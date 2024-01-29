---
layout: post
read_time: true
show_date: true
title: "Handling enumerables in Roslyn Analyzers and Code Generators"
date: 2023-08-30
img_path: /assets/img/posts/20230830
image: Sunset-beach.jpeg
tags: [development, .net, csharp, roslyn]
category: development
author: Antão Almada
---

Roslyn Analyzers and Code Generators are essential tools in the world of .NET development. Analyzers offer real-time code analysis at compile time, catching issues and promoting best practices by interpreting the code before compilation. This ensures that potential problems are identified early in the development process. Code Generators, also operating at compile time, automate the creation of repetitive code snippets. By doing so, they enhance code quality, boost efficiency, and streamline the development process.

The requirement for an enumerable to be traversed using a `foreach` is that the type must provide a public parameterless method named `GetEnumerator()` that returns an instance of an enumerator. The returned enumerator type must provide a public parameterless method named `MoveNext()` that returns `bool`, and also a public readable property named `Current`. Alternatively, the `GetEnumerator()` method can be defined as an extension method.

It's not correct to simply check if the type derives from `IEnumerable<T>` or `IAsyncEnumerable<T>`.

This makes the correct handling of enumerables in Roslyn Analyzers and Code Generators very complicated.

## NetFabric.CodeAnalysis

`NetFabric.CodeAnalysis` provides extension methods for the interface `ITypeSymbol` that can correctly validate if the type it represents can be used as the source in `foreach` or `await foreach` statements.

### IsEnumerable

```csharp
public static bool IsEnumerable(this ITypeSymbol typeSymbol, Compilation compilation,
[NotNullWhen(true)] out EnumerableSymbols? enumerableSymbols,
    out IsEnumerableError error)
```

The methods return `true` if the type represented by `ITypeSymbol` can be used in a `foreach` statement; otherwise `false`. It supports all the cases including when `GetEnumerator()` is defined as an extension method.

The method `IsEnumerable()` only returns `true` if both the enumerable and the enumerator are valid.

If the method `IsEnumerable()` returns `true`, the `enumerableSymbols` output parameter contains all the `IMethodSymbol>` and `IPropertySymbol` for the methods and properties that are going to be actually used by the `foreach` statement. The `GetEnumerator()` of the enumerable, the property `Current` and the method `MoveNext()` of the enumerator. It may also contain info for methods `Reset()` and `Dispose()` of the enumerator, if defined.

Is the methods return false, the errors output parameter indicates why the type is not considered an enumerable. It can be `Error.MissingGetEnumerator`, `Error.MissingCurrent` or `Error.MissingMoveNext`.

The output parameter also includes a `ForEachUsesIndexer` boolean property that indicates that, although the collection provides an enumerator, `foreach` will use the indexer instead. That's the case for arrays and spans.

You can use these info values to further validate the enumerable and its respective enumerator. For example, use the following to find if the `Current` property of the enumerator returns by reference:

```csharp
enumerableSymbols.EnumeratorSymbols.Current.ReturnsByRef;
```

### IsAsyncEnumerable

```csharp
public static bool IsAsyncEnumerable(this ITypeSymbol typeSymbol, Compilation compilation,
    [NotNullWhen(true)] out AsyncEnumerableSymbols? enumerableSymbols,
    out IsAsyncEnumerableError error)
```

The methods return `true` if the type represented by `ITypeSymbol` can be used in an `await foreach` statement; otherwise `false`. It supports all the cases including when `GetAsyncEnumerator()` is defined as an extension method.

The method `IsAsyncEnumerable()` only returns true if both the enumerable and the enumerator are valid.

If the method `IsAsyncEnumerable()` returns `true`, the `enumerableSymbols` output parameter contains all the `IMethodSymbol` and `IPropertySymbol` for the methods and properties that are going to be actually used by the `await foreach` statement. The `GetAsyncEnumerator()` of the enumerable, the property `Current` and the method `MoveNextAsync()` of the enumerator. It may also contain info for method `DisposeAsync()` of the enumerator, if defined.

Is the methods return `false`, the errors output parameter indicates why the type is not considered an enumerable. It can be `Error.MissingGetAsyncEnumerator`, `Error.MissingCurrent` or `Error.MissingMoveNextAsync`.

You can use these info values to further validate the async enumerable or its respective enumerator.

## NetFabric.Hyperlinq.Analyzer

[`NetFabric.Hyperlinq.Analyzer`](https://github.com/NetFabric/NetFabric.Hyperlinq.Analyzer) is an Roslyn Analyzer that provides diagnostics and code fixes related to enumerables in C# projects. It makes use of the `NetFabric.CodeAnalysis` package.

If you're developing a Roslyn Analyzer or a Code Generator, and would like to use `NetFabric.CodeAnalysis`, you can use its source code as reference.

If you're developing any other kind of C# project, you can add this analyzer to your projects so that you can easily find where to use the tips I wrote about in the articles I've been publishing. You can find the current list of rules in its repository.
