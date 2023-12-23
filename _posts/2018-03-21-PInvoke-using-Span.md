---
layout: post
read_time: true
show_date: true
title: "P/Invoking using Span&lt;T&gt;"
date: 2018-03-21
img: posts/20180321/Observing.jpg
tags: [development, .net, csharp]
category: development
author: Antão Almada
---

Through out the many years I’ve been using .NET, I’ve had to use many functionalities that were not yet available in .NET (computer vision, 3D rendering, physics, augmented-reality, and many more). One of the great features of .NET is that it supports calls to native code. This is called [Platform Invocation Service, or P/Invoke](https://en.wikipedia.org/wiki/Platform_Invocation_Services). This article is about my investigation on how `Span<T>` can be used for P/Invoke calls.

For the purpose of this investigation, I created a simple C++ native library that exposes a method that calculates the total sum of a given array of integers.

```cpp
int sum(int* ptr, size_t length)
{
 int sum = 0;
 for (size_t index = 0; index < length; index++)
  sum += ptr[index];
 return sum;
}
```

The method accepts two arguments (a pointer to the first position of the array and the number of items in the array) and returns the sum. The array is allocated by the caller, that is also responsible for releasing it.

The following code makes if possible for managed code to call the native method defined above.

```csharp
using System;
using System.Runtime.InteropServices;
using System.Security;

namespace SpanSample
{
    [SuppressUnmanagedCodeSecurity]
    static class Native
    {
        const string LibName = "Native";

        [DllImport(LibName, EntryPoint = "sum")]
        public static extern unsafe int Sum(int* buffer, UIntPtr size);
    }
}
```

This P/Invoke implementation has multiple details that are beyond the scope of this article but the most important thing here is that managed code can call the static method by using `Native.Sum(buffer, size)`.

## Before Span<T> Era

NET has three different ways to allocate contiguous memory:

- `new[]` — Allocated on the heap and managed by the GC.
- `stackalloc[]` — Allocated on the stack and released automatically when exiting scope.
- `Marshal.AllocHGlobal()` — Allocated on the heap. Caller is responsible for releasing it by calling `Marshal.FreeHGlobal()`.

All these options can be used to allocate the required buffer to be passed to the native method:

```csharp
public unsafe int Array()
{
    var buffer = new int[bufferSize]; 
    fixed(int* ptr = &buffer[0])
    {
        return Native.Sum(ptr, (UIntPtr)bufferSize);
    }
}

public unsafe int StackAlloc()
{
    var buffer = stackalloc int[bufferSize];
    return Native.Sum(buffer, (UIntPtr)bufferSize);
}

public unsafe int HGlobal()
{
    var size = bufferSize * Unsafe.SizeOf<int>();
    var buffer = IntPtr.Zero;
    try
    {
        buffer = Marshal.AllocHGlobal(size);
        GC.AddMemoryPressure(size);
        return Native.Sum((int*)buffer.ToPointer(), (UIntPtr)bufferSize);
    }
    finally
    {
        Marshal.FreeHGlobal(buffer);
        GC.RemoveMemoryPressure(size);
    }
}
```

Notice how each memory allocation is handled in completely different ways:

- The managed array needs to be fixed so that the GC doesn’t move it around while the sum is calculated. The memory is automatically released once no references are found by the GC.
- The stack allocation is the simplest one as it stays in its position until automatically released when the code exits the method.
- Memory allocated with `Marshal.AllocHGlobal()` is not managed by the GC so it’s not moved around but it has to be explicitly released. Although the GC doesn’t managed this memory, it’s good policy to inform it of the total heap memory used by the application. This can be done using `GC.AddMemoryPressure()` and `GC.RemoveMemoryPressure()`.

> NOTE: The example doesn’t include code to fill the buffer with values so the result is always 0. I’m focusing just on memory management and p/invoke call issues.

## Unsafe and MemoryMarshal classes

.NET has always supported passing value-type arguments by reference. Recently it was added support for return-by-reference and read-only-references.

The `System.Runtime.CompilerServices.Unsafe` class includes many useful static methods, including the following that allow handling pointers as references:

```csharp
ref T AsRef<T>(void* source);
ref T AsRef<T>(in T source)
void* AsPointer<T>(ref T value);
ref T Add<T>(ref T source, int elementOffset);
ref T Subtract<T>(ref T source, int elementOffset);
```

The `System.Runtime.InteropServices.MemoryMarshal` class includes a couple of `GetReference()` static methods that return a reference to the first position of a `Span<T>` or a `ReadOnlySpan<T>`:

```csharp
ref T GetReference<T>(Span<T> span);
ref T GetReference<T>(ReadOnlySpan<T> span);
```

To use these, we can refactor the first argument in the P/Invoke signature, from a `int*` pointer to a `int` reference using the `ref` keyword. But, because the buffer content is not changed in the call and I’m using C# 7.2, I can set it to a readonly-reference instead, using the `in` keyword.

```csharp
using System;
using System.Runtime.InteropServices;
using System.Security;

namespace SpanSample
{
    [SuppressUnmanagedCodeSecurity]
    static class Native
    {
        const string LibName = "Native";

        [DllImport(LibName, EntryPoint = "sum")]
        public static extern int Sum(in int buffer, UIntPtr size);
    }
}
```

Notice that the `unsafe` keyword is no longer required.

Using the reference methods and the new P/Invoke signature, we can refactor the first code example to the following:

```csharp
public unsafe int Array()
{
    ReadOnlySpan<int> span = new int[bufferSize];
    fixed (int* ptr = &MemoryMarshal.GetReference(span))
    {
        return Native.Sum(Unsafe.AsRef<int>(ptr), (UIntPtr)span.Length);
    }
}

public int StackAlloc()
{
    ReadOnlySpan<int> span = stackalloc int[bufferSize];
    return Native.Sum(MemoryMarshal.GetReference(span), (UIntPtr)span.Length);
}

public unsafe int HGlobal()
{
    var buffer = IntPtr.Zero;
    try
    {
        buffer = Marshal.AllocHGlobal(bufferSize * Unsafe.SizeOf<int>());
        ReadOnlySpan<int> span = new ReadOnlySpan<int>(buffer.ToPointer(), bufferSize);
        return Native.Sum(MemoryMarshal.GetReference(span), (UIntPtr)span.Length);
    }
    finally
    {
        Marshal.FreeHGlobal(buffer);
    }
}
```

It compiles fine with the following notes:

- For the managed array, although we get a reference to the first position, it still has to be fixed which returns a pointer, forcing the use of the `unsafe` keyword
- For the unmanaged allocation, there is no `Span<T>` or `ReadOnlySpan<T>` constructor that takes an `IntPtr` argument so it has to be converted to a pointer, also forcing the use of the `unsafe` keyword.
- The use of the `in` keyword is optional in a method call.

## Span&lt;T&gt; arguments

One of the advantages of using `Span<T>` is that methods can be abstracted from how the memory was allocated. We can move the call to the P/Invoke into a static `Sum` method with a `ReadOnlySpan<T>` argument.

```csharp
static unsafe int Sum(ReadOnlySpan<int> span)
{
    fixed (int* ptr = &MemoryMarshal.GetReference(span))
    {
        return Native.Sum(Unsafe.AsRef<int>(ptr), (UIntPtr)span.Length);
    }
}

public int Array()
{
    return Sum(new int[BufferSize]);
}

public int StackAlloc()
{
    ReadOnlySpan<int> span = stackalloc int[bufferSize];
    return Sum(span);
}

public unsafe int HGlobal()
{
    var size = BufferSize * Unsafe.SizeOf<int>();
    var buffer = IntPtr.Zero;
    try
    {
        buffer = Marshal.AllocHGlobal(size);
        GC.AddMemoryPressure(size);
        return Sum(new ReadOnlySpan<int>(buffer.ToPointer(), BufferSize));
    }
    finally
    {
        Marshal.FreeHGlobal(buffer);
        GC.RemoveMemoryPressure(size);
    }
}
```

Notice that the method now has to fix the buffer for all the cases as it doesn’t know how the memory was allocated. We’ll check later if this affects the performance in any way.

> NOTE: The method is marked as unsafe only because of the use of a pointer inside. The signature of the method is not unsafe on itself. The keyword can be moved inside if you prefer.

This example is very simple so we gain very little with the abstraction but developers of public APIs can now let the user allocate the memory and pass it in, in a clean, strongly-typed way without exposing unsafe code.

## MemoryManager&lt;T&gt;

The code for the unmanaged array handling is still somewhat complex as it has to release resources in a robust way. We should hide it in some IDisposable implementation.

.NET Core 2.1 includes a `System.Buffers.MemoryManager<T>` class that seem to be exactly for this purpose (was `System.Buffers.OwnedMemory<T>` in Preview 1). This is an abstract class so we have to derive our own class, implementing the unmanaged array creation and release.

The dotnet/corefx repository includes a `NativeMemoryManager` class that does exactly that. This is an internal class and only implements the case for `MemoryManager<byte>` so I cloned it and refactored it to be generic.

We can now refactor our `HGlobal` method to the following:

```csharp
public int HGlobal()
{
    using (var buffer = new NativeMemoryManager<int>(bufferSize))
    {
        return Sum(buffer.Span);
    }
}
```

The code is now much cleaner, easier to maintain and read. The need for the `unsafe` keyword has also been dropped.

## Performance

I now want to know if these abstraction affect the performance in any way. To evaluate it, I commented out the buffer iteration in the native code so that only the memory management and the P/Invoke is taken into account.

Using [BenchmarkDotNet](http://benchmarkdotnet.org/) and [some code that reproduces all the scenarios described](https://github.com/aalmada/SpanSample/blob/master/SpanSample/PinvokeBenchmarks.cs), for buffers with 100 and 1000 items, I got the following results:

![benchmarks](./assets/img/posts/20180321/Benchmarks.png)

> NOTE: Choosing larger buffers would make the stack allocation fail as this type of memory is very limited.

I reordered the result to better understand how the method used, memory type and number of items, influence the performance.

On this first table, each line highlights the difference in performance when using `Span<T>` and method with a `Span<T>` argument, relative to when not using them:

![benchmarks](./assets/img/posts/20180321/Benchmarks2.png)

- The use of `Span<T>` makes almost no difference for the managed array.
- There’s a big difference when using `Span<T>` with stack allocations.
- “Fixing” the buffer even when not required, doesn’t seem to affect performance.
- The use of the `NativeMemoryManager<T>` introduces some overhead (~50 percentage points).

On this second table, each lines highlights the difference in performance when increasing from 100 to 1000 items:

![benchmarks](./assets/img/posts/20180321/Benchmarks3.png)

- The factor of time-elapsed increase is constant for all scenarios except for the stack allocation where there is a big difference between using `Span<T>` and not using it.
- Interesting to see that the factor is 1 (100%) for all unmanaged allocation scenarios.

## Conclusions

The use of `Span<T>` for P/Invoke calls allows cleaner, strongly-typed, reusable code.
