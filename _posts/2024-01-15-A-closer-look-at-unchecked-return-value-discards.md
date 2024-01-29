---
layout: post
read_time: true
show_date: true
title: "Defensive Coding in C#: A Closer Look at Unchecked Return Value Discards"
date: 2024-01-15
img_path: /assets/img/posts/20240115
image: Discard.png
tags: [development, .net, csharp, .editorconfig]
category: development
author: Antão Almada
---

One of the significant advantages of strongly-typed languages like C# lies in their ability to catch many errors during compile time, providing a robust defense against bugs reaching the runtime. This not only streamlines the development process but also contributes to a more reliable user experience.

Despite the rigorous error-checking at compile time, there are certain types of errors that may escape detection or are intentionally overlooked for convenience. A notable example is the disregard of unused returned values. By default, C# allows developers to ignore the value returned by a method.

Now, you might wonder why this seemingly harmless practice could be problematic.

Let's consider a scenario where you have a `List<T>` and use a method to iteratively add items:

```csharp
var collection = new List<int>();

for (var index = 0; index < 10; index++)
    collection.Add(item);
```

[You can observe in SharpLab that this code performs as expected.](https://sharplab.io/#v2:EYLgxg9gTgpgtADwGwBYA0AXEUCuA7AHwAEAmABgFgAoUgRmqLIAIjaUBua6gNwEMomkADZCYYDAEsIeJgF4meGAHcmAGQkBnDAB4JeDAD4AFAEpOVagDNoRvgL0ATGAjlMy7Jo+dNtTWu888JwQAahCTaiYowQgRMUlpADoAQQcHIy8EMy4qYVFxKTxI6MSAMWgAUV4wAAsjVgBObIsW6iA)

Now, imagine that you decide to make the collection immutable and refactor the code:

```csharp
var collection = ImmutableList.Create<int>();

for (var index = 0; index < 10; index++)
    collection.Add(index);
```

We only had to change the way the collection is created, and the code compiles fine.

[Running this code on SharpLab reveals that the items are not added as expected.](https://sharplab.io/#v2:EYLgxg9gTgpgtADwGwBYA0AXEUCuA7AHwAEAmABgFgAoUgRmqLIAIjaA6AYQgBtuYwMASwh4AzmwCSAWyk4MAQ2B8A3NWoA3eVCaRe/ISKYBeJtNkKlMADKDRGTrHkYYAHkF4MAPgAUASlVU1ABm0N6a2u4AJjAIxkxkykxRMUwuTLQJSXjRCADUub7UTMU6PHwCwnhsAIKRkd7JCP5qVLrlBnhFJWwAYtAAovJgABberACczYHT1EA=)

What's happening?

The issue lies in the definition of `Add()` for `List<T>`:

```csharp
public void Add(T item);
```

While the `Add()` for `ImmutableList<T>` is defined as follows:

```csharp
public ImmutableList<T> Add(T value);
```

The crucial difference lies in the return type. While the `Add()` method for `List<T>` returns `void` and adds the item to the instance, the `Add()` method for `ImmutableList<T>` returns a new instance containing the provided item, leaving the original instance unaltered.

To resolve this, the result of `Add()` must be stored in the `collection` variable:

```csharp
var collection = ImmutableList.Create<int>();

for(var index = 0; index < 10; index++)
    collection = collection.Add(index);
```

> NOTE: There are more efficient ways to add multiple items to an `ImmutableList<T>`. This is just a simple example.

The real issue here is that you may only notice the error at runtime. It would be beneficial if the compiler could catch this error at compile time.

## .editorconfig

The `.editorconfig` file plays a practical role as a shared rulebook, facilitating uniformity across developers and integrated development environments (IDEs). Specifically relevant to C#, this configuration file is supported by popular IDEs such as Visual Studio, Visual Studio Code, and Rider, offering a streamlined approach to achieving coding consistency in C# projects.

Consider the following minimal `.editorconfig` file for a C# project:

```ini
# Set the indentation style to spaces with a size of 4
[*.{cs}]
indent_style = space
indent_size = 4

# Specify Unix line endings
[*]
end_of_line = lf
```

Remember, the `.editorconfig` file is a text file that should be placed at the root of the project. It supports overloading in children folders, allowing you to fine-tune coding style preferences for specific sections of your project. This simple yet powerful approach can significantly enhance the readability and collaborative nature of your C# codebase.

### csharp_style_unused_value_expression_statement_preference

In the context of customizing `.editorconfig`, a noteworthy configuration is `csharp_style_unused_value_expression_statement_preference`. Its purpose is clear: to convert potential runtime errors into compilation errors.

By incorporating `csharp_style_unused_value_expression_statement_preference` into your project's `.editorconfig`, you establish a uniform coding style and fortify your code against potential runtime issues, ensuring they are detected during compilation.

To implement this setting, simply add the following to your `.editorconfig` file:

```ini
csharp_style_unused_value_expression_statement_preference = discard_variable:error
```

This configuration prompts the compiler to flag errors, specifically [IDE0058](https://learn.microsoft.com/en-us/dotnet/fundamentals/code-analysis/style-rules/ide0058), when encountering the mentioned issues in your code.

However, there are scenarios where you intentionally want to disregard the returned value. This is common in cases involving [fluent](https://en.wikipedia.org/wiki/Fluent_interface) syntax, where methods always return values so that they can be chained together. In such instances, you can use the [discard](https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/functional/discards), an underscore, as illustrated below:

```csharp
_ = result.Must()
  .BeEnumerableOf<string>()
  .BeEqualTo(expected);
```

> NOTE: Example uses [`NetFabric.Assertive`](https://www.nuget.org/packages/NetFabric.Assertive) package.

This approach eliminates the need to declare variables that will ultimately go unused, while explicitly signaling the intention to ignore the returned value.

## Conclusions

In conclusion, configuring `csharp_style_unused_value_expression_statement_preference` in the `.editorconfig` enhances code quality in C#, converting potential runtime errors into compilation errors for a more robust codebase. This setting promotes a consistent coding style and proactively addresses runtime challenges, while allowing intentional disregard of returned values when needed.
