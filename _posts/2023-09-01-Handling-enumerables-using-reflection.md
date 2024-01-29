---
layout: post
read_time: true
show_date: true
title: "Handling enumerables when using reflection"
date: 2023-09-01
img_path: /assets/img/posts/20230901
image: Stormy-sunset.jpeg
tags: [development, .net, csharp, reflection]
category: development
author: Antão Almada
---

.NET Reflection is a dynamic mechanism that allows developers to inspect and interact with the metadata and behaviour of types, objects, and assemblies at runtime. This enables tasks like discovering types, accessing their properties and methods, and creating instances without having explicit compile-time knowledge. Reflection is a powerful tool for scenarios where you need to work with code in a flexible and adaptive manner.

The requirement for an enumerable to be traversed using a `foreach` is that the type must provide a public parameterless method named `GetEnumerator()` that returns an instance of an enumerator. The returned enumerator type must provide a public parameterless method named `MoveNext()` that returns `bool`, and also a public readable property named `Current`. Alternatively, the `GetEnumerator()` method can be defined as an extension method.

It's not correct to simply check if the type derives from `IEnumerable<T>` or `IAsyncEnumerable<T>`.

The compiler generates different code for the `foreach` statement depending on the type of collection provided. Handling all these cases correctly makes the use of reflection very complicated.

## NetFabric.Reflection

`NetFabric.Reflection` provides extension methods for the type `System.Type` that can correctly validate if the type it represents can be used as the source in `foreach` or `await foreach` statements.

### IsEnumerable()

```csharp
public static bool IsEnumerable(this Type type,
    [NotNullWhen(true)] out EnumerableInfo? enumerableInfo,
    out IsEnumerableError error)
```

The method returns `true` if the type represented by `Type` can be used in a `foreach` statement; otherwise `false`.

> It does not support the case when `GetEnumerator()` is defined as an extension method. It's not possible to find extension methods using reflection.

The method `IsEnumerable()` only returns `true` if both the enumerable and the enumerator are valid.

If the method `IsEnumerable()` returns true, the `enumerableInfo` output parameter contains all the `MethodInfo` and `PropertyInfo` for the methods and properties that are going to be actually used by the `foreach` statement. The `GetEnumerator()` of the enumerable, the property `Current` and the method `MoveNext()` of the enumerator. It may also contain info for methods `Reset()` and `Dispose()` of the enumerator, if defined.

If the methods return `false`, the `errors` output parameter indicates why the type is not considered an enumerable. It can be `Error.MissingGetEnumerator`, `Error.MissingCurrent` or `Error.MissingMoveNext`.

The output parameter also includes a `ForEachUsesIndexer` boolean property that indicates that, although the collection provides an enumerator, `foreach` will use the indexer instead. That's the case for arrays and spans.

You can use these info values to further validate the enumerable and its respective enumerator. For example, use the following to find if the `Current` property of the enumerator returns by reference:

```csharp
enumerableInfo.EnumeratorSymbols.Current.ReturnsByRef;
```

### IsAsyncEnumerable

```csharp
public static bool IsAsyncEnumerable(this Type type,
    [NotNullWhen(true)] out AsyncEnumerableInfo? enumerableInfo,
    out IsAsyncEnumerableError error)
```

The method returns `true` if the type represented by `Type` can be used in an `await foreach` statement; otherwise `false`.

> It does not support the case when `GetAsyncEnumerator()` is defined as an extension method. It's not possible to find extension methods using reflection.

The method `IsAsyncEnumerable()` only returns `true` if both the enumerable and the enumerator are valid.

If the method `IsAsyncEnumerable()` returns `true`, the enumerableInfo output parameter contains all the `MethodInfo` and `PropertyInfo` for the methods and properties that are going to be actually used by the `await foreach` statement. The `GetAsyncEnumerator()` of the enumerable, the property `Current` and the method `MoveNextAsync()` of the enumerator. It may also contain info for method `DisposeAsync()` of the enumerator, if defined.

If the methods return `false`, the errors output parameter indicates why the type is not considered an enumerable. It can be `Error.MissingGetAsyncEnumerator`, `Error.MissingCurrent` or `Error.MissingMoveNextAsync`.

You can use these info values to further validate the async enumerable or its respective enumerator.

### Expression Trees

When using reflection you most certainly want to dynamically execute code. Given the `MethodInfo` and `PropertyInfo` provided, reflection can be used to call the methods and property accessors.

