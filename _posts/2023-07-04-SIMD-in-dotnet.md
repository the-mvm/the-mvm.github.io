---
layout: post
read_time: true
show_date: true
title: "Single Instruction, Multiple Data (SIMD) in .NET"
date: 2023-07-04
img_path: /assets/img/posts/20230704
image: Margarida.jpg
tags: [development, .net, csharp, performance, math, simd, intrinsics]
category: development
author: Antão Almada
---

## What is SIMD?

SIMD stands for "Single Instruction, Multiple Data". It is a type of parallel processing technique that allows a single instruction to be executed on multiple data elements simultaneously. SIMD enables efficient and high-performance execution of repetitive operations on large sets of data, such as vector and matrix computations.

In SIMD processing, data is divided into smaller elements, often called vectors or lanes. These vectors contain multiple data items that can be processed in parallel. The SIMD processor executes a single instruction on all the data elements in a vector simultaneously, performing the same operation on each element concurrently.

SIMD instructions are typically supported by specialized hardware or instruction sets found in modern CPUs. These instructions are designed to perform arithmetic, logical, and other operations on vectors efficiently. SIMD instructions are commonly used in multimedia applications, scientific simulations, image and signal processing, and other computationally intensive tasks.

> Note: Implementing SIMD as explained in this article involves writing complex code, which might need replication across multiple methods. This complexity necessitates extensive testing to ensure its functionality in various scenarios. To address this challenge, I've created my own library that defines reusable methods without sacrificing performance. For a detailed understanding of its workings and usage, refer to my other article "[A generic tensor library for .NET](https://aalmada.github.io/A-generic-tensor-library-for-dotnet.html)."

## SIMD in .NET

SIMD can be used in .NET through the `System.Numerics` and `System.Runtime.Intrinsics` namespaces.

In .NET Core 1.0 and later versions, you can use the `System.Numerics.Vector<T>` class. This class provides SIMD support for a wide range of data types, including integers and floating-point numbers. You can perform SIMD operations using `Vector<T>` to efficiently process large sets of data in parallel. For example, you can create `Vector<T>` instances, perform arithmetic or logical operations on them, and access the individual elements of the vector using familiar array-like syntax.

Starting from .NET Core 3.0 and later versions, the `System.Runtime.Intrinsics` namespace provides access to lower-level SIMD capabilities. The `Vector128` and `Vector256` structures in this namespace represent SIMD vector types for specific hardware instruction sets, such as SSE (Streaming SIMD Extensions) or AVX (Advanced Vector Extensions). These types allow you to perform more fine-grained control over SIMD operations and take advantage of the full capabilities of the underlying hardware.

### Optimizing the sum of the elements in a collection

As explained in my previous article, .NET 7 allows the development of a method that calculates the sum of a collection of any numeric type as follow:

```csharp
public static class MyExtensions
{
    public static T Sum<T>(this IEnumerable<T> source)
        where T : struct, IAdditionOperators<T, T, T>, IAdditiveIdentity<T, T>
    {
        var sum = T.AdditiveIdentity;
        foreach (var value in source)
        {
            sum += value;
        }
        return sum;
    }
}
```

This is an extension method so it can be used as follow:

```csharp
var source = Enumerable.Range(0, 100).ToArray();
Console.WriteLine(source.Sum());
```

This simply creates an array with 100 elements ranging from 0 to 99. It writes on the console the sum of all the element of the array.

