---
layout: post
read_time: true
show_date: true
title: "ToList(), or not ToList(), that is the question"
date: 2023-07-22
img: posts/20230722/Plaza.jpg
tags: [development, .net, csharp, linq, performance]
category: development
author: Antão Almada
---

## Introduction

I frequently find other developers using a `ToList()` or `ToArray()` at the end of every LINQ query:

```csharp
var sequence = Enumerable.Range(0, 10)
    .ToList();

foreach(var number in sequence)
    Console.WriteLine(number);
```

Most of the time this is not necessary and can have a big impact on performance.

## Lazy evaluation

LINQ queries use lazy evaluation. This means that a query by itself doesn’t do any work. The items have to be pulled by calling the `MoveNext()` of an instance of its enumerator. This is usually done by simply using a `foreach` loop:

```csharp
var sequence = Enumerable.Range(0, 10);

foreach(var number in sequence)
    Console.WriteLine(number);
```

In this case, the `foreach` will pull the values directly from the `Enumerable.Range()` and output it to the console.

## Arrays and List<T>

Arrays and `List<T>` are data structures that allow random access. They provide an indexer than finds the item just by calculating the offset from the beginning of the allocated memory. They allow sequential access by also providing a `GetEnumerator()` method.

Arrays are contiguous portions of allocated memory. Its property `Length` returns the number of items that fits in the allocated memory. Resizing an array means allocating a new array, copying the items and releasing the original array. This is an expensive operation.

A `List<T>` contains an array. Its property `Capacity` returns the number of items that fits in this internal array. Its property `Count` returns the number of items stored in the list. The `Capacity` is always greater than or equal to `Count`.

