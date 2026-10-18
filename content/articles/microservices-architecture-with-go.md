---
title: "Microservices Architecture with Go and Docker"
description: "How I split a system into Go services, run them with Docker, and connect them with REST and gRPC. Service discovery with Consul, and why starting with fewer services is safer."
createdAt: "2024-04-22"
updatedAt: 2024-04-22
featuredImage: "/articles/go_micro_feat.jpg"
tags:
  - backend
  - go
  - microservices
  - docker
---

This post covers how I split a system into Go services, run them with Docker, and let them talk to each other.

## Why Go for Microservices?

Go suits microservices for a few reasons:

1. **Lightweight concurrency model** - Goroutines make handling concurrent requests efficient
2. **Fast compilation** - Quick feedback loop during development
3. **Static typing** - Catches errors at compile time
4. **Standard library** - Rich HTTP handling, JSON processing, and more
5. **Single binary deployment** - Simplifies containerization

## Design Principles for Microservices

When I design microservices, I follow these principles:

### Single Responsibility

Each microservice should focus on a specific business capability:

```go
// user-service/main.go
package main

import (
    "github.com/gin-gonic/gin"
)

func main() {
    router := gin.Default()
    
    router.GET("/users/:id", getUserHandler)
    router.POST("/users", createUserHandler)
    
    router.Run(":8080")
}
```

### Loose Coupling

Services should interact through well-defined APIs, typically RESTful endpoints or message queues:

```go
// order-service/client/user_client.go
package client

import (
    "encoding/json"
    "fmt"
    "net/http"
)

type UserClient struct {
    BaseURL string
}

func (c *UserClient) GetUser(id string) (*User, error) {
    resp, err := http.Get(fmt.Sprintf("%s/users/%s", c.BaseURL, id))
    if err != nil {
        return nil, err
    }
    defer resp.Body.Close()
    if resp.StatusCode != http.StatusOK {
        return nil, fmt.Errorf("get user %s: status %d", id, resp.StatusCode)
    }
    
    var user User
    if err := json.NewDecoder(resp.Body).Decode(&user); err != nil {
        return nil, err
    }
    
    return &user, nil
}
```

## Containerization with Docker

Docker simplifies deployment and ensures consistency across environments. Here's a sample Dockerfile for a Go microservice:

```dockerfile
# Start from the golang alpine image
FROM golang:1.21-alpine AS builder

# Set the working directory
WORKDIR /app

# Copy go.mod and go.sum files
COPY go.mod go.sum ./

# Download dependencies
RUN go mod download

# Copy the source code
COPY . .

# Build the application
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o main .

# Start a new stage with a minimal alpine image
FROM alpine:latest

# Set the working directory
WORKDIR /root/

# Copy the pre-built binary file from the previous stage
COPY --from=builder /app/main .

# Expose port 8080
EXPOSE 8080

# Command to run the executable
CMD ["./main"]
```

This multi-stage build produces a minimal image with just your application binary, reducing security risks and image size.

## Service Discovery

For service discovery, I've found Consul effective:

```go
package main

import (
    "github.com/hashicorp/consul/api"
    "log"
)

func registerService() {
    config := api.DefaultConfig()
    client, err := api.NewClient(config)
    if err != nil {
        log.Fatalf("Failed to create Consul client: %v", err)
    }
    
    registration := &api.AgentServiceRegistration{
        ID:      "user-service-1",
        Name:    "user-service",
        Port:    8080,
        Address: "10.0.0.1",
        Check: &api.AgentServiceCheck{
            HTTP:     "http://10.0.0.1:8080/health",
            Interval: "10s",
        },
    }
    
    if err := client.Agent().ServiceRegister(registration); err != nil {
        log.Fatalf("Failed to register service: %v", err)
    }
}
```

## Inter-Service Communication

For synchronous calls, gRPC gives you type-safe, efficient communication. Define the service in a `.proto` file:

```protobuf
// user.proto
syntax = "proto3";
package user;

service UserService {
  rpc GetUser(UserRequest) returns (UserResponse) {}
}

message UserRequest {
  string id = 1;
}

message UserResponse {
  string id = 1;
  string name = 2;
  string email = 3;
}
```

## What I'd keep in mind

Go and Docker make each service small and easy to ship. Most of the hard parts are in how the services fit together:

1. Design services around business capabilities
2. Use Docker for consistent deployment
3. Implement service discovery for resilience
4. Choose appropriate communication protocols
5. Monitor and log extensively

And start with fewer services than you think you need. Splitting a service later is easier than merging two that should never have been split. 