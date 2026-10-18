---
title: Preventing Duplicate Transactions with Database Locking Strategies in Financial Systems
description: "A card-issuing service that sometimes processed the same request twice. How optimistic and pessimistic locking stopped the duplicates, and when to use each."
createdAt: "2025-04-10"
updatedAt: 2025-04-10
featuredImage: "/articles/database-locking/db_locks_feat.jpg"
tags:
  - database
  - concurrency
  - optimistic-locking
  - financial-systems
  - redis
---

## Introduction

In a financial system, each transaction must be processed exactly once. Concurrent processing makes that hard, and a mistake can have serious consequences. This article describes how we fixed a race condition in a card issuance system by combining several locking strategies.

## The problem we want to solve

Recently, I was debugging a tricky issue in our card issuing platform. We noticed something wrong in our logs:

```
144609,2025-04-10 16:08:52.637252 +00:00,39407,Pending
144616,2025-04-10 16:09:00.147463 +00:00,39407,Approved
144617,2025-04-10 16:09:00.170468 +00:00,39407,Approved
144618,2025-04-10 16:09:01.356295 +00:00,39407,Approved
```

The same order (ID 39407) was approved three times in about 1.2 seconds. This happened even though we already had a Redis-based distributed lock.

The consequences were serious. Each approval could create a separate physical card, so one customer could receive several cards. That cost money, and it confused customers.

The problem happened when several cron job instances ran at nearly the same time. Each one checked whether an order was "Pending" before it approved the order. All of them read the status before any of them wrote an update. This race condition happened at the database transaction level, which our Redis job lock could not prevent.

## The solution

After analyzing the problem, I realized we needed a multi-layered approach to keep transactions correct. The steps below cover each layer.

### Understanding Locking Strategies

There are two primary approaches to handling concurrent database access:

**Pessimistic Locking**
```go
// Original problematic code using pessimistic locking
if err := tx.Clauses(clause.Locking{Strength: "UPDATE"}).
    Preload("CardData").
    First(&order, orderID).Error; err != nil {
    return nil, utility.NewError(err, "FAILED_TO_FETCH_ORDER", "UPDATE-ORDER-STATUS")
}

// Update status
if err := tx.Model(&order).Updates(map[string]interface{}{
    "status":     status,
    "updated_at": time.Now(),
}).Error; err != nil {
    return nil, utility.NewError(err, "FAILED_TO_UPDATE_STATUS", "UPDATE-ORDER-STATUS")
}
```

This approach locks the row while the transaction runs. But the "Pending" check happened earlier, outside this transaction, and the code does not check the status again once it holds the lock. So a second process that waits for the lock still approves the order.

**Optimistic Locking**
```go
// First get the current status
var currentOrder model.CardOrder
if err := tx.Select("status").First(&currentOrder, orderID).Error; err != nil {
    return nil, utility.NewError(err, "FAILED_TO_FETCH_CURRENT_STATUS", "UPDATE-ORDER-STATUS")
}

// Apply optimistic locking: only update if status hasn't changed
result := tx.Model(&model.CardOrder{}).
    Where("id = ? AND status = ?", orderID, currentOrder.Status).
    Updates(map[string]interface{}{
        "status":     status,
        "updated_at": time.Now(),
    })

// Check if update was successful
if result.Error != nil {
    return nil, utility.NewError(result.Error, "FAILED_TO_UPDATE_STATUS", "UPDATE-ORDER-STATUS")
}
if result.RowsAffected == 0 {
    return nil, utility.NewError(
        fmt.Errorf("order status was changed by another process"),
        "CONCURRENT_MODIFICATION",
        "UPDATE-ORDER-STATUS",
    )
}
```

This approach doesn't lock anything during read, but ensures updates only succeed if the data hasn't changed since it was read.

## Implementing a Multi-Layered Solution

We added three layers, each one catching what the one before it can miss:

### 1. Database Optimistic Locking

I replaced our repository's `UpdateOrderStatus` method with an optimistic locking version:

