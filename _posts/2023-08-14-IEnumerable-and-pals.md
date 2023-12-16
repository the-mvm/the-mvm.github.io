---
layout: post
read_time: true
show_date: true
title: "Taming .NET Collections: A Safari Through IEnumerable and Pals"
date: 2023-08-14
img: posts/20230814/IEnumerable.png
tags: [development, .net, csharp, linq, performance]
category: development
author: Antão Almada
---

## Introduction

A collection is a fundamental concept that refers to a grouping or container for a set of related objects or values. These objects could be of any data type, such as integers, strings, custom objects, or even other collections. Collections provide a structured and organized way to store, manipulate, and manage multiple items together, making it easier to work with and process data in various scenarios. Each collection type has its own features and developers should use the one most appropriate in the given context.

Usually, data from collections need to be processed. The collection developer should not have to implement all possible processing algorithms and processing algorithms should support multiple types of collections. That's where interfaces become useful.

Interfaces, in the realm of programming, are contracts that define a set of rules and expectations for how objects should behave. An interface declares a collection of methods, properties, events, and sometimes indexers that a class must provide when it claims to implement that interface. It serves as a bridge between different classes and the code that uses them. By adhering to the specifications set by an interface, a class ensures that it can be easily integrated into various parts of a larger software system.
This article focus on the interfaces dedicated to the several aspects of collections. What they provide and when they should be used.

## IEnumerable and IEnumerator

The pair of interfaces `IEnumerable` and `IEnumerator` serves as a fundamental mechanism for sequentially traversing items from a pull stream. Sequential traversal implies that to access an item deep within the collection, one must traverse through all the preceding items. Additionally, determining the count of items within a collection requires traversing the entire collection.

These interfaces find utility not only in collections but also in various other scenarios. For example, they are used to implement coroutines in Unity and can play a crucial role in implementing behavior trees for artificial intelligence.

> Push streams can be implemented using the pair of interfaces `IObservable<T>` and `IObserver<T>`.

The `IEnumerable` interface is declared within the `System.Collections` namespace and provides a single method, `GetEnumerator()`:

```csharp
namespace System.Collections
{
    public interface IEnumerable
    {
        IEnumerator GetEnumerator();
    }
}
```

The `GetEnumerator()` method returns an instance of an object that implements the `IEnumerator` interface. It should create a new instance each time it's called, with its internal state positioned at the beginning of the stream, before the first item.

> `IEnumerable` essentially acts as a "factory" for objects that implement `IEnumerator`.

The `IEnumerator` interface is also declared within the `System.Collections` namespace and offers one read-only property and two methods:

```csharp
namespace System.Collections
{
    public interface IEnumerator
    {
        object Current { get; }

        bool MoveNext();
        void Reset();
    }
}
```

Items must be explicitly "pulled" from the stream using the `MoveNext()` method. This method returns `true` if a new item is available; otherwise, it returns `false`. In the case of an empty stream or collection, the first call to `MoveNext()` will immediately return `false`.

If `MoveNext()` returns `true`, the item's value can be obtained by accessing the `Current` property. This process can be repeated until `MoveNext()` eventually returns `false`.

The `Reset()` method can be used to reset the state to the beginning of the collection traversal. However, it may not be implemented by all streams or collections and could throw a `NotSupportedException`.

> `IEnumerator` essentially provides the mechanism for traversal and must maintain the state between calls to `MoveNext()`.

In practice, developers typically do not need to interact directly with these interfaces. Instead, they can use a `foreach` loop to simplify the process. For example, the following code calculates the sum of all items of type `int`:

```csharp
public static int SumInt(this IEnumerable source)
{
    var sum = 0;
    foreach(int item in source)
        sum += item;
    return sum;
}
```

