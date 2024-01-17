---
layout: post
read_time: true
show_date: true
title: "LINQ Internals: Speed Optimizations"
date: 2023-08-22
img: posts/20230822/Pine-processionary.jpg
tags: [development, .net, csharp, linq, performance]
category: development
author: Antão Almada
---

Behind the elegant facade of LINQ lies a meticulously engineered core designed for more than just simplicity. This article delves into the technical intricacies of LINQ, focusing on the "speed optimizations" that enhance its execution efficiency. These optimizations also have many shortcomings.

## LINQ

LINQ, short for "Language Integrated Query," derives its name from its capability to compose queries directly in C#:

```csharp
var query =
    from person in people
    where person.Age > 20
    select person.Name;
```

This approach offers several advantages, primarily the ability to validate all query components at compile time rather than risking runtime failures. It also provides autocomplete support for query construction.

A powerful tool for gaining insights into the inner workings of the compiler is [SharpLab](https://sharplab.io/). Using it, [you can observe how the compiler transforms your query into code that closely resembles the following](https://sharplab.io/#v2:EYLgZgpghgLgrgJwgZwLQAdYwggdm5TXVAYwAsoEAfAAQCYAGAWACh6BGVmhgAhvYB0AGQCWuAI4BuVqwBulHuggB7dABsIPALw9cEAO48ACjmTLcAbQC6PAN6sej3QeOnzACgBEAFWUBbTwAaHnYGAEpAhyc9QxMEM1wvAGU4CCCeRgioxxjXeI9PACllMlx0gGZwyJYnZ1i3RM8kkTVZESh0gBYq1gBfaRY5BXFUhABPbWyeMAR/RQaeMXnVDSn9MhxNJXzcAQBBAHNNAD4M5hqnZAgNEhh5nYEAOSg/CAHWMGUkKHIed3kEDx5GpUotcDwRjgxmEpvwAJz/KAgiBhd4sb4AE3MagmSBIXwxPGQMAQcFueQS7n4vGer2CYjuhxRkiAA===):

```csharp
var query = 
  Enumerable.Select(
    Enumerable.Where(
      people, 
      person => person.Age > 20), 
    person => person.Name);
```

The `Enumerable` class is a static class residing within the `System.Linq` namespace, encompassing a multitude of static methods, including `Select()` and `Where()`, which are employed in this query.

> The `Enumerable` class is quite extensive, comprising hundreds of methods. It is a prime candidate for the use of the `partial` keyword, allowing the class to be organized across multiple files. You can explore its source code [here](https://github.com/dotnet/dotnet/tree/main/src/runtime/src/libraries/System.Linq/src/System/Linq).

It's important to note that all methods within the `Enumerable` class are actually declared as extension methods for `IEnumerable<T>`. Consequently, the query can be rewritten in a more intuitive form:

```csharp
var query = people
    .Where(person => person.Age > 20)
    .Select(person => person.Name);
```

This revised structure simplifies understanding. The variable `people` represents a collection implementing `IEnumerable<Person>`. The `Where()` method applies a predicate function, returning an instance of an object that also implements `IEnumerable<Person>`. Subsequently, the `Select()` method applies a selector function and provides an instance of another object implementing `IEnumerable<string>`. Ultimately, this results in a reference to an `IEnumerable<string>`.

The key takeaway is that LINQ relies on the methods declared in the `Enumerable` class. The performance of LINQ is intricately linked to the performance of these methods. This article will delve into various optimization techniques employed in LINQ to enhance its performance.

## IQueryable&lt;T&gt; and Query Providers

LINQ introduces yet another querying mechanism supported by the `IQueryable<T>` interface, which is also defined within the `System.Linq` namespace. In this scenario, the query is handed over to a provider, which dynamically transforms the query into an expression tree. Subsequently, this tree is used to generate a query that can be interpreted and executed by a different underlying engine.

Numerous "LINQ to SQL" providers exist, designed to convert the query into SQL statements that can be executed by a database. Additionally, there are various other providers, such as LinqToExcel, LinqToTwitter, LinqToCsv, LINQ-to-BigQuery, LINQ-to-GameObject-for-Unity, ElasticLINQ, GpuLinq, and many more. These diverse providers enable the execution of the same query across vastly different engines and platforms.

When employing a provider, the query execution occurs externally, and its performance hinges on numerous factors. Consequently, a comprehensive exploration of this type of query execution falls beyond the scope of this article.

## Implicit enumerator collapse

LINQ operations are inherently composable, allowing the output of one operation to serve as the input for another. As demonstrated earlier, you can easily follow a `Where()` operation with a `Select()`.
The basic implementations of `Where()` and `Select()`, without any optimizations, resemble the following code snippets:

```csharp
public static IEnumerable<TSource> Where<TSource>(
    this IEnumerable<TSource> source, 
    Func<TSource, bool> predicate)
{
    foreach(var item in source)
    {
        if(predicate(item))
            yield return item;
    }
}


public static IEnumerable<TResult> Select<TSource, TResult>(
    this IEnumerable<TSource> source, 
    Func<TSource, TResult> selector)
{
    foreach(var item in source)
    {
        yield return selector(item);
    }
} 
```

Each of these operations returns an enumerable, which means that to traverse the result of their composition, an instance of each enumerator must be created. Each item is "pulled" from one enumerator, which, in turn, "pulls" from another, and so on, until the source enumerator is reached. While composability is a major advantage of LINQ, it can also pose significant performance challenges. Thankfully, certain optimizations help mitigate this issue.

The common pattern of using `Where().Select()` has been optimized for performance. The enumerator returned by `Where()` has an overload for `Select()` that accepts both a predicate and a selector as parameters. This is equivalent to the following code:

```csharp
public static IEnumerable<TResult> WhereSelect<TSource, TResult>(
    this IEnumerable<TSource> source, 
    Func<TSource, bool> predicate, 
    Func<TSource, TResult> selector)
{
    foreach(var item in source)
    {
        if(predicate(item))
            yield return selector(item);
    }
}
```

Here, both the predicate and selector are applied within a single `foreach` loop. This eliminates one layer of enumerators, resulting in improved performance.

> For a deeper understanding of how the `foreach` loop works and its efficiency, please refer to my other article, "[Efficient Data Processing: Leveraging C#'s foreach Loop](https://aalmada.github.io/Leveraging-csharp-foreach-loop.html)".

The same optimization occurs when you have two consecutive `Where()` or `Select()` operations. It's equivalent to executing one of the following:

[For consecutive Where()](https://github.com/dotnet/dotnet/blob/b61a49ad2478ff60c30a1ca7fbf6f51452b303c5/src/runtime/src/libraries/System.Linq/src/System/Linq/Where.cs#L137C52-L137C52):

```csharp
public static IEnumerable<TSource> Where<TSource>(
    this IEnumerable<TSource> source, 
    Func<TSource, bool> predicate1, 
    Func<TSource, bool> predicate2)
    => source.Where(item => predicate1(item) && predicate2(item));
```

It takes two predicates as parameteres and consolidates the two separate `Where()` calls into a single one. In this unified `Where()` operation, the predicate combines the evaluations of the original two predicates by applying a logical AND operation to their results.

[For consecutive Select()](https://github.com/dotnet/dotnet/blob/b61a49ad2478ff60c30a1ca7fbf6f51452b303c5/src/runtime/src/libraries/System.Linq/src/System/Linq/Select.cs#L156C32-L156C32):

```csharp
public static IEnumerable<TResult> Select<TSource, TMiddle, TResult>(
    this IEnumerable<TSource> source, 
    Func<TSource, TMiddle> selector1, 
    Func<TMiddle, TResult> selector2)
    => source.Select(item => selector2(selector1(item)));
```

It takes two selectors as parameters and merges the two individual `Select()` calls into a singular operation. Within this unified `Select()`, the output of the selector from the first `Select()` is directly fed into the selector of the second `Select()`.
These enumerator optimizations happen automatically and seamlessly, requiring no code changes on your part.

## Explicit enumerator collapse

In certain scenarios, you must explicitly use specific overloads to ensure the efficient collapse of enumerators. This is particularly relevant for operations like `First()`, `FirstOrDefault()`, `Single()`, `SingleOrDefault()`, `Last()`, `LastOrDefault()`, `Any()`, and `Count()`. All of these operations offer an overload that accepts a predicate as a parameter. Interestingly, this overload yields the same result as applying a `Where()` operation with the same predicate before the parameterless extension. In essence, source.`Where(predicate).Count()` delivers identical results to `source.Count(predicate)`, although the latter may exhibit superior performance.

Here's an implementation example for the `Count()` operation, without incorporating other optimizations:

The original Count():

```csharp
public static int Count<TSource>(
    this IEnumerable<TSource> source
{
    var count = 0;
    using(var enumerator = source.GetEnumerator())
    {
        checked
        {
            while(enumerator.MoveNext())
                count++;
        }
    }
    return count;
}
```

It increments the counter until `MoveNext()` returns `false`.

The `Count()` with a predicate parameter:

```csharp
public static int Count<TSource>(
    this IEnumerable<TSource> source, 
    Func<TSource, bool> predicate)
{
    var count = 0;
    foreach(var item in source)
    {
        checked
        {
            if(predicate(item))
                count++;
        }
    }
    return count;
})
```

This second overload efficiently combines filtering and counting within a single `foreach` loop, eliminating the need for an enumerator solely for executing the predicate. It only increments the counter if the predicate returns `true` for that item.

It's important to note that implicit enumerator collapse does not function with these specific overloads as there are no overloads that provide it.

## Collection item count

Understanding the size of a collection plays a vital role in various LINQ operations and can significantly enhance overall performance.

It's important to note that all LINQ methods are designed as extension methods for `IEnumerable<T>`. When working solely with this interface, determining the number of items in a collection necessitates traversing the entire collection.

As demonstrated in the implementations of `Count()` above, the method must traverse the entire collection to perform its counting task. What exacerbates the situation is that, since the source collection is of type `IEnumerable<T>`, it forces the enumerator to become a reference type, leading to heap allocation, increasing pressure on the garbage collector, and slowing down method calls.

> For a deeper understanding of how reference type enumerators impact performance, please refer to my other article, "[Performance of Value-Type vs. Reference-Type Enumerators in C#](https://aalmada.github.io/Value-type-vs-reference-type-enumerables.html)".

Fortunately, interfaces such as `ICollection`, `ICollection<T>`, and `IReadOnlyCollection<T>` provide a `Count` property that efficiently returns the number of items. These interfaces are implemented by collections that support enumeration and internally keep track of item counts. While LINQ internally utilizes this property when available, it comes at a performance cost.

> To explore enumeration-related interfaces in more detail, please refer to my other article, "[Taming .NET Collections: A Safari Through IEnumerable and Pals](https://aalmada.github.io/IEnumerable-and-pals.html)".

Starting from .NET 6, LINQ introduces a new public method called `TryGetNonEnumeratedCount()`. Internally, it checks whether the collection implements any interface that provides the item count. If such an interface is found, it returns `true` and outputs the item count through its output parameter; otherwise, it returns `false`.

Interestingly, this method is used internally in operations like `Any()`, `ElementAt()`, and `Concat()`, but not in `Count()`, which is defined in the same file and essentially duplicates the same code.

The `TryGetNonEnumeratedCount()` method is implemented as follows:

```csharp
public static bool TryGetNonEnumeratedCount<TSource>(this IEnumerable<TSource> source, out int count)
{
    if (source == null)
    {
        ThrowHelper.ThrowArgumentNullException(ExceptionArgument.source);
    }

    if (source is ICollection<TSource> collectionoft)
    {
        count = collectionoft.Count;
        return true;
    }

    if (source is IIListProvider<TSource> listProv)
    {
        int c = listProv.GetCount(onlyIfCheap: true);
        if (c >= 0)
        {
            count = c;
            return true;
        }
    }

    if (source is ICollection collection)
    {
        count = collection.Count;
        return true;
    }

    count = 0;
    return false;
}
```

This method checks whether the collection implements `ICollection<T>`, `IIListProvider<T>`, or `ICollection`. It's worth noting that it doesn't check for the `IReadOnlyCollection<T>` interface. All collections that implement `IReadOnlyCollection<T>` should also implement `ICollection<T>` to ensure more efficient handling in LINQ.

However, it's important to recognize that checking whether the collection implements any of these interfaces carries a notable performance cost, particularly when used in operations like `Any()`, where it would only call `MoveNext()` once. This would result in the allocation of the enumerator on the heap.

`IIListProvider` is an internal interface implemented by the "iterator" implemented within LINQ. It provides the following method:

```csharp
/// <summary>
/// Returns the count of elements in the sequence.
/// </summary>
/// <param name="onlyIfCheap">
/// If true then the count should only be calculated if doing so is quick 
/// (sure or likely to be constant time), otherwise -1 should be returned.
/// </param>
/// <returns>The number of elements.</returns>
int GetCount(bool onlyIfCheap);
```

I find it unnecessary because, if it's cheap to get the item count, then the iterator should implement `ICollection<T>`. By doing so, there could be one less if statement in the `TryGetNonEnumeratedCount()` method.

> To delve deeper into how knowing the collection's size improves the performance of `ToList()` and `ToArray()`, please refer to my other article, "[ToList(), or Not ToList(), That Is the Question](https://aalmada.github.io/ToList-or-not-ToList.html)".

These optimizations introduce several challenges. Firstly, not all LINQ methods incorporate these optimizations, and among those that do, consistency is lacking, with no documented guidelines. Consequently, one must inspect the source code of each operation and its combinations for these optimizations.

## Value-type enumerators

As previously mentioned, reference type enumerators are considerably slower than their value type counterparts. Fortunately, the .NET framework offers value type enumerators for all its collections, prioritizing performance. However, a key challenge arises from the fact that LINQ methods, as extensions to `IEnumerable<T>`, tend to box and convert enumerators into reference types.

There is, however, one notable exception in LINQ: the `Where()` method. When the source is a `List<T>`, [it employs a special `WhereListIterator<T>`](https://github.com/dotnet/dotnet/blob/b61a49ad2478ff60c30a1ca7fbf6f51452b303c5/src/runtime/src/libraries/System.Linq/src/System/Linq/Where.SpeedOpt.cs#L122C38-L122C55), ensuring that the value-type enumerator provided by `List<T>` remains unboxed.

Although `List<T>` is among the most frequently used collections in .NET, alongside arrays and spans, this VIP treatment is reserved solely for this operation. Other collections do not receive the same special consideration.

## Spans

A `Span<T>` and `ReadOnlySpan<T>` can reference contiguous memory allocations, delivering exceptional traversal performance.

In .NET 8, an internal method, `TryGetSpan()`, has been introduced. This method checks if the source collection can be converted into a `ReadOnlySpan<T>`. Its implementation is as follows:

```csharp
private static bool TryGetSpan<TSource>(
    this IEnumerable<TSource> source, 
    out ReadOnlySpan<TSource> span)
    where TSource : struct
{
    if (source is null)
    {
        ThrowHelper.ThrowArgumentNullException(ExceptionArgument.source);
    }

    bool result = true;
    if (source.GetType() == typeof(TSource[]))
    {
        span = Unsafe.As<TSource[]>(source);
    }
    else if (source.GetType() == typeof(List<TSource>))
    {
        span = CollectionsMarshal.AsSpan(Unsafe.As<List<TSource>>(source));
    }
    else
    {
        span = default;
        result = false;
    }

    return result;
}
```

At present, this method can exclusively convert arrays and `List<T>`. It leverages the `CollectionsMarshal.AsSpan()` method, introduced in .NET 7. Although this "VIP treatment" is reserved for arrays and `List<T>`, adding more if statements to accommodate additional types would adversely affect the method's performance.

Regrettably, this new method is currently employed solely in mathematical operations such as `Sum()`, `Average()`, and `MinMax()`. In my opinion, it should have been integrated into many other LINQ operations, considering arrays and `List<T>` are frequently used, offering a standardized solution.

> LINQ cannot be applied directly to `Span<T>` or `ReadOnlySpan<T>` instances, as they do not implement `IEnumerable<T>`. To use LINQ operations on these, one must resort to alternative implementations as mentioned below.

## Generic math

Implementing mathematical operations in .NET has historically posed a challenge due to the inability to define math operators within interfaces. Consequently, LINQ had to provide specific implementations of `Sum()` and `Average()` for each numeric type offered by .NET, leaving out any numeric types implemented by third parties, such as vectors.

In a welcome development, .NET 7 introduced a solution that enables the implementation of generic math operations.

> For a deeper understanding of this new feature, please refer to my other article, "[Generic Math in .NET](https://aalmada.github.io/Generic-math-in-dotnet.html)".

Regrettably, in .NET 8, there is only a modest effort to employ this new feature. It is used exclusively for internal purposes, and all the overloads for numeric types are still provided. This implies that third-party numeric types continue to face challenges when attempting to use the `Sum()` and `Average()` methods efficiently. These have to provide their own overloads.

## Single Instruction, Multiple Data (SIMD)

In .NET 8, LINQ has at long last embraced the power of SIMD (Single Instruction, Multiple Data) processing. Regrettably, its utilization remains confined to specific scenarios:

- `Sum()` is leveraged but [exclusively when dealing with item types of `int` or `long`](https://github.com/dotnet/dotnet/blob/7278a1a4b5163f0a14d8eec87a58fbcd16e67946/src/runtime/src/libraries/System.Linq/src/System/Linq/Sum.cs#L42).
- `Average()` comes into play, but [only when the item type is `int`](https://github.com/dotnet/dotnet/blob/7278a1a4b5163f0a14d8eec87a58fbcd16e67946/src/runtime/src/libraries/System.Linq/src/System/Linq/Average.cs#L11).

It's worth noting that these scenarios have been carefully chosen to ensure backward compatibility when handling `NaN` (Not-a-Number) and `Infinite` values.

> To gain a comprehensive understanding of SIMD and its application in your code, please refer to my other article, "[Single Instruction, Multiple Data (SIMD) in .NET](https://aalmada.github.io/SIMD-in-dotnet.html)".

## Alternative Implementations of LINQ

Numerous alternative libraries exist that replicate the functionality of LINQ while striving to enhance performance. Some of these extensions go a step further by accommodating spans (`Span<T>`, `ReadOnlySpan<T>`, `Memory<T>`, and `ReadOnlyMemory<T>`).

For comprehensive benchmark comparisons of these diverse implementations, you can refer to the following link: [https://github.com/NetFabric/LinqBenchmarks](https://github.com/NetFabric/LinqBenchmarks)

This resource offers benchmarks for individual operations, as well as various combinations. Additionally, it furnishes benchmarks across multiple versions of the .NET framework.

## Concluding Thoughts

The abstractions offered by `IEnumerable<T>` make LINQ an invaluable library for straightforward data processing implementation and maintenance. However, it also stands as one of the primary culprits behind performance limitations in .NET applications.

.NET's performance has steadily improved, largely owing to advancements in the JIT compiler and the ongoing development of new APIs within the framework. Nevertheless, a strict commitment to preserving LINQ's full backward compatibility has limited the incorporation of many internal optimizations that align with the latest advancements.

For optimal performance, it is advisable to prioritize the use of methods provided by the collections themselves. These methods possess an intimate understanding of their internal workings that LINQ inherently lacks. Leveraging these collection-specific methods will yield significantly improved performance compared to relying solely on LINQ for data processing tasks.