When an item is added to the `List<T>`, `Count` is incremented and if it becomes larger than `Capacity` it means the internal array has to be resized, which we already know it’s an expensive operation. [When resizing, the `Capacity` is increased to its double, up to a maximum size](https://github.com/microsoft/referencesource/blob/51cf7850defa8a17d815b4700b67116e3fa283c2/mscorlib/system/collections/generic/list.cs#L405).

## ToList() and ToArray()

`ToList()` converts an enumerable into a `List<T>`, while `ToArray()` converts an enumerable into an array.

Their behavior depends on the source type:

- If the size of the source is known, then the required memory can be allocated, and the items copied into it. [That’s the case of `Enumerable.Range()` that implements optimized versions of these methods](https://github.com/dotnet/dotnet/blob/6bcad01f565dc9209b8bd821cd1e3759ed6646d9/src/runtime/src/libraries/System.Linq/src/System/Linq/Range.SpeedOpt.cs#L17).

- If the size is not known, then the source has to be iterated and items copied one by one, resizing accordingly. `ToList()` uses the `List<T>` resizing algorithm while [`ToArray()` uses a similar but independent resizing algorithm](https://github.com/dotnet/dotnet/blob/837e7751ea1e9ad67408ff0c6d7ad656ecf2d84f/src/runtime/src/libraries/Common/src/System/Collections/Generic/LargeArrayBuilder.SpeedOpt.cs#L13). `ToArray()` requires one extra resize in the end so that `Length` returns exactly the number of items added to it. [That’s the case of `Enumerable.Where()`](https://github.com/dotnet/corefx/blob/30ab651fcb4354552bd4891619a0bdd81e0ebdbf/src/System.Linq/src/System/Linq/Where.cs#L160).

In either case, memory has to be allocated on the heap and all the items copied. This adds pressure to the garbage collector and it’s not a cheap operation. The second case can be worse than the first, depending on the number of resizes required.

When using `ToList()` or `ToArray()` on a collection of known size:

```csharp
var sequence = Enumerable.Range(0, 10)
    .ToList();

foreach(var number in sequence)
    Console.WriteLine(number);
```

These operations have to allocate memory once and copy all the items.

When using `ToList()` or `ToArray()` on a collection of unknown size:

```csharp
var sequence = Enumerable.Range(0, 10)
    .Where(_ => true)
    .ToList();

foreach(var number in sequence)
    Console.WriteLine(number);
```

> NOTE: The Where(_ => true) is here just for benchmarking purposes. It converts the Enumerable.Range() into an IEnumerable<T> while returning the same number of items. It represents the output of most regular LINQ queries.

Now these operations have to allocate memory one or more times and copy all the items by using an equivalent to the first `foreach` loop.

## Performance

Let's compare the performance by using [BenchmarkDotNet](https://benchmarkdotnet.org/) to run the following code:

```csharp
public class ToListBenchmarks
{
    [Params(10, 1_000)]
    public int Count { get; set; }

    [Benchmark(Baseline = true)]
    public long LazyEvaluation()
    {
        var sequence = Enumerable.Range(0, Count)
            .Where(_ => true);

        var sum = 0L;
        foreach (var item in sequence)
            sum += item;
        return sum;
    }

    [Benchmark]
    public long ToList()
    {
        var sequence = Enumerable.Range(0, Count)
            .Where(_ => true)
            .ToList();

        var sum = 0L;
        foreach (var item in sequence)
            sum += item;
        return sum;
    }

    [Benchmark]
    public long ToArray()
    {
        var sequence = Enumerable.Range(0, Count)
            .Where(_ => true)
            .ToArray();

        var sum = 0L;
        foreach (var item in sequence)
            sum += item;
        return sum;
    }
}
```

It compares the performance for sources with two sizes. A small one (10 items) and a relatively large one (1.000 items).
It uses `Where(_ => true)` so that the size of the source is not known to the methods `ToList()` and `ToArray()`.

I also configured it to use .NET 6, .NET 7, and .NET 8 (all the “modern” .NET runtimes).

> NOTE: The benchmarking methods return the sum of the items so that the JIT compiler doesn’t remove any code that it considers "unused".

![benchmarks](./assets/img/posts/20230722/Benchmarks.png)

One thing to note is that the performance improves significantly between .NET 7 and .NET 8. That’s one good reason to upgrade to .NET 8 as soon as possible.

Notice the memory allocated on the heap. The lazy evaluation only allocates one enumerator (96 bytes) and it’s around 20% faster than both alternatives. `ToList()` and `ToArray()` allocate 312 bytes for 10 int values and more than 8 KB for 1.000 int values.

This benchmark adds the time of conversion and the time of enumerating the results. As I explained in my other article [“Array iteration performance in C#”](https://aalmada.github.io/Array-iteration-performance-in-csharp.html), iterating an array is much more performant than iterating a `List<T>`. We should also benchmark the conversion time independently of the iteration:

```csharp
public class ToListBenchmarks
{
    [Params(10, 1_000)]
    public int Count { get; set; }

    [Benchmark(Baseline = true)]
    public List<int> ToList() 
        => Enumerable.Range(0, Count)
            .Where(_ => true)
            .ToList();

    [Benchmark]
    public int[] ToArray() 
        => Enumerable.Range(0, Count)
            .Where(_ => true)
            .ToArray();
}
```

<center><img style="float: left;margin-right: 1em;" src='./assets/img/posts/20230722/Benchmarks2.png'></center>

Notice that most the allocated memory does come from the conversion operation and that it increases with the number of items in the sequence.

## Conclusions

`ToList()` and `ToArray()` will allocate on the heap. The size depends on the number of items and the size of the items.

Heap allocations add pressure to the garbage collection. If you allocate small amounts and keep them for short period of time, these will be handled by the Gen 0 collection, which is fast but not free. If you allocate big amount (>85,000 bytes) they will go directly into the LOH (Large Object Heap) causing its fragmentation and making it slow.

These methods should be used to cache the result of a query when:

- It’s going to be iterated more than one time.
- The total size is guaranteed to fit in memory.

A method that returns the result of a query should not internally use any of these methods. It should be the caller of the method to decide if the result should be cached and, if so, if `ToList()` or `ToArray()` is more adequate.

