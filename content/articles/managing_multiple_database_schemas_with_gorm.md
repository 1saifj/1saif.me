---
title: Managing Multiple Database Schemas with Gorm
description: "How to keep tables in two PostgreSQL schemas, app and auth, behind one GORM connection, using table names."
createdAt: "2023-07-09"
updatedAt: 2023-07-09
featuredImage: "/articles/gorm_schema_feat.jpg"
tags:
  - golang
  - gorm
  - database
---

## Introduction

GORM is an Object-Relational Mapping (ORM) library for Go with a wide range of features.

## Identifying the Issue

The GORM documentation is thorough, but it does not cover every detail. I needed to manage two schemas in one database, as the diagram below shows. The aim was to keep a schema named APP and another named AUTH in the same database. This separation helps when you split the application into smaller services, or when you want to manage the app database from a different viewpoint.

![Diagram of the app and auth schemas in one database](https://i.imgur.com/2p8e8GV.png)

The GORM documentation did not give a direct answer to my problem. However, reading the [source code](https://github.com/go-gorm/gorm/blob/master/schema/schema.go#L98) showed me a solution.

## The Solution

To let GORM manage multiple schemas in one database, set a table name for each model.

```go
type TablerWithNamer interface {
	TableName(Namer) string
}
```

`TablerWithNamer` is GORM's interface for this. Its `TableName` method takes GORM's naming strategy (`Namer`) and returns the table name. The example below uses the simpler `TableName() string` method, which takes no argument.

The full example follows the diagram above. It gives each table its schema name, and it uses a clause to preload associations.

```go
package main

import (
	"fmt"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

const (
	AppSchema  = "app"
	AuthSchema = "auth"
)

// User is a model representing the users table
type User struct {
	ID   uint
	Name string
}

// TableName returns the custom table name for the User model
func (User) TableName() string {
	return AuthSchema + ".user"
}

// Order is a model representing the orders table
type Order struct {
	ID     uint
	Name   string
	UserID uint
	User   User
}

// TableName returns the custom table name for the Order model
func (Order) TableName() string {
	return AppSchema + ".order"
}

func main() {
	// Connect to the database
	db, err := gorm.Open(postgres.Open("host=localhost user=postgres password=postgres dbname=postgres port=5432 sslmode=disable TimeZone=Asia/Jakarta"), &gorm.Config{})
	if err != nil {
		panic(err)
	}

	// Create schema if not exist
	db.Exec("CREATE SCHEMA IF NOT EXISTS " + AppSchema)
	db.Exec("CREATE SCHEMA IF NOT EXISTS " + AuthSchema)

	// Auto-migrate the models
	err = db.AutoMigrate(&User{}, &Order{})
	if err != nil {
		panic(err)
	}

	// Create a new user in the auth schema
	user := User{Name: "John"}
	db.Create(&user)

	// Create a new order associated with the user in the app schema
	order := Order{Name: "Order 1", UserID: user.ID}
	db.Create(&order)

	// Fetch all users from the auth schema
	var authUsers []User
	db.Find(&authUsers)
	fmt.Println("Auth Users:", authUsers)

	// Fetch all orders from the app schema
	var appOrders []Order
	db.Find(&appOrders)
	fmt.Println("App Orders:", appOrders)

	// Fetch all orders from the app schema with the associated user
	var appOrdersWithUser []Order
	db.Preload(clause.Associations).Find(&appOrdersWithUser)
	fmt.Println("App Orders with User:", appOrdersWithUser)
}
```

The example defines the models first. Then it connects to the database and creates both schemas if they do not exist. `Preload(clause.Associations)` tells GORM to load every association of the model. GORM runs one extra query per association, instead of one query per row, so you avoid the N+1 query problem.

Thanks for reading.

## Source code

[GitHub](https://github.com/1saifj/gorm_multipe_schemas)
