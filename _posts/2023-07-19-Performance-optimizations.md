---
layout: post
read_time: true
show_date: true
title: "A 12 % improvement, easily obtained, is never considered marginal -- Donald Knuth"
date: 2023-07-19
img: posts/20230719/Hummingbird-hawk-moth.jpg
tags: [development, .net, csharp, performance]
category: development
author: Antão Almada
---

I've been writing articles about performance in .NET for several years but I frequently find in the comments the famous quote from the Donald Knuth's paper ["Structured Programming with go to Statements"](https://dl.acm.org/doi/pdf/10.1145/356635.356640):

> We should forget about small efficiencies, say about 97% of the time: premature optimization is the root of all evil.

If you care about “things that matter” in programming, I highly recommend this keynote by Scott Meyers:

<iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/3WBaY61c9sE?si=bH1Oc9724oBoCthJ&amp;start=86" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>

In the first part of this keynote Scott focus on performance. He starts by enumerating several types of systems where performance is essential: embedded systems, mobile devices, operating systems, libraries, servers, games and virtual reality. Some need performance to be usable. For some, performance means lower costs. There's also an environmental impact. The more performant the application is, less servers it requires, less electricity, resulting in smaller datacenters. Still, performance is ignored by most and viewed as secondary.

Scott points out that on the same page of the same paper, there's also this phrase:

> In established engineering disciplines a 12 % improvement, easily obtained, is never considered marginal;

If you know that there's an easy way to get better performance, you should not ignore it. 

Writing code that performs well usually means applying the same “recipes” over and over again. Most of these are very simple and can be considered “easily obtained”.

I once worked on a project that processed the data from a call center. It was developed by someone else that had already left the company and it was taking 2 hours to process the data. At the end of those 2 hours, the data analysts would find that something was wrong or missing. The code had to be fixed and they had to wait two more hours to validate it again. It was unbearable. 

The source was nice "clean code" with lots of LINQ queries. I analysed the code, refactored it and quickly reduced the processing time to 20 minutes.

I do love well-structured source code, but performance should never be ignored.

To be honest, I didn't pay much attention to the performance of enumerables up until then. I then started noticing the same bad patterns in many other places. In my own code, in code from job interviews, in blog posts. I also didn't find much information about performance of enumerables in .NET. 

I’m far from an expert on performance. I just like to learn and try to apply it the best I can to my work. I started writing articles to help me structure my thoughts. These are references for myself, and hopefully for others too. I also hope this works as validation. In case I got it wrong, I want to learn from the comments.

The challenge is that developers need to know that there are “better” ways of implementing a certain task. If they don’t know, they won’t apply it. This knowledge depends on learning from the experts in several fields. It can be found in books, blog posts, conferences, videos, pull requests, or simply in tweets.

Roslyn analyzers are also a great help. I wrote my own analyzer with rules based on the articles I've been writing. I myself forget about some of these and the analyzer is very helpful. It's open source and you can use on your own projects: [NetFabric.Hyperlinq.Analyzer](https://github.com/NetFabric/NetFabric.Hyperlinq.Analyzer)

I also suggest this other video:

<iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/tD5NrevFtbU?si=iBzRQWHvPazWkUBl" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>

In this video, Casey Muratori points out that blindly following the "clean code" principles, results in performance equivalent to running hardware from 15 years ago. Hardware keeps getting faster but software getting slower on this faster hardware.

Knowing how hardware works is important. It's not by accident that machine learning development is mostly based on vectors (tensors). That's how GPUs handle data much faster than traditional sequential code on CPUs. 

Knowing the difference between a reference type and a value type, and how memory allocation works, is important.
"Clean code" is subjective. Multiple layers of abstraction, for the sake of modularization and testability, are really necessary? Performant code can be testable and easy to maintain.

Donald Knuth's advice is that you should focus on improving performance solely on the hot paths. I do agree with this advice but, if performance is ignored from the beginning, everything becomes a hot path. Also, if you don't know a better way to do it, how do you know it's a hot path? Maybe the initial developer believed that it was normal for a "big data" application to take 2 hours.

Performance knowledge should be encouraged. Not ignored by proclaiming a quote out of context.

Based on what I've learned since then, I think I could reduce the 20 minutes processing time to less than 1 minute. Why wait two hours?
