---
title: "Metaprogramming in Go: Generate, Reflect, or Generics"
description: Go has no macros, but it does have three ways to write code that works on other code. What go generate, the reflect package and generics are each good at, with a small example of each.
createdAt: "2025-04-15"
updatedAt: "2025-04-15"
featuredImage: "/articles/go_metaprogramming_feat.jpg"
tags:
  - golang
  - code-generation
  - software-design
---

If you come to Go from Ruby, or from any language where classes can rewrite themselves at runtime, an early question is: does Go do metaprogramming at all?

It does, just differently. Go has no macros and no runtime monkey-patching. What it has is more explicit, and most of it happens at compile time. There are three tools, and knowing which one to pick saves a lot of awkward code.

## 1. go generate

This is Go's main tool for compile-time metaprogramming. You put a special comment in a source file, and `go generate` runs the command in it. The command is usually a program that reads your code or a schema and writes new `.go` files. Those files get committed and compiled like any other code.

The classic example is `stringer`. Say you have an enum:

```go
package order

//go:generate go run golang.org/x/tools/cmd/stringer@latest -type=Status -trimprefix=Status

type Status int

const (
	StatusPending Status = iota
	StatusApproved
	StatusRejected
)
```

Run `go generate ./...` and you get a `status_string.go` file with a `String()` method. Now `fmt.Println(order.StatusApproved)` prints `Approved` instead of `1`, and you never wrote or maintained that method by hand.

The same idea drives other generators in Go: mocks with `mockgen`, protobuf and gRPC code with `protoc`, type-safe SQL with `sqlc`, and API clients from OpenAPI specs.

What you get is ordinary Go code. It's type-checked, as fast as handwritten code, and you can open it and read it when something goes wrong. The cost is a build step, and someone has to remember to run it. A CI check that runs `go generate ./...` and fails if `git diff` isn't empty takes care of that.

## 2. reflect

The `reflect` package lets a program look at types and values while it runs: which fields a struct has, their tags, their types, and the ability to set them. It's how `encoding/json` knows what to do with your structs without you writing anything.

A small example: loading config from environment variables based on struct tags.

```go
type Config struct {
	Port  int    `env:"PORT"`
	DBURL string `env:"DATABASE_URL"`
}

func LoadEnv(dst any) error {
	v := reflect.ValueOf(dst)
	if v.Kind() != reflect.Pointer || v.Elem().Kind() != reflect.Struct {
		return errors.New("LoadEnv needs a pointer to a struct")
	}
	v = v.Elem()

	for i := 0; i < v.NumField(); i++ {
		key := v.Type().Field(i).Tag.Get("env")
		raw, ok := os.LookupEnv(key)
		if key == "" || !ok {
			continue
		}

		field := v.Field(i)
		if !field.CanSet() { // unexported fields can't be set through reflection
			continue
		}
		switch field.Kind() {
		case reflect.String:
			field.SetString(raw)
		case reflect.Int:
			n, err := strconv.Atoi(raw)
			if err != nil {
				return fmt.Errorf("%s: %w", key, err)
			}
			field.SetInt(int64(n))
		default:
			return fmt.Errorf("%s: unsupported type %s", key, field.Kind())
		}
	}
	return nil
}
```

It works for any struct with `env` tags. That's the power of reflection, and it's needed when the types really aren't known ahead of time: serializers, ORMs, validation libraries, dependency injection.

But look at what it costs. The compiler can't check any of this, so a wrong type shows up as an error at runtime, or a panic if you forget a check. It's slower than direct field access. And it's harder to read. Ten lines of setting fields directly would be clearer for one config struct. Reflection pays off when you'd otherwise write the same code for many types.

## 3. Generics

Generics, since Go 1.18, aren't metaprogramming in the classic sense. But they solve many of the problems people used to solve with reflection or code generation: functions and data structures that work for many types.

Before generics, a function that worked on "a slice of anything" took `[]interface{}` and used type assertions, or you generated one copy per type. Now:

```go
func Filter[T any](items []T, keep func(T) bool) []T {
	var out []T
	for _, item := range items {
		if keep(item) {
			out = append(out, item)
		}
	}
	return out
}

paid := Filter(orders, func(o Order) bool { return o.Status == order.StatusApproved })
```

It's checked at compile time, and you keep one copy to maintain.

## Which one to use

- **Generics**, when the same logic works for many types and the types are known at compile time. Collections, small helpers, typed wrappers.
- **go generate**, when you'd otherwise write a lot of repetitive code from some source of truth: an enum, a schema, an interface you need to mock. You get fast, readable, type-safe code.
- **reflect**, when the types truly aren't known until runtime, and usually inside a library rather than your application code.

That matches Go's design. It prefers explicit tools, code generation and generics over runtime magic, because they keep code simple to read, safe at compile time, and fast.

What are your favorite uses of `go generate` or `reflect`?
