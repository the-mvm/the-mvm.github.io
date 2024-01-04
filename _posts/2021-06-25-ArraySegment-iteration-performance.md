---
layout: post
read_time: true
show_date: true
title: "ArraySegment&lt;T&gt; iteration performance in C#"
date: 2021-06-25
img: posts/20210625/Karts.jpg
tags: [development, .net, csharp, performance]
category: development
author: Antão Almada
---

## Introduction

`ArraySegment<T>` is older and somewhat similar to `Span<T>`.

`ArraySegment<T>` has a lot less usage limitations than `Span<T>`. Both are value types but `Span<T>` cannot be used as a generics type and can only be used as a field type inside a `ref struct`. With any other `struct`, or `class`, you’ll have to use a `Memory<T>` field type. To enumerate a `Memory<T>`, you have to call its `Span` property, which creates a new instance of `Span<T>`. This may be a big performance hit if, for example, the type containing this field has a method that accesses just one item. It takes time to create the `Span<T>` instance to then simply access a memory location.

`Span<T>` supports arrays and other types of contiguous memory allocations. `ArraySegment<T>` only supports arrays.

`Span<T>` doesn’t implement `IEnumerable<T>` so the LINQ operations defined in `System.Linq` cannot be used. You’ll have to use [NetFabric.Hyperlinq](https://github.com/NetFabric/NetFabric.Hyperlinq) or [SpanLinq](https://github.com/YairHalberstadt/SpanLinq) libraries. `ArraySegment<T>` implements `IEnumerable<T>` so it can be used with any LINQ implementation.

So, how do these fairs in terms of performance?

Let’s use BenchmarkDotNet to run the following benchmarks:

```csharp
using System;
using System.Linq;
using BenchmarkDotNet.Attributes;

namespace ArrayIteration;

public class ArraySegmentBenchmarks
{
    protected ArraySegment<int> arraySegment;
    
    [Params(100)]
    public int Offset { get; set; }

    [Params(10, 1_000)]
    public int Count { get; set; }

    [Params(2_000)]
    public int Length { get; set; }

    [GlobalSetup]
    public void GlobalSetup()
    {
        var array = Enumerable.Range(0, Length).ToArray();
        arraySegment = new ArraySegment<int>(array, Offset, Count);
    }

    [Benchmark(Baseline = true)]
    public int For()
    {
        var sum = 0;
        for (var index = 0; index < arraySegment.Count; index++)
            sum += arraySegment[index];
        return sum;
    }
    
    [Benchmark]
    public int ForEach()
    {
        var sum = 0;
        foreach (var item in arraySegment)
            sum += item;
        return sum;
    }

    [Benchmark]
    public int Linq()
        => arraySegment
            .Sum();
    
    [Benchmark]
    public int Array_For()
    {
        var array = arraySegment.Array!;
        var start = arraySegment.Offset;
        var end = start + arraySegment.Count;
        var sum = 0;
        for (var index = start; index < end; index++)
            sum += array[index];
        return sum;
    }

    [Benchmark]
    public int AsSpan_ForEach()
    {
        var sum = 0;
        foreach (var item in arraySegment.AsSpan())
            sum += item;
        return sum;
    }

    [Benchmark]
    public int Array_Linq()
        => arraySegment.Array!
            .Skip(Offset)
            .Take(Count)
            .Sum();
}
```

These benchmarks use an array of 2.000 integers. It creates a `ArraySegment<int>` with an `Offset` of 100 and two different `Count` values, 10 and 1.000 items.

The `For()` benchmarks uses a `for` loop to iterate the `ArraySegment<T>`. It uses its indexer to get the item.
The `ForEach()` benchmark uses a `foreach` loop to iterate the `ArraySegment<T>`.

The `Linq()` benchmark uses the `Sum()` provided by the `System.Linq` namespace.

The `Array_For()` benchmark uses a `for` loop on the inner array of `ArraySegment<T>`. The inner array is available through the `Array` property, and the segment properties are available through the `Offset` and `Count` properties.

The `Span_ForEach()` benchmark uses `AsSpan()` and a `foreach` loop to iterate the inner array of `ArraySegment<T>`. As you can see in its source, `AsSpan()` uses the `Array`, `Offset`, and `Count` properties to create a `Span<T>` equivalent to the `ArraySegment<T>`.

The `Array_Linq()` benchmark uses on the inner array the `Skip()`, `Take()`, and `Count()` operations provided by the `System.Linq` namespace.

Here are the benchmarking results using a configuration to test on .NET 6, .NET 7 and .NET 8 (all “modern” .NET versions):

![benchmarks](./assets/img/posts/20230724/Benchmarks.png)

`ForEach()` is around 1.3x slower than `For()` for the shorter collection. Unlike arrays and `Span<T>`, the C# compiler doesn’t treat `ArraySegment<T>` as a special case. `foreach` does not use the indexer. It allocates an instance of an enumerator and uses it. Although the enumerator is a value-type, it’s still slower than using the indexer.

Both the indexer and the `Current` property of the enumerator check bounds twice. One explicitly in the code and another implicitly when indexing the array. The indexer does it in a more efficient way with only one comparison but `Current` does it with two comparisons.

`Linq()` is around 10x slower than `For()`, but 3x to 5x slower when on .NET 8. Adding to the double bounds checking in the `Current` property, it boxes the enumerator, making it a reference-type.

> NOTE: Check my other article “[Performance of value-type vs reference-type enumerators](https://aalmada.github.io/Value-type-vs-reference-type-enumerables.html)” to understand why having a value-type enumerator is an advantage.

The `Array_For()` and `AsSpan_ForEach()` have similar performance. These are 1.6x to 2x faster than `For()`. These are equivalent and faster because the array is copied to a local variable so the JIT compiler can remove bounds checking.

> NOTE: Check my other article “[Array iteration performance in C#](https://aalmada.github.io/Array-iteration-performance-in-csharp.html)” to understand how the JIT compiler can remove bounds checking.

The `Array_Linq()` is 8x to 20x slower than `For()` because more enumerators are used. Notice that 96 bytes are allocated against the 72 bytes allocated by the `Linq()` benchmark. `Skip()` and `Take()` are optimized to create only one enumerator when used together but still adds this extra enumerator.

## Conclusions

Using the indexer or the enumerator of a `ArraySegment<T>` is slow. Given that it’s possible to access its inner array, it’s just like having the array and the slice bounds in a value type. Using it this way, allows to work around a the `Memory<T>` indexing one element performance limitation.

Avoid the use of LINQ with `ArraySegment<T>` when possible.

Favor the use of `Span<T>` and `Memory<T>` when possible.
