---
title: "Flutter State Management: Comparing Provider, Riverpod, and Bloc"
description: "Provider, Riverpod and Bloc compared from real projects: how each one works, where it fits, and which one I would pick for a new app."
createdAt: "2024-03-10"
updatedAt: 2024-03-10
featuredImage: "/articles/flutter_state_mgt_feat.jpg"
tags:
  - mobile
  - flutter
  - dart
  - state-management
---

Every Flutter project I start comes to the same question early: how do we manage state? I've used Provider, Riverpod and Bloc in real projects, and each one fits a different kind of app. Here's how they compare.

## The Importance of State Management

First, what kind of state are we talking about? Flutter applications can have various types of state:

- **Ephemeral state**: Short-lived state that belongs to a single widget (e.g., animation state)
- **App state**: State shared across multiple widgets (e.g., user authentication status)
- **Navigation state**: The current route/screen in your application
- **Form state**: Data entered by users in forms

Good state management keeps an app easy to maintain as it grows.

## Provider: Simple Yet Powerful

Provider is built on top of InheritedWidget but simplifies its usage considerably.

### Setting Up Provider

```dart
// Define your model
class Counter extends ChangeNotifier {
  int value = 0;
  
  void increment() {
    value++;
    notifyListeners();
  }
}

// Setup in main.dart
void main() {
  runApp(
    ChangeNotifierProvider(
      create: (context) => Counter(),
      child: MyApp(),
    ),
  );
}

// Use in a widget
class CounterWidget extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Consumer<Counter>(
      builder: (context, counter, child) {
        return Text(counter.value.toString());
      },
    );
  }
}

// Update state
ElevatedButton(
  onPressed: () => context.read<Counter>().increment(),
  child: Text('Increment'),
)
```

### Pros of Provider
- Simple API, easy to learn
- Officially recommended by the Flutter team
- Good documentation and community support
- Minimal boilerplate code

### Cons of Provider
- Can become unwieldy for complex state relationships
- Provider nesting can become verbose

## Riverpod: Provider Evolved

Riverpod was created by the same developer as Provider but addresses several limitations.

### Setting Up Riverpod

```dart
// Define providers
final counterProvider = StateNotifierProvider<CounterNotifier, int>((ref) {
  return CounterNotifier();
});

class CounterNotifier extends StateNotifier<int> {
  CounterNotifier() : super(0);
  
  void increment() => state++;
}

// Setup in main.dart
void main() {
  runApp(
    ProviderScope(
      child: MyApp(),
    ),
  );
}

// Use in a widget
class CounterWidget extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final count = ref.watch(counterProvider);
    
    return Text('$count');
  }
}

// Update state
ElevatedButton(
  onPressed: () => ref.read(counterProvider.notifier).increment(),
  child: Text('Increment'),
)
```

### Pros of Riverpod
- Type-safe, with compile-time checks
- Providers can be overridden for testing
- Handles dependencies between providers elegantly
- Providers are declared outside the widget tree
- Better support for async operations with futures

### Cons of Riverpod
- Steeper learning curve than Provider
- More verbose for simple use cases
- Requires additional setup with ProviderScope

## Bloc: Structured and Scalable

Bloc separates the UI from business logic using streams and the BLoC pattern.

### Setting Up Bloc

```dart
// Define events
abstract class CounterEvent {}
class IncrementEvent extends CounterEvent {}

// Define the Bloc
class CounterBloc extends Bloc<CounterEvent, int> {
  CounterBloc() : super(0) {
    on<IncrementEvent>((event, emit) {
      emit(state + 1);
    });
  }
}

// Setup in main.dart
void main() {
  runApp(
    BlocProvider(
      create: (context) => CounterBloc(),
      child: MyApp(),
    ),
  );
}

// Use in a widget
class CounterWidget extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return BlocBuilder<CounterBloc, int>(
      builder: (context, count) {
        return Text('$count');
      },
    );
  }
}

// Update state
ElevatedButton(
  onPressed: () => context.read<CounterBloc>().add(IncrementEvent()),
  child: Text('Increment'),
)
```

### Pros of Bloc
- Clear separation of concerns
- Structured approach with events, states, and transitions
- Good for complex applications with many business logic rules
- Built-in support for state transitions and history
- Great for teams with developers of varying skill levels

### Cons of Bloc
- Significant boilerplate code
- Steeper learning curve
- Can be overkill for simpler applications

## Which One Should You Choose?

Based on my experience:

- **Use Provider** for simple to medium complexity apps
- **Use Riverpod** when you want type safety and state that does not depend on the widget tree
- **Use Bloc** for large applications with complex business logic, especially in teams

## Performance Considerations

In my testing, I've found that for most applications, performance differences between these solutions are negligible. The choice should be based on your project needs and team familiarity rather than performance alone.

## Which one I'd pick

There's no single right answer. I recommend starting with Provider for simpler applications and considering Riverpod or Bloc as your application grows in complexity.

Whichever you pick, pick it early and use it the same way everywhere. A project with two state management styles is harder to work on than one with the "wrong" one used consistently. 