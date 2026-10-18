---
title: "Interfaces in Go: Keep Them Small"
description: A refactor that started with a nine-method IKeycloakConfig interface. What was wrong with it, what replaced it, and the Go habits behind the change.
createdAt: "2025-04-13"
updatedAt: "2025-04-13"
featuredImage: "/articles/go_interfaces_feat.jpg"
tags:
  - golang
  - software-design
  - refactoring
---

I spent a day refactoring a Go codebase, and one interface was the worst part. It looked like this:

```go
type IKeycloakConfig interface {
	GetBaseUrl() string
	GetRealm() string
	GetClientId() string
	GetClientSecret() string
	GetUserName() string
	GetPassword() string
	GetTOTPServiceClientID() string
	GetTOTPServiceClientSecret() string
	GetClientToken(client *gocloak.GoCloak) *gocloak.JWT
}
```

If you've written Java or C#, this probably looks normal. In Go it has almost every interface smell in one place.

## What's wrong with it

**The `I` prefix.** That's a naming habit from other languages. Go names interfaces after what they do: `Reader`, `Writer`, `Stringer`, `Handler`. If you need a prefix to tell the interface apart from a struct, the interface is probably modeling the wrong thing.

**Too many methods.** Nine methods means anything that wants to implement it, including a fake in a test, has to write nine methods. And no single caller uses all nine. Each caller needs a few of the values, yet each one depends on all nine.

**It leaks the dependency.** `GetClientToken(client *gocloak.GoCloak)` means every package that touches this interface now imports `gocloak`. The interface was meant to hide Keycloak, but it spreads the dependency to every package that uses it.

**It's all getters.** An interface made only of `GetX()` methods is really a struct. It describes data, not behavior. Config rarely needs a second implementation.

Rob Pike put it in one line: "The bigger the interface, the weaker the abstraction."

## A better structure

Two separate things were mixed in that interface. One is configuration, which is just data. The other is "give me a token", which is behavior.

This is how I'd structure the config now, as a plain struct loaded once at startup:

```go
type KeycloakConfig struct {
	BaseURL      string
	Realm        string
	ClientID     string
	ClientSecret string
}
```

No interface. If a function needs the realm, it gets the realm.

The behavior the rest of the code actually needed was a token. That can become a one-method interface, defined in the package that uses it:

```go
// in package billing
type TokenSource interface {
	Token(ctx context.Context) (string, error)
}

type Client struct {
	tokens TokenSource
	http   *http.Client
}
```

Keep the Keycloak-specific code in one place that implements it. Only that file should import `gocloak`:

```go
package keycloak

type Tokens struct {
	cfg    KeycloakConfig
	client *gocloak.GoCloak

	mu      sync.Mutex
	token   string
	expires time.Time
}

func NewTokens(cfg KeycloakConfig) *Tokens {
	return &Tokens{cfg: cfg, client: gocloak.NewClient(cfg.BaseURL)}
}

func (t *Tokens) Token(ctx context.Context) (string, error) {
	t.mu.Lock()
	defer t.mu.Unlock()

	if t.token != "" && time.Until(t.expires) > 30*time.Second {
		return t.token, nil
	}

	jwt, err := t.client.LoginClient(ctx, t.cfg.ClientID, t.cfg.ClientSecret, t.cfg.Realm)
	if err != nil {
		return "", fmt.Errorf("keycloak login: %w", err)
	}
	t.token = jwt.AccessToken
	t.expires = time.Now().Add(time.Duration(jwt.ExpiresIn) * time.Second)
	return t.token, nil
}
```

The token is cached until it's close to expiring. With the old interface, every caller got a raw `*gocloak.JWT` and had to decide for itself when to ask for a new one.

## Define the interface where it's used

Notice that `TokenSource` lives in `billing`, the package that needs a token, and not in `keycloak`. That's the habit that changes the most in Go.

In Java you write the interface first, next to the implementation, and classes declare `implements`. In Go, a type satisfies an interface just by having the methods. So the consumer can describe exactly what it needs, and nothing more. `keycloak.Tokens` doesn't know `billing.TokenSource` exists, and it doesn't need to.

The usual way to say it: accept interfaces, return structs. `NewTokens` returns a concrete `*Tokens`. `billing.Client` accepts any `TokenSource`.

## Tests get easy

With one method, a fake is two lines. Inside the `billing` package:

```go
type staticToken string

func (s staticToken) Token(context.Context) (string, error) { return string(s), nil }

func TestInvoiceSendsBearerToken(t *testing.T) {
	c := Client{tokens: staticToken("test-token"), http: srv.Client()}
	// ...
}
```

Compare that with faking nine methods of `IKeycloakConfig`, most of which return strings the test doesn't care about.

## A note on the version I posted

When I shared this on LinkedIn, the "better" example also had a `ConfigProvider` interface with `GetValue(key string) string`. It's smaller, but it has its own problem. It's stringly typed: a typo in a key compiles fine and returns an empty string at runtime. A struct with real fields, like `KeycloakConfig` above, gives you that check at compile time. A string key moves errors from compile time to run time.

## A simple rule

Before you write an interface, ask: is there a second implementation today, or a test that needs a fake? If not, use the struct directly and add the interface later, at the place that needs it. Go makes that cheap, because nothing has to change on the implementing side.

What's your experience with interface design in Go? Have you run into similar problems while refactoring?
