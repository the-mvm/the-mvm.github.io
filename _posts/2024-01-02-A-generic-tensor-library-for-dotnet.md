---
layout: post
read_time: true
show_date: true
title: "A generic tensor library for .NET"
date: 2024-01-02
img: posts/20240102/EstacaoOriente.jpeg
tags: [development, .net, csharp, simd, performance]
category: development
author: Antão Almada
---

I'm currently working on an [open-source geometric coordinates library](https://netfabric.github.io/NetFabric.Numerics/), incorporating features from .NET 7 and 8. You can find details about generic math in my [previous post](https://aalmada.github.io/Generic-math-in-dotnet.html). Now, I'm focused on integrating SIMD optimizations to enhance performance.

In an [earlier post](https://aalmada.github.io/SIMD-in-dotnet.html), I explored SIMD and its role in improving math calculations. However, dealing with the additional complexity introduced by SIMD can be challenging, requiring code adaptations for various algorithms and potentially increasing the risk of bugs.

As a software engineer, my aim for this library is to reduce code repetition while maintaining performance.

In [a different post](https://www.linkedin.com/pulse/battle-loops-foreach-vs-c-ant%C3%A3o-almada/), I introduced the concept of value-type delegates, functioning similarly to C# delegates for code injection into existing algorithms. The key distinction is that, unlike C# delegates, they don't impact performance. It's about finding the right balance between abstraction and efficiency in the development process.

## Tensors

Tensors serve as a foundational concept in mathematics and physics, expanding upon the notion of vectors to a more general framework. Essentially, they're mathematical entities depicted by arrays of components, where each component is a function of the coordinates within a given space. Tensors exist in various orders, indicating the number of indices required to specify each component. To illustrate, a scalar is a zeroth-order tensor, a vector is a first-order tensor, and matrices are second-order tensors. The adaptability of tensors proves invaluable in fields such as physics, engineering, and machine learning, enabling us to succinctly and powerfully describe and manipulate intricate relationships.

The widespread adoption of this concept can be attributed to the introduction of the TensorFlow and PyTorch libraries, which fueled a recent revolution in deep learning. The capability to perform mathematical calculations using SIMD, whether on the CPU or GPU, has transformed the way we handle extensive mathematical computations.

While these libraries are primarily developed in Python, there are ports available for .NET, such as [TensorFlow.NET](https://scisharp.github.io/tensorflow-net-docs/), [TorchSharp](https://scisharp.github.io/tensorflow-net-docs/#/), and [Torch.NET](https://github.com/SciSharp/Torch.NET).

.NET 8 brings forth an updated version of the [System.Numerics.Tensors](https://www.nuget.org/packages/System.Numerics.Tensors) library. It taps into the latest .NET capabilities, allowing [direct support for low-level SIMD operations](https://devblogs.microsoft.com/dotnet/dotnet-8-hardware-intrinsics/) within the .NET environment. This library is smaller in size compared to its counterparts, it is designed exclusively for CPU execution. This characteristic makes it an attractive option for scenarios with less complexity, particularly those not requiring the use of expensive NVIDIA GPUs.

## NetFabric.Numerics.Tensors

In my ongoing work on the geometry library, I've chosen to use a `struct` approach for each geometry object, encapsulating the element values within. This differs from the conventional tensor definition, where each coordinate is typically represented by a separate tensor. Additionally, the library employs generic mathematics, utilizing generics to handle various element types. It's important to highlight that `System.Numerics.Tensors` is limited to exclusively supporting the `float` type.

Due to these considerations, I've made the decision to develop my own open-source tensors library `NetFabric.Numerics.Tensors`, drawing inspiration from `System.Numerics.Tensors` but with some notable distinctions:

-   `NetFabric.Numerics.Tensors` provides support for all value types implementing the math interfaces found in `System.Numerics`. This library is built on `Vector<T>` from `System.Numerics`, utilizing SIMD to enhance performance across all supported types. In contrast, `System.Numerics.Tensors` is restricted to only supporting `float`.

-   `System.Numerics.Tensors` employs SIMD for tensor operations regardless of the number of elements. In contrast, `NetFabric.Numerics.Tensors` leverages SIMD only when the number of elements can fully occupy at least one `Vector<T>` for the specific system it's running on. Any remaining elements are processed iteratively.

-   `NetFabric.Numerics.Tensors` is better suited for handling large collections of elements. On the other hand, `System.Numerics.Tensors` can be used for both large and small data sets, such as calculating the length of a vector with only three coordinates provided in a span.

-   While `System.Numerics.Tensors` enjoys support across various .NET versions, including the .NET Framework, `NetFabric.Numerics.Tensors` is exclusively compatible with .NET 8.

-   `NetFabric.Numerics.Tensors` accommodates pairs of values of the same type, facilitating operations on 2D vectors without the need to duplicate coordinates into separate tensors. (I still have to work on the triplets to support 3D vectors.)

### Apply and aggregate operations

`NetFabric.Numerics.Tensors` facilitates two categories of operations on spans of data:

-   `Apply`: Executes an operation using one, two, or three source spans of data, and the result is stored in the destination span. The operation can be performed in-place if the destination is the same as one of the sources.

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
    static virtual T Seed
        => Throw.NotSupportedException<T>();

    static abstract T ResultSelector(T value, Vector<T> vector);
}

public interface IAggregationPairsOperator<T>
    : IBinaryOperator<T>
    where T : struct
{
    static virtual ValueTuple<T, T> Seed
        => Throw.NotSupportedException<ValueTuple<T, T>>();

    static abstract ValueTuple<T, T> ResultSelector(ValueTuple<T, T> value, Vector<T> vector);
}
```

Take note that the interfaces utilize [static virtual members](https://learn.microsoft.com/en-us/dotnet/csharp/whats-new/tutorials/static-virtual-interface-members), a feature introduced in .NET 7. Unlike the value delegates employed in my [previous post](https://www.linkedin.com/pulse/battle-loops-foreach-vs-c-ant%C3%A3o-almada/), there's no need to create an instance of the operator to utilize the methods. This also implies that operators cannot possess inner state.

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
    public static T Seed
        => T.AdditiveIdentity;

    public static T ResultSelector(T value, Vector<T> vector)
        => Vector.Sum(vector) + value;

    public static T Invoke(T x, T y)
        => x + y;

    public static Vector<T> Invoke(Vector<T> x, Vector<T> y)
        => x + y;
}
```

This is an aggregation operator, delivering a value. The generic type `T` is constrained to `struct`, `IAdditiveIdentity<T, T>`, and `IAdditionOperators<T, T, T>`, indicating that only value types with the additive identity and the `+` operator implemented can be used. The `Seed` initializes the sum using the additive identity. The `Invoke` methods simply perform the addition operation for either a single `T` value or a `Vector<T>` of values. Lastly, the `ResultSelector` adds the partial sums resulting from summing the `Vector<T>` elements and the single `T` values.

Additionally, here's a variant of the sum that can be used for pairs of values, such as 2D vectors:

```csharp
public readonly struct SumPairsOperator<T>
    : IAggregationPairsOperator<T>
    where T : struct, IAdditiveIdentity<T, T>, IAdditionOperators<T, T, T>
{
    public static ValueTuple<T, T> Seed
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

This is an aggregation operator, producing a pair of values as a `ValueTuple<T, T>`. In this case, the `Seed` initializes the sum with a pair of additive identities. The `ResultSelector` function sums the pairs of values from `Vector<T>` to the pair of values from the single `T` values.

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

| Method     | Job       | Count |        Mean |    StdDev |        Ratio |
| ---------- | --------- | ----- | ----------: | --------: | -----------: |
| Add_Short  | Scalar    | 10000 |  5,677.0 ns |   5.66 ns |     baseline |
| Add_Short  | Vector128 | 10000 |    686.3 ns |   0.23 ns | 8.27x faster |
|            |           |       |             |           |              |
| Add_Int    | Scalar    | 10000 |  5,675.5 ns |   4.61 ns |     baseline |
| Add_Int    | Vector128 | 10000 |  1,420.2 ns |   1.76 ns | 4.00x faster |
|            |           |       |             |           |              |
| Add_Long   | Scalar    | 10000 |  5,679.9 ns |   4.35 ns |     baseline |
| Add_Long   | Vector128 | 10000 |  2,790.5 ns |   1.26 ns | 2.04x faster |
|            |           |       |             |           |              |
| Add_Half   | Scalar    | 10000 | 82,937.0 ns | 116.03 ns |     baseline |
| Add_Half   | Vector128 | 10000 | 82,846.6 ns |  41.69 ns | 1.00x faster |
|            |           |       |             |           |              |
| Add_Float  | Scalar    | 10000 |  5,138.9 ns |   1.51 ns |     baseline |
| Add_Float  | Vector128 | 10000 |  1,304.5 ns |   0.93 ns | 3.94x faster |
|            |           |       |             |           |              |
| Add_Double | Scalar    | 10000 |  5,160.2 ns |   2.76 ns |     baseline |
| Add_Double | Vector128 | 10000 |  2,793.6 ns |   1.98 ns | 1.85x faster |

**Intel i7**

| Method     | Job       | Count |         Mean |      StdDev |       Median |         Ratio |
| ---------- | --------- | ----- | -----------: | ----------: | -----------: | ------------: |
| Add_Short  | Scalar    | 10000 |   5,590.9 ns |   173.19 ns |   5,512.3 ns |      baseline |
| Add_Short  | Vector128 | 10000 |     684.5 ns |    10.51 ns |     685.5 ns |  8.22x faster |
| Add_Short  | Vector256 | 10000 |     375.7 ns |    16.26 ns |     368.5 ns | 14.89x faster |
|            |           |       |              |             |              |               |
| Add_Int    | Scalar    | 10000 |   4,069.3 ns |    53.04 ns |   4,051.1 ns |      baseline |
| Add_Int    | Vector128 | 10000 |   1,426.8 ns |    58.62 ns |   1,402.7 ns |  2.84x faster |
| Add_Int    | Vector256 | 10000 |     984.3 ns |    11.39 ns |     983.2 ns |  4.14x faster |
|            |           |       |              |             |              |               |
| Add_Long   | Scalar    | 10000 |   4,207.0 ns |   136.60 ns |   4,152.0 ns |      baseline |
| Add_Long   | Vector128 | 10000 |   2,851.6 ns |   116.40 ns |   2,811.5 ns |  1.46x faster |
| Add_Long   | Vector256 | 10000 |   1,953.5 ns |    29.76 ns |   1,945.4 ns |  2.13x faster |
|            |           |       |              |             |              |               |
| Add_Half   | Scalar    | 10000 | 111,684.1 ns | 2,809.82 ns | 110,697.1 ns |      baseline |
| Add_Half   | Vector128 | 10000 | 106,414.7 ns |   771.63 ns | 106,375.0 ns |  1.06x faster |
| Add_Half   | Vector256 | 10000 | 107,698.5 ns | 2,447.17 ns | 107,014.9 ns |  1.04x faster |
|            |           |       |              |             |              |               |
| Add_Float  | Scalar    | 10000 |   5,432.5 ns |   148.69 ns |   5,395.7 ns |      baseline |
| Add_Float  | Vector128 | 10000 |   1,661.6 ns |    26.56 ns |   1,656.8 ns |  3.24x faster |
| Add_Float  | Vector256 | 10000 |   1,008.9 ns |    36.51 ns |     995.9 ns |  5.35x faster |
|            |           |       |              |             |              |               |
| Add_Double | Scalar    | 10000 |   4,380.2 ns |    54.45 ns |   4,382.9 ns |      baseline |
| Add_Double | Vector128 | 10000 |   2,797.4 ns |    58.89 ns |   2,784.3 ns |  1.56x faster |
| Add_Double | Vector256 | 10000 |   1,967.7 ns |    35.07 ns |   1,967.1 ns |  2.23x faster |

### Sum

**Apple M1**

| Method     | Job       | Count |      Mean |    StdDev |        Ratio |
| ---------- | --------- | ----- | --------: | --------: | -----------: |
| Sum_Short  | Scalar    | 10000 | 10.284 μs | 0.0033 μs |     baseline |
| Sum_Short  | Vector128 | 10000 |  1.214 μs | 0.0010 μs | 8.47x faster |
|            |           |       |           |           |              |
| Sum_Int    | Scalar    | 10000 |  8.059 μs | 0.0043 μs |     baseline |
| Sum_Int    | Vector128 | 10000 |  2.494 μs | 0.0010 μs | 3.23x faster |
|            |           |       |           |           |              |
| Sum_Long   | Scalar    | 10000 |  8.094 μs | 0.0058 μs |     baseline |
| Sum_Long   | Vector128 | 10000 |  5.055 μs | 0.0016 μs | 1.60x faster |
|            |           |       |           |           |              |
| Sum_Half   | Scalar    | 10000 |        NA |        NA |            ? |
| Sum_Half   | Vector128 | 10000 |        NA |        NA |            ? |
|            |           |       |           |           |              |
| Sum_Float  | Scalar    | 10000 | 15.257 μs | 0.0050 μs |     baseline |
| Sum_Float  | Vector128 | 10000 |  3.730 μs | 0.0018 μs | 4.09x faster |
|            |           |       |           |           |              |
| Sum_Double | Scalar    | 10000 | 15.254 μs | 0.0060 μs |     baseline |
| Sum_Double | Vector128 | 10000 |  7.573 μs | 0.0022 μs | 2.01x faster |

**Intel i7**

| Method     | Job       | Count |        Mean |    StdDev |      Median |         Ratio |
| ---------- | --------- | ----- | ----------: | --------: | ----------: | ------------: |
| Sum_Short  | Scalar    | 10000 |  5,522.5 ns |  58.24 ns |  5,520.6 ns |      baseline |
| Sum_Short  | Vector128 | 10000 |    511.5 ns |  12.98 ns |    508.3 ns | 10.84x faster |
| Sum_Short  | Vector256 | 10000 |    258.4 ns |   2.35 ns |    257.4 ns | 21.39x faster |
|            |           |       |             |           |             |               |
| Sum_Int    | Scalar    | 10000 |  3,862.1 ns | 150.55 ns |  3,798.6 ns |      baseline |
| Sum_Int    | Vector128 | 10000 |  1,034.6 ns |  36.37 ns |  1,021.1 ns |  3.75x faster |
| Sum_Int    | Vector256 | 10000 |    526.0 ns |   7.28 ns |    525.0 ns |  7.29x faster |
|            |           |       |             |           |             |               |
| Sum_Long   | Scalar    | 10000 |  3,846.8 ns |  67.45 ns |  3,832.2 ns |      baseline |
| Sum_Long   | Vector128 | 10000 |  2,056.7 ns |  39.65 ns |  2,052.6 ns |  1.87x faster |
| Sum_Long   | Vector256 | 10000 |  1,025.1 ns |  12.06 ns |  1,023.7 ns |  3.76x faster |
|            |           |       |             |           |             |               |
| Sum_Half   | Scalar    | 10000 |          NA |        NA |          NA |             ? |
| Sum_Half   | Vector128 | 10000 |          NA |        NA |          NA |             ? |
| Sum_Half   | Vector256 | 10000 |          NA |        NA |          NA |             ? |
|            |           |       |             |           |             |               |
| Sum_Float  | Scalar    | 10000 | 12,012.7 ns | 148.28 ns | 12,039.3 ns |      baseline |
| Sum_Float  | Vector128 | 10000 |  2,613.2 ns |  21.26 ns |  2,615.2 ns |  4.60x faster |
| Sum_Float  | Vector256 | 10000 |  1,309.9 ns |  14.90 ns |  1,312.5 ns |  9.17x faster |
|            |           |       |             |           |             |               |
| Sum_Double | Scalar    | 10000 | 11,821.3 ns | 350.49 ns | 11,955.6 ns |      baseline |
| Sum_Double | Vector128 | 10000 |  5,265.3 ns |  45.11 ns |  5,272.2 ns |  2.20x faster |
| Sum_Double | Vector256 | 10000 |  2,632.7 ns |  22.63 ns |  2,631.7 ns |  4.38x faster |

### Sum Pairs

**Apple M1**

| Method     | Job       | Count |      Mean |    StdDev |        Ratio |
| ---------- | --------- | ----- | --------: | --------: | -----------: |
| Sum_Short  | Scalar    | 10000 | 11.252 μs | 0.1730 μs |     baseline |
| Sum_Short  | Vector128 | 10000 |  2.573 μs | 0.0155 μs | 4.37x faster |
|            |           |       |           |           |              |
| Sum_Int    | Scalar    | 10000 |  9.968 μs | 0.0202 μs |     baseline |
| Sum_Int    | Vector128 | 10000 |  5.143 μs | 0.0082 μs | 1.94x faster |
|            |           |       |           |           |              |
| Sum_Long   | Scalar    | 10000 |  9.943 μs | 0.0365 μs |     baseline |
| Sum_Long   | Vector128 | 10000 | 10.268 μs | 0.0182 μs | 1.03x slower |
|            |           |       |           |           |              |
| Sum_Half   | Scalar    | 10000 |        NA |        NA |            ? |
| Sum_Half   | Vector128 | 10000 |        NA |        NA |            ? |
|            |           |       |           |           |              |
| Sum_Float  | Scalar    | 10000 | 15.393 μs | 0.0587 μs |     baseline |
| Sum_Float  | Vector128 | 10000 |  7.739 μs | 0.0252 μs | 1.99x faster |
|            |           |       |           |           |              |
| Sum_Double | Scalar    | 10000 | 15.345 μs | 0.0266 μs |     baseline |
| Sum_Double | Vector128 | 10000 | 15.376 μs | 0.0438 μs | 1.00x slower |

**Intel i7**

| Method     | Job       | Count |        Mean |    StdDev |      Median |         Ratio |
| ---------- | --------- | ----- | ----------: | --------: | ----------: | ------------: |
| Sum_Short  | Scalar    | 10000 |  8,864.0 ns | 587.28 ns |  8,698.5 ns |      baseline |
| Sum_Short  | Vector128 | 10000 |  1,376.6 ns |  12.45 ns |  1,375.8 ns |  6.55x faster |
| Sum_Short  | Vector256 | 10000 |    591.6 ns |  18.60 ns |    584.3 ns | 15.04x faster |
|            |           |       |             |           |             |               |
| Sum_Int    | Scalar    | 10000 |  5,826.2 ns | 462.48 ns |  5,660.9 ns |      baseline |
| Sum_Int    | Vector128 | 10000 |  2,811.1 ns | 113.68 ns |  2,756.8 ns |  2.08x faster |
| Sum_Int    | Vector256 | 10000 |  1,359.4 ns |  11.93 ns |  1,358.8 ns |  4.01x faster |
|            |           |       |             |           |             |               |
| Sum_Long   | Scalar    | 10000 |  5,487.8 ns |  66.20 ns |  5,471.9 ns |      baseline |
| Sum_Long   | Vector128 | 10000 |  5,413.2 ns |  63.94 ns |  5,410.6 ns |  1.01x faster |
| Sum_Long   | Vector256 | 10000 |  2,083.5 ns |  30.40 ns |  2,074.0 ns |  2.63x faster |
|            |           |       |             |           |             |               |
| Sum_Half   | Scalar    | 10000 |          NA |        NA |          NA |             ? |
| Sum_Half   | Vector128 | 10000 |          NA |        NA |          NA |             ? |
| Sum_Half   | Vector256 | 10000 |          NA |        NA |          NA |             ? |
|            |           |       |             |           |             |               |
| Sum_Float  | Scalar    | 10000 | 11,937.9 ns | 239.06 ns | 12,014.6 ns |      baseline |
| Sum_Float  | Vector128 | 10000 |  5,329.7 ns |  53.87 ns |  5,322.4 ns |  2.25x faster |
| Sum_Float  | Vector256 | 10000 |  2,684.4 ns |  25.28 ns |  2,687.9 ns |  4.44x faster |
|            |           |       |             |           |             |               |
| Sum_Double | Scalar    | 10000 | 12,092.6 ns | 168.62 ns | 12,111.3 ns |      baseline |
| Sum_Double | Vector128 | 10000 | 11,839.5 ns | 102.38 ns | 11,871.5 ns |  1.02x faster |
| Sum_Double | Vector256 | 10000 |  5,328.8 ns |  50.20 ns |  5,335.7 ns |  2.27x faster |

## Conclusions

The performance improvement is directly proportional to the number of elements that can fit in a `Vector<T>`. Notably, for smaller types, the gains in performance are more pronounced. While for larger types, the benefits become noticeable only when the platform supports larger vectors. In either scenario, the code functions well without requiring any special handling.

I see `System.Numerics.Tensors` and `NetFabric.Numerics.Tensors` as examples of achieving clean code without significant performance compromises. Understanding how compilers handle your code and the system's execution is crucial. I also encourage you to explore my related post, "[A 12% improvement, easily obtained, is never considered marginal -- Donald Knuth](https://aalmada.github.io/Performance-optimizations.html)".

I do like the implementation of `System.Numerics.Tensors`. My hope is that it will eventually broaden its support to encompass a wider range of base types beyond just `float`, including provisions for pairs and triplets of data.
