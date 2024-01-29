---
layout: post
read_time: true
show_date: true
title: "A generic tensor library for .NET"
date: 2024-01-02
img_path: /assets/img/posts/20240102
image: EstacaoOriente.jpeg
tags: [development, .net, csharp, generics, simd, math, intrinsics, performance]
category: development
author: Antão Almada
---

> EDIT: Revised the content to align with the changes introduced in [version 2](https://www.nuget.org/packages/NetFabric.Numerics.Tensors) of `NetFabric.Numerics.Tensors`.

In a [previous article](https://aalmada.github.io/SIMD-in-dotnet.html), I explored SIMD and its impact on improving mathematical calculations. However, dealing with the increased complexity introduced by SIMD can be challenging, requiring code adjustments for various algorithms and potentially elevating the risk of bugs. A reusable, highly-optimized iteration of `Span<T>` would serve as a valuable tool, saving considerable development and testing time.

As a software engineer, my objective is often to minimize code redundancy while maintaining optimal performance.

In [a separate article](https://aalmada.github.io/The-battle-of-loops.html), I introduced the concept of "value-type delegates", functioning similarly to C# delegates for injecting custom code into existing algorithms. The crucial distinction is that, unlike C# delegates, they do not impact performance. This approach facilitates the creation of a library defining reusable SIMD-powered methods without compromising performance.

## Tensors: Foundations and Applications

Tensors represent a fundamental concept in mathematics and physics, extending the idea of vectors into a more versatile framework. Essentially, they are mathematical entities represented by arrays of components, where each component is a function of the coordinates within a given space. Tensors come in various orders, signifying the number of indices needed to specify each component. For example, a scalar is a zeroth-order tensor, a vector is a first-order tensor, and matrices are second-order tensors. The adaptability of tensors proves invaluable in fields such as physics, engineering, and machine learning, allowing us to concisely and powerfully describe and manipulate complex relationships.

The widespread adoption of this concept can be traced back to the introduction of the TensorFlow and PyTorch libraries, sparking a recent revolution in deep learning. The ability to perform mathematical calculations using SIMD, whether on the CPU or GPU, has transformed the landscape of extensive mathematical computations.

While these libraries are predominantly developed in Python, there are .NET ports available, such as [TensorFlow.NET](https://scisharp.github.io/tensorflow-net-docs/), [TorchSharp](https://scisharp.github.io/tensorflow-net-docs/#/), and [Torch.NET](https://github.com/SciSharp/Torch.NET).

With the release of .NET 8, an updated version of the [System.Numerics.Tensors](https://www.nuget.org/packages/System.Numerics.Tensors) library emerges. Leveraging the latest .NET capabilities, it provides [direct support for low-level SIMD operations](https://devblogs.microsoft.com/dotnet/dotnet-8-hardware-intrinsics/) within the .NET environment. This library, smaller in size compared to its counterparts, is designed exclusively for CPU execution and does not offer tensor transformation capabilities. This characteristic makes it an attractive option for less complex scenarios, especially those not requiring the use of expensive NVIDIA GPUs.

## NetFabric.Numerics.Tensors

In my ongoing work on [my geometry library](https://github.com/NetFabric/NetFabric.Numerics), my aim is to maximize vectorization, especially when dealing with collections of geometry objects. This library employs an object-oriented approach where each geometry object encapsulates its coordinate values. This differs from conventional tensor usage, where each coordinate is typically represented by a separate tensor. Moreover, the library embraces generic mathematics, utilizing generics to handle various element types. It's important to note that the current version of `System.Numerics.Tensors` is confined to exclusively supporting the `Single` type (`float` in C# or `float32` in F#).

Considering these factors, I've made the decision to develop my own open-source library named `NetFabric.Numerics.Tensors`. While drawing inspiration from `System.Numerics.Tensors`, it incorporates some distinctions:

- `NetFabric.Numerics.Tensors` provides support for all value types implementing the [generic math](https://aalmada.github.io/Generic-math-in-dotnet.html) interfaces found in the `System.Numerics` namespace. This library builds on `Vector<T>`, also from `System.Numerics`, leveraging SIMD to enhance performance across all supported types. In contrast, as mentioned earlier, `System.Numerics.Tensors` is currently limited to supporting only `Single`.

- `System.Numerics.Tensors` employs SIMD for tensor operations regardless of the number of elements. Conversely, `NetFabric.Numerics.Tensors` leverages SIMD only when the number of elements can fully occupy at least one `Vector<T>` for the specific system it's running on, processing any remaining elements iteratively.

- While `System.Numerics.Tensors` enjoys support across various .NET versions, including the .NET Framework, `NetFabric.Numerics.Tensors` is exclusively compatible with .NET 8.

- `NetFabric.Numerics.Tensors` utilizes `Vector<T>` to leverage intrinsics (SIMD) for enhanced hardware acceleration. In contrast, `System.Numerics.Tensors` relies on `Vector128`, `Vector256`, and `Vector512` for more detailed control over intrinsics. The latter provides specific control but lacks the generality and abstraction offered by `Vector<T>`. While `Vector<T>` abstracts SIMD complexity with generics support, it doesn't allow explicit control over the vector size, consistently opting for the largest available size.

- `NetFabric.Numerics.Tensors` accommodates tuples of values of the same type, streamlining operations on 2D, 3D, and 4D vectors without the need to duplicate coordinates into separate tensors.

- `NetFabric.Numerics.Tensors` empowers third-party developers to create custom operations, a capability not currently present in `System.Numerics.Tensors`.

> If your requirements involve exclusively predefined operations on `Single`, I suggest utilizing `System.Numerics.Tensors`. However, if you find yourself in need of support for different types and/or custom operators, I recommend exploring `NetFabric.Numeric.Tensors`. Give it a try, conduct benchmarks, and assess the performance gains it may offer. Below, you can find some benchmark results for reference.

Detailed documentation is provided on [its dedicated documentation site](https://netfabric.github.io/NetFabric.Numerics.Tensors/). You can also access the source code for the library on [GitHub](https://github.com/NetFabric/NetFabric.Numerics.Tensors). Feel free to delve into the repository for comprehensive insights, contribute to ongoing development, or report any encountered issues. Your exploration and involvement are encouraged.

# Getting Started with NetFabric.Numerics.Tensors

To utilize `NetFabric.Numerics.Tensors`, you can easily obtain the `System.Numerics.Tensors` package from [NuGet](https://www.nuget.org/packages/NetFabric.Numerics.Tensors). Simply include it as a dependency in your project and import it wherever necessary (`using NetFabric.Numerics.Tensors;` in C# or `open NetFabric.Numerics.Tensors` in F#).

This library offers methods designed for operations involving one, two, or three `ReadOnlySpan<T>`, depending on the specific operation. The results are then provided in a `Span<T>`, which should be supplied as the last parameter. It's essential to note that the destination `Span<T>` must be of the same size or larger than the sources. Inplace operations are supported when the destination parameter is the same as any of the sources.

> NOTE: The examples are in C#, and I hope developers using other languages can still grasp the concepts presented.

For instance, given a variable `data` of type `Span<int>`, the following code snippet replaces each element of the span with its square root:

```csharp
Tensor.Sqrt(data, data);
```

Note that since `data` serves as both the source and destination, the operation is performed inplace.

For variables `x`, `y`, and `result`, all of type `Span<float>` and of the same size, the following example updates each element in `result` with the sum of the corresponding elements in `x` and `y`:

```csharp
Tensor.Add(x, y, result);
```

The library also supports aggregation operations. For a variable `values` of type `Span<float>`, the following snippet calculates the sum of all its elements:

```csharp
var sum = Tensor.Sum(values);
```

### Custom Operations

While `NetFabric.Numerics.Tensors` provides an array of primitive operations, combining them might not be efficient, necessitating multiple iterations over the sources. Foreseeing and implementing all potential combinations can be challenging. To tackle this, `NetFabric.Numerics.Tensors` supports the implementation of custom operators. This allows you to define the specific operation for each element of the source, while still benefiting from the high-performance reusable iteration code.

Within the domain of custom operations, `NetFabric.Numerics.Tensors` facilitates two main categories of operations on spans of data:

- `Apply`: This operation employs one, two, or three source spans of data to apply a specified function, storing the result in the destination span. The operation can be executed in-place if the destination is the same as one of the sources. Additionally, it accommodates a value or a tuple instead of the second or third source spans.

- `Aggregate`: This operation consolidates a source span of data into either a single value or a tuple of values.

These methods accept a generic type representing the operations to be applied to the source spans. The operator types must implement one of the following operator interfaces:

```csharp
public interface IOperator
{
    static virtual bool IsVectorizable => true;
}

public interface IUnaryOperator<T, TResult> : IOperator
    where T : struct
    where TResult : struct
{
    static abstract TResult Invoke(T x);
    static abstract Vector<TResult> Invoke(ref readonly Vector<T> x);
}

public interface IBinaryOperator<T1, T2, TResult> : IOperator
    where T1 : struct
    where T2 : struct
    where TResult : struct
{
    static abstract TResult Invoke(T1 x, T2 y);
    static abstract Vector<TResult> Invoke(ref readonly Vector<T1> x, ref readonly Vector<T2> y);
}

public interface IGenericBinaryOperator<T1, T2, TResult> : IOperator
    where T1 : struct
    where TResult : struct
{
    static abstract TResult Invoke(T1 x, T2 y);
    static abstract Vector<TResult> Invoke(ref readonly Vector<T1> x, T2 y);
}

public interface ITernaryOperator<T1, T2, T3, TResult> : IOperator
    where T1 : struct
    where T2 : struct
    where T3 : struct
    where TResult : struct
{
    static abstract TResult Invoke(T1 x, T2 y, T3 z);
    static abstract Vector<TResult> Invoke(ref readonly Vector<T1> x, ref readonly Vector<T2> y, ref readonly Vector<T3> z);
}

public interface IAggregationOperator<T, TResult> : IBinaryOperator<TResult, T, TResult>
    where T : struct
    where TResult : struct
{
    static virtual TResult Identity => Throw.NotSupportedException<TResult>();
    static abstract TResult Invoke(TResult x, TResult y);
    static abstract TResult Invoke(TResult value, ref readonly Vector<TResult> vector);
}
```

Take note that the interfaces utilize [static virtual members](https://learn.microsoft.com/en-us/dotnet/csharp/whats-new/tutorials/static-virtual-interface-members), a feature introduced in .NET 7. Unlike the value delegates employed in my [previous post](https://aalmada.github.io/The-battle-of-loops.html), there's no need to create an instance of the operator to utilize the methods. This also means that operators are pure and cannot have internal state.

Take, for instance, the square operator, responsible for computing the square of values:

```csharp
public readonly struct SquareOperator<T> : IUnaryOperator<T>
    where T : struct, IMultiplyOperators<T, T, T>
{
    public static T Invoke(T x)
        => x * x;

    public static Vector<T> Invoke(ref readonly Vector<T> x)
        => x * x;
}
```

This is a unary operator, designed to operate on a single source. The generic type `T` is limited to `struct` and must implement `IMultiplyOperators<T, T, T>`, indicating that only value types with the `*` operator implemented can be used. The `Invoke` methods simply carry out the square operation for either a single `T` value or a `Vector<T>` of values.

Similarly, consider an addition operator, which computes the sum of values:

```csharp
readonly struct AddOperator<T> : IBinaryOperator<T, T, T>
    where T : struct, IAdditionOperators<T, T, T>
{
    public static T Invoke(T x, T y)
        => x + y;

    public static Vector<T> Invoke(ref readonly Vector<T> x, ref readonly Vector<T> y)
        => x + y;
}
```

This is a binary operator, working on two sources, the addends. The generic type `T` is constrained to `struct` and must implement `IAdditionOperators<T, T, T>`, indicating that only value types with the `+` operator implemented can be used. The `Invoke` methods simply perform the addition operation for either a single `T` value or a `Vector<T>` of values.

Furthermore, an operator calculating the addition followed by multiplication of values is implemented as follows:

```csharp
readonly struct AddMultiplyOperator<T> : ITernaryOperator<T, T, T, T>
    where T : struct, IAdditionOperators<T, T, T>, IMultiplyOperators<T, T, T>
{
    public static T Invoke(T x, T y, T z)
        => (x + y) * z;

    public static Vector<T> Invoke(ref readonly Vector<T> x, ref readonly Vector<T> y, ref readonly Vector<T> z)
        => (x + y) * z;
}
```

This is a ternary operator, handling three sources, the addends plus the multiplier. The generic type `T` is constrained to `struct`, `IAdditionOperators<T, T, T>`, and `IMultiplyOperators<T, T, T>`, indicating that only value types with the `+` and `*` operators implemented can be used. The `Invoke` methods simply perform the addition operation followed by multiplication for either a single `T` value or a `Vector<T>` of values.

Finally, an operator determining the sum of all elements of the source is implemented as follows:

```csharp
readonly struct SumOperator<T> : IAggregationOperator<T, T>
    where T : struct, IAdditiveIdentity<T, T>, IAdditionOperators<T, T, T>
{
    public static T Identity
        => T.AdditiveIdentity;

    public static T Invoke(T x, ref readonly Vector<T> y)
        => x + Vector.Sum(y);

    public static T Invoke(T x, T y)
        => x + y;

    public static Vector<T> Invoke(ref readonly Vector<T> x, ref readonly Vector<T> y)
        => x + y;
}
```

This is an aggregation operator, delivering a value. The generic type `T` is constrained to `struct`, `IAdditiveIdentity<T, T>`, and `IAdditionOperators<T, T, T>`, indicating that only value types with the additive identity and the `+` operator implemented can be used. The `Identity` initializes the sum using the additive identity. The `Invoke` methods perform the addition of `T` and `Vector<T>` values.

It's worth noting that certain operators may only be partially supported or not supported by `Vector<T>`. Take the shift left operation (`<<`), for instance. While `Vector<T>` only supports it for signed and unsigned integer primitives, any type implementing `IShiftOperators<TSelf, TOther, TResult>` can support left shift, including third-party-developed types. To accommodate all scenarios, a generic operator that isn't vectorizable can be implemented, along with specific operators for each vectorizable type. The example below illustrates this approach, focusing on the `sbyte` type:

```csharp
readonly struct ShiftLeftOperator<T, TResult> : IGenericBinaryOperator<T, int, TResult>
    where T : struct, IShiftOperators<T, int, TResult>
    where TResult : struct
{
    public static bool IsVectorizable
        => false;

    public static TResult Invoke(T value, int count)
        => value << count;

    public static Vector<TResult> Invoke(ref readonly Vector<T> value, int count)
        => Throw.NotSupportedException<Vector<TResult>>();
}

readonly struct ShiftLeftSByteOperator : IGenericBinaryOperator<sbyte, int, sbyte>
{
    public static sbyte Invoke(sbyte value, int count)
        => (sbyte)(value << count);

    public static Vector<sbyte> Invoke(ref readonly Vector<sbyte> value, int count)
        => Vector.ShiftLeft(value, count);
}
```

Please be aware that `IsVectorizable` is included in every operator, and it automatically returns `true` by default. Overloading is unnecessary unless the intention is to return `false`.

Note that the operator implements `IGenericBinaryOperator<T1, T2, TResult`. This denotes a binary operator where the vectorization method accepts a value rather than a vector as the second parameter.

### Using the operators

To employ the operators, you simply need to utilize either the `Apply` or `Aggregate` methods and provide the generic parameters along with the necessary method parameters. For instance, for the `Add` operation, the following overloads are provided:

```csharp
public static void Add<T>(ReadOnlySpan<T> x, T y, Span<T> destination)
    where T : struct, IAdditionOperators<T, T, T>
    => Apply<T, AddOperator<T>>(x, y, destination);

public static void Add<T>(ReadOnlySpan<T> x, ValueTuple<T, T> y, Span<T> destination)
    where T : struct, IAdditionOperators<T, T, T>
    => Apply<T, AddOperator<T>>(x, y, destination);

public static void Add<T>(ReadOnlySpan<T> x, ValueTuple<T, T, T> y, Span<T> destination)
    where T : struct, IAdditionOperators<T, T, T>
    => Apply<T, AddOperator<T>>(x, y, destination);

public static void Add<T>(ReadOnlySpan<T> x, ReadOnlySpan<T> y, Span<T> destination)
    where T : struct, IAdditionOperators<T, T, T>
    => Apply<T, AddOperator<T>>(x, y, destination);
```

It's noteworthy that these not only support the addition of values in two spans but also the addition of either a constant or a tuple of constants to the values in a span.

For the `Sum` operation, the following is provided:

```csharp
public static T Sum<T>(ReadOnlySpan<T> source)
    where T : struct, IAdditionOperators<T, T, T>, IAdditiveIdentity<T, T>
    => Aggregate<T, SumOperator<T>>(source);

public static ValueTuple<T, T> Sum2D<T>(ReadOnlySpan<T> source)
    where T : struct, IAdditionOperators<T, T, T>, IAdditiveIdentity<T, T>
    => Aggregate2D<T, SumOperator<T>>(source);

public static ValueTuple<T, T, T> Sum3D<T>(ReadOnlySpan<T> source)
    where T : struct, IAdditionOperators<T, T, T>, IAdditiveIdentity<T, T>
    => Aggregate3D<T, SumOperator<T>>(source);

public static ValueTuple<T, T, T, T> Sum4D<T>(ReadOnlySpan<T> source)
    where T : struct, IAdditionOperators<T, T, T>, IAdditiveIdentity<T, T>
    => Aggregate4D<T, SumOperator<T>>(source);
```

For `ShiftLeft`, which supplies implementations for specific types, the compiler will automatically choose the suitable overload based on the type being utilized by providing the following methods:

```csharp
public static void ShiftLeft<T>(ReadOnlySpan<T> value, int count, Span<T> destination)
    where T : struct, IShiftOperators<T, int, T>
    => ShiftLeft<T, T>(value, count, destination);

public static void ShiftLeft<T, TResult>(ReadOnlySpan<T> value, int count, Span<TResult> destination)
    where T : struct, IShiftOperators<T, int, TResult>
    where TResult : struct
    => ApplyGeneric<T, int, TResult, ShiftLeftOperator<T, TResult>>(value, count, destination);

public static void ShiftLeft(ReadOnlySpan<sbyte> value, int count, Span<sbyte> destination)
    => ApplyGeneric<sbyte, int, sbyte, ShiftLeftSByteOperator>(value, count, destination);
```

For conciseness, only the overload for `sbyte` type is shown here.

`NetFabric.Numerics.Tensors` provides these overloads for the primitive operators, but you can easily implement your own operator and use it in a similar manner.

## Working with tensors for structured data

The tensors in `NetFabric.Numerics.Tensors` can handle any value-type that meets the minimum requirements. For example, the following 2D vector implementation can be used in `Sum` because it implements both `IAdditionOperators<T, T, T>` and `IAdditiveIdentity<T, T>`:

```csharp
public readonly record struct MyVector2<T>(T X, T Y)
    : IAdditiveIdentity<MyVector2<T>, MyVector2<T>>
    , IAdditionOperators<MyVector2<T>, MyVector2<T>, MyVector2<T>>
    where T : struct, INumber<T>
{
    public MyVector2(ValueTuple<T, T> tuple)
        : this(tuple.Item1, tuple.Item2)
    { }

    public static MyVector2<T> AdditiveIdentity
        => new(T.AdditiveIdentity, T.AdditiveIdentity);

    public static MyVector2<T> operator +(MyVector2<T> left, MyVector2<T> right)
        => new (left.X + right.X, left.Y + right.Y);
}
```

However, `Vector<T>` does not support this type directly, so the tensor cannot use SIMD to optimize the `Sum`.

Please note that the `MyVector2<T>` type comprises two fields of the same type and is always a value type, implying that they are stored adjacently in memory. Consequently, a `Span<MyVector2<T>>` can be effortlessly converted to a `Span<T>` by utilizing `MemoryMarshal.Cast<MyVector2<T>, T>()`.

This capability enables the implementation of the following:

```csharp
public static MyVector2<T> Sum<T>(this ReadOnlySpan<MyVector2<T>> source)
    where T : struct, INumber<T>, IMinMaxValue<T>
    => new(Tensor.Sum2D(MemoryMarshal.Cast<MyVector2<T>, T>(source)));
```

This implementation allows the tensor to leverage SIMD for enhanced performance in the `Sum` operation on a span of `MyVector2<T>`, interpreting it as a span of its internal values. It's noteworthy that the use of `Sum2D` is essential, reflecting the intention to calculate the sum of every other item in the span.

Regarding `Apply`, the operation is applied to each element while maintaining the order in the destination span. In this context, applying `MemoryMarshal.Cast<MyVector2<T>, T>()` to both the sources and destination is adequate:

```csharp
public static void Add<T>(ReadOnlySpan<MyVector2<T>> angles, MyVector2<T> value, Span<MyVector2<T>> result)
    where T : struct, INumber<T>, IMinMaxValue<T>
    => Tensor.Add(MemoryMarshal.Cast<MyVector2<T>, T>(angles), (value.X, value.Y), MemoryMarshal.Cast<MyVector2<T>, T>(result));

public static void Add<T>(ReadOnlySpan<MyVector2<T>> left, ReadOnlySpan<MyVector2<T>> right, Span<MyVector2<T>> result)
    where T : struct, INumber<T>, IMinMaxValue<T>
    => Tensor.Add(MemoryMarshal.Cast<MyVector2<T>, T>(left), MemoryMarshal.Cast<MyVector2<T>, T>(right), MemoryMarshal.Cast<MyVector2<T>, T>(result));
```

## Benchmarks

I conducted benchmarks for various operations on the following system:

```
BenchmarkDotNet v0.13.12, Windows 11 (10.0.22631.3007/23H2/2023Update/SunValley3)
AMD Ryzen 9 7940HS w/ Radeon 780M Graphics, 1 CPU, 16 logical and 8 physical cores
.NET SDK 8.0.101
  [Host]    : .NET 8.0.1 (8.0.123.58001), X64 RyuJIT AVX-512F+CD+BW+DQ+VL+VBMI
  Scalar    : .NET 8.0.1 (8.0.123.58001), X64 RyuJIT
  Vector128 : .NET 8.0.1 (8.0.123.58001), X64 RyuJIT AVX
  Vector256 : .NET 8.0.1 (8.0.123.58001), X64 RyuJIT AVX2
  Vector512 : .NET 8.0.1 (8.0.123.58001), X64 RyuJIT AVX-512F+CD+BW+DQ+VL+VBMI
```

It performs the following bechmarks

- `Baseline_*` - using a simple iteration without explicit optimizations.
- `LINQ_*` - using LINQ (when available).
- `System_*` - using `System.Numerics.Tensors` (only for `Single`, `float` in C#).
- `NetFabric_*` - using `NetFabric.Numerics.Tensors`.

Every benchmark encompassed four distinct jobs:

- `Scalar` - without any SIMD support
- `Vector128` - utilizing 128-bit SIMD support
- `Vector256` - utilizing 256-bit SIMD support
- `Vector512` - utilizing 512-bit SIMD support

The full benchmarking source code can be found [here](https://github.com/NetFabric/NetFabric.Numerics.Tensors/tree/main/src/NetFabric.Numerics.Tensors.Benchmarks).

### Add

Benchmarks performing addition on two spans (tensors), each containing 1,000 items,

The following serves as the baseline against which performance is evaluated:

```csharp
public static void Add<T>(ReadOnlySpan<T> source, ReadOnlySpan<T> other, Span<T> result)
    where T : struct, IAdditionOperators<T, T, T>
{
    if (source.Length != other.Length)
        Throw.ArgumentException(nameof(source), "source and other spans must have the same length.");
    if (source.Length > result.Length)
        Throw.ArgumentException(nameof(source), "result spans is too small.");

    for(var index = 0; index < source.Length; index++)
        result[index] = source[index] + other[index];
}
```

| Method           | Job       | Categories | Count |        Mean |     StdDev |         Ratio |
| ---------------- | --------- | ---------- | ----- | ----------: | ---------: | ------------: |
| Baseline_Double  | Scalar    | Double     | 1000  |   311.04 ns |   2.651 ns |      baseline |
| NetFabric_Double | Scalar    | Double     | 1000  |   209.02 ns |   1.433 ns |  1.49x faster |
| Baseline_Double  | Vector128 | Double     | 1000  |   310.25 ns |   2.740 ns |  1.00x faster |
| NetFabric_Double | Vector128 | Double     | 1000  |   134.08 ns |   2.219 ns |  2.32x faster |
| Baseline_Double  | Vector256 | Double     | 1000  |   310.13 ns |   3.700 ns |  1.00x faster |
| NetFabric_Double | Vector256 | Double     | 1000  |    93.20 ns |   0.675 ns |  3.34x faster |
| Baseline_Double  | Vector512 | Double     | 1000  |   310.08 ns |   2.661 ns |  1.00x faster |
| NetFabric_Double | Vector512 | Double     | 1000  |    87.48 ns |   0.741 ns |  3.56x faster |
|                  |           |            |       |             |            |               |
| Baseline_Float   | Scalar    | Float      | 1000  |   313.76 ns |   3.896 ns |      baseline |
| System_Float     | Scalar    | Float      | 1000  |   209.50 ns |   1.307 ns |  1.50x faster |
| NetFabric_Float  | Scalar    | Float      | 1000  |   205.32 ns |   1.435 ns |  1.53x faster |
| Baseline_Float   | Vector128 | Float      | 1000  |   321.60 ns |   5.085 ns |  1.02x slower |
| System_Float     | Vector128 | Float      | 1000  |    70.98 ns |   0.752 ns |  4.42x faster |
| NetFabric_Float  | Vector128 | Float      | 1000  |    71.42 ns |   0.516 ns |  4.39x faster |
| Baseline_Float   | Vector256 | Float      | 1000  |   314.04 ns |   2.951 ns |  1.00x slower |
| System_Float     | Vector256 | Float      | 1000  |    46.24 ns |   0.222 ns |  6.79x faster |
| NetFabric_Float  | Vector256 | Float      | 1000  |    46.09 ns |   0.233 ns |  6.81x faster |
| Baseline_Float   | Vector512 | Float      | 1000  |   314.20 ns |   2.108 ns |  1.00x slower |
| System_Float     | Vector512 | Float      | 1000  |    50.93 ns |   0.305 ns |  6.17x faster |
| NetFabric_Float  | Vector512 | Float      | 1000  |    45.42 ns |   0.200 ns |  6.92x faster |
|                  |           |            |       |             |            |               |
| Baseline_Half    | Scalar    | Half       | 1000  | 9,067.22 ns | 105.207 ns |      baseline |
| NetFabric_Half   | Scalar    | Half       | 1000  | 9,022.14 ns |  98.395 ns |  1.01x faster |
| Baseline_Half    | Vector128 | Half       | 1000  | 8,308.19 ns |  63.387 ns |  1.09x faster |
| NetFabric_Half   | Vector128 | Half       | 1000  | 8,162.03 ns | 106.299 ns |  1.11x faster |
| Baseline_Half    | Vector256 | Half       | 1000  | 8,280.55 ns |  71.927 ns |  1.10x faster |
| NetFabric_Half   | Vector256 | Half       | 1000  | 8,174.82 ns |  77.175 ns |  1.11x faster |
| Baseline_Half    | Vector512 | Half       | 1000  | 8,313.73 ns |  75.231 ns |  1.09x faster |
| NetFabric_Half   | Vector512 | Half       | 1000  | 8,164.85 ns |  81.093 ns |  1.11x faster |
|                  |           |            |       |             |            |               |
| Baseline_Int     | Scalar    | Int        | 1000  |   354.66 ns |   3.378 ns |      baseline |
| NetFabric_Int    | Scalar    | Int        | 1000  |   214.07 ns |   1.596 ns |  1.66x faster |
| Baseline_Int     | Vector128 | Int        | 1000  |   352.79 ns |   3.747 ns |  1.01x faster |
| NetFabric_Int    | Vector128 | Int        | 1000  |    82.25 ns |   0.631 ns |  4.31x faster |
| Baseline_Int     | Vector256 | Int        | 1000  |   352.52 ns |   2.231 ns |  1.01x faster |
| NetFabric_Int    | Vector256 | Int        | 1000  |    52.30 ns |   0.315 ns |  6.78x faster |
| Baseline_Int     | Vector512 | Int        | 1000  |   351.95 ns |   2.057 ns |  1.01x faster |
| NetFabric_Int    | Vector512 | Int        | 1000  |    52.60 ns |   0.378 ns |  6.74x faster |
|                  |           |            |       |             |            |               |
| Baseline_Long    | Scalar    | Long       | 1000  |   356.10 ns |   3.108 ns |      baseline |
| NetFabric_Long   | Scalar    | Long       | 1000  |   213.75 ns |   1.372 ns |  1.67x faster |
| Baseline_Long    | Vector128 | Long       | 1000  |   354.82 ns |   2.280 ns |  1.00x faster |
| NetFabric_Long   | Vector128 | Long       | 1000  |   147.92 ns |   1.259 ns |  2.41x faster |
| Baseline_Long    | Vector256 | Long       | 1000  |   354.91 ns |   3.753 ns |  1.00x faster |
| NetFabric_Long   | Vector256 | Long       | 1000  |    91.50 ns |   0.747 ns |  3.89x faster |
| Baseline_Long    | Vector512 | Long       | 1000  |   354.09 ns |   2.805 ns |  1.01x faster |
| NetFabric_Long   | Vector512 | Long       | 1000  |    90.98 ns |   0.637 ns |  3.91x faster |
|                  |           |            |       |             |            |               |
| Baseline_Short   | Scalar    | Short      | 1000  |   425.04 ns |   3.359 ns |      baseline |
| NetFabric_Short  | Scalar    | Short      | 1000  |   307.20 ns |   2.011 ns |  1.38x faster |
| Baseline_Short   | Vector128 | Short      | 1000  |   421.70 ns |   2.703 ns |  1.01x faster |
| NetFabric_Short  | Vector128 | Short      | 1000  |    39.23 ns |   0.228 ns | 10.84x faster |
| Baseline_Short   | Vector256 | Short      | 1000  |   424.45 ns |   2.715 ns |  1.00x faster |
| NetFabric_Short  | Vector256 | Short      | 1000  |    29.63 ns |   0.416 ns | 14.39x faster |
| Baseline_Short   | Vector512 | Short      | 1000  |   422.11 ns |   2.148 ns |  1.01x faster |
| NetFabric_Short  | Vector512 | Short      | 1000  |    29.40 ns |   0.289 ns | 14.45x faster |

### Sum

Benchmarks performing the sum of the items in a span (tensor), containing 1,000 items.

The following serves as the baseline against which performance is evaluated:

```csharp
public static T Sum<T>(ReadOnlySpan<T> source)
    where T : struct, IAdditiveIdentity<T, T>, IAdditionOperators<T, T, T>
{
    var sum = T.AdditiveIdentity;
    foreach (var item in source)
        sum += item;
    return sum;
}
```

It additionally compares with the performance of LINQ's `Sum()`. However, it's worth noting that this method lacks support for the types `short` and `Half`. In such instances, LINQ's `Aggregate()` is employed instead.

| Method           | Job       | Categories | Count |         Mean |     StdDev |       Median |         Ratio |
| ---------------- | --------- | ---------- | ----- | -----------: | ---------: | -----------: | ------------: |
| Baseline_Double  | Scalar    | Double     | 1000  |    570.98 ns |   5.629 ns |    573.36 ns |      baseline |
| LINQ_Double      | Scalar    | Double     | 1000  |    571.74 ns |   5.388 ns |    573.79 ns |  1.00x slower |
| NetFabric_Double | Scalar    | Double     | 1000  |    147.88 ns |   2.157 ns |    148.22 ns |  3.86x faster |
| Baseline_Double  | Vector128 | Double     | 1000  |    572.54 ns |   5.996 ns |    573.91 ns |  1.00x slower |
| LINQ_Double      | Vector128 | Double     | 1000  |    570.89 ns |   5.926 ns |    571.20 ns |  1.00x faster |
| NetFabric_Double | Vector128 | Double     | 1000  |    277.94 ns |   2.981 ns |    278.61 ns |  2.05x faster |
| Baseline_Double  | Vector256 | Double     | 1000  |    572.45 ns |   5.287 ns |    573.21 ns |  1.00x slower |
| LINQ_Double      | Vector256 | Double     | 1000  |    573.01 ns |   6.732 ns |    574.56 ns |  1.00x slower |
| NetFabric_Double | Vector256 | Double     | 1000  |    128.70 ns |   1.034 ns |    128.53 ns |  4.44x faster |
| Baseline_Double  | Vector512 | Double     | 1000  |    571.11 ns |   6.915 ns |    572.84 ns |  1.00x slower |
| LINQ_Double      | Vector512 | Double     | 1000  |    570.82 ns |   4.606 ns |    572.51 ns |  1.00x faster |
| NetFabric_Double | Vector512 | Double     | 1000  |    128.17 ns |   1.055 ns |    128.33 ns |  4.46x faster |
|                  |           |            |       |              |            |              |               |
| Baseline_Float   | Scalar    | Float      | 1000  |    570.56 ns |   4.612 ns |    572.98 ns |      baseline |
| LINQ_Float       | Scalar    | Float      | 1000  |  1,014.42 ns |  10.750 ns |  1,018.47 ns |  1.78x slower |
| System_Float     | Scalar    | Float      | 1000  |    574.55 ns |   5.687 ns |    575.36 ns |  1.01x slower |
| NetFabric_Float  | Scalar    | Float      | 1000  |    145.22 ns |   1.107 ns |    145.80 ns |  3.93x faster |
| Baseline_Float   | Vector128 | Float      | 1000  |    569.56 ns |   4.442 ns |    572.11 ns |  1.00x faster |
| LINQ_Float       | Vector128 | Float      | 1000  |  1,207.31 ns |   8.692 ns |  1,209.80 ns |  2.12x slower |
| System_Float     | Vector128 | Float      | 1000  |    115.47 ns |   0.658 ns |    115.61 ns |  4.94x faster |
| NetFabric_Float  | Vector128 | Float      | 1000  |    127.75 ns |   1.536 ns |    126.71 ns |  4.46x faster |
| Baseline_Float   | Vector256 | Float      | 1000  |    568.82 ns |   5.199 ns |    567.58 ns |  1.00x faster |
| LINQ_Float       | Vector256 | Float      | 1000  |  1,210.59 ns |  10.939 ns |  1,213.35 ns |  2.12x slower |
| System_Float     | Vector256 | Float      | 1000  |     43.05 ns |   0.335 ns |     43.16 ns | 13.25x faster |
| NetFabric_Float  | Vector256 | Float      | 1000  |     52.75 ns |   0.238 ns |     52.77 ns | 10.82x faster |
| Baseline_Float   | Vector512 | Float      | 1000  |    570.12 ns |   5.911 ns |    571.47 ns |  1.00x slower |
| LINQ_Float       | Vector512 | Float      | 1000  |  1,401.84 ns |  10.311 ns |  1,405.26 ns |  2.46x slower |
| System_Float     | Vector512 | Float      | 1000  |     20.96 ns |   0.204 ns |     20.99 ns | 27.23x faster |
| NetFabric_Float  | Vector512 | Float      | 1000  |     52.38 ns |   0.445 ns |     52.32 ns | 10.89x faster |
|                  |           |            |       |              |            |              |               |
| Baseline_Half    | Scalar    | Half       | 1000  | 12,303.82 ns |  51.396 ns | 12,320.83 ns |      baseline |
| LINQ_Half        | Scalar    | Half       | 1000  | 12,569.00 ns |  42.232 ns | 12,580.73 ns |  1.02x slower |
| NetFabric_Half   | Scalar    | Half       | 1000  |  9,224.23 ns |  81.418 ns |  9,274.72 ns |  1.33x faster |
| Baseline_Half    | Vector128 | Half       | 1000  | 11,958.97 ns |  44.551 ns | 11,980.43 ns |  1.03x faster |
| LINQ_Half        | Vector128 | Half       | 1000  | 12,195.96 ns |  74.433 ns | 12,202.99 ns |  1.01x faster |
| NetFabric_Half   | Vector128 | Half       | 1000  |  8,146.77 ns |  81.343 ns |  8,164.09 ns |  1.51x faster |
| Baseline_Half    | Vector256 | Half       | 1000  | 11,973.93 ns | 108.398 ns | 11,984.58 ns |  1.03x faster |
| LINQ_Half        | Vector256 | Half       | 1000  | 12,158.34 ns | 126.659 ns | 12,116.17 ns |  1.01x faster |
| NetFabric_Half   | Vector256 | Half       | 1000  |  8,136.64 ns |  71.782 ns |  8,164.75 ns |  1.51x faster |
| Baseline_Half    | Vector512 | Half       | 1000  | 11,966.10 ns |  63.814 ns | 11,992.15 ns |  1.03x faster |
| LINQ_Half        | Vector512 | Half       | 1000  | 12,183.80 ns |  77.386 ns | 12,207.81 ns |  1.01x faster |
| NetFabric_Half   | Vector512 | Half       | 1000  |  8,132.30 ns |  73.452 ns |  8,140.99 ns |  1.51x faster |
|                  |           |            |       |              |            |              |               |
| Baseline_Int     | Scalar    | Int        | 1000  |    209.13 ns |   1.815 ns |    209.57 ns |      baseline |
| LINQ_Int         | Scalar    | Int        | 1000  |    207.11 ns |   1.197 ns |    207.26 ns |  1.01x faster |
| NetFabric_Int    | Scalar    | Int        | 1000  |    106.23 ns |   0.707 ns |    106.22 ns |  1.97x faster |
| Baseline_Int     | Vector128 | Int        | 1000  |    221.71 ns |   1.209 ns |    221.74 ns |  1.06x slower |
| LINQ_Int         | Vector128 | Int        | 1000  |    106.27 ns |   3.544 ns |    105.34 ns |  1.96x faster |
| NetFabric_Int    | Vector128 | Int        | 1000  |     59.76 ns |   0.899 ns |     60.06 ns |  3.50x faster |
| Baseline_Int     | Vector256 | Int        | 1000  |    221.06 ns |   1.133 ns |    220.85 ns |  1.06x slower |
| LINQ_Int         | Vector256 | Int        | 1000  |     50.87 ns |   0.211 ns |     50.88 ns |  4.11x faster |
| NetFabric_Int    | Vector256 | Int        | 1000  |     33.41 ns |   0.293 ns |     33.41 ns |  6.26x faster |
| Baseline_Int     | Vector512 | Int        | 1000  |    219.06 ns |   1.548 ns |    218.67 ns |  1.05x slower |
| LINQ_Int         | Vector512 | Int        | 1000  |     50.72 ns |   0.320 ns |     50.70 ns |  4.12x faster |
| NetFabric_Int    | Vector512 | Int        | 1000  |     33.69 ns |   0.330 ns |     33.72 ns |  6.21x faster |
|                  |           |            |       |              |            |              |               |
| Baseline_Long    | Scalar    | Long       | 1000  |    209.33 ns |   3.041 ns |    208.05 ns |      baseline |
| LINQ_Long        | Scalar    | Long       | 1000  |    208.01 ns |   1.683 ns |    208.05 ns |  1.01x faster |
| NetFabric_Long   | Scalar    | Long       | 1000  |    106.83 ns |   0.630 ns |    106.97 ns |  1.96x faster |
| Baseline_Long    | Vector128 | Long       | 1000  |    220.86 ns |   1.267 ns |    220.79 ns |  1.06x slower |
| LINQ_Long        | Vector128 | Long       | 1000  |    205.47 ns |   1.143 ns |    205.74 ns |  1.02x faster |
| NetFabric_Long   | Vector128 | Long       | 1000  |    110.76 ns |   0.171 ns |    110.71 ns |  1.89x faster |
| Baseline_Long    | Vector256 | Long       | 1000  |    220.38 ns |   1.423 ns |    220.08 ns |  1.05x slower |
| LINQ_Long        | Vector256 | Long       | 1000  |    108.83 ns |   2.826 ns |    108.70 ns |  1.93x faster |
| NetFabric_Long   | Vector256 | Long       | 1000  |     59.73 ns |   0.512 ns |     59.62 ns |  3.51x faster |
| Baseline_Long    | Vector512 | Long       | 1000  |    220.13 ns |   2.014 ns |    220.33 ns |  1.05x slower |
| LINQ_Long        | Vector512 | Long       | 1000  |    109.13 ns |   4.001 ns |    109.02 ns |  1.91x faster |
| NetFabric_Long   | Vector512 | Long       | 1000  |     60.10 ns |   0.533 ns |     60.23 ns |  3.48x faster |
|                  |           |            |       |              |            |              |               |
| Baseline_Short   | Scalar    | Short      | 1000  |    398.96 ns |   4.568 ns |    397.85 ns |      baseline |
| LINQ_Short       | Scalar    | Short      | 1000  |    747.23 ns |   4.973 ns |    746.78 ns |  1.87x slower |
| NetFabric_Short  | Scalar    | Short      | 1000  |    217.72 ns |   1.566 ns |    217.20 ns |  1.83x faster |
| Baseline_Short   | Vector128 | Short      | 1000  |    397.20 ns |   2.326 ns |    398.01 ns |  1.00x faster |
| LINQ_Short       | Vector128 | Short      | 1000  |    743.73 ns |   3.997 ns |    744.50 ns |  1.86x slower |
| NetFabric_Short  | Vector128 | Short      | 1000  |     33.28 ns |   0.324 ns |     33.35 ns | 12.00x faster |
| Baseline_Short   | Vector256 | Short      | 1000  |    398.76 ns |   3.406 ns |    398.69 ns |  1.00x slower |
| LINQ_Short       | Vector256 | Short      | 1000  |    745.48 ns |   6.354 ns |    745.06 ns |  1.87x slower |
| NetFabric_Short  | Vector256 | Short      | 1000  |     17.16 ns |   0.238 ns |     17.16 ns | 23.25x faster |
| Baseline_Short   | Vector512 | Short      | 1000  |    396.99 ns |   3.059 ns |    397.21 ns |  1.00x faster |
| LINQ_Short       | Vector512 | Short      | 1000  |    754.52 ns |  12.566 ns |    752.41 ns |  1.89x slower |
| NetFabric_Short  | Vector512 | Short      | 1000  |     20.55 ns |   1.059 ns |     20.91 ns | 18.86x faster |

### Sum2D

Benchmarks performing the sum of the 2D vectors in a span (tensor), containing 1,000 vectors. The vector is a value type containing two fields of the same type.

It uses the same baseline as for the `Sum` benchmarks as it uses generics math to support any of these cases.

It also compares to the performance of LINQ's `Aggregate()`, as LINQ's `Sum()` does not support non-native numeric types.

| Method           | Job       | Categories | Count |        Mean |    StdDev |      Median |        Ratio |
| ---------------- | --------- | ---------- | ----- | ----------: | --------: | ----------: | -----------: |
| Baseline_Double  | Scalar    | Double     | 1000  |    586.1 ns |   4.78 ns |    588.5 ns |     baseline |
| LINQ_Double      | Scalar    | Double     | 1000  |  2,452.1 ns |  22.31 ns |  2,457.8 ns | 4.18x slower |
| NetFabric_Double | Scalar    | Double     | 1000  |    297.2 ns |   3.22 ns |    297.8 ns | 1.97x faster |
| Baseline_Double  | Vector128 | Double     | 1000  |    586.9 ns |   5.41 ns |    589.8 ns | 1.00x slower |
| LINQ_Double      | Vector128 | Double     | 1000  |  2,449.7 ns |  17.31 ns |  2,454.0 ns | 4.18x slower |
| NetFabric_Double | Vector128 | Double     | 1000  |    295.5 ns |   3.26 ns |    296.2 ns | 1.98x faster |
| Baseline_Double  | Vector256 | Double     | 1000  |    587.1 ns |   6.33 ns |    587.5 ns | 1.00x slower |
| LINQ_Double      | Vector256 | Double     | 1000  |  2,442.0 ns |  24.81 ns |  2,448.3 ns | 4.17x slower |
| NetFabric_Double | Vector256 | Double     | 1000  |    295.7 ns |   2.30 ns |    296.5 ns | 1.98x faster |
| Baseline_Double  | Vector512 | Double     | 1000  |    587.2 ns |   6.54 ns |    587.1 ns | 1.00x slower |
| LINQ_Double      | Vector512 | Double     | 1000  |  2,444.4 ns |  26.33 ns |  2,448.4 ns | 4.17x slower |
| NetFabric_Double | Vector512 | Double     | 1000  |    294.6 ns |   2.54 ns |    294.5 ns | 1.99x faster |
|                  |           |            |       |             |           |             |              |
| Baseline_Float   | Scalar    | Float      | 1000  |  2,363.4 ns |  25.96 ns |  2,362.2 ns |     baseline |
| LINQ_Float       | Scalar    | Float      | 1000  |  7,681.9 ns |  81.63 ns |  7,698.7 ns | 3.25x slower |
| NetFabric_Float  | Scalar    | Float      | 1000  |    301.4 ns |   2.27 ns |    302.0 ns | 7.84x faster |
| Baseline_Float   | Vector128 | Float      | 1000  |  2,352.6 ns |  27.39 ns |  2,349.8 ns | 1.00x faster |
| LINQ_Float       | Vector128 | Float      | 1000  |  7,659.4 ns |  99.62 ns |  7,606.3 ns | 3.24x slower |
| NetFabric_Float  | Vector128 | Float      | 1000  |    300.6 ns |   3.87 ns |    298.4 ns | 7.86x faster |
| Baseline_Float   | Vector256 | Float      | 1000  |  2,356.3 ns |  19.77 ns |  2,362.4 ns | 1.00x faster |
| LINQ_Float       | Vector256 | Float      | 1000  |  7,574.4 ns |  11.36 ns |  7,572.2 ns | 3.21x slower |
| NetFabric_Float  | Vector256 | Float      | 1000  |    301.4 ns |   2.48 ns |    302.0 ns | 7.84x faster |
| Baseline_Float   | Vector512 | Float      | 1000  |  2,350.5 ns |  17.85 ns |  2,355.6 ns | 1.01x faster |
| LINQ_Float       | Vector512 | Float      | 1000  |  7,595.7 ns |  10.69 ns |  7,598.3 ns | 3.21x slower |
| NetFabric_Float  | Vector512 | Float      | 1000  |    300.4 ns |   2.14 ns |    301.7 ns | 7.87x faster |
|                  |           |            |       |             |           |             |              |
| Baseline_Half    | Scalar    | Half       | 1000  | 18,149.6 ns | 131.56 ns | 18,209.0 ns |     baseline |
| LINQ_Half        | Scalar    | Half       | 1000  | 26,635.7 ns |  98.41 ns | 26,621.6 ns | 1.47x slower |
| NetFabric_Half   | Scalar    | Half       | 1000  | 18,169.1 ns | 183.74 ns | 18,227.2 ns | 1.00x slower |
| Baseline_Half    | Vector128 | Half       | 1000  | 16,322.7 ns | 208.14 ns | 16,356.5 ns | 1.11x faster |
| LINQ_Half        | Vector128 | Half       | 1000  | 25,550.1 ns | 468.29 ns | 25,370.3 ns | 1.41x slower |
| NetFabric_Half   | Vector128 | Half       | 1000  | 16,194.8 ns | 159.24 ns | 16,128.4 ns | 1.12x faster |
| Baseline_Half    | Vector256 | Half       | 1000  | 16,239.9 ns | 167.92 ns | 16,181.3 ns | 1.12x faster |
| LINQ_Half        | Vector256 | Half       | 1000  | 25,348.3 ns | 119.29 ns | 25,384.0 ns | 1.40x slower |
| NetFabric_Half   | Vector256 | Half       | 1000  | 16,329.8 ns | 144.27 ns | 16,265.6 ns | 1.11x faster |
| Baseline_Half    | Vector512 | Half       | 1000  | 16,297.9 ns | 170.77 ns | 16,377.9 ns | 1.12x faster |
| LINQ_Half        | Vector512 | Half       | 1000  | 25,375.8 ns | 228.32 ns | 25,389.2 ns | 1.40x slower |
| NetFabric_Half   | Vector512 | Half       | 1000  | 16,224.8 ns | 178.99 ns | 16,314.0 ns | 1.12x faster |
|                  |           |            |       |             |           |             |              |
| Baseline_Int     | Scalar    | Int        | 1000  |  1,518.2 ns |   8.91 ns |  1,519.8 ns |     baseline |
| LINQ_Int         | Scalar    | Int        | 1000  |  5,532.7 ns |  55.53 ns |  5,539.8 ns | 3.65x slower |
| NetFabric_Int    | Scalar    | Int        | 1000  |    207.2 ns |   1.65 ns |    207.2 ns | 7.33x faster |
| Baseline_Int     | Vector128 | Int        | 1000  |  1,515.0 ns |   9.10 ns |  1,518.0 ns | 1.00x faster |
| LINQ_Int         | Vector128 | Int        | 1000  |  5,414.7 ns |  97.83 ns |  5,405.6 ns | 3.56x slower |
| NetFabric_Int    | Vector128 | Int        | 1000  |    206.3 ns |   1.16 ns |    206.2 ns | 7.36x faster |
| Baseline_Int     | Vector256 | Int        | 1000  |  1,519.4 ns |  10.55 ns |  1,520.6 ns | 1.00x slower |
| LINQ_Int         | Vector256 | Int        | 1000  |  5,433.3 ns |  99.97 ns |  5,389.2 ns | 3.59x slower |
| NetFabric_Int    | Vector256 | Int        | 1000  |    206.2 ns |   1.20 ns |    206.6 ns | 7.36x faster |
| Baseline_Int     | Vector512 | Int        | 1000  |  1,515.9 ns |   8.19 ns |  1,516.9 ns | 1.00x faster |
| LINQ_Int         | Vector512 | Int        | 1000  |  5,371.7 ns |  80.45 ns |  5,356.9 ns | 3.54x slower |
| NetFabric_Int    | Vector512 | Int        | 1000  |    207.2 ns |   0.95 ns |    206.9 ns | 7.33x faster |
|                  |           |            |       |             |           |             |              |
| Baseline_Long    | Scalar    | Long       | 1000  |    412.6 ns |   2.43 ns |    413.4 ns |     baseline |
| LINQ_Long        | Scalar    | Long       | 1000  |  1,323.0 ns |  11.82 ns |  1,323.5 ns | 3.21x slower |
| NetFabric_Long   | Scalar    | Long       | 1000  |    207.9 ns |   2.00 ns |    208.2 ns | 1.98x faster |
| Baseline_Long    | Vector128 | Long       | 1000  |    413.5 ns |   2.48 ns |    412.9 ns | 1.00x slower |
| LINQ_Long        | Vector128 | Long       | 1000  |  1,357.5 ns |  13.62 ns |  1,358.9 ns | 3.29x slower |
| NetFabric_Long   | Vector128 | Long       | 1000  |    207.5 ns |   2.44 ns |    207.2 ns | 1.99x faster |
| Baseline_Long    | Vector256 | Long       | 1000  |    412.1 ns |   2.43 ns |    412.7 ns | 1.00x faster |
| LINQ_Long        | Vector256 | Long       | 1000  |  1,326.8 ns |   9.45 ns |  1,330.3 ns | 3.22x slower |
| NetFabric_Long   | Vector256 | Long       | 1000  |    206.0 ns |   1.44 ns |    206.1 ns | 2.00x faster |
| Baseline_Long    | Vector512 | Long       | 1000  |    412.8 ns |   2.59 ns |    413.4 ns | 1.00x slower |
| LINQ_Long        | Vector512 | Long       | 1000  |  1,339.4 ns |   9.54 ns |  1,341.8 ns | 3.25x slower |
| NetFabric_Long   | Vector512 | Long       | 1000  |    205.8 ns |   0.93 ns |    205.8 ns | 2.00x faster |
|                  |           |            |       |             |           |             |              |
| Baseline_Short   | Scalar    | Short      | 1000  |  1,906.6 ns |  23.93 ns |  1,915.5 ns |     baseline |
| LINQ_Short       | Scalar    | Short      | 1000  |  8,428.6 ns | 109.49 ns |  8,407.6 ns | 4.42x slower |
| NetFabric_Short  | Scalar    | Short      | 1000  |    430.9 ns |   2.20 ns |    430.7 ns | 4.42x faster |
| Baseline_Short   | Vector128 | Short      | 1000  |  1,881.3 ns |   2.34 ns |  1,881.2 ns | 1.01x faster |
| LINQ_Short       | Vector128 | Short      | 1000  |  8,390.7 ns |  88.63 ns |  8,428.9 ns | 4.40x slower |
| NetFabric_Short  | Vector128 | Short      | 1000  |    430.6 ns |   3.47 ns |    430.1 ns | 4.43x faster |
| Baseline_Short   | Vector256 | Short      | 1000  |  1,881.9 ns |   2.30 ns |  1,882.2 ns | 1.01x faster |
| LINQ_Short       | Vector256 | Short      | 1000  |  8,400.1 ns |  77.78 ns |  8,419.1 ns | 4.41x slower |
| NetFabric_Short  | Vector256 | Short      | 1000  |    434.4 ns |   5.98 ns |    432.7 ns | 4.39x faster |
| Baseline_Short   | Vector512 | Short      | 1000  |  2,057.9 ns |  95.45 ns |  2,041.6 ns | 1.07x slower |
| LINQ_Short       | Vector512 | Short      | 1000  |  8,948.6 ns | 518.20 ns |  8,685.5 ns | 4.62x slower |
| NetFabric_Short  | Vector512 | Short      | 1000  |    438.0 ns |   4.59 ns |    438.0 ns | 4.35x faster |

## Conclusions

The `NetFabric.Numerics.Tensors` library employs optimizations beyond just `Vector<T>`, resulting in superior performance compared to the basic baseline, even in the absence of vectorization support.

In cases where SIMD vectors are supported, the performance boost scales proportionally with the capacity of a `Vector<T>`. Particularly, with smaller types, the performance gains are more prominent. For larger types, noticeable benefits emerge when the platform accommodates larger vectors. In both scenarios, the code functions seamlessly without necessitating special handling.

The benchmarks demonstrate performance improvements for relatively large spans. Although presented here in a condensed format for space considerations, I have also conducted benchmarks for very small spans and observed no deteriorations in performance.

Although `NetFabric.Numerics.Tensors` provides numerous primitive operations, it also allows the implementation of custom operators. The extensive range of these primitive operations supported illustrates that the few interfaces provided can effectively cover a wide array of scenarios.

In contrast, `Vector<T>` is deficient in low-level operations, which is used for vectorization. As a result, the scope of vectorized operations is constrained to its existing API. Contributions to introduce new operations or vectorize existing ones are highly encouraged.

For enhanced tensor features and improved performance with GPU utilization, consider exploring alternative libraries such as [TorchSharp](https://github.com/dotnet/TorchSharp).

> I view `System.Numerics.Tensors` as an exemple of achieving "clean code" without compromising significant performance. It's crucial to grasp how compilers handle your code and understand the system's execution. I also recommend exploring my related post, "[A 12% improvement, easily obtained, is never considered marginal -- Donald Knuth](https://aalmada.github.io/Performance-optimizations.html)."
