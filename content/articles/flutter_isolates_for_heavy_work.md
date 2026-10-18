---
title: Keeping Flutter Smooth with Isolates
description: Heavy work on the main isolate freezes the UI. When to move it off with Isolate.run, what you can and can't send across, a long-lived worker for repeated jobs, and the web caveat.
createdAt: "2025-06-10"
updatedAt: "2025-06-10"
featuredImage: "/articles/flutter_isolates_feat.jpg"
tags:
  - flutter
  - dart
  - performance
  - mobile
---

Ever wondered why some map and navigation apps stay smooth while others freeze for a second when they calculate a route? Most of the time the difference is where the heavy work runs.

I've been working on Flutter guide apps lately, the kind with maps, places and routes between them. The lesson that made the biggest difference was about isolates.

## The problem

Flutter runs your Dart code, your build methods and your animations on one thread, the main isolate. To draw at 60 frames per second, each frame has about 16 milliseconds. On a 120 Hz screen it's about 8.

If you run something that takes 300 milliseconds on that thread, like ordering ten stops into a route, decoding a large JSON file or filtering thousands of road segments, the app can't draw anything during that time. The map stops panning. Buttons don't respond. The loading spinner you added freezes too, because it also needs the main isolate to animate.

`async` and `await` don't help here. They let you wait for I/O without blocking, but a CPU-heavy function still runs on the same thread, start to finish.

## Isolate.run

An isolate is a separate worker with its own memory. Work there doesn't block the UI. Since Dart 2.19, the simplest way to use one is `Isolate.run`:

```dart
final ordered = await Isolate.run(() => orderStops(stops));
```

The closure runs in a new isolate, and the result comes back as a `Future`. While it runs, the user can still pan the map and tap buttons.

The function itself is plain Dart. Here's a simple nearest-neighbor ordering, the kind of thing that's quick for five stops and noticeable for many:

```dart
import 'dart:math';

class Stop {
  const Stop(this.name, this.lat, this.lng);
  final String name;
  final double lat;
  final double lng;
}

List<Stop> orderStops(List<Stop> stops) {
  if (stops.isEmpty) return [];
  final remaining = [...stops];
  final route = [remaining.removeAt(0)];
  while (remaining.isNotEmpty) {
    final last = route.last;
    remaining.sort((a, b) => _distance(last, a).compareTo(_distance(last, b)));
    route.add(remaining.removeAt(0));
  }
  return route;
}

double _distance(Stop a, Stop b) {
  const r = 6371.0; // km
  final dLat = _rad(b.lat - a.lat);
  final dLng = _rad(b.lng - a.lng);
  final h = pow(sin(dLat / 2), 2) + cos(_rad(a.lat)) * cos(_rad(b.lat)) * pow(sin(dLng / 2), 2);
  return 2 * r * asin(sqrt(h));
}

double _rad(double deg) => deg * pi / 180;
```

## What you can send across

Isolates don't share memory, so whatever the closure captures gets copied into the new isolate. That has two consequences.

First, keep the closure small. If you write `Isolate.run(() => orderStops(widget.stops))` inside a widget, the closure captures `widget`, and Dart tries to copy the whole widget into the isolate. Pull the data into a local variable first:

```dart
final stops = widget.stops;
final ordered = await Isolate.run(() => orderStops(stops));
```

Second, some objects can't be copied at all: open sockets, `ReceivePort`s, and native resources. If the closure captures one, even by accident, you get an error at runtime.

The result comes back without a copy. `Isolate.run` finishes with `Isolate.exit`, which hands the result's memory over to the calling isolate. So returning a large list is cheap, while sending a large list in is not.

If you're inside Flutter, `compute(orderStops, stops)` does the same job and reads well when the function takes one argument.

## A long-lived worker

`Isolate.run` starts a new isolate every time. That takes a few milliseconds, which is nothing for a job that takes 300. But if you recalculate every time the user drags a waypoint, you'd rather keep one isolate alive and send it messages. That's `Isolate.spawn` with a `SendPort` and a `ReceivePort`. It's more code, so only reach for it when the start-up cost actually shows up in your profiling.

## Things that will surprise you

**Plugins in background isolates.** Calling a plugin that uses platform channels, like reading shared preferences, from a background isolate needs `BackgroundIsolateBinaryMessenger.ensureInitialized(token)` first, with a `RootIsolateToken` you pass in from the main isolate. Better, read what you need on the main isolate and send plain data in.

**Flutter web has no isolates.** `compute` still works on the web, but it runs the function on the main thread. If you ship the same app to the web, heavy work there needs a different plan, like a web worker or doing it on the server.

## When not to bother

Don't move everything to isolates. Copying data and starting an isolate both cost time, and for small work the overhead is bigger than the gain. Turning a 2 millisecond function into an isolate call makes it slower.

A good rule is the frame budget. If something can take longer than about 16 milliseconds on a mid-range phone, it shouldn't run on the main isolate. Measure it in profile mode with Flutter DevTools, on a real device and not the simulator, and look for frames that go over the budget. That tells you which work to move.

What's your experience with performance in mobile apps? Have you hit similar problems?
