---
layout: post
read_time: true
show_date: true
title: "Building Custom Iterators with 'yield' in C#"
date: 2023-09-14
img_path: /assets/img/posts/20230914
image: Yield.png
tags: [development, .net, csharp]
category: development
---

[As detailed in a previous article](https://aalmada.github.io/IEnumerable-and-pals.html), an enumerator serves as a representation of a pull stream. To obtain the next item, clients must invoke the `MoveNext()` method. If it returns`true`, it indicates a successful retrieval, and the value can be accessed through the `Current` property. The enumerator is typically implemented as a state machine, encompassing information about the current position within the stream and the current value.

On the other hand, an enumerable functions as a factory for enumerators. Each time the `GetEnumerator()` method is called, it produces a new instance of the enumerator.

These methods can be utilized explicitly or implicitly, particularly through the use of a `foreach` loop.

## yield return

In C#, the `yield return` keywords simplifies the implementation of pull streams, allowing it to be used within methods returning one of the enumerable interfaces (`IEnumerable`, `IEnumerable<T>`, or `IAsyncEnumerable<T>`) or one of the enumerator interfaces(`IEnumerator`, `IEnumerator<T>`, or `IAsyncEnumerator<T>`). For instance:

```csharp
IEnumerable<int> GetValues()
{
    yield return 1;
    yield return 2;
}
```

This method creates a sequence that yields 1, followed by 2, and then concludes. The execution of this method can be understood as follows:

- Execute code until encountering a `yield return` statement or reaching the end of the method.
- If a `yield return` statement is encountered, the method returns the provided value; otherwise, execution terminates.
- The next time the method is called, it resumes execution immediately after the previously executed `yield return`.
- Repeat from step 1.

In reality, the method is executed only once, returning an instance of an enumerable where the `MoveNext()` method and `Current` property of its enumerator are used to retrieve values.

Behind the scenes, the compiler generates the necessary code to implement the required state machine. Utilizing tools like SharpLab, [we can see that the method effectively returns an instance of a class](https://sharplab.io/#v2:EYLgxg9gTgpgtADwGwBYA+ABATABgLABQ2AjIRjgAQbEoDchhAZtDAIZgAWAFAG6tQUAlgBcYAWyEA7CgHEYwgGqsANgFcYAZy4BKbYQoGqxAJxcR47fQJliAZgA8gycIB8s+UrWadhAN77DamIqAHYKYitDI2CMMKwrAF8gA===) like the following (simplified for clarity):

```csharp
sealed class GetValues
    : IEnumerable<int>
    , IEnumerator<int>
{
    int state;
    int current;
    int initialThreadId;

    int IEnumerator<int>.Current
        => current;

    object IEnumerator.Current
        => current;

    public GetValues(int state)
    {
        this.state = state;
        initialThreadId = Environment.CurrentManagedThreadId;
    }

    void IDisposable.Dispose() {}

    bool MoveNext()
    {
        switch (state)
        {
            default:
                return false;
            case 0:
                state = -1;
                current = 1;
                state = 1;
                return true;
            case 1:
                state = -1;
                current = 2;
                state = 2;
                return true;
            case 2:
                state = -1;
                return false;
        }
    }

    bool IEnumerator.MoveNext()
        => MoveNext();

    void IEnumerator.Reset()
        => throw new NotSupportedException();

    IEnumerator<int> IEnumerable<int>.GetEnumerator()
    {
        if (state == -2 && initialThreadId == Environment.CurrentManagedThreadId)
        {
            state = 0;
            return this;
        }
        return new GetValues(0);
    }

    IEnumerator IEnumerable.GetEnumerator()
        => ((IEnumerable<int>)this).GetEnumerator();
}
```

The crucial aspect to understand is how `MoveNext()` operates. It executes based on the current value of the state. In cases where the state is `0` or `1`, it sets the `Current` value, transitions to the next state, and returns `true`. Once state `2` is reached, it transitions to the default state and always returns `false`, indicating that no more values are available.

> The `async` and `await` keywords can be explained similarly but return instances of `Task<T>` or `ValueTask<T>` instead of enumerables or enumerators.

While the presented example is straightforward for better comprehension, real-world state machines can be much more complex. For instance, the `Range()` method can be implemented to return a sequence of integers:

```csharp
static IEnumerable<int> Range(int start, int count)
{
    var end = start + count;
    for (var value = start; value < end; value++)
        yield return value;
}
```

This method repeatedly calls `yield return` with different values until the end value is reached, terminating the loop and the method. [You can experiment with it in SharpLab](https://sharplab.io/#v2:EYLgxg9gTgpgtADwGwBYA0AXEUCuA7AHwAEAmABgFgAoUgRmqLIAIjaUBua6gM2hgEMwACwAUAN35QmASwwwAtjLxMASvzwBzGCNpomtMgEpD1JmZa0AnCNkLDnKg1pILAZgA80vBgB8q9Vo23kwAzhiSGHpeGEyQ+BgmVADepuYSUjB4ACZMALyh4VAxANSxEPEO5ky8UuKSTBIANjgweQUR7A38za3uTJlZnU0txcWJVVWstCwA7F09DgC+1EA).

Additionally, asynchronous operations can be integrated with `yield`. For instance, `RangeAsync()`:

```csharp
static async IAsyncEnumerable<int> RangeAsync(int start, int count, int millisecondsDelay)
{
    var end = start + count;
    for (var value = start; value < end; value++)
    {
        await Task.Delay(millisecondsDelay).ConfigureAwait(false);
        yield return value;
    }
}
```

In this asynchronous scenario, `async` and `await` are used to pause execution, allowing other parts of the code to proceed during the delay. [You can experiment with it in SharpLab](https://sharplab.io/#v2:EYLgxg9gTgpgtADwGwBYA0AXEUCuA7AHwAEAmABgFgAoUgRmqLIAIjaUBuB51gVk6oYBOJgDNoMAIZgAFgAoAbhKhMAlhhgBbVXiYAlCXgDmMAIIBnAJ54ws2mia0y9x2QCUr6ky8tag2Ws1XfgZaJBYADiYASXMrMABRPBwNGCgJYAAbGAAeFTwMAD49A2NY6398pjMMJQx7PIwmSHw67UaNFQyMlTMYSDwAEzMAERgMiQsPKgBvT29FZRhBpgBeKpqoRoBqJogW/m9RaCYFJSZFDJwYVfXa9nOJS+vspiWB+4urra2pw9mqQ6HIjCIhIAB0o3GFlkHS6PT6EEGIzGEyCc0BPloLAA7A8ngdvABfajEqhAA).

You can also apply yield to process other enumerables, as demonstrated by `Select()`:

```csharp
static IEnumerable<TResult> Select<TSource, TResult>(IEnumerable<TSource> source, Func<TSource, TResult> selector)
{
    foreach(var item in source)
        yield return selector(item);
}
```

This method projects all items from the source using the provided selector function. [You can experiment with it in SharpLab](https://sharplab.io/#v2:EYLgxg9gTgpgtADwGwBYA0AXEUCuA7AHwAEAmABgFgAoUgRmqLIAIjaUBua6gNwEMomAZwg4oYGEwC8TAEq88AcxgAKWmia0yASk5UAZtBi8wAC2V8BASwwwAtk0t4mAZRgAbGGAzLho8eus7KQA+Bxt7AComEi0taiYElloATmVA2x0uGlokJIBmAB5HDFC5RRVioQx+DAC8DCZIfAw4qgBveMSLJhg8ABMpKpqmAGpGkXrdRKYDAXN+Jj43HAlpQWqoDHZF3mWJAp7+7aWVkZHW6enWWhYAdh293QBfLNZc1kKAFRkYQRw3EoudyeDAFT7OERiGDqb6/f4lZQfMEQvwwUK+KHqIgAVmRkP8TFhfwB6OBXmgrQ6VGmsyMpnmVnCDicGPEF0uCWudyEZIw0DS4UyVBeVGoQA).

Lastly, `Where()` can be implemented as follows:

```csharp
static IEnumerable<T> Where<T>(IEnumerable<T> source, Func<T, bool> predicate)
{
    foreach(var item in source)
    {
        if (predicate(item))
            yield return item;
    }
}
```

This method returns items from the source for which the predicate function evaluates to true. [You can experiment with it in SharpLab]().

> These methods actually have a more complex implementation in LINQ because of multiple optimizations. Check my other article "[LINQ Internals: Speed Optimizations](https://aalmada.github.io/LINQ-internals-speed-optimizations.html)" where I explain the optimizations used.

## yield break

In C#, the `yield break` statement is a valuable tool that allows for the immediate termination of a method's execution, essentially providing a shortcut that transitions the state machine to its default state. For instance, consider the `Empty()` method:

```csharp
static IEnumerable<T> Empty<T>()
{
    yield break;
}
```

This method returns an empty stream, and it does so by breaking immediately. As a result, the first call to `MoveNext()` will return `false`, indicating that no values are available. [You can experiment with it in SharpLab](https://sharplab.io/#v2:EYLgxg9gTgpgtADwGwBYA0AXEUCuA7AHwAEAmABgFgAoUgRmqLIAIjaUBua6gM2hgEMwACwAUAN35QmASwwwAtjLxMAovIAOGAJ4AeaXgwA+EQEoT1JpZa0AnCNkKTnKg1pJrAZh0AVQ6o3aPsbmVADeFlastEzAsPwA1s4AvtRAA===).

Additionally, here's an alternative implementation of the `Range()` method that utilizes `yield break`:

```csharp
static IEnumerable<int> Range(int start, int count)
{
    var value = start;
    var end = start + count;
    while(true)
    {
        if (value == end)
            yield break;

        yield return value;

        value++;
    }
}
```

This implementation employs an infinite loop with a `yield break` statement to terminate it when the specified condition is met. [You can experiment with it in SharpLab](https://sharplab.io/#v2:EYLgxg9gTgpgtADwGwBYA0AXEUCuA7AHwAEAmABgFgAoUgRmqLIAIjaUBua6gM2hgEMwACwAUAN35QmASwwwAtjLxMASvzwBzGCNpomtMgEpD1JmZa0AnCNkLDnKg1pILAZgA80vBgB8q9Vo23kwAzhiSGHpeGEyQ+BgmVADepuYSUhIANjgwTAC8oeFQGA7mTOlMMHgAJvmFEUwA1LEQ8aXmAO5C0pnaGLgwiWUpVGVl0txM4vzZuXkFVdVDYyustEzAsPwA1u0rqau060QA7OUzOXtjB2NZOY2NVwC+XFQvjlRAA==).

## Enumerables vs. enumerators

In C#, a method employing the `yield` keyword can return either one of the enumerable interfaces (`IEnumerable`, `IEnumerable<T>`, or `IAsyncEnumerable<T>`) or one of the enumerator interfaces (`IEnumerator`, `IEnumerator<T>`, or `IAsyncEnumerator<T>`).

Enumerables act as factories for enumerators, providing a `GetEnumerator()` or `GetAsyncEnumerator()` method that produces a new enumerator instance. This design allows enumerables to be iterated multiple times, generating a new enumerator for each iteration.

The `foreach` loop is applicable only to enumerables, so it is advisable to return an enumerable interface in most cases, ensuring versatility across scenarios. However, when dealing with specific scenarios where a single iteration is guaranteed, returning an enumerator interface is permissible. In such cases, the `foreach` loop is not applicable, and you must explicitly invoke the enumerator methods and properties.

[When returning `IEnumerator`](https://sharplab.io/#v2:EYLgxg9gTgpgtADwGwBYA+ABATABgLABQ2AjIRjgAQbEB0AwhADaMxgAuAlhAHYDOA3IUIA3AIZQKMbgFcAtjCii20CgF4KAcRhsAaqMbSYvABQBKQQQDuACw4tjUuQqXQaAWQjCYAORgI2ZqaEFCFUxACcDjLyispQ9NJQsNxs5kJExEgUAJIAotHOcZraegZGZoQA3sGh1MRUAOwUxBahYfUYTVgWAL5AA):

```csharp
var enumerator = GetValues();
while(enumerator.MoveNext())
{
    Console.WriteLine(enumerator.Current);
}

static IEnumerator GetValues()
{
    yield return 1;
    yield return 2;
}
```

[When returning `IEnumerator<T>`](https://sharplab.io/#v2:EYLgxg9gTgpgtADwGwBYA+ABATABgLABQ2AjIRjgAQbEoDchZOAFAG4CGUFMAdgK4C2MKGwAu0CgF4KAcRgiAamwA2vGAGcmASk2EA3oQqGKAdwAWASyUwmPAUNHQAdAFkILGADkYCEVp0EjQKpiAE4bPkFhMShHAGFeKFhuEU16AgBfBiJiJAoASQBRCPtogB5zZIA+GTlFFXUtPQMjamIqAHYKYjTA1o6KLDT0oA==):

```csharp
using(var enumerator = GetValues())
{
    while(enumerator.MoveNext())
    {
        Console.WriteLine(enumerator.Current);
    }
}

static IEnumerator<int> GetValues()
{
    yield return 1;
    yield return 2;
}
```

[When returning `IAsyncEnumerator<T>`](https://sharplab.io/#v2:EYLgxg9gTgpgtADwGwBYA+ABATABgLABQ2AjIRjgAQbEoDcZl1ArPQYQG4CGUFMAdgFcAtjCicALtAoBeCgHEY4gGqcANgJgBnABQBKVhgCcVHNv7DRE6ADoAwhD4AzAJYBzAbACCAd07Px2o5qmjC6uoQA3oQUMRTeABbOqjDaRryCImKSUNYAshDsMAByMAjinpoAnnxgenYOLu5evv6BwaHhBLHdVMSGZhmW2XYesHzi+oQAvoRkABwUAJIV1WAAooNZ0AA8zuMAfPKKKupaepHRsdTEVADsFMSs3WkYSNYAIjCqnJXaxLr1JxuDwwHx+AJBVQhSZdK7EG4Ye5YVhTIA=):

```csharp
var enumerator = GetValues();
await using(enumerator.ConfigureAwait(false))
{
    while(await enumerator.MoveNextAsync().ConfigureAwait(false))
    {
        Console.WriteLine(enumerator.Current);
    }
}

async IAsyncEnumerator<int> GetValues()
{
    yield return 1;
    await Task.Delay(1).ConfigureAwait(false);
    yield return 2;
}
```

These examples illustrate the usage of `IEnumerator`, `IEnumerator<T>`, and `IAsyncEnumerator<T>`, emphasizing the appropriate scenarios for each.

## Lazy Evaluation

As mentioned earlier, when a method utilizes the `yield` keyword, it generates an enumerable instance. The code within the method is executed only when the `MoveNext()` method of the enumerator is invoked, a concept known as "lazy evaluation."

Understanding this behavior is crucial when dealing with parameter validation. Let's consider the following code:

```csharp
static IEnumerable<int> Range(int start, int count)
{
    if (count < 0)
        throw new ArgumentException("count must not be negative");

    var end = start + count;
    for (var value = start; value < end; value++)
        yield return value;
}
```

This code requires the `count` parameter to be non-negative. However, there's a potential issue with this when the validation occurs. If we execute the following code that calls the method with an invalid parameter and then use a `foreach` loop to iterate the enumerable:

```csharp
Console.WriteLine("start");
var range = Range(0, -10);
Console.WriteLine("entering loop");
foreach(var item in range)
    Console.WriteLine(item);
```

The output is:

```
start
entering loop
System.ArgumentException: count must not be negative
   at Program.<<Main>$>g__Range|0_0(Int32 start, Int32 count)+MoveNext()
   at Program.<Main>$(String[] args)
   at System.RuntimeMethodHandle.InvokeMethod(Object target, Void** arguments, Signature sig, Boolean isConstructor)
   at System.Reflection.MethodInvoker.Invoke(Object obj, IntPtr* args, BindingFlags invokeAttr)
```

Notice that, the exception is thrown only when the code enters the `foreach` loop. This happens because the validation is only performed when `MoveNext()` is called, which is called by the `foreach`. [This behavior can be observed in SharpLab](https://sharplab.io/#v2:EYLgxg9gTgpgtADwGwBYA0AXEUCuA7AHwAEAmABgFgAoUgRmqLIAIjaUBuah2gTgAoARAGcMAQygYBASk5UAbuKZRReAOYwmAXiYAlFer5k0TOLTIzu/ATDwYYUAJZqmAGwgQADtNkAzaDFEwAAs+BSgmBzsAWwi8JX0YKWomFJZePkiYKIsqbiQ0gGYAHicMAD5dBIzbJhFxDGNSpkh8DCSqAG9k1IcfJj4WmqKmcyZu1NSMIKgIAHcmPBh5gEEoVRwomwwAUQQwGA8MBwg8QUGMJiicEQWIC+ANRdVRI7kYb3GxqgmwphsAEy0tTEEiYAGpmhBWrIJn5wqFFAoXDgNNo6hJ2EwkSimMMAZjsTAwWD2hMJqxaCwAOxY0TImCyAC+QA=).

Parameter validation should occur when the method is called, not sometime later. To achieve this, the method should be split into two parts: one that does not use `yield` and another that does. This can be accomplished using a [local function](https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/classes-and-structs/local-functions):

```csharp
static IEnumerable<int> Range(int start, int count)
{
    if (count < 0)
        throw new ArgumentException("count must not be negative");
    return GetEnumerable(start, count);

    static IEnumerable<int> GetEnumerable(int start, int count)
    {
        var end = start + count;
        for (var value = start; value < end; value++)
            yield return value;
    }
}
```

In this updated code, the portion of the method that is lazily evaluated has been moved into a `GetEnumerable()` local function. The `Range()` function first validates the parameter and then calls the local function.

The output for the previous test code is now:

```
start
System.ArgumentException: count must not be negative
   at Program.<<Main>$>g__Range|0_0(Int32 start, Int32 count)+MoveNext()
   at Program.<Main>$(String[] args)
   at System.RuntimeMethodHandle.InvokeMethod(Object target, Void** arguments, Signature sig, Boolean isConstructor)
   at System.Reflection.MethodInvoker.Invoke(Object obj, IntPtr* args, BindingFlags invokeAttr)
```

Importantly, it never reaches the enumerable instanciation. [This behavior can also be observed in SharpLab](https://sharplab.io/#v2:EYLgxg9gTgpgtADwGwBYA0AXEUCuA7AHwAEAmABgFgAoUgRmqLIAIjaUBuah2gTgAoARAGcMAQygYBASk5UAbuKZRReAOYwmAXiYAlFer5k0TOLTIzu/ATDwYYUAJZqmAGwgQADtNkAzaDFEwAAs+BSgmBzsAWwi8JX0YKWomFJZePkiYKIsqbiQ0gGYAHicMAD5dBIzbJhFxDGNSpkh8DCSqAG9k1IcfJj4WmqKmcyZu1NSMIKgIAHcmPBh5gEEoVRwomwwAUQQwGA8MBwg8QUGMJiicEQWIC+ANRdVRI7kYb3GWAHYmAHEYHZ4Db2UTAFwwPh1CTGc45CafVj5VjFUoVf6A4HKMEQppQhqxC6wz5dKgTCZhJg2AAmWlqYgkTAA1M0IK1ZGTUn5wqFFAoXDgNNo8ewmHyBUxhtSRWKYIzGe0ORzWLRvqLRPyYOzUgBfajaoA===).

## Performance

If you're concerned about performance considerations, it's essential to be mindful of the following aspects:

Using `yield` generates an enumerable and its respective enumerator types. In most cases, enumerables are slower when compared to using the array indexer, spans, or types that implement `IReadOnlyList<T>` or `IList<T>`.

When employing `yield`, the method must return an interface. These represent reference types, and the performance may not be as optimal as with value type enumerators. Also, the enumerator is allocated on the heap.

> Please refer to my other article titled "[Performance of Value-Type vs. Reference-Type Enumerators in C#](https://aalmada.github.io/Value-type-vs-reference-type-enumerables.html)" for a detailed exploration of how enumerator types impact performance.

However, it's worth noting that the lazy-evaluation nature of enumerables enables the generation of streams and their processing with minimal memory allocations, as demonstrated in the provided examples. `yield` remains a useful tool that can save substantial development and testing time. If you require enhanced performance for specific scenarios, consider exploring alternatives or implementing your custom enumerable solution.

> For further insights into performance optimizations used by LINQ, I recommend checking out my article "[LINQ Internals: Speed Optimizations](https://aalmada.github.io/LINQ-internals-speed-optimizations.html)".

## Coroutines

Coroutines are often described as [functions with the capability to pause and later resume execution](https://en.wikipedia.org/wiki/Coroutine). In essence, they are methods that can be interrupted and continued, a behavior we've previously illustrated using enumerables and yield.

This concept finds extensive application in game development, [particularly within the Unity framework](https://docs.unity3d.com/Manual/Coroutines.html). Game engines operate by executing code and then rendering frames, repeating these steps in a continuous loop. The rapid execution of this loop creates the illusion of movement, akin to a movie. Coroutines, in the context of Unity, are methods that enable the distribution of execution across multiple frames.

In Unity, a coroutine is essentially a method that returns `IEnumerator`. The Unity engine, in turn, invokes the corresponding `MoveNext()` method to resume execution just before each frame rendering. The utilization of `yield` simplifies code development and maintenance, eliminating the need to implement intricate state machines.

## Behavior Trees

[Behavior trees find practical applications in game development and robotics](<https://en.wikipedia.org/wiki/Behavior_tree_(artificial_intelligence,_robotics_and_control)>), enabling the specification of agent or robot behavior in a modular and reusable manner. While initially designed for these domains, the concept can be extended to synchronously manage code execution in various computer science fields.

A behavior tree essentially comprises multiple coroutines arranged in a tree structure. Branch modules, represented as coroutines, coordinate the execution of their child modules. These branch modules are responsible for appropriately invoking the `MoveNext()` method of their children modules. In contrast, leaf modules perform specific, often application-customized, simple tasks. The hierarchical composition of multiple modules as a tree allows for the creation of complex tasks through their combination.

Crucially, a behavior tree module can exist in one of three states: `running`, `successful`, or `failed`. Consequently, a module is required to return an `IEnumerable<BehaviorStatus>`, with `BehaviorStatus` being a type that can represent these three states. This design choice ensures that when a parent module calls the `MoveNext()` method of one of its children, it can ascertain whether the child is still in progress, has completed successfully, or has encountered a failure.

## Conclusions

In conclusion, the `yield` keyword in C# is a versatile tool offered by the compiler. While commonly used for creating collections and streams, its utility extends beyond that. It serves as a valuable resource for building easily maintainable state machines and offers a synchronous approach to managing code execution in various scenarios.
