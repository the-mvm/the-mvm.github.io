---
layout: post
read_time: true
show_date: true
title: "An interface for value-type enumerators, a proposal"
date: 2023-09-10
img_path: /assets/img/posts/20230910
image: IValueEnumerable.png
tags: [development, .net, csharp, performance]
category: development
---

[As I explained in a previous article](https://aalmada.github.io/Leveraging-csharp-foreach-loop.html), `IEnumerable<T>` is an interface that enforces the requirements for the source of a `foreach` statement. Any type that implements `IEnumerable<T>` can be traversed using the `foreach` statement.

[As I explained in one other article](https://aalmada.github.io/Value-type-vs-reference-type-enumerables.html), there's a big advantage in performance if the enumerator is a value-type. All the collections provided by the .NET framework define value-type enumerators.

The disadvantage of using `IEnumerable<T>` is exactly that it requires `GetEnumerator()` to return `IEnumerator<T>` which is an interface, a reference-type. There are ways to workaround this issue by providing overloads to `GetEnumerator()` but these only work if the collections itself is not cast to `IEnumerable<T>`.

[LINQ casts all collections to `IEnumerable<T>` so it uses runtime optimizations to improve performance](https://aalmada.github.io/LINQ-internals-speed-optimizations.html) but these make the code a lot more complex and hard to maintain.

## IValueEnumerable&lt;T, TEnumerator&gt;

My proposal is to adopt an interface that not only requires `GetEnumerator()` to return a value-type but that is also backwards compatible. Meaning that, collections that implement it, must still be handled by existing libraries that require the use of `IEnumerable<T>` , e.g. LINQ.

```csharp
public interface IValueEnumerable<out T, out TEnumerator>
    : IEnumerable<T>
    where TEnumerator : struct, IEnumerator<T>
{
    new TEnumerator GetEnumerator();
}
```

`IValueEnumerable<T, TEnumerator>` adds an overload for `GetEnumerator()` that returns `TEnumerator`, a generics attribute that has a `struct` constraint, making it a value-type. The interface derives from `IEnumerable<T>` making all collections that implement it to be backwards compatible. This also requires `TEnumerator` to implement `IEnumerator<T>`.

As an example, here's a simple collection that implement `IValueEnumerable<T, TEnumerator>`:

```csharp
class MyCollection
    : IValueEnumerable<int, MyCollection.Enumerator>
{
    readonly int[] source;

    public MyCollection(int[] source)
        => this.source = source;

    public Enumerator GetEnumerator()
        => new Enumerator(this);

    IEnumerator<int> IEnumerable<int>.GetEnumerator()
        => GetEnumerator();

    IEnumerator IEnumerable.GetEnumerator()
        => GetEnumerator();

    public struct Enumerator : IEnumerator<int>
    {
        readonly int[] source;
        int index;

        public Enumerator(MyCollection enumerable)
        {
            source = enumerable.source;
            index = -1;
        }

        public int Current
            => source[index];

        object IEnumerator.Current
            => Current;

        public bool MoveNext()
            => ++index < source.Length;

        public void Reset()
            => index = -1;

        public void Dispose() {}
    }
}
```

In this case, changing the `Enumerator` from a `struct` to a `class` would result in a compilation error.

The interface can also be used in the methods that process the contents of a collection. For example, we can implement a `Sum()` method that takes a parameter of type `IValueEnumerable<T, TEnumerator>`:

```csharp
public static T Sum<T, TEnumerator>(this IValueEnumerable<T, TEnumerator> source)
    where T: IAdditiveIdentity<T, T>, IAdditionOperators<T, T, T>
    where TEnumerator : struct, IEnumerator<T>
{
    var sum = T.AdditiveIdentity;
    foreach(var item in source)
        sum += item;
    return sum;
}
```

> NOTE: Check my other article "[Generic math in .NET](https://aalmada.github.io/Generic-math-in-dotnet.html)" to understand de use of the `IAdditiveIdentity<T, T>` and `IAdditionOperators<T, T, T>` interfaces.

[You can see in SharpLab](https://sharplab.io/#v2:EYLgxg9gTgpgtADwGwBYA+ABATABgLABQ2AjIRjgAQbEB0AwhADaMxgAuAlhAHYDOA3GUrUUgosNoA5AK4BbGFA5gBhQgDcAhlAq8I0qGBgUAvBW4wA7hQCyATwbNWnHgApzFgNoBdCgG8cADQUxEFYAL4AlGLUAJwuuvqGNADKci4RUapEAMwUHNxsCgBmGoYUAJIAahqM0jAAotxyChrALAA8emwUACpBXb2NzVAabNAAfIQU0xQgVMTZ7T2TBDMUFgAWCkY9Q/IjY9pzvGxQ0uxB5Xsth0srvlMz7oNN+6PQFADiMGzXB9DpMRhLLUJBULA2Wz1BCFPhcPiEB6rGYYXKg3oUVKyJZBXavG4TFxsDYcXgVaq1Br4kZtGA4l7Dd5QcY6PQGGARR5raabba9OblACCABNhRxOGoYOVhTACuLbPTlpcRWLnNwAPIABwJUF4itxK25M15sAZb0Osx0p3ObEufyZdy5fida002l4chMvRoKvFHEl0tlnDYtjERumRWgMFKGxcbryhVkeW4rMSHJd4Y9SYA1KZxTBZGHwxgAOw6ORF6bAgjVsgQuwOFjseEUJ0Cil1e209r5W2QxtOeE0e2He5O2AaYU8Ri2ZNsbyp9mV1vI6ao/tMJtqly9hcJdmc1fc4ws4mkmj7sqmS8wZdO9cjj7fX7UpnpDPTE9mSwUR9QIkkrwmRHmsTpXK+ty9iy1CLFBNDPn+74gTMX4IRBAJRNMH4rms4GMhaMHwT8iGHuGJgsmh+EYXeR7ricZzsL+6FHBUf49gUhozEiZETlO3AznOe5soYy5rL2yYyggokzNhD7MS4DaboOPAULKjK0qR4bcWRMw3l6alvLSF7Cbe2FidwklenAxDSVW2Gybk4l0PosAFDhOmfiyN4ePkkleLZ3LYRAwAAFZOKxzH0C5QZmShLLOVArlsAFoHIWuuTABATA2BAkqSDAMJIR5nkUNm2a+QVFDtIuSQADKygA5sSKUyWlVBoigFAAEowLwPxFcVX4VQgVk2bFWFteuGCdQAIqSmoQH16R+NWazVmEQA===) that the compiled code is equivalent to the following:

```csharp
public static T Sum<T, TEnumerator>(IValueEnumerable<T, TEnumerator> source)
    where T : IAdditiveIdentity<T, T>, IAdditionOperators<T, T, T>
    where TEnumerator : struct, IEnumerator<T>
{
    T additiveIdentity = T.AdditiveIdentity;
    TEnumerator enumerator = source.GetEnumerator();
    try
    {
        while (enumerator.MoveNext())
        {
            T current = enumerator.Current;
            additiveIdentity += current;
        }
        return additiveIdentity;
    }
    finally
    {
        enumerator.Dispose();
    }
}
```

Notice that the enumerator is of type `TEnumerator` which has a constraint to be a value-type. If the source parameter had been of type `IEnumerator<T>`, the enumerator would have been of type `IEnumerator<T>` which is a reference-type.

> NOTE: For benchmarks please check my other article "[Performance of value-type vs reference-type enumerators in C#](https://aalmada.github.io/Value-type-vs-reference-type-enumerables.html)".

## NetFabric.Hyperlinq.Abstractions

An interface for enumeration becomes most useful when the developers of both the collections and the processing libraries use the same interface. This makes them interoperable.

While there is not an alternative in the .NET framework but you'd like to start using a standard version, I suggest the use of the package [NetFabric.Hyperlinq.Abstractions](https://www.nuget.org/packages/NetFabric.Hyperlinq.Abstractions).

This package is extensively used by the packages [NetFabric.DoublyLinkedList](https://www.nuget.org/packages/NetFabric.DoublyLinkedList) and [NetFabric.Hyperlinq](https://www.nuget.org/packages/NetFabric.Hyperlinq/).