You can see it working in [SharpLab](https://sharplab.io/#v2:EYLgxg9gTgpgtADwGwBYA0AXEUCuA7AHwAEAmABgFgAoUgRmqLIAIjaUBuB51gOgBkAlngCOnGt1o8AcjgC2MKALABnMdQBuAQyhNlEHFDAwmAXiYBRPHIWbgAGxg8ASprwBzGAAoyaJrTIAlDwAKhAAglBQmgCengFirACcngAkAEQAynIgTADeegZGPFmycQC+afHUDADMLLRILCRMALLR5ggYMHjKAhA91LnUTCMsdayNwUwlADzBAHyeGAAWAsr1NXPzuvqGMAHDo0cA7ssKxlM5yhi4YBi+AJJhACbPAhh9eADyAA42GNBlHNfMEQfNHi83h91DAHs9uh8MNFgUwFocRrkjljRuisVodMo5KZUTxIe8BDC4Qj3tExNiRgAzaAwTRgZZMTz4phaOw4YxCHaFfa4o5DKj0rGE2RMADUZh5fLp9LKItGRAA7Lo5EqRiqqGUgA=).

### Sum of a span of elements

Data to be used in SIMD has to be in the form of a vector. The layout of the data in an enumerable is unknown so the "vectorization" requires copying the data into the vector. For this reason it's not advantageous to use SIMD on enumerables.

A `Span<T>` represents a contiguous region of arbitrary memory. This makes it possible to convert to a vector without copies, making it possible to take advantage of the SIMD performance optimizations.

So, lets provide an override of the `Sum()` method that takes a `ReadOnlySpan<T>` as a parameter as we are not going to mutate the collection while calculating the sum.

Unfortunately the compiler does not automatically call this new override when the collection is an array. It's a good idea to provide one more override that takes an array as parameter. It simply cast the array to a span (no copies) and call the other override.

If an array is cast to `IEnumerable<T>`, the first method will be called and SIMD will not be used. It's a good idea to check inside this method if the collection is actually an array and the call the new override so that SIMD is used on this collection.

```csharp
public static class MyExtensions
{
    public static T Sum<T>(this IEnumerable<T> source)
        where T : struct, IAdditionOperators<T, T, T>, IAdditiveIdentity<T, T>
    {
        // check if the enumerable is an array
        if (source.GetType() == typeof(T[]))
            return Sum(Unsafe.As<T[]>(source));

        var sum = T.AdditiveIdentity;
        foreach (var value in source)
        {
            sum += value;
        }
        return sum;
    }

    // overload that takes an array
    public static T Sum<T>(this T[] source)
        where T : struct, IAdditionOperators<T, T, T>, IAdditiveIdentity<T, T>
        => Sum<T>(source.AsSpan());

    // overload that takes a span
    public static T Sum<T>(this ReadOnlySpan<T> source)
        where T : struct, IAdditionOperators<T, T, T>, IAdditiveIdentity<T, T>
    {
        var sum = T.AdditiveIdentity;
        foreach (ref readonly var value in source) // use ref to avoid value-type copies
        {
            sum += value;
        }
        return sum;
    }
}
```

You can see it working in [SharpLab](https://sharplab.io/#v2:EYLgxg9gTgpgtADwGwBYA0AXEUCuA7AHwAEAmABgFgAoUgRmqLIAIjaUBuB51gOgBkAlngCOnGt1o8AcjgC2MKALABnMYxaSASvgwD5PAMIRZABwEAbBQGUFANyUxV1BrQDMAHiEYAfE2UQcKDAYJgBeJgBRPDkFAENgSx5NWLwAcxgACjI0JloyAEoeABUIAEEoKFiATwz8tVoATgyAEgAiKzkQJgBvf0Dgng7ZWoBfVrrnGlcNJBYSJgBZKoiEDBg8ZQEIDepu6iYDlmnWWaKmIfci7wyMAAsBZQ0PK78AoJh8/cPvgHdbhRCZy6ygwuDAGByAElSgATGECXTbADyJjiGGgykuOSK2O8UNh8N0thgkJh610GCqWKYVy+Bz2VG+3wEADMmBk+u8eABxGAYIpVVG1MLhSmoiAsjJFADaAF18p9GUzlUQAOznOSXa4AVQ2sRZMB4pUxMtl105wQVYmVyrpTNssSgfjkYRpRrhCIExNJ5IRVWtNpZ0BgsTAt3ZDqdDvMOBCQle/Q+du+DJtTOULoA1OFo7GA8qRsnDmrnbJ80xC0qDnaiMdaKcNbItTd7o9TQn3oq038ATSmMDQThwfiPYi8Ci0RjqTiaXimNDR16SWS8BSqTPaVWmaFfBcrhy3gNjVYTClahMtzW6w299c7g8mJoQzCkXhzFUTyktR3LUWDj3YD7AcwQhecCU9ZFUUqdEoBNbFcRHQklx9Vc/Wnbw7VTG1I1LV0indJDvRXNdy2+INYFDcMMlgNkKJhbZ3yYHDczjPAfyTLcUz/dMsxzWIYxgUjDkrNMSwzMs7UrEYgA=).

Now we can finally add the SIMD optimizations to the `Sum()` override dedicated to `ReadOnlySpan<T>` and have the guarantee that it's used on every case that it may be useful.

### Optimisations using `System.Numerics.Vector<T>`

The collection must be "vectorized" so that SIMD can be used. In our case, where the type of the collection elements is not known, the use of `System.Numerics.Vector<T>` makes it much easier to understand the code than using the lower-level `System.Runtime.Intrinsics` API:

```csharp
public static class MyExtensions
{
    public static T Sum<T>(this IEnumerable<T> source)
        where T : struct, IAdditionOperators<T, T, T>, IAdditiveIdentity<T, T>
    {
        if (source.GetType() == typeof(T[]))
            return Sum(Unsafe.As<T[]>(source));

        var sum = T.AdditiveIdentity;
        foreach (var value in source)
        {
            sum += value;
        }
        return sum;
    }

    public static T Sum<T>(this T[] source)
        where T : struct, IAdditionOperators<T, T, T>, IAdditiveIdentity<T, T>
        => Sum<T>(source.AsSpan());

    public static T Sum<T>(this ReadOnlySpan<T> source)
        where T : struct, IAdditionOperators<T, T, T>, IAdditiveIdentity<T, T>
    {
        var sum = T.AdditiveIdentity;
        // check if SIMD is available and can be used
        if(Vector.IsHardwareAccelerated && Vector<T>.IsSupported && source.Length > Vector<T>.Count)
        {
            var sumVector = Vector<T>.Zero; // initialize to zeros

            // cast the span to a span of vectors
            var vectors = MemoryMarshal.Cast<T, Vector<T>>(source);

            // add each vector to the sum vector
            foreach (ref readonly var vector in vectors)
                sumVector += vector;

            // get the sum of all elements of the vector
            sum = Vector.Sum(sumVector);

            // find what elements of the source were left out
            var remainder = source.Length % Vector<T>.Count;
            source = source[^remainder..];
        }
        // sum all elements not handled by SIMD
        foreach (ref readonly var value in source)
        {
            sum += value;
        }
        return sum;
    }
}
```

You can see it working in [SharpLab](https://sharplab.io/#v2:EYLgxg9gTgpgtADwGwBYA0AXEUCuA7AHwAEAmABgFgAoUgRmqLIAIjaUBuB51gOgBkAlngCOnGt1o8AcjgC2MKALABnMYxaSASvgwD5PAMIRZABwEAbBQGUFANyUxV1BrQDMAHiEYAfE2UQcKDAYJgBeJgBRPDkFAENgSx5NWLwAcxgACjI0JloyAEoeABUIAEEoKFiATwz8tVoATgyAEgAiKzkQJgBvf0Dgng7ZWoBfVrrnGlcNJBYSJgBZKoiEDBg8ZQEIDepu6iYDlmnWWaKmIfci7wyMAAsBZQ0PK78AoJh8/cPvgHdbhRCZy6ygwuDAGByAElSgATGECXTbADyJjiGGgykuOSK2O8UNh8N0thgkJh610GCqWKYVy+Bz2VG+3wEADMmBk+u8eABxGAYIpVVG1MLhSmoiAsjJFADaAF18p9GUzlUQAOznOSXa4AVQ2sRZMB4pUxMtl105wQVYmVyrpTNssSgfjkYRpRrhCIExNJ5IRVWtNpZ0BgsTAt3ZDqdDvMOBCQle/Q+du+DJtTOULoA1OFo7GA8qRsnDmrnbJ80xC0qDnaiMdaKcNbItTd7o9TQn3oq038ATSmMDQThwfiPYi8Ci0RjqTiaXimNDR16SWS8BSqTPaVWmaFfBcrhy3gNjVYTClahMtzW6w299c7g8mJoQzCkXhzFUTyktR3LUWDj3YD7AcwQhecCU9ZFUUqdEoBNbFcRHQklx9Vc/Wnbw7VTG1I1LV0indJDvRXNdy2+INYFDcMMlgNkKJhbZ3yYHDczjPAfyTLcUz/dMsxzWIYxgUjDkrNMSwzMs7UrEYgA=).

The code added to the third method will only be execute if hardware acceleration (SIMD) is provided by the hardware device and if the type `T` is supported. The JIT compiler will actually remove all this extra code when any of the two conditions is false. Meaning that there's no performance penalty when not used.

The size of `Vector<T>` may vary depending on the hardware device but it should only be used if the source is larger than the vector. Otherwise, the code defaults to the usual foreach loop.

To calculate the sum, we have to create `sumVector` that is a `Vector<T>` with all the elements initialized to zero.

The method `MemoryMarshal.Cast<T, Vector<T>>` provides an efficient way, without copies, of converting the source `ReadOnlySpan<T>` into a `ReadOnlySpan<Vector<T>>`. We can now use a `foreach` loop to iterate through the span of vectors. On each step of the loop, the elements of the vector are added to the elements of `sumVector`. This means, the first element of the vector is added to the first element of `sumVector`, the second element of the vector is added to the second element of `sumVector`, and so on.

Once the loop ends, each element of `sumVector` contains a partial sum of the array elements. We need to call `Vector.Sum()` that sums all the elements of `sumVector`, resulting in the total sum of the array elements processed.

> NOTE: This portion of the code does not check for overflows or deal with NaN and infinite. I you know how to do it, please let me know in the comments.

We now only have to handle the case where there are elements of the source that were left out because they were not enough to fill up one last `Vector<T>`. To do it efficiently, without copies, we can slice the source, leaving only these last elements. The span resulting from the slice will then be handled by the usual foreach loop, adding to the current sum value.

### Optimizing the sum of the `List<T>` elements

`List<T>` is a type provided by .NET that is very commonly used. The advantage over arrays is that data can be inserted and appended. Internally it uses an array that grows as needed.

`List<T>` is an enumerable type so we can use the `Sum()` we've just implemented:

```csharp
var source = Enumerable.Range(0, 100).ToList();
Console.WriteLine(source.Sum());
```

Although `List<T>` wraps an array, the first `Sum()` method will be used, which is much slower than the third one.

.NET 5 introduced a new method `CollectionsMarshal.AsSpan<T>(List<T>)`. It returns the `List<T>` internal array as a `Span<T>`. This means we can use the much more efficient third method to calculate the sum of the elements of a `List<T>`. We just need to change the code to the following:

```csharp
public static class MyExtension
{
    public static T Sum<T>(this IEnumerable<T> source)
        where T : struct, IAdditionOperators<T, T, T>, IAdditiveIdentity<T, T>
    {
        if (source.GetType() == typeof(T[]))
            return Sum(Unsafe.As<T[]>(source));

        // check if the enumerable is a list
        if (source.GetType() == typeof(List<T>))
            return Sum(Unsafe.As<List<T>>(source));

        var sum = T.AdditiveIdentity;
        foreach (var value in source)
        {
            sum += value;
        }
        return sum;
    }

    public static T Sum<T>(this T[] source)
        where T : struct, IAdditionOperators<T, T, T>, IAdditiveIdentity<T, T>
        => Sum<T>(source.AsSpan());

    // override that takes a list
    public static T Sum<T>(this List<T> source)
        where T : struct, IAdditionOperators<T, T, T>, IAdditiveIdentity<T, T>
        => Sum<T>(CollectionsMarshal.AsSpan(source));

    public static T Sum<T>(this ReadOnlySpan<T> source)
        where T : struct, IAdditionOperators<T, T, T>, IAdditiveIdentity<T, T>
    {
        var sum = T.AdditiveIdentity;
        if(Vector.IsHardwareAccelerated && Vector<T>.IsSupported && source.Length > Vector<T>.Count)
        {
            var sumVector = Vector<T>.Zero;

            var vectors = MemoryMarshal.Cast<T, Vector<T>>(source);
            foreach (ref readonly var vector in vectors)
                sumVector += vector;

            sum = Vector.Sum(sumVector);
            var remainder = source.Length % Vector<T>.Count;
            source = source[^remainder..];
        }
        foreach (ref readonly var value in source)
        {
            sum += value;
        }
        return sum;
    }
}
```

You can see it working in [SharpLab](https://sharplab.io/#v2:EYLgxg9gTgpgtADwGwBYA0AXEUCuA7AHwAEAmABgFgAoUgRmqLIAIjaUBuB51gOgBkAlngCOnGt1o8AcjgC2MKALABnMYxaSASvgwD5PAMIRZABwEAbBQGUFANyUxVXDT215d+gJLuFEEzah7MEc1CVcdPRgebwxFPGUlJyoGWgBOAAoAEgAiAAkAQygAEwB3QpgmAEEwYMsofIwYIpAmAG8ANRgwDGho5QListhq2oUGpoBfbIBKNTSs7M7u6FQq23yLfOBLFo6unqhUPoHS8pGYOvGiqdmUjJylg9oSAA41jfMtnbbH6GeX46FU7DGoXMaNa4zOb3Rb7aAkACsSHem22MF2vygiKQgMGZ1BlwhN2hC0xTCsAgAXuifnCoAAeIQYAB8hggOmJ1BSAGZGe5mUxlOyoMEmABeJgAUTwcjGaNc+TwAHMYOkyGgmLQyNMeAAVCCCZQYdK3GjzHJWOS7IU4EVRS2yE2c5I0bkaZGkJgAWQAnpKEI14gIIPFqK1qExIyw3axkbryXJ6brmekMAALATKDS85OC4XBaYRqPFkpphQVeMtI24boazyVIpFAS6EMAeRM4OgyiTGt1veZdYbTd0thgniKMHczZ9PaYyaLkfDVGLxYEADMmOkbXaeABxGAYXU+jsm8USjDHmAQNfpXUAbQAutNC8uV2+iAB2BOyJMpgCq8T5GuUSVN294Pim24Fqab5vguK7rpuUFRPuh6XqeYrnpe17pIaGC/s+8GwSwX4OukAHKEBIHdnhv6QfmMDPmIxHFkRUbrFAgpyOKc48EOzYCKO46TroF7MbBa7QDA+RgGmm4cUw6zmDgFRCHmtoFmxi5aSuyjcQA1BKSkqeJb4TDpn5cbIplMOZr6RvBRAxrQcbfr+qYZlm4HqXaL7EaW5ZzkwVaxDgtZMPWjYCW2Hb1AcYG9v2g5RSOY4TlOF6zvO9krmKAoOu5yF8coVgmIqJowVGjnOa5BXJh5mZMLRubIX5sEBbAQUhTWGDJcOwZ4O2nZQAlc5JRF/GpcJGUzn2c7MjpeVufVRjmJY3QDcoXqFMoab5OYxWleVrWVQ5OVOe6QV1Sm6aNZo0lFK2eDmD6R14L+PmaTlJZlp1laCqF4WRf1MXDaNc3Jn1AlCelomzf28FLsRCl6bIPG6nxKWCWlInTjZq43piuLAjA5yEk0TAAGSU0wmK/n0lomCY0AQlTNNFXwk5KumTACnTyZsjobVvkjLGRijchkhK/OsgAWr4Yg6cWCmjssI08V6MCyNAPrbSNe0HQY+RGrOMv0RpjHsFVy5K1GkmwDJcnpLAG4O0UIYvYphSKXSTBqar8XC2LUao2Shk+2rivfbBqM8UTZGh3Spq2+L3uwLIGx4BOnEShzXM8wApLTdL00YOj4zHDE8chd4AHrp5n2c8DwD4V5GdnEfb0myZuLtMG7Hs+l7nHGapeCfYxOmi2Lsfh6Pbe2RZX6ozZdkTEAA).

This code allows SIMD to be used on a `List<T>` even when cast to `IEnumerable<T>`.

## Results

Lets now benchmark it against the basic implementation of `Sum(IEnumerable<T>)` without any of the optimizations introduced.

The benchmark compares the following scenarios:

- A List<float> with 10 and 10,000 items,
- .NET 7 and .NET 8,
- With no SIMD support (Scalar), only Vector128 support (Vector128) and with Vector256 support (Vector256).

![benchmarks](Benchmarks.png)

The use of SIMD, together with the iteration of `List<T>` as span, totals in performance boosts of:

- 14x faster for 10 items and 6x faster for 10,000 items when hardware acceleration is not available (Scalar jobs).
- 17x faster for 10 items and 27x faster for 10,000 items when Vector128 is available (Vector128 jobs).
- 19x faster for 10 items and 54x faster for 10,000 items when Vector256 is available (Vector256 jobs).
- There is a 4x performance improvement when hardware acceleration is not available (Scalar jobs) just by upgrading from .NET 7 to .NET 8. This is an unrelated gain that you get for free by simply upgrading.

## Conclusions

The use of SIMD can radically improve performance of arithmetic intensive operations on large amounts of data.

> NOTE: This implementation of Sum() should only be used when it's guaranteed that the sum will not overflow and that the collection does not contain elements that are NaN or infinite. Use LINQ when these are not guaranteed.

The `Sum()` is just one example where the use of vectorization can be used. I hope you found this article helpful in understanding the concepts so that you can apply to different scenarios in your projects.

For documentation on the more advanced `System.Runtime.Intrinsics` namespace, check the "Introduction to vectorization with Vector128 and Vector256".
