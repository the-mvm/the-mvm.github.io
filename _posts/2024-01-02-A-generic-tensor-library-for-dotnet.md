---
layout: post
read_time: true
show_date: true
title: "A generic tensor library for .NET"
date: 2024-01-02
img: posts/20240102/EstacaoOriente.jpeg
tags: [development, .net, csharp, generics, simd, math, intrinsics, performance]
category: development
author: Antão Almada
---

I'm currently working on an [open-source geometric coordinates library](https://netfabric.github.io/NetFabric.Numerics/), incorporating features from .NET 7 and 8. You can find details about generic math in my [previous post](https://aalmada.github.io/Generic-math-in-dotnet.html). Now, I'm focused on integrating SIMD optimizations to enhance performance.

In an [earlier post](https://aalmada.github.io/SIMD-in-dotnet.html), I explored SIMD and its role in improving math calculations. However, dealing with the additional complexity introduced by SIMD can be challenging, requiring code adaptations for various algorithms and potentially increasing the risk of bugs.

As a software engineer, my aim for this library is to reduce code repetition while maintaining performance.

In [a different post](https://aalmada.github.io/The-battle-of-loops.html), I introduced the concept of value-type delegates, functioning similarly to C# delegates for code injection into existing algorithms. The key distinction is that, unlike C# delegates, they don't impact performance. It's about finding the right balance between abstraction and efficiency in the development process.

## Tensors

Tensors serve as a foundational concept in mathematics and physics, expanding upon the notion of vectors to a more general framework. Essentially, they're mathematical entities depicted by arrays of components, where each component is a function of the coordinates within a given space. Tensors exist in various orders, indicating the number of indices required to specify each component. To illustrate, a scalar is a zeroth-order tensor, a vector is a first-order tensor, and matrices are second-order tensors. The adaptability of tensors proves invaluable in fields such as physics, engineering, and machine learning, enabling us to succinctly and powerfully describe and manipulate intricate relationships.

The widespread adoption of this concept can be attributed to the introduction of the TensorFlow and PyTorch libraries, which fueled a recent revolution in deep learning. The capability to perform mathematical calculations using SIMD, whether on the CPU or GPU, has transformed the way we handle extensive mathematical computations.

While these libraries are primarily developed in Python, there are ports available for .NET, such as [TensorFlow.NET](https://scisharp.github.io/tensorflow-net-docs/), [TorchSharp](https://scisharp.github.io/tensorflow-net-docs/#/), and [Torch.NET](https://github.com/SciSharp/Torch.NET).

.NET 8 brings forth an updated version of the [System.Numerics.Tensors](https://www.nuget.org/packages/System.Numerics.Tensors) library. It taps into the latest .NET capabilities, allowing [direct support for low-level SIMD operations](https://devblogs.microsoft.com/dotnet/dotnet-8-hardware-intrinsics/) within the .NET environment. This library is smaller in size compared to its counterparts, it is designed exclusively for CPU execution. This characteristic makes it an attractive option for scenarios with less complexity, particularly those not requiring the use of expensive NVIDIA GPUs.

## NetFabric.Numerics.Tensors

In my ongoing work on the geometry library, I've used a object-oriented approach where each geometry object contains the coordinate values within. This differs from the conventional tensor usage, where each coordinate is typically represented by a separate tensor. Additionally, the library employs generic mathematics, utilizing generics to handle various element types. It's important to highlight that `System.Numerics.Tensors` is limited to exclusively supporting the `float` type.

Due to these considerations, I've made the decision to develop my own open-source tensors library `NetFabric.Numerics.Tensors`, drawing inspiration from `System.Numerics.Tensors` but with some notable distinctions:

-   `NetFabric.Numerics.Tensors` provides support for all value types implementing the math interfaces found in `System.Numerics`. This library is built on `Vector<T>` from `System.Numerics`, utilizing SIMD to enhance performance across all supported types. In contrast, `System.Numerics.Tensors` is restricted to only supporting `float`.

-   `System.Numerics.Tensors` employs SIMD for tensor operations regardless of the number of elements. In contrast, `NetFabric.Numerics.Tensors` leverages SIMD only when the number of elements can fully occupy at least one `Vector<T>` for the specific system it's running on. Any remaining elements are processed iteratively.

-   `NetFabric.Numerics.Tensors` is better suited for handling large collections of elements. On the other hand, `System.Numerics.Tensors` can be used for both large and small data sets, such as calculating the length of a vector with only two, three, or any number of dimensions provided in a span.

-   While `System.Numerics.Tensors` enjoys support across various .NET versions, including the .NET Framework, `NetFabric.Numerics.Tensors` is exclusively compatible with .NET 8.

-   `NetFabric.Numerics.Tensors` accommodates pairs and triplets of values of the same type, facilitating operations on 2D and 3D vectors without the need to duplicate coordinates into separate tensors.

### Apply and aggregate operations

`NetFabric.Numerics.Tensors` facilitates two categories of operations on spans of data:

-   `Apply`: Applies an operation using one, two, or three source spans of data, and the result is stored in the destination span. The operation can be performed in-place if the destination is the same as one of the sources.

-   `Aggregate`: Consolidates a source span of data into either a single value or a pair of values.

These methods accept a generic type representing the operations to be applied to the source spans. The operator types must implement one of the following interfaces:

```csharp
public interface IUnaryOperator<T>
    where T : struct
{
    static abstract T Invoke(T x);
    static abstract Vector<T> Invoke(Vector<T> x);
}

public interface IBinaryOperator<T>
    where T : struct
{
    static abstract T Invoke(T x, T y);
    static abstract Vector<T> Invoke(Vector<T> x, Vector<T> y);
}

public interface ITernaryOperator<T>
    where T : struct
{
    static abstract T Invoke(T x, T y, T z);
    static abstract Vector<T> Invoke(Vector<T> x, Vector<T> y, Vector<T> z);
}

public interface IAggregationOperator<T>
    : IBinaryOperator<T>
    where T : struct
{
    static virtual T Identity
        => Throw.NotSupportedException<T>();

    static abstract T ResultSelector(T value, Vector<T> vector);
}

public interface IAggregationPairsOperator<T>
    : IBinaryOperator<T>
    where T : struct
{
    static virtual ValueTuple<T, T> Identity
        => Throw.NotSupportedException<ValueTuple<T, T>>();

    static abstract ValueTuple<T, T> ResultSelector(ValueTuple<T, T> value, Vector<T> vector);
}
```

Take note that the interfaces utilize [static virtual members](https://learn.microsoft.com/en-us/dotnet/csharp/whats-new/tutorials/static-virtual-interface-members), a feature introduced in .NET 7. Unlike the value delegates employed in my [previous post](https://aalmada.github.io/The-battle-of-loops.html), there's no need to create an instance of the operator to utilize the methods. This also implies that operators cannot possess inner state.

Take, for instance, the square operator, responsible for computing the square of values:

```csharp
public readonly struct SquareOperator<T>
    : IUnaryOperator<T>
    where T : struct, IMultiplyOperators<T, T, T>
{
    public static T Invoke(T x)
        => x * x;

    public static Vector<T> Invoke(Vector<T> x)
        => x * x;
}
```

This is a unary operator, designed to operate on a single source. The generic type `T` is limited to `struct` and must implement `IMultiplyOperators<T, T, T>`, indicating that only value types with the `*` operator implemented can be used. The `Invoke` methods simply carry out the square operation for either a single `T` value or a `Vector<T>` of values.

Similarly, consider an addition operator, which computes the sum of values:

```csharp
public readonly struct AddOperator<T>
    : IBinaryOperator<T>
    where T : struct, IAdditionOperators<T, T, T>
{
    public static T Invoke(T x, T y)
        => x + y;

    public static Vector<T> Invoke(Vector<T> x, Vector<T> y)
        => x + y;
}
```

This is a binary operator, working on two sources, the addends. The generic type `T` is constrained to `struct` and must implement `IAdditionOperators<T, T, T>`, indicating that only value types with the `+` operator implemented can be used. The `Invoke` methods simply perform the addition operation for either a single `T` value or a `Vector<T>` of values.

Furthermore, an operator calculating the sum of the addition followed by multiplication of values is implemented as follows:

```csharp
public readonly struct AddMultiplyOperator<T>
    : ITernaryOperator<T>
    where T : struct, IAdditionOperators<T, T, T>, IMultiplyOperators<T, T, T>
{
    public static T Invoke(T x, T y, T z)
        => (x + y) * z;

    public static Vector<T> Invoke(Vector<T> x, Vector<T> y, Vector<T> z)
        => (x + y) * z;
}
```

This is a ternary operator, handling three sources, the addends plus the multiplier. The generic type `T` is constrained to `struct`, `IAdditionOperators<T, T, T>`, and `IMultiplyOperators<T, T, T>`, indicating that only value types with the `+` and `*` operators implemented can be used. The `Invoke` methods simply perform the addition operation followed by multiplication for either a single `T` value or a `Vector<T>` of values.

Finally, an operator determining the sum of all elements of the source is implemented as follows:

```csharp
public readonly struct SumOperator<T>
    : IAggregationOperator<T>
    where T : struct, IAdditiveIdentity<T, T>, IAdditionOperators<T, T, T>
{
    public static T Identity
        => T.AdditiveIdentity;

    public static T ResultSelector(T value, Vector<T> vector)
        => Vector.Sum(vector) + value;

    public static T Invoke(T x, T y)
        => x + y;

    public static Vector<T> Invoke(Vector<T> x, Vector<T> y)
        => x + y;
}
```

This is an aggregation operator, delivering a value. The generic type `T` is constrained to `struct`, `IAdditiveIdentity<T, T>`, and `IAdditionOperators<T, T, T>`, indicating that only value types with the additive identity and the `+` operator implemented can be used. The `Identity` initializes the sum using the additive identity. The `Invoke` methods simply perform the addition operation for either a single `T` value or a `Vector<T>` of values. Lastly, the `ResultSelector` adds the partial sums resulting from summing the `Vector<T>` elements and the single `T` values.

Additionally, here's a variant of the sum that can be used for pairs of values, such as 2D vectors:

```csharp
public readonly struct SumPairsOperator<T>
    : IAggregationPairsOperator<T>
    where T : struct, IAdditiveIdentity<T, T>, IAdditionOperators<T, T, T>
{
    public static ValueTuple<T, T> Identity
        => (T.AdditiveIdentity, T.AdditiveIdentity);

    public static ValueTuple<T, T> ResultSelector(ValueTuple<T, T> value, Vector<T> vector)
    {
        for (var index = 0; index < Vector<T>.Count; index += 2)
        {
            value.Item1 += vector[index];
            value.Item2 += vector[index + 1];
        }
        return value;
    }

    public static T Invoke(T x, T y)
        => x + y;

    public static Vector<T> Invoke(Vector<T> x, Vector<T> y)
        => x + y;
}
```

This is an aggregation operator, producing a pair of values as a `ValueTuple<T, T>`. In this case, the `Identity` initializes the sum with a pair of additive identities. The `ResultSelector` function sums the pairs of values from `Vector<T>` to the pair of values from the single `T` values.

### Using the operators

To employ the operators, you simply need to utilize either the `Apply` or `Aggregate` methods and provide the generic parameters along with the necessary method parameters. For instance, for the `Add` operation, you can choose from any of these overloads:

```csharp
public static void Add<T>(ReadOnlySpan<T> x, T y, Span<T> destination)
    where T : struct, IAdditionOperators<T, T, T>
    => Apply<T, AddOperator<T>>(x, y, destination);

public static void Add<T>(ReadOnlySpan<T> x, ValueTuple<T, T> y, Span<T> destination)
    where T : struct, IAdditionOperators<T, T, T>
    => Apply<T, AddOperator<T>>(x, y, destination);

public static void Add<T>(ReadOnlySpan<T> x, ReadOnlySpan<T> y, Span<T> destination)
    where T : struct, IAdditionOperators<T, T, T>
    => Apply<T, AddOperator<T>>(x, y, destination);
```

For the `Sum` operation, you can use the following:

```csharp
public static T Sum<T>(ReadOnlySpan<T> source)
    where T : struct, IAdditionOperators<T, T, T>, IAdditiveIdentity<T, T>
    => Aggregate<T, SumOperator<T>>(source);

public static ValueTuple<T, T> SumPairs<T>(ReadOnlySpan<T> source)
    where T : struct, IAdditionOperators<T, T, T>, IAdditiveIdentity<T, T>
    => AggregatePairs<T, SumPairsOperator<T>>(source);
```

`NetFabric.Numerics.Tensors` provides these overloads for the common operators, but you can easily implement your own operator and use it in a similar manner.

## Working with tensors for structured data

The tensors in `NetFabric.Numerics.Tensors` can handle any value-type that meets the minimum requirements. For example, the following 2D vector implementation can be used in `Sum` because it implements both `IAdditionOperators<T, T, T>` and `IAdditiveIdentity<T, T>`:

```csharp
public readonly record struct MyVector2<T>(T X, T Y)
    : IAdditiveIdentity<MyVector2<T>, MyVector2<T>>
    , IAdditionOperators<MyVector2<T>, MyVector2<T>, MyVector2<T>>
    where T : struct, INumber<T>
{
    public static MyVector2<T> AdditiveIdentity
        => new(T.AdditiveIdentity, T.AdditiveIdentity);

    public static MyVector2<T> operator +(MyVector2<T> left, MyVector2<T> right)
        => new (left.X + right.X, left.Y + right.Y);
}
```

However, `Vector<T>` does not support this type directly, so the tensor cannot use SIMD to optimize the `Sum`.

Note that this `MyVector2<T>` type has two fields of the same type and is always a value type. This means that they are stored adjacently in memory. This means that a span of `MyVector2<T>` can be converted to a span of `T` by using `MemoryMarshal.Cast<MyVector2<T>, T>()`.

This allows us to implement the following:

```csharp
public static MyVector2<T> Sum<T>(this ReadOnlySpan<MyVector2<T>> source)
    where T : struct, INumber<T>, IMinMaxValue<T>
{
    (var sumX, var sumY) = Tensor.SumPairs(MemoryMarshal.Cast<MyVector2<T>, T>(source));
    return new MyVector2<T>(sumX, sumY);
}
```

This allows the tensor to leverage SIMD to improve the performance of `Sum` for a span of `MyVector2<T>`. It's important to observe that now we need to use `SumPairs` since we are aiming for the sum of every other item in the span.

For `Apply`, the operation is applied to each element while preserving the order in the destination span. In this scenario, applying `MemoryMarshal.Cast<MyVector2<T>, T>()` to both the sources and destination is sufficient.

```csharp
public static void Add<T>(ReadOnlySpan<MyVector2<T>> angles, MyVector2<T> value, Span<MyVector2<T>> result)
    where T : struct, INumber<T>, IMinMaxValue<T>
    => Tensor.Add(MemoryMarshal.Cast<MyVector2<T>, T>(angles), (value.X, value.Y), MemoryMarshal.Cast<MyVector2<T>, T>(result));

public static void Add<T>(ReadOnlySpan<MyVector2<T>> left, ReadOnlySpan<MyVector2<T>> right, Span<MyVector2<T>> result)
    where T : struct, INumber<T>, IMinMaxValue<T>
    => Tensor.Add(MemoryMarshal.Cast<MyVector2<T>, T>(left), MemoryMarshal.Cast<MyVector2<T>, T>(right), MemoryMarshal.Cast<MyVector2<T>, T>(result));
```

## Benchmarks

I conducted benchmarks for various operations on an Apple M1 platform:

```
BenchmarkDotNet v0.13.11, macOS Sonoma 14.2.1 (23C71) [Darwin 23.2.0]
Apple M1, 1 CPU, 8 logical and 8 physical cores
.NET SDK 8.0.100
  [Host]    : .NET 8.0.0 (8.0.23.53103), Arm64 RyuJIT AdvSIMD
  Scalar    : .NET 8.0.0 (8.0.23.53103), Arm64 RyuJIT
  Vector128 : .NET 8.0.0 (8.0.23.53103), Arm64 RyuJIT AdvSIMD
```

Additionally, I performed benchmarks on an Intel i7 platform:

```
BenchmarkDotNet v0.13.11, Windows 10 (10.0.19045.3803/22H2/2022Update)
Intel Core i7-7567U CPU 3.50GHz (Kaby Lake), 1 CPU, 4 logical and 2 physical cores
.NET SDK 8.0.100
  [Host]    : .NET 8.0.0 (8.0.23.53103), X64 RyuJIT AVX2
  Scalar    : .NET 8.0.0 (8.0.23.53103), X64 RyuJIT
  Vector128 : .NET 8.0.0 (8.0.23.53103), X64 RyuJIT AVX
  Vector256 : .NET 8.0.0 (8.0.23.53103), X64 RyuJIT AVX2
```

Each benchmark involved four different jobs:

-   `Scalar` - with all SIMD turned off
-   `Vector128` - with 128-bit SIMD activated
-   `Vector256` - with 256-bit SIMD activated
-   `Vector512` - with 512-bit SIMD activated

> Please be aware that the Apple M1 only supports `Scalar` and `Vector128`. Unfortunately, I lack a system that supports `Vector256`, preventing me from conducting tests with it. The type `Half` is not yet supported by `Vector<T>`.

### Addition

**Apple M1**

| Method     | Job       | Count | Mean        | StdDev    | Ratio        | 
|----------- |---------- |------ |------------:|----------:|-------------:|-
| Add_Short  | Scalar    | 10000 |  3,488.8 ns |   4.54 ns |     baseline | 
| Add_Short  | Vector128 | 10000 |    421.2 ns |   0.49 ns | 8.28x faster | 
|            |           |       |             |           |              | 
| Add_Int    | Scalar    | 10000 |  3,496.1 ns |  20.67 ns |     baseline | 
| Add_Int    | Vector128 | 10000 |    869.8 ns |   0.76 ns | 4.02x faster | 
|            |           |       |             |           |              | 
| Add_Long   | Scalar    | 10000 |  3,524.7 ns |  30.92 ns |     baseline | 
| Add_Long   | Vector128 | 10000 |  1,712.5 ns |   1.50 ns | 2.06x faster | 
|            |           |       |             |           |              | 
| Add_Half   | Scalar    | 10000 | 51,628.3 ns | 234.75 ns |     baseline | 
| Add_Half   | Vector128 | 10000 | 51,118.0 ns |  98.57 ns | 1.01x faster | 
|            |           |       |             |           |              | 
| Add_Float  | Scalar    | 10000 |  3,156.9 ns |   3.76 ns |     baseline | 
| Add_Float  | Vector128 | 10000 |    802.1 ns |   1.69 ns | 3.93x faster | 
|            |           |       |             |           |              | 
| Add_Double | Scalar    | 10000 |  3,180.0 ns |  27.26 ns |     baseline | 
| Add_Double | Vector128 | 10000 |  1,718.9 ns |   3.54 ns | 1.85x faster | 

**Intel i7**

| Method     | Job       | Count |         Mean |      StdDev |       Median |         Ratio |
| ---------- | --------- | ----- | -----------: | ----------: | -----------: | ------------: |
| Add_Short  | Scalar    | 10000 |   6,029.5 ns |   238.03 ns |   5,944.0 ns |      baseline |
| Add_Short  | Vector128 | 10000 |     735.9 ns |    40.58 ns |     717.6 ns |  8.25x faster |
| Add_Short  | Vector256 | 10000 |     402.4 ns |    18.30 ns |     399.5 ns | 14.95x faster |
|            |           |       |              |             |              |               |
| Add_Int    | Scalar    | 10000 |   4,321.3 ns |   140.97 ns |   4,285.9 ns |      baseline |
| Add_Int    | Vector128 | 10000 |   1,510.4 ns |    78.74 ns |   1,475.1 ns |  2.85x faster |
| Add_Int    | Vector256 | 10000 |   1,133.5 ns |    73.16 ns |   1,103.6 ns |  3.84x faster |
|            |           |       |              |             |              |               |
| Add_Long   | Scalar    | 10000 |   4,305.2 ns |    68.61 ns |   4,312.1 ns |      baseline |
| Add_Long   | Vector128 | 10000 |   3,024.3 ns |   199.01 ns |   2,927.5 ns |  1.40x faster |
| Add_Long   | Vector256 | 10000 |   2,359.3 ns |   165.68 ns |   2,316.2 ns |  1.87x faster |
|            |           |       |              |             |              |               |
| Add_Half   | Scalar    | 10000 | 115,958.9 ns | 6,975.66 ns | 112,334.2 ns |      baseline |
| Add_Half   | Vector128 | 10000 | 111,266.9 ns | 8,493.85 ns | 106,796.4 ns |  1.05x faster |
| Add_Half   | Vector256 | 10000 | 106,486.7 ns | 1,441.02 ns | 106,587.8 ns |  1.10x faster |
|            |           |       |              |             |              |               |
| Add_Float  | Scalar    | 10000 |   5,901.4 ns |   349.22 ns |   5,752.3 ns |      baseline |
| Add_Float  | Vector128 | 10000 |   1,851.2 ns |   110.01 ns |   1,829.5 ns |  3.20x faster |
| Add_Float  | Vector256 | 10000 |   1,145.8 ns |    92.70 ns |   1,121.9 ns |  5.20x faster |
|            |           |       |              |             |              |               |
| Add_Double | Scalar    | 10000 |   4,482.8 ns |    56.62 ns |   4,502.8 ns |      baseline |
| Add_Double | Vector128 | 10000 |   3,171.4 ns |   270.37 ns |   3,059.5 ns |  1.47x faster |
| Add_Double | Vector256 | 10000 |   2,171.3 ns |   295.82 ns |   2,170.7 ns |  1.80x faster |

### Sum

**Apple M1**

| Method     | Job       | Count | Mean         | StdDev    | Median       | Ratio        | 
|----------- |---------- |------ |-------------:|----------:|-------------:|-------------:|-
| Sum_Short  | Scalar    | 10000 |   6,298.3 ns |   7.26 ns |   6,298.4 ns |     baseline | 
| Sum_Short  | Vector128 | 10000 |     745.5 ns |   1.45 ns |     744.9 ns | 8.45x faster | 
|            |           |       |              |           |              |              | 
| Sum_Int    | Scalar    | 10000 |   4,949.5 ns |   4.65 ns |   4,947.8 ns |     baseline | 
| Sum_Int    | Vector128 | 10000 |   1,529.4 ns |   1.39 ns |   1,529.0 ns | 3.24x faster | 
|            |           |       |              |           |              |              | 
| Sum_Long   | Scalar    | 10000 |   4,946.4 ns |   4.29 ns |   4,946.7 ns |     baseline | 
| Sum_Long   | Vector128 | 10000 |   3,101.3 ns |   2.50 ns |   3,100.6 ns | 1.59x faster | 
|            |           |       |              |           |              |              | 
| Sum_Half   | Scalar    | 10000 | 164,877.8 ns | 251.07 ns | 164,758.6 ns |     baseline | 
| Sum_Half   | Vector128 | 10000 | 164,804.9 ns | 309.48 ns | 164,711.8 ns | 1.00x faster | 
|            |           |       |              |           |              |              | 
| Sum_Float  | Scalar    | 10000 |   9,694.8 ns | 248.92 ns |   9,712.4 ns |     baseline | 
| Sum_Float  | Vector128 | 10000 |   2,287.8 ns |   2.25 ns |   2,287.8 ns | 4.23x faster | 
|            |           |       |              |           |              |              | 
| Sum_Double | Scalar    | 10000 |   9,528.9 ns | 269.41 ns |   9,373.0 ns |     baseline | 
| Sum_Double | Vector128 | 10000 |   4,672.1 ns |  36.10 ns |   4,652.4 ns | 2.08x faster | 

**Intel i7**

| Method     | Job       | Count |         Mean |      StdDev |       Median |         Ratio |
| ---------- | --------- | ----- | -----------: | ----------: | -----------: | ------------: |
| Sum_Short  | Scalar    | 10000 |   5,389.3 ns |    34.33 ns |   5,381.4 ns |      baseline |
| Sum_Short  | Vector128 | 10000 |     589.2 ns |    60.69 ns |     557.3 ns |  9.09x faster |
| Sum_Short  | Vector256 | 10000 |     291.5 ns |    22.90 ns |     282.8 ns | 18.08x faster |
|            |           |       |              |             |              |               |
| Sum_Int    | Scalar    | 10000 |   3,755.7 ns |   170.33 ns |   3,700.5 ns |      baseline |
| Sum_Int    | Vector128 | 10000 |   1,166.6 ns |   100.07 ns |   1,122.5 ns |  3.24x faster |
| Sum_Int    | Vector256 | 10000 |     562.7 ns |     7.17 ns |     564.1 ns |  6.73x faster |
|            |           |       |              |             |              |               |
| Sum_Long   | Scalar    | 10000 |   3,667.7 ns |    44.57 ns |   3,664.5 ns |      baseline |
| Sum_Long   | Vector128 | 10000 |   2,194.1 ns |    32.99 ns |   2,196.8 ns |  1.67x faster |
| Sum_Long   | Vector256 | 10000 |   1,166.2 ns |    76.00 ns |   1,138.7 ns |  3.13x faster |
|            |           |       |              |             |              |               |
| Sum_Half   | Scalar    | 10000 | 136,557.0 ns | 8,772.53 ns | 132,492.3 ns |      baseline |
| Sum_Half   | Vector128 | 10000 | 166,216.1 ns |   838.10 ns | 166,478.5 ns |  1.18x slower |
| Sum_Half   | Vector256 | 10000 | 166,010.6 ns | 1,549.13 ns | 166,065.4 ns |  1.17x slower |
|            |           |       |              |             |              |               |
| Sum_Float  | Scalar    | 10000 |  10,609.8 ns |    94.76 ns |  10,577.4 ns |      baseline |
| Sum_Float  | Vector128 | 10000 |   2,674.0 ns |    15.03 ns |   2,677.5 ns |  3.97x faster |
| Sum_Float  | Vector256 | 10000 |   1,343.3 ns |    19.20 ns |   1,342.5 ns |  7.90x faster |
|            |           |       |              |             |              |               |
| Sum_Double | Scalar    | 10000 |  10,639.7 ns |    84.98 ns |  10,636.9 ns |      baseline |
| Sum_Double | Vector128 | 10000 |   5,360.1 ns |    82.42 ns |   5,335.8 ns |  1.98x faster |
| Sum_Double | Vector256 | 10000 |   2,702.3 ns |    38.59 ns |   2,691.4 ns |  3.94x faster |

### Sum Pairs

**Apple M1**

| Method     | Job       | Count | Mean       | StdDev    | Ratio         | 
|----------- |---------- |------ |-----------:|----------:|--------------:|-
| Sum_Short  | Scalar    | 10000 |  24.513 μs | 0.0231 μs |      baseline | 
| Sum_Short  | Vector128 | 10000 |   1.599 μs | 0.0011 μs | 15.33x faster | 
|            |           |       |            |           |               | 
| Sum_Int    | Scalar    | 10000 |   5.620 μs | 0.0198 μs |      baseline | 
| Sum_Int    | Vector128 | 10000 |   3.175 μs | 0.0070 μs |  1.77x faster | 
|            |           |       |            |           |               | 
| Sum_Long   | Scalar    | 10000 |   6.059 μs | 0.0048 μs |      baseline | 
| Sum_Long   | Vector128 | 10000 |   6.084 μs | 0.0267 μs |  1.00x slower | 
|            |           |       |            |           |               | 
| Sum_Half   | Scalar    | 10000 | 177.767 μs | 0.2944 μs |      baseline | 
| Sum_Half   | Vector128 | 10000 | 178.542 μs | 1.2602 μs |  1.00x slower | 
|            |           |       |            |           |               | 
| Sum_Float  | Scalar    | 10000 |   9.425 μs | 0.0772 μs |      baseline | 
| Sum_Float  | Vector128 | 10000 |   4.722 μs | 0.0087 μs |  2.00x faster | 
|            |           |       |            |           |               | 
| Sum_Double | Scalar    | 10000 |   9.397 μs | 0.0111 μs |      baseline | 
| Sum_Double | Vector128 | 10000 |   9.394 μs | 0.0162 μs |  1.00x faster | 

**Intel i7**

| Method     | Job       | Count |         Mean |       StdDev |       Median |         Ratio |
| ---------- | --------- | ----- | -----------: | -----------: | -----------: | ------------: |
| Sum_Short  | Scalar    | 10000 |  48,984.7 ns |    672.78 ns |  48,642.0 ns |      baseline |
| Sum_Short  | Vector128 | 10000 |   1,114.3 ns |      8.85 ns |   1,113.6 ns | 43.90x faster |
| Sum_Short  | Vector256 | 10000 |     668.0 ns |     54.55 ns |     649.6 ns | 75.44x faster |
|            |           |       |              |              |              |               |
| Sum_Int    | Scalar    | 10000 |  13,987.2 ns |    210.91 ns |  13,899.7 ns |      baseline |
| Sum_Int    | Vector128 | 10000 |   2,947.6 ns |     66.05 ns |   2,944.6 ns |  4.74x faster |
| Sum_Int    | Vector256 | 10000 |   1,216.9 ns |     82.75 ns |   1,193.7 ns | 11.84x faster |
|            |           |       |              |              |              |               |
| Sum_Long   | Scalar    | 10000 |   5,271.7 ns |    136.80 ns |   5,225.2 ns |      baseline |
| Sum_Long   | Vector128 | 10000 |   5,201.4 ns |     72.87 ns |   5,197.9 ns |  1.01x faster |
| Sum_Long   | Vector256 | 10000 |   3,081.0 ns |    215.67 ns |   3,008.6 ns |  1.68x faster |
|            |           |       |              |              |              |               |
| Sum_Half   | Scalar    | 10000 | 239,293.1 ns | 20,385.65 ns | 228,534.6 ns |      baseline |
| Sum_Half   | Vector128 | 10000 | 224,593.4 ns | 16,325.55 ns | 219,436.1 ns |  1.07x faster |
| Sum_Half   | Vector256 | 10000 | 211,760.1 ns |  4,314.82 ns | 209,544.0 ns |  1.16x faster |
|            |           |       |              |              |              |               |
| Sum_Float  | Scalar    | 10000 |  24,220.7 ns |    151.22 ns |  24,197.0 ns |      baseline |
| Sum_Float  | Vector128 | 10000 |   5,423.7 ns |     73.41 ns |   5,388.3 ns |  4.48x faster |
| Sum_Float  | Vector256 | 10000 |   2,719.4 ns |     14.30 ns |   2,720.6 ns |  8.91x faster |
|            |           |       |              |              |              |               |
| Sum_Double | Scalar    | 10000 |  11,225.3 ns |    411.67 ns |  11,217.9 ns |      baseline |
| Sum_Double | Vector128 | 10000 |  10,828.0 ns |    142.42 ns |  10,745.9 ns |  1.02x faster |
| Sum_Double | Vector256 | 10000 |   5,637.4 ns |    218.04 ns |   5,634.2 ns |  1.99x faster |

## Conclusions

The performance improvement is directly proportional to the number of elements that can fit in a `Vector<T>`. Notably, for smaller types, the gains in performance are more pronounced. While for larger types, the benefits become noticeable only when the platform supports larger vectors. In either scenario, the code functions well without requiring any special handling.

I see `System.Numerics.Tensors` and `NetFabric.Numerics.Tensors` as examples of achieving "clean code" without significant performance compromises. Understanding how compilers handle your code and the system's execution is crucial. I also encourage you to explore my related post, "[A 12% improvement, easily obtained, is never considered marginal -- Donald Knuth](https://aalmada.github.io/Performance-optimizations.html)".

I do like the implementation of `System.Numerics.Tensors`. My hope is that it will eventually broaden its support to encompass a wider range of base types beyond just `float`, including provisions for pairs and triplets of data.

`System.Numerics.Tensors` is available on [NuGet](https://www.nuget.org/packages/NetFabric.Numerics.Tensors) and its source on [GitHub](https://github.com/NetFabric/NetFabric.Numerics.Tensors).
