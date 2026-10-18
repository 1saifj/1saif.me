---
title: Most Effective Design Patterns In Golang
description: "Two classic design patterns that still earn their place in Go, Observer and Singleton, with Go code for each."
createdAt: "2023-06-25"
updatedAt: 2023-06-25
featuredImage: "/articles/go_design_patterns_feat.jpg"
tags:
  - golang
  - design-patterns
---

Design patterns are common answers to problems that keep coming back in software design. Go doesn't need most of the classic catalog, because interfaces, closures and goroutines already cover a lot of it. I still reach for two patterns, Observer and Singleton, so this post covers those two, with Go code for each.

## Observer Pattern
The Observer pattern is a software design pattern that defines a one-to-many dependency between objects. When one object changes its state, all its dependents are notified and updated automatically.

Why use the **Observer pattern**?

* Loose coupling: a change in one object updates the others automatically, without tight references between them.
* Broadcast: when an object changes, all its dependents are notified, and the object does not need to know who they are.
* Dynamic relationships: you can add and remove observers at runtime.
* Event handling: it fits situations where one action should trigger other actions.


```go
type Subject interface {
    Register(observer Observer)
    Deregister(observer Observer)
    Notify()
}

type Observer interface {
    Update()
}

```

The two interfaces above form the core of the pattern. `Subject` registers and deregisters observers, and it notifies them of changes. The `Update` method on `Observer` runs each time a notification is sent.


```go
type ConcreteSubject struct {
    Observers []Observer
}

func (cs *ConcreteSubject) Register(observer Observer) {
    cs.Observers = append(cs.Observers, observer)
}

func (cs *ConcreteSubject) Deregister(observer Observer) {
    for i, o := range cs.Observers {
        if o == observer {
            cs.Observers = append(cs.Observers[:i], cs.Observers[i+1:]...)
            return
        }
    }
}

func (cs *ConcreteSubject) Notify() {
    for _, observer := range cs.Observers {
        observer.Update()
    }
}

type ConcreteObserver struct {
    ID int
}

// Compile-time check that *ConcreteSubject implements Subject.
var _ Subject = (*ConcreteSubject)(nil)

func (co *ConcreteObserver) Update() {
    fmt.Println("Observer", co.ID, "updated")
}
```

### Real-world example

Consider a blog with a list of subscribers who want to know when a new post is published. In this case, the blog is the Subject (or Publisher), and the subscribers are the Observers.

```go

package main

import (
	"fmt"
)

type Subscriber interface {
	Update(string)
}

type Blog struct {
	subscribers []Subscriber
}

func (b *Blog) Subscribe(s Subscriber) {
	b.subscribers = append(b.subscribers, s)
}

func (b *Blog) Publish(post string) {
	for _, subscriber := range b.subscribers {
		subscriber.Update(post)
	}
}

type User struct {
	Name string
}

func (u *User) Update(post string) {
	fmt.Printf("%s received new post: %s\n", u.Name, post)
}

func main() {
	user1 := &User{Name: "Alice"}
	user2 := &User{Name: "Bob"}

	blog := &Blog{}
	blog.Subscribe(user1)
	blog.Subscribe(user2)

	blog.Publish("Introduction to the Observer Pattern in Go")
}

```

## Singleton Pattern

The Singleton pattern ensures that a type has only one instance, and it provides a global point of access to that instance. Use it when exactly one object must coordinate actions across the system. Go has no classes, but you can still build a singleton with a package-level variable and `sync.Once`.

```go
package singleton

import "sync"

type singleton struct {
	value string
}

var (
	instance *singleton
	once     sync.Once
)

func Instance() *singleton {
	once.Do(func() {
		instance = &singleton{value: "I am a singleton!"}
	})

	return instance
}
```

Each call to `Instance()` returns the same pointer. `once.Do` creates the singleton on the first call, and later calls return the stored instance.
