---
layout: post
read_time: true
show_date: true
title: "Why I always use ‘var’ in C#"
date: 2018-05-14
img: posts/20180514/Ballpit.jpg
tags: [development, .net, csharp]
category: development
author: Antão Almada
---

The `var` keyword was introduced in C# 3.0 back in 2007 and remains a topic of debate within development teams. Personally, I advocate for its use, and here's why the arguments against it don't sway me.

## ‘var’ is Strongly Typed

Once a variable is declared, the compiler infers its type and validates any new assignment using that type. This process aligns with the rules of the `Type.IsAssignableFrom` method. Attempts to assign values that would make this method return `false` are not allowed.

While it may seem obvious, there are still misconceptions that it behaves like its JavaScript counterpart. The closest approximation in C# would be using the `dynamic` keyword.

## ‘var’ Makes Refactoring Easier

In the lifecycle of any substantial project, multiple refactorings are inevitable. Having refactored numerous projects, I can attest that the use of `var` significantly improves productivity and code correctness.

Consider a scenario where a method returns a `float` and is utilized throughout the codebase. Later, you decide to enhance its precision by changing it to `double`. Without using `var`, you must manually update every instance where this method is used to match the new variable type.

Now, envision the reverse situation where the method returns a `double`, but you realize that a `float` is sufficient, saving memory. Unlike the previous case, the compiler won't indicate where changes are needed because the .NET framework provides an implicit converter from `float` to `double`. The code compiles, but you might be inefficiently using resources, and it's up to you to identify where modifications are required.

When employing `var`, the variables will compile to the correct type in both scenarios, streamlining the refactoring process.

## ‘var’ Eliminates Value Type Boxing

In the .NET framework, value types are "boxed" when cast to an interface type, causing them to be copied to the heap, and all method calls become virtual. This implicit boxing occurs when assigned to a variable declared as an interface type.

Typically, `GetEnumerator()` returns `IEnumerator<T>`, a reference type. However, `List<T>.GetEnumerator()` returns `List<T>.Enumerator`, a value type. Many people overlook this distinction, but getting the type wrong can significantly impact performance.

By using `var`, automatic avoidance of "boxing" is ensured.

> I've developed an analyzer featuring a rule to detect instances of this case: [NetFabric.Hyperlinq.Analyzer](https://github.com/NetFabric/NetFabric.Hyperlinq.Analyzer/blob/master/docs/reference/HLQ001_AssignmentBoxing.md)

## The Benefits of ‘var’ Beyond IDEs

IDEs, such as Visual Studio, conveniently display variable types in tooltips when the cursor hovers over them. Critics of using `var` often argue that determining the type should be straightforward even without an IDE. However, I assert that giving precedence to meaningful variable and method names holds more significance than cluttering code with explicit type declarations. Well-chosen names prove invaluable when navigating through someone else's code or revisiting one's own work after a brief hiatus.

This rationale also holds true for [fluent code](https://www.red-gate.com/simple-talk/dotnet/net-framework/fluent-code-in-c/) styles. Consider LINQ usage, where it's unusual to encounter each method result assigned to a variable with an explicitly declared type. Instead, data effortlessly flows from one method to another, enabling the code to be read like a coherent English sentence.

The same guiding principle applies to [lambda expressions](https://docs.microsoft.com/en-us/dotnet/csharp/programming-guide/statements-expressions-operators/lambda-expressions). Many users opt for them without specifying parameter types, and most also employ generic parameter names like "i". I consistently use more descriptive names such as "item" or "index," reflecting the parameter's actual purpose.

## Conclusions

C# is great at inferring types and allow strongly-typed code all over. `var` doesn’t contradict this and can be a great tool. Use it. You won’t regret.

> NOTE: C++ 11 introduces an equivalent `auto` keyword. Scott Meyers wrote in his “Effective Modern C++” book a great explanation on why you should also use it.