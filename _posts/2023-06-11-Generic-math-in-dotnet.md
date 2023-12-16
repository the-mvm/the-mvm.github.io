---
layout: post
read_time: true
show_date: true
title: "Generic math in .NET"
date: 2023-06-11
img: posts/20230611/Sculpture-by-Liechennay.jpg
tags: [development, .net, csharp, math, generics]
category: development
author: Antão Almada
---

## Before .NET 7

In C#, arithmetic operators are a handy feature that allows you to work with mathematical expressions using familiar symbols like `+`, `-`, `*`, and `/`. This simplifies your code by eliminating the need to call specific methods such as `Add`, `Subtract`, `Multiply`, or `Divide` for basic arithmetic operations.

For more complex math operations, especially those involving trigonometric functions, C# provides the `System.Math` static class. It's worth noting that most of the methods in this class work with double precision (double) values. However, in certain scenarios, using single precision (float) may offer better performance. To cater to this need, starting with .NET Core 2, there's also a `System.MathF` class that handles single precision operations.

While C# allows you to define custom arithmetic operators for your types, doing so with generics can be challenging. Generics are designed to work with known methods, and since operators are essentially static methods, they cannot be defined within an interface. This complexity makes defining arithmetic operators for generic types like `Vector<T>` possible but [cumbersome and challenging to maintain](https://github.com/NetFabric/NetFabric.Hyperlinq/blob/9abf381ca277d0934bd810bc946e443d203106e2/NetFabric.Hyperlinq/Utils/Scalar.cs). As a result, many libraries opt to define `Vector` types for specific numerical types to simplify the implementation.

## .NET 7 and beyond!

.NET 7, along with C# 11, introduces a range of exciting features that break previous limitations. One notable advancement is the ability to declare static virtual methods in interfaces, including those for arithmetic operators.

In the `System.Numerics` namespace, you'll find numerous interfaces that define sets of mathematical operations associated with native numerical .NET types. For instance, if a type implements `IAdditionOperators<TSelf, TOther, TResult>`, it automatically has the operator + implemented.

This opens the door to implementing a generic Sum method as follows:

```csharp
static T Sum<T>(IEnumerable<T> source
    where T: IAdditiveIdentity<T, T>, IAdditionOperators<T, T, T>
{
    var sum = T.AdditiveIdentity; // initialize to zero
    foreach(var value in source)
        sum += value; // add value to sum
    return sum;
})
```

This method allows you to sum a collection of any type that defines the additive identity (zero) and the operator `+`, which is used by the `+=` operator. This not only covers all .NET native numerical types but can also extend to other types like vectors, quaternions, matrices, and more. It's a versatile and powerful addition to the C# language.

You have the option to limit T to `INumber<T>`, enabling the use of any numeric native type, or you can choose to restrict it to `IFloatingPoint<T>`, thus permitting any floating-point native type. However, maintaining the method as is allows its use by types that may not fully implement all the interfaces mandated by `INumber<TSelf>` or `IFloatingPoint<TSelf`. These serve as the bare minimum requirements and will still accommodate a broad range of additional types.

In `System.Numerics`, you'll find new interfaces tailored for mathematical operations beyond basic arithmetic operators. One of these is `ITrigonometricFunctions<TSelf>`, which is now implemented by certain native numerical types in .NET. This opens the door to the following usage:

```csharp
// half-precision floating-point
var sinHalf = Half.Sin(Half.Pi);
var arcSinHalf = Half.Asin(sinHalf);

// single-precision floating-point
var sinFloat = float.Sin(float.Pi);
var arcSinFloat = float.Asin(sinFloat);

// double-precision floating-point
var sinDouble = double.Sin(double.Pi);
var arcSinDouble = double.Asin(sinDouble);
```

Observe that constants like `Pi`, as well as the `Sin` and `Asin` methods, are now defined for the floating-point types `Half`, `float`, and `double`. This makes it unnecessary and even discouraged to use `System.Math` or `System.MathF`. Furthermore, this enhancement expands the support for various numeric types.

`System.Numerics` offers a range of similar interfaces, including `IExponentialFunctions<TSelf>`, `IHyperbolicFunctions<TSelf>`, `ILogarithmicFunctions<TSelf>`, `IPowerFunctions<TSelf>`, `IRootFunctions<TSelf>`, and more.

Notably, the constants `E`, `Pi`, and `Tau` are defined within the `IFloatingPointConstants<TSelf>` interface.

## Conclusions

Generics have expanded their utility, simplifying code and enhancing maintainability.

It's recommended to transition away from `System.Math` or `System.MathF` and use the inherent math capabilities of each data type.

For those developing custom numeric types, implementing the interfaces provided in `System.Numerics` is important to ensure compatibility with third-party methods.

> As a side note, I've been actively working on an open-source library that uses .NET generic math to implement primitives across various coordinate systems, including rectangular 2D and 3D, polar, spherical, and geodetic. These implementations are designed as immutable value types, using generics to prevent unit mismatch execution errors. Feel free to explore it at https://netfabric.github.io/NetFabric.Numerics/