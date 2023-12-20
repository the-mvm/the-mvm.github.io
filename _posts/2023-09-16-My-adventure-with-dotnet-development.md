---
layout: post
read_time: true
show_date: true
title: "Coding Chronicles: My Adventure with .NET Development"
date: 2023-09-16
img: posts/20230916/Depth-camera-AR.png
tags: [.net]
category: development
author: Antão Almada
---

I've been immersed in the .NET world since version 1.0, and it's been an incredible journey. Throughout the years, .NET has consistently been my primary development tool of choice. In this article, I'll delve into my experiences as a developer within the .NET ecosystem and offer insights into its current status and adoption trends.

If you're interested primarily in my take on the current status of .NET, feel free to skip ahead to the conclusion, where I'll provide a succinct yet comprehensive opinion on the state of .NET today.

## My journey

I started using .NET shortly after 1.0 was released, back in 2002. I loved the simplicity of C#, coming from a long experience with C++, and loved the concept of a single runtime and single framework for multiple programming languages. I still hold as a souvenir these two DVDs of Visual Studio .NET (2003) and Visual Studio 2005.

![Old Visual Studio DVD boxes](./assets/img/posts/20230916/VisualStudio.jpeg)

I was then working at [YDreams](https://ydreams.global/) and, for our first big project on .NET, I used [Web Forms](https://en.wikipedia.org/wiki/ASP.NET_Web_Forms) to develop a tool for the management of the truck fleet that collects recyclable garbage in the [Portalegre District, Portugal](https://en.wikipedia.org/wiki/Portalegre_District). Back then, very little was available besides the official framework. I had to develop the route-finding algorithms based on [A-star](https://en.wikipedia.org/wiki/A*_search_algorithm) and [ant colony](https://en.wikipedia.org/wiki/Ant_colony_optimization_algorithms). I implemented map browsing with dynamic panning and zooming. This was before Google Maps was released.

My first own open-source actually came out of this project when I published the article "[ImageMap.NET](https://www.codeproject.com/Articles/2536/ImageMap-NET)" in 2002 together with its source code. It was a "web server control" that generated an [HTML image map](https://www.w3schools.com/html/html_images_imagemap.asp) on the client side. I used it to implement the map visualization and interaction for our project. Later, after the release of ASP.NET 2.0, I published an update in the article "[ImageMap.NET 2.0](https://www.codeproject.com/Articles/13278/ImageMap-NET-2-0)".

Around 2004, YDreams [started developing interactive applications based on detection using web cameras](https://www.youtube.com/watch?v=YCuPU6fVGCo). This required the development of both computer vision and computer graphics components. When the number of applications started to grow, we felt the need to develop a reusable framework for this kind of applications. YDreams created an R&D department where I was very lucky to work with an amazing team of developers. We decided to use .NET for it, and we named it YVision.

![YVision technical paper cover](./assets/img/posts/20230916/YVision.png)

The purpose of this framework was to have reusable and composable components to easily develop interactive applications, based on any type of sensor, with realistic graphics and behaviours. [We published a scientific paper describing the architecture of the framework](https://www.researchgate.net/publication/221097505_YVision_A_General_Purpose_Software_Composition_Framework).

It is composed of three core concepts:

- Dataflow Graph - Composition as a graph of blocks that generate, or process push data streams.
- Object Composition - Composition as a tree structure of objects that contain components/services.
- Behavior Composition - Composition as a tree structure of [coroutines](https://en.wikipedia.org/wiki/Coroutine). A concept a.k.a. [behavior trees](https://en.wikipedia.org/wiki/Behavior_tree_(artificial_intelligence,_robotics_and_control)).

The combination of these three core concepts made it very easy to integrate the many different aspects of the development of the interactive application: computer vision, computer graphics, physics, robotics, artificial intelligence and so on. For this, we integrated several existing third-party projects. Here are the ones I remember:

- [Mono](https://www.mono-project.com/) - A cross platform, open-source .NET framework.
- [OpenCV](https://opencv.org/) - An open-source computer vision library developed in C++. We developed our own managed wrapper.
- [MOGRE](https://wiki.ogre3d.org/MOGRE) - An open-source managed wrapper for the open-source [OGRE 3D](https://www.ogre3d.org/) rendering engine developed in C++.
- [bullet-xna](https://github.com/xexuxjy/bullet-xna) - An open-source partial rewrite in C# of the open-source [bullet](https://github.com/bulletphysics) physics library develop in C++.
- [OdeNet](https://wiki.ogre3d.org/OdeNet) - An open-source managed wrapper for the open-source [ODE](http://www.ode.org/) physics library developed in C++.
- [AForge.NET](http://aforge.net/) - An open-source library for computer vision and machine learning developed in C#.
- [Accord.NET](http://accord.net/) - An open-source library for machine learning developed in C#.
- [ALVAR](http://virtual.vtt.fi/virtual/proj2/multimedia/alvar/) - A library for augmented and virtual reality.

Here is a very small sample of applications developed using YVision:

- A demo of interaction with 3D virtual objects and face detection using a 2D web camera (2009):

<iframe width="560" height="315" src="https://www.youtube.com/embed/-NAH5vlkgkk?si=xwl-YW2fR0DheTw0" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>

- A demo of interaction with 3D virtual objects using a [Canesta](https://en.wikipedia.org/wiki/Canesta) 3D camera (2010). This was before the [Kinect](https://en.wikipedia.org/wiki/Kinect) 3D camera was released. This demo earned us the prestigious "Best Demo Award" at the [2010 AWE Conference, in Santa Clara, California](https://www.awexr.com/):

<iframe width="560" height="315" src="https://www.youtube.com/embed/qXcIZ1R68SQ?si=wY1xznqivcz5tb7B" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>

- Robots developed for the visitor center of the Santander Bank with complex behaviors defined using the behavior composition (2010):

<iframe width="560" height="315" src="https://www.youtube.com/embed/X762g_kJn3U?si=pAZW0bB2iEHDRiXq" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>

Hundreds of applications were developed by YDreams for its customers using this framework. Unfortunately, it was only available for internal use.

> You can now find an equivalent dataflow graph framework implemented using [Reactive Extensions for .NET](https://github.com/dotnet/reactive). It's open-source and can be found at [https://bonsai-rx.org/](https://bonsai-rx.org/). It's used by some of the best neuroscience labs for their scientific research and it can be used for so much more than that.

Around 2011, I started using [.NET Micro Framework](https://en.wikipedia.org/wiki/.NET_Micro_Framework) which allowed the use of C# on [Arduino](https://en.wikipedia.org/wiki/Arduino)-equivalent boards like [Netduino](https://en.wikipedia.org/wiki/Netduino) and [FEZ](https://docs.ghielectronics.com/hardware/duino/fez-cerbuino-bee.html) boards. I developed a few open-source libraries on my free time. The repositories have since then disappeared but fortunately [the packages can still be found on NuGet](https://www.nuget.org/packages?q=hydramf).

> The .NET Micro Framework as been discontinued, but you can still use C# on boards from [Wilderness Labs](https://www.wildernesslabs.co/) and [GHI Electronics](https://docs.ghielectronics.com/).

In 2014, I joined [LusoVU](https://lusovu.com/). A company focusing on augmented reality hardware. There, I was part of the team that created a communication device for people diagnosed with [Amyotrophic Lateral Sclerosis (ALS)](https://en.wikipedia.org/wiki/ALS). They cannot speak or move their body. They can only move their eyes.

The device is called [EyeSpeak](https://lusovu.com/products/eyespeak/) and it's composed of a pair of augmented reality glasses, a camera to track the user's eyes, and a speaker. The see-through displays allow the user to interact with the user interface and also see the outside world, without having to remove the device.

![The Eyespeak device](./assets/img/posts/20230916/Eyespeak.jpeg)

Using the open-source projects [Xamarin for Android](https://learn.microsoft.com/en-us/xamarin/android/), [ReactiveUI](https://www.reactiveui.net/) and [Reactive Extensions for .NET](https://github.com/dotnet/reactive), we developed a system to interact with active UI elements, like pressing the buttons and menus, using the eye gaze only. We developed a text-to-speech application that allows the user to output voice sentences through the speaker by typing the text using only the eyes. We developed a custom Android keyboard that is easier to use with gaze tracking. The system also includes a loud sound alarm to be used in case of an emergency that can be easily activated using the eye gaze.

It's a full-featured Android device and the user can interact with all the other apps, like social media, emails, watch videos and play games.

In 2017, I was challenged to join DataSonar. A startup working on "big data". They used C# and .NET, and they wanted me to work on the development of the tools and performance improvement. That's where I gained a large interest in how enumeration works in C# and .NET. I found that there was little information about this subject and decided to share this knowledge by [writing my own posts on Medium](https://medium.com/@antao-almada). 

I also started developing open-source projects mostly related to enumeration. They can be found on GitHub under an organization named [NetFabric](https://github.com/NetFabric). I wanted these to not just be my projects but a community effort. [Go check them out!](https://github.com/NetFabric)

In 2018, I joined [Farfetch](https://www.farfetchtechblog.com/) where I went back to work on the type of projects I used to. I work in the Tech R&D team where we explore technical solutions to improve the user experience. As a tech fashion-related company, one of the subjects we work on are the virtual try-ons.

We developed a proof-of-concept for a full-body soft cloth virtual try-on using Unity. Here I am during one of the tests 😅:

<iframe width="560" height="315" src="https://www.youtube.com/embed/XoGn0ac82Kc?si=Gh_lRJgTHVJiOIH9" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>

These were some of the most important .NET applications I was involved throughout my career. There were many more and I did use several other tool stacks in between, but .NET has been my favorite development tool since I started using it.

## Final thoughts

I love developing in C#. I love and respect all the effort that has been done to further improve .NET. Especially since it became open-source and since the start of the .NET Core era. I just find it very unfortunate that .NET did not find a large adoption beyond the web backend development. The name also doesn't help.

Thousands of games have been developed in Unity. Unfortunately, most forget that Unity is based on .NET (although the engine is full C++). They use an old version of .NET so Unity developers don't have access to the latest developments. Library developers drop older .NET targets to simplify code (which they have the right to do) but excluding all the Unity developers. I'm not a big Unity developer myself. I've used it for a few projects. But I'm aware of its community.

One of the reasons I wrote this post is for others to be aware that there's a lot of other uses for .NET. That .NET-community open-source development started long before .NET itself became open-source.
Much of my work has been based on libraries developed in C++. I developed or used existing managed wrappers to be able to use them in my .NET projects. .NET is amazing but there's no need to keep reinventing the wheel. That's exactly how Python found so much success and adoption. The latest developments in .NET interop makes it even easier to develop wrappers.

Many don't want to use libraries outside of the official .NET release just because they are afraid these could be discontinued. Do you know how many .NET projects have been discontinued by Microsoft? .NET Micro Framework, Web Forms, Silverlight, WPF, WCF, XNA, MRTK, Mono, Xamarin. Some included in the .NET Framework. Some are replaced by another library, some aren't. Porting to alternatives is not always simple. 

.NET is not owned by Microsoft but most of its core developers are Microsoft staff. Microsoft does have the right to allocate resources to other projects or disregard backwards compatibility once in a while. There's also no guarantee that an open-source project supported by the [.NET Foundation](https://dotnetfoundation.org/) will be maintained. Open-source projects also have a limited lifespan but, at least, you can fork the project. For example, [MRTK](https://github.com/microsoft/MixedRealityToolkit-Unity) still lives on, and so does WPF as [Avalonia XPF](https://avaloniaui.net/XPF).

Microsoft seems to have a mentally of "we won't contribute to projects we cannot have control over". They end up replicating existing open-source projects. There are many ways to implement the same thing and competition is good but, this has frustrated several of the few .NET open-source developers. Giving little incentive to others.

Open-source projects are free but should be supported. If not financially, with pull requests. Every time I find an issue that I can figure out how to solve, I submit a pull request. I only submit issues when I find the fix too complex for me. I've also submitted pull requests with new features to multiple projects I've used. Making sure open-source projects thrive is a community effort.

I also contribute to the community by sharing my knowledge in the form of articles or just simple tweets.
I just want to see the .NET platform and community continue prospering. There's no recipe on how to make it happen...