One other way to do it is to use expression trees. These are a tree structure of expressions that represent code statements. Expression trees can be compiled at runtime and then executed as many times as needed.

The .NET Framework does not provide an expression element that represents a `foreach` statement. This doesn't make it easy to deal with collections the way the Roslyn compiler does for the `foreach` statement. Roslyn generates different code depending on the the type of enumerable.

The `NetFabric.Reflection` package provides a `ExpressionEx.ForEach()` that does that. This makes handling enumerables when using reflection, simple and reusable.

To dynamically generate the code that calculates the sum all the items of a collection, you can use the following:

```csharp
using static NetFabric.Expressions.ExpressionEx;
using static System.Linq.Expressions.Expression;

int Sum<TEnumerable>(TEnumerable enumerable)
{
    var enumerableParameter = Parameter(typeof(TEnumerable), "enumerable");
    var sumVariable = Variable(typeof(int), "sum");
    var expression = Block(
        new[] {sumVariable},
        Assign(sumVariable, Constant(0)),
        ForEach(
            enumerableParameter,
            item => AddAssign(sumVariable, item)),
        sumVariable);
    var sum = Lambda<Func<TEnumerable, int>>(expression, enumerableParameter).Compile();

    return sum(enumerable);
}
```

Notice that the generics parameter `TEnumerable` doesn't have any constraints. This method can be used to sum the items of a collection that doesn't implement any interface. It throws an exception if the collection does not comply with the `foreach` minimum requirements.

The issues with this code is that it compiles the expression tree every time it's called. This is a very slow operation. The following code solves this by using `Lazy<T>` to cache the result of the compilation. As an example, it also uses a collection that only implements the minimum requirements of foreach, i.e. doesn't implement `IEnumerable` or `IEnumerable<T>`:

```csharp
using static NetFabric.Expressions.ExpressionEx;
using static System.Linq.Expressions.Expression;

var source = new MyCollection(new[] { 0, 1, 2 });
var sumFunc = Sum<MyCollection>.Func;

Console.WriteLine(sumFunc(source));

static class Sum<TEnumerable>
{
    static Lazy<Func<TEnumerable, int>> Cache
        = new (Compile, LazyThreadSafetyMode.ExecutionAndPublication);

    public static Func<TEnumerable, int> Func
        => Cache.Value;

    static Func<TEnumerable, int> Compile()
    {
        var enumerableParameter = Parameter(typeof(TEnumerable), "enumerable");
        var sumVariable = Variable(typeof(int), "sum");
        var expression = Block(
            new[] {sumVariable},
            Assign(sumVariable, Constant(0)),
            ForEach(
                enumerableParameter,
                item => AddAssign(sumVariable, item)),
            sumVariable);
        return Lambda<Func<TEnumerable, int>>(expression, enumerableParameter).Compile();
    }
}

class MyCollection
{
    readonly int[] source;

    public MyCollection(int[] source)
        => this.source = source;

    public Enumerator GetEnumerator()
        => new Enumerator(this);

    public struct Enumerator
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

        public bool MoveNext()
            => ++index < source.Length;
    }
}
```

`ExpressionEx.ForEach()` generates code as much as possible similar to the code generated by Roslyn.

> `ExpressionEx.ForEach()` does not support `Span<T` or `ReadOnlySpan<T>` as its source because they return the items by reference and unfortunately expression trees still do not support return by reference.

> `NetFabric.Reflection` does not provide an expression to traverse async enumerables because, reproducing the state machine code generation as Roslyn does it, is a lot of work...

## NetFabric.Assertive

[NetFabric.Assertive](https://www.nuget.org/packages/NetFabric.Assertive) is yet another assertions library. What differentiates this package from other assertion libraries is that it allows the comparison of all the possible enumeration outputs of a collection against an expected result. It traverses the collection as the `foreach` statement would do, if cast to `IEnumerable` or `IEnumerable<T>`, and also using the indexer, is provided. One single call gets full enumeration coverage.

It makes use of the `NetFabric.Reflection` to dynamically generate the required code. It uses `ExpressionEx.ForEach()` to use all enumerators and `ExpressionEx.For()` to use the indexer when available.

If you'd like to use `NetFabric.Reflection` in your project, you can use this project as reference.

If you are developing new collections, you can use this package to unit test it.