Tools like SharpLab reveal that this code [is effectively translated into the following](https://sharplab.io/#v2:EYLgZgpghgLgrgJwgZwLQAdYwggdm5TXVAYwAsoEAfAAQCYAGAWACh6BGVmhgAhvYB0AYQD2AGzEQSMAJYj8AblasAbpR7IRiEhB4BeHrggB3HjNwwA2gF0eAbx4MAND3Yu6LgMwuALDwC+Sixc7ACcABSa2hACAMpwALYAkhbhAJRpQVyefOwAbHx0PACyAJ4AogAe2Phy+Kx2rDzNfDn8BeYwPPHJqTBkMsi5OVEIOmlNLY0sLbM8aggaifqOQXMtYCJIUOThnWbYCWa4GlpjEBMz63PIywDUBjKHa9c0AOxLCS/N/qz+QA===):

```csharp
public static int SumInt(IEnumerable source)
{
    int num = 0;
    IEnumerator enumerator = source.GetEnumerator();
    try
    {
        while (enumerator.MoveNext())
        {
            int num2 = (int)enumerator.Current;
            num += num2;
        }
        return num;
    }
    finally
    {
        IDisposable disposable = enumerator as IDisposable;
        if (disposable != null)
        {
            disposable.Dispose();
        }
    }
}
```

The process starts with a call to `GetEnumerator()` to obtain a new enumerator instance. Subsequently, `MoveNext()` and `Current` are called within a `while` loop.

It's worth noting that the value returned by the `Current` property must be cast to `int`, which means that if the collection does not contain items of type `int`, an `InvalidCastException` will be thrown.

The entire loop is enclosed within a `try`/`finally` block to ensure that the enumerator is properly disposed of, especially if it implements `IDisposable`.

While `foreach` loops are suitable for most situations, understanding how they work under the hood can help optimize specific scenarios. For instance, determining if a collection is empty can be achieved without accessing the `Current` property. Here's the equivalent of the LINQ `Any()` operation:

```csharp
public static bool Any(this IEnumerable source)
{
    var enumerator = source.GetEnumerator();
    try
    {
        return !enumerator.MoveNext();
    }
    finally
    {
        if (enumerator is IDisposable disposable)
            disposable.Dispose();
    }
}
```

This code creates an enumerator instance and returns the result of `MoveNext()`. It disposes of the enumerator, if necessary, before returning.

Similarly, the equivalent of the LINQ `First()` operation can be implemented as follows:

```csharp
public static object First(this IEnumerable source)
{
    var enumerator = source.GetEnumerator();
    try
    {
        if(!enumerator.MoveNext())
            throw new InvalidOperationException();

        return enumerator.Current;
    }
    finally
    {
        if (enumerator is IDisposable disposable)
            disposable.Dispose();
    }
}
```

This code creates an enumerator instance, throws an exception if `MoveNext()` returns `false`, and returns the value of `Current` if `MoveNext()` returns `true`. In either case, the enumerator is properly disposed before exiting the method.

[These implementations can be tested using SharpLab](https://sharplab.io/#v2:EYLgZgpghgLgrgJwgZwLQAdYwggdm5TXVAYwAsoEAaGEBOXAHwAEAmABgFgAoNgRh7N2AAmZ8AdAGEA9gBtZEEjACW0/AG4ePAG6VhyaYhIRhAXmG4IAd2HLcMANoBdYQG8Avpt58AnAAoDIwhxAEFcAE8/AEoorzF/QIRjcQAxZQRkGGjYrV4AZlE+ADZRVmEAWXCAUQAPbHxVfB5XHmE20QKxEuBpOWEwyJgyZWRCgsTjKNb2lu52+eFdBGEIXDgAWxxYaWXzCeCAcQgYKrXNhG2EaK8F9pgEcOnb2dvb5gB2YQBCVY2tmB24nK0m0EAAchA6tcngt3DD5mA7FB5I85q8Xq95sowMI/L9zpdbKMAJIAERG6GkyCgwAUwgAJhSqTSFFM0ZjbozCMzacFydzkBBoezYTC4SKYcxOsVhNJgAArRQwYRpDJZIYjMb6QxJCBs+YY25LFZnf47MzaoLiI4nU0XAFXHIi+b3VGYw0c7F+H52y5AkHgyFZGLwjltIYIaQ2Sw2Ym4XSyZT0gDy6H+jVqxnQKjUwrDt1Db0++LNCCkiCQ9hur3FmMRuGRsjd6MLC2xuJL9vNmrJTOpvIZfZZetbmK5lP7CnE/InQqdmNr7XF7iAA).

## IEnumerable&lt;T&gt; and IEnumerator&lt;T&gt;

In the early days of C#, before the introduction of generics, the interfaces `IEnumerable` and `IEnumerator` were fundamental for working with collections. The `Current` property in these interfaces returned a value of type `object`, which often needed to be cast at runtime to a specific type. Unfortunately, the compiler couldn't verify types at compile time, which introduced the risk of runtime `InvalidCastException` errors.

With the introduction of generics in C#, a new pair of equivalent interfaces, `IEnumerable<T>` and `IEnumerator<T>`, were introduced. These interfaces offer the same functionality as their non-generic counterparts but with strongly-typed items.

`IEnumerable<T>` is declared within the `System.Collections.Generic` namespace. It takes a generic type parameter `T`, and the `GetEnumerator()` method now returns an instance of an object implementing the generic interface `IEnumerator<T>`:

```csharp
namespace System.Collections.Generic
{
    public interface IEnumerable<out T> : IEnumerable
    {
        new IEnumerator<T> GetEnumerator();
    }
}
```

To ensure backward compatibility, it derives from the non-generic `IEnumerable`. Consequently, all objects implementing the generic `IEnumerable<T>` interface must also implement the non-generic `IEnumerable` interface.

Because both the generic and non-generic `GetEnumerator()` methods have the same signature, the `new` keyword is required in this new declaration. The return type is not part of the method signature.

The `IEnumerator<T>` interface simply declares a read-only `Current` property that now returns `T`, which is the type of items declared in `IEnumerable<T>`. It also derives from the non-generic `IEnumerator`, inheriting all its methods and properties:

```csharp
namespace System.Collections.Generic
{
    public interface IEnumerator<out T> : IDisposable, IEnumerator
    {
        new T Current
        {
            get;
        }
    }
}
```

Because the generic `Current` property shares the same signature as the non-generic version, it also requires the use of the `new` keyword. Moreover, it derives from `IDisposable`, indicating that enumerators implementing `IEnumerator<T>` must implement the dispose mechanism, whereas it's optional in the non-generic version.

The `foreach` loop can also be employed with these interfaces, as shown in the following example:

```csharp
static int Sum(this IEnumerable<int> source)
{
    var sum = 0;
    foreach(var item in source)
        sum += item;
    return sum;
}
```

Notice that the item type is explicitly specified in the method declaration.

> Explore my companion article on "[Generic Math in .NET](https://aalmada.github.io/Generic-math-in-dotnet.html)" to discover how to implement the `Sum()` method, accommodating numeric types of all kinds.

The generated code for this method looks as follows:

```csharp
public static int Sum(IEnumerable<int> source)
{
    int num = 0;
    IEnumerator<int> enumerator = source.GetEnumerator();
    try
    {
        while (enumerator.MoveNext())
        {
            int current = enumerator.Current;
            num += current;
        }
        return num;
    }
    finally
    {
        if (enumerator != null)
        {
            enumerator.Dispose();
        }
    }
}
```

The key differences are that now the value returned by `Current` does not require casting, and there's no need to check whether the enumerator implements `IDisposable`. This not only avoids runtime exceptions but also significantly enhances performance.

## IAsyncEnumerable&lt;T&gt; and IAsyncEnumerator&lt;T&gt; 

In the interfaces we've explored thus far, the operation is synchronous, meaning that the application may pause while waiting for the traversal of a new item. In certain scenarios, these items might be stored in a file or located on a remote computer, which can result in lengthy delays in CPU time during retrieval.

With the introduction of .NET Core 3.0, a new pair of interfaces, namely `IAsyncEnumerable<T>` and `IAsyncEnumerator<T>`, were introduced. These interfaces are also declared within the `System.Collections.Generic` namespace.

The `IAsyncEnumerable<T>` interface primarily declares a method called `GetAsyncEnumerator()`:

```csharp
namespace System.Collections.Generic
{
    public interface IAsyncEnumerable<out T>
    {
        IAsyncEnumerator<T> GetAsyncEnumerator(CancellationToken cancellationToken = default);
    }
}
```

This method returns an instance of an object that implements `IAsyncEnumerator<T>`. It also accepts an optional `CancellationToken` parameter. The token is intended to be used by the enumerator's implementer to check whether the collection traversal should be canceled. It's important to note that this method is not asynchronous itself, as its purpose is merely to create a new object instance in memory.

On the other hand, the `IAsyncEnumerator<T>` interface introduces the `MoveNextAsync()` method and the read-only `Current` property:

```csharp
namespace System.Collections.Generic
{
    public interface IAsyncEnumerator<out T> : IAsyncDisposable
    {
        ValueTask<bool> MoveNextAsync();

        T Current { get; }
    }
}
```

These two members are used in a manner similar to the previous pairs of interfaces. The key distinction is that `MoveNextAsync()` is now asynchronous. This means that, while waiting for the arrival of the next item, our application can continue performing other tasks.

Additionally, `IAsyncEnumerator<T>` derives from `IAsyncDisposable`, which includes an asynchronous `DisposeAsync()` method.

As has been the case with the previous interfaces, developers typically won't need to interact directly with these interfaces. Instead, a `foreach` loop is commonly employed, prefixed with the `await` keyword:

```csharp
public static async ValueTask<int> SumAsync(
    this IAsyncEnumerable<int> source, 
    CancellationToken token = default)
{
    var sum = 0;
    await foreach(var item in source.WithCancellation(token))
        sum += item;
    return sum;
}
```

If you examine the code generated by the compiler in SharpLab, you'll find that [it now produces a complex state machine to manage asynchronous calls](https://sharplab.io/#v2:EYLgZgpghgLgrgJwgZwLQAdYwggdm5TXVAYwAsoEAfAAQCYAGAWACh6BGVmhgAhvYAsAbi69+AOgAqZJFAAmAS1wBzEWzHsArGtZcAzH3YA2PnR4BZAJ4BRAB7Z8CgPb5WAb1Y8vfA/xM0ADh4ANSgAGzgIGiMAHiUYAD4eAGU4AFsAQWRLXBIAChgyBWQeAEksnJJrXHScKGAwiDjcRJ5kJ0QSCAAaHgBhKFyIMLDYZ1xJJwBrCFweGGnZngBeHjkIMCg4MJgASk9vDxZvE54AN0o29JWeBjVT7xoATh4wJ1lyPIuEHgVsNN+c3anQg4gA6n8yAMhiMxi4CotcLt9scHqdkNcANSrP4QNL3NE0ADsV3xBy8AF9WBSgA). Although the generated code may be challenging to follow, it should be conceptually equivalent to the following:

```csharp
public static async ValueTask<int> SumAsync(
    this IAsyncEnumerable<int> source, 
    CancellationToken token = default)
{
    var sum = 0;
    var enumerator = source.GetAsyncEnumerator(token);
    await using(enumerator.ConfigureAwait(false))
    {
        while(await enumerator.MoveNextAsync().ConfigureAwait(false))
        {
            var item = enumerator.Current;
            sum += item;
        }
    }
    return sum;
}
```

As you can see, this code closely resembles the previous interface pairs, but it incorporates `async` and `await` patterns along with the inclusion of a `CancellationToken` parameter. The `await using` construct generates an asynchronous equivalent to the `try`/`finally` block with an asynchronous call to `DisposeAsync()` within the finally section.

## IReadOnlyCollection&lt;T&gt; and IReadOnlyList&lt;T&gt;

`IReadOnlyCollection<T>` and `IReadOnlyList<T>` are two immutable collections that add features to `IEnumerable<T>`.

The `IReadOnlyCollection<T>` interface is also declared in the `System.Collections.Generic` namespace, derives from `IEnumerable<T>` and only declares a `Count` read-only property that returns the number of items in the collection.

```csharp
namespace System.Collections.Generic
{
    public interface IReadOnlyCollection<out T> : IEnumerable<T>
    {
        int Count
        {
            get;
        }
    }
}
```

This means that collections that implement this interface provide all the features provided by `IEnumerable<T>` but saves from having to traverse all the collection to find the number of items in the collection. This allows checking if the collection is empty without having to allocate an enumerator. This also allows the allocation of memory to fit all the collection without having to resize and copy items multiple times.

> Check my other article "[ToList(), or not ToList(), that is the question](https://aalmada.github.io/ToList-or-not-ToList.html)" to find how important this is for methods like `ToArray()` and `ToList()`.

The `IReadOnlyList<T>` interface is also declared in the `System.Collections.Generic` namespace, derives from `IReadOnlyCollection<T>` and only declares an indexer:

```csharp
namespace System.Collections.Generic
{
    public interface IReadOnlyList<out T> : IReadOnlyCollection<T>
    {
        T this[int index]
        {
            get;
        }
    }
}
```

This means that collections that implement this interface provide all the features described above, plus it provides random-access.

> `IReadOnlyList<T>` is actually a really bad name for this interface. Random access is common to many collections that are not lists. It got its name for historical reasons.

Random-access means that users can access the 100th element without having to traverse the 99 previous items. The user just has to pass 99 to the indexer and indices are zero-based. The number of items in the collection is given by the `Count` property provided by `IReadOnlyCollection<T>` which is mandatory to implement. As it also indirectly derives from `IEnumerable` and `IEnumerable<T>`, it also provides sequential access.

The indexer doesn't have to keep any internal state so there's no need to allocate an instance of an object like an enumerator. To get an item there's only one method call. An enumerator requires two method calls. For these reasons, using the indexer usually performs better than using the enumerator when traversing the collection.

When using a `foreach` loop on these collections, it will use the enumerator. You have to use a `for` loop to use the indexer.

> Please check my other articles "[Array iteration performance in C#](https://aalmada.github.io/Array-iteration-performance-in-csharp.html)" and "[ImmutableArray<T> iteration performance in C#](https://aalmada.github.io/ImmutableArray-enumeration-performance.html)" to understand that there are exceptions when using a `foreach` loop.

You can define an overload for `Sum()` as follow:

```csharp
public static int Sum(this IReadOnlyList<int> source)
{
    var sum = 0;
    for(var index = 0; index < source.Count; index++)
        sum += source[index];
    return sum;
}
```

This overload uses a for loop to increment an index variable and uses the indexer of the source collection.
If you provide the two overloads, the compiler will automatically choose the one to use depending on the interfaces provided by the source. 

## ICollection&lt;T&gt; and IList&lt;T&gt;

`ICollection<T>` and `IList<T>` add mutation operations to the interfaces `IReadOnlyCollection<T>` and `IReadOnlyList<T>` respectively. Historically these were actually introduced first. Before the introduction of the immutable versions, `IReadOnlyCollection<T>` and `IReadOnlyList<T>`, there was no way to only accept the immutable version. It had to be done at runtime by checking the value returned by the `IsReadOnly` property defined in `ICollection<T>`.

```csharp
namespace System.Collections.Generic
{
    public interface ICollection<T> : IEnumerable<T>
    {
        int Count
        {
            get;
        }

        bool IsReadOnly
        {
            get;
        }

        void Add(T item);
        void Clear();
        bool Contains(T item);
        void CopyTo(T[] array, int arrayIndex);
        bool Remove(T item);
    }
}
```

Notice that, although `ICollection<T>` adds features to `IReadOnlyCollection<T>`, it doesn't derive from it. To guarantee backwards compatibility, `ICollection<T>` could not be altered when `IReadOnlyCollection<T>` was introduced. Unfortunately this makes the interface hierarchy look awkward and the handling of these interfaces more complex.

Collections that implement `IReadOnlyCollection<T>` should implement `ICollection<T>`. If the collection is immutable then the property `IsReadOnly` must return `true` and all mutation operations must throw an exception. This guarantees full backwards compatibility of the collections.

All the same applies to `IList<T>`:

```csharp
namespace System.Collections.Generic
{
    public interface IList<T> : ICollection<T>
    {
        T this[int index]
        {
            get;
            set;
        }

        int IndexOf(T item);
        void Insert(int index, T item);
        void RemoveAt(int index);
    }
}
```

## What is an immutable interface?

An immutable interface is an interface that does not declare methods that can alter the internal state of the object that implements it. It doesn't mean that the object in itself is immutable. It means that when the object is interacted with using the methods declared in that particular interface, it cannot be mutated. `List<T>` is mutable but when cast to `IEnumerable<T>` it becomes immutable.

> Immutability is enforced by the compiler but there's no concept of immutability at runtime. There are many ways to mutate something that is declared as immutable. Always assume that if any anyone does it, the behavior is undefined. 

The namespace `System.Collections.Immutable` also contains the declaration of collections and interfaces that are immutable. These contain operations that appear to modify them but that actually return a new collection with the modified contents, leaving the original collection unchanged. This is very similar to how strings are manipulated in .NET.

## Which interfaces to use?

![interface hierarchy](./assets/img/posts/20230814/IEnumerable.png)
<small>The layered hierarchy of collection interfaces. Immutable interfaces in green and mutable interfaces in red.</small>

The interface that should be used depends on the scenario.

If you're implementing a method that returns a collection, you should return the interface that provides more features. For example, if you return `IReadOnlyList<T>`, the caller of the method then has the option to use either the enumerator or the indexer. If you return `IEnumerable<T>`, the caller will only be able to use the enumerator. If you return `ICollection<T>` or `IList<T>`, the caller is able to mutate the collection.

If you're implementing a method that takes a collection as parameter, you should use the interface that has the minimum required features for the given method. For example, if the method does not mutate the collection, use an immutable interface. 

If you're implementing a new collection type, you should derive it from as many interfaces as possible given the features it provides. This way, your new collection can be passed as a parameter to as many as possible existing methods. For example, to be used by LINQ, it only has to implement IEnumerable<T> but other libraries may require random access or mutation of the collection.

> If a collection implements `ICollection<T>` or `IList<T>`, it may perform better in some LINQ operations.

## Conclusions

This article focus on the core interfaces implemented by collections. The framework includes several other collection interfaces but that are specific to an implementation and harder to reuse. They are the interface version of a provided implementation. `IList<T>` is one of these but I still consider it core because it's the backwards compatible version of `IReadOnlyList<T>` which provides random-access.

I hope this article helped you to better understand each of the collection interfaces, why they exist and when to use them.

> Check my other article "[Performance of value-type vs reference-type enumerators in C#](https://aalmada.github.io/Value-type-vs-reference-type-enumerables.html)" to better understand that unfortunately the use of these interfaces may affect the performance when traversing the collections.

