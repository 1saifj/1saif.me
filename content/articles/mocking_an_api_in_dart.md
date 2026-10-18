---
title: How to Mock an API in ONE minute
description: "Quick ways to stand up a mock API for tests and development: JSON Server for JavaScript, httptest in Go, mockito in Dart, and unittest.mock in Python."
createdAt: "2022-12-17"
updatedAt: 2022-12-17
featuredImage: "/articles/api_mock_feat.jpg"
tags:
  - api
  - testing
---

Mocking an API can be useful when you want to test your application's integration with an API, but you don't have access to the real API, or you don't want to make real API calls during testing. Here's how I set up a mock API with the tools I reach for in JavaScript, Go, Dart and Python.

Here's an example of how to set up a mock API with JSON Server in just a few minutes:

## Mocking an API with JSON Server

1. Install JSON Server by running the following command in your terminal:

```sh
npm install -g json-server
```

2. Create a JSON file with your data. JSON Server turns each top-level array into a REST resource, so this file gives you `GET /users` and `POST /users` without any routes to write:

```json
{
  "users": [
    { "id": 1, "name": "Alice" },
    { "id": 2, "name": "Bob" }
  ]
}
```

3. Start JSON Server, replacing `db.json` with the path to your JSON file:

```sh
json-server db.json
```

4. Your mock API now runs at http://localhost:3000. You can call it with any HTTP client, such as `fetch` in the browser or `axios` in Node.js.

## Mocking an API in Go

Another option in Go is the `httptest` package, which is part of the standard library. It creates a mock HTTP server that you can use to test your application's HTTP client code.

Here's how to set up a mock API with `httptest`:

1. Import the packages in your test file:

```go
import (
    "net/http"
    "net/http/httptest"
    "testing"
)
```

2. Create a mock HTTP server by calling `NewServer` and passing it a handler that defines the responses:

```go
server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
    if r.URL.Path == "/users" && r.Method == "GET" {
        w.Write([]byte(`[{"id": 1, "name": "Alice"}, {"id": 2, "name": "Bob"}]`))
        return
    }
    w.WriteHeader(http.StatusNotFound)
}))
```

3. Make HTTP requests to the mock server with the `http.Client` type:

```go
client := &http.Client{}
req, _ := http.NewRequest("GET", server.URL+"/users", nil)
resp, err := client.Do(req)
if err != nil {
    t.Fatal(err)
}
defer resp.Body.Close()
```

4. Close the mock server when you're done with it:

```go
server.Close()
```

## Mocking an API in Dart

To mock an API in Dart, use the `mockito` package, a popular mocking library for Dart and Flutter. You mock the `Client` class from the `http` package, so the code under test receives the mock instead of a real client.

1. Add `http` as a dependency, and `mockito` and `build_runner` as dev dependencies, in `pubspec.yaml`:

```yaml
dependencies:
  http: ^1.2.0

dev_dependencies:
  build_runner: ^2.4.0
  mockito: ^5.4.4
```

2. Import the packages in your test file, and annotate `main` so mockito generates a mock for `http.Client`. This example assumes the test file is `test/api_test.dart`:

```dart
import 'package:http/http.dart' as http;
import 'package:mockito/annotations.dart';
import 'package:mockito/mockito.dart';

import 'api_test.mocks.dart';

@GenerateMocks([http.Client])
void main() {
  final mockHttpClient = MockClient();
}
```

The rest of the steps go inside `main()`.

3. Generate the mock class by running this command in your project:

```sh
dart run build_runner build
```

This creates `api_test.mocks.dart`, which contains `MockClient`. Mockito 5 needs this generated class, because a hand-written mock cannot return the non-nullable `Future<Response>` that `get` returns.

4. Use `when` to set the response for a call:

```dart
when(mockHttpClient.get(Uri.parse('http://example.com/users')))
    .thenAnswer((_) async => http.Response('[{"id": 1, "name": "Alice"}, {"id": 2, "name": "Bob"}]', 200));
```

5. Call the mock where your code uses the client. For example:

```dart
final response = await mockHttpClient.get(Uri.parse('http://example.com/users'));
print(response.statusCode); // 200
```

6. Use `verify` to check that the mock was called as expected:

```dart
verify(mockHttpClient.get(Uri.parse('http://example.com/users'))).called(1);
```

With mockito, you can set up a mock HTTP client for your tests. This saves time, and your tests don't depend on the availability of the real API.

## Mocking an API in Python

To mock an API in Python, use the `unittest.mock` module, which is part of the standard library. It lets you create mock objects and define how they behave.

Here's how to mock the `requests` library with `unittest.mock`:

1. Import the names you need in your test file:

```python
from unittest.mock import Mock, patch
import requests
```

2. Create a mock `Response` object and define its behavior:

```python
response_mock = Mock()
response_mock.json.return_value = [{"id": 1, "name": "Alice"}, {"id": 2, "name": "Bob"}]
response_mock.status_code = 200
```

3. Use `patch` to replace `requests.get` with a mock that returns your response. `patch` restores the original function when the `with` block ends:

```python
with patch("requests.get", return_value=response_mock) as mock_get:
    response = requests.get("http://example.com/users")
```

4. Inside the `with` block, the call returns the mock response instead of a real one. You can test your code against that data, and check the call with `mock_get.assert_called_once_with("http://example.com/users")`.

Whichever language you're in, the idea is the same: your tests shouldn't depend on a server you don't control. A mock that returns fixed responses makes tests fast, and it lets you test the cases the real API rarely gives you, like a 500 or a timeout. Just keep the mock close to the real API's responses, or your tests will pass against something that doesn't exist.