```go
func (r *cardOrderRepository) UpdateOrderStatus(
    orderID uint,
    status enums.CardOrderStatus,
) (*model.CardOrder, coerr.Error) {
    result, err := utility.WithTransaction(r.db, func(tx *gorm.DB) (interface{}, error) {
        // 1. First get the current status
        var currentOrder model.CardOrder
        if err := tx.Select("status").First(&currentOrder, orderID).Error; err != nil {
            return nil, utility.NewError(err, "FAILED_TO_FETCH_CURRENT_STATUS", "UPDATE-ORDER-STATUS")
        }

        // 2. Only proceed if it's not already the target status (idempotency)
        if currentOrder.Status == status {
            // Status already at target value, load the full order and return
            var order model.CardOrder
            if err := tx.Preload("CardProduct").
                Preload("CardData").
                // More preloads...
                First(&order, orderID).Error; err != nil {
                return nil, utility.NewError(err, "FAILED_TO_RELOAD_ORDER", "UPDATE-ORDER-STATUS")
            }
            return &order, nil
        }

        // 3. Apply optimistic locking: only update if status hasn't changed
        result := tx.Model(&model.CardOrder{}).
            Where("id = ? AND status = ?", orderID, currentOrder.Status).
            Updates(map[string]interface{}{
                "status":     status,
                "updated_at": time.Now(),
            })

        if result.Error != nil {
            return nil, utility.NewError(result.Error, "FAILED_TO_UPDATE_STATUS", "UPDATE-ORDER-STATUS")
        }
        if result.RowsAffected == 0 {
            return nil, utility.NewError(
                fmt.Errorf("order status was changed by another process"),
                "CONCURRENT_MODIFICATION",
                "UPDATE-ORDER-STATUS",
            )
        }

        // Create status history and reload order...
        return &updatedOrder, nil
    }, "UPDATE_ORDER_STATUS")
    if err != nil {
        return nil, utility.NewError(err, "FAILED_TO_UPDATE_ORDER_STATUS", "UPDATE-ORDER-STATUS")
    }

    return result.(*model.CardOrder), nil
}
```

This ensures that only one process can successfully transition an order from "Pending" to "Approved" state.

### 2. Per-Order Redis Locking

As an additional safeguard, I added fine-grained Redis locks for each order:

```go
// Add per-order Redis locking to prevent duplicate processing
orderLockKey := fmt.Sprintf("cron:lock:order:%d", order.ID)
orderLockTTL := 30 * time.Second

// Try to acquire order-specific lock
ctx := context.Background()
orderLockAcquired, err := s.redisClient.SetNX(ctx, orderLockKey, "1", orderLockTTL).Result()
if err != nil {
    s.logger.Warn("Failed to acquire Redis lock for order, proceeding with caution",
        "order_id", order.ID,
        "error", err)
    // Continue processing - the database optimistic locking is our safety net
} else if !orderLockAcquired {
    s.logger.Info("Order is being processed by another instance, skipping",
        "order_id", order.ID)
    return nil
} else {
    // Release the lock only when this instance took it
    defer func() {
        if err := s.redisClient.Del(ctx, orderLockKey).Err(); err != nil {
            s.logger.Warn("Failed to release order lock", "order_id", order.ID, "error", err)
        }
    }()
}
```

One gap is left here: the `Del` is unconditional. If the work takes longer than the 30-second TTL, the lock expires, another instance takes it, and this `Del` removes their lock. Store a random token as the value and delete the key only when it still holds that token, with a small Lua script, if the work can ever run that long.

### 3. Graceful Concurrency Error Handling

Finally, I changed the error handling so that a concurrency conflict is not treated as a failure:

```go
if _, err := s.orderUsecase.UpdateOrderStatus(order.ID, enums.CardStatusApproved); err != nil {
    // Check for concurrent modification error and handle it gracefully
    if cErr, ok := err.(coerr.StringError); ok && cErr.GetErrorCode() == "CONCURRENT_MODIFICATION" {
        s.logger.Info("Order status was modified by another process, skipping",
            "order_id", order.ID,
            "error", err.Error())
        return nil // Not an error case, just a race condition
    }

    return fmt.Errorf("card creation failed for order %d: %v", order.ID, err)
}
```

## The Results

After these changes, concurrent processing worked as intended. Even when multiple cron job instances ran simultaneously, each order was processed exactly once. The logs now showed a clean progression from "Pending" to "Approved" without duplicates.

![Two cron instances: the Redis lock stops the second one, and the status check in the UPDATE stops it again if Redis fails](/articles/database-locking/db_locks.jpg)

The multi-layered approach provided several benefits:

1. If Redis failed, the database optimistic locking still prevented duplicates
2. If a cron job crashed, the short TTL on the Redis lock allowed others to take over
3. When concurrent modifications occurred, they were properly logged without raising alarms

## When to Choose Each Locking Strategy

**Use Optimistic Locking When:**

- Conflicts are rare (like our scenario)
- Transactions are short-lived
- You need high throughput
- The system is distributed

**Use Pessimistic Locking When:**

- Conflicts happen frequently
- Transactions are long-running
- The cost of retrying transactions is high
- Data consistency is more important than performance

In our case, optimistic locking was ideal because we had relatively low contention (multiple cron jobs occasionally overlapping) and simple, short transactions.

## References

- [GORM Transactions Documentation](https://gorm.io/docs/transactions.html)
- [Redis SETNX Command](https://redis.io/commands/setnx/)
- [Martin Fowler on Optimistic Offline Lock](https://martinfowler.com/eaaCatalog/optimisticOfflineLock.html)
- [AWS Database Blog: Optimistic locking in Amazon DynamoDB](https://aws.amazon.com/blogs/database/optimistic-locking-in-amazon-dynamodb/)
