---
layout: post
read_time: true
show_date: true
title: "Markdown, the language of blogs"
date: 2021-01-20
description: A simple cheat sheet for markdown and kramdown.
img: /posts/Markdown.png
tags: [general blogging]
author: Armando Maynez
toc: sticky
mathjax: yes
---
If you have worked on any GitHub repository or have your own blog, chances are you have seen a README.md file, this is the markdown file where you can describe your repo. Markdown is easy to learn. It is helpful in writing questions on forums like StackOverflow,
useful in commenting on Pull Request in Github, and of course publish your blog posts. It is a quick way to generated formatted text.

This post in particular deals with the differences found in Kramdown, the default markdown parser for Jekyll, so if you are thinking of setting up a blog, or already have one, this might be useful for you.

The kramdown syntax is based on the Markdown syntax and has been enhanced with features that are found in other Markdown implementations like Maruku, PHP Markdown Extra and Pandoc. However, it strives to provide a strict syntax with definite rules and therefore isn’t completely compatible with Markdown. Nonetheless, most Markdown documents should work fine when parsed with kramdown. All places where the kramdown syntax differs from the Markdown syntax are highlighted.

As of today, I cannot still get Jekyll to parse all the kramdown specifications, but so far what is below is working fine:

* * *
## Specifying a Header ID

```markdown
Hello        {#id}
-----

# Hello      {#id}

# Hello #    {#id}
```

Hello        {#id}
-----

# Hello      {#id}

# Hello #    {#id}

* * *

## Emphasis
```markdown
**This is bold text**

__This is bold text__

*This is italic text*

_This is italic text_

~~Strikethrough~~
```
**This is bold text**

__This is bold text__

*This is italic text*

_This is italic text_

~~Strikethrough~~


## Blockquotes
```markdown
> Blockquotes can also be nested...
>> ...by using additional greater-than signs right next to each other...
> > > ...or with spaces between arrows.

```

> Blockquotes can also be nested...
>> ...by using additional greater-than signs right next to each other...
> > > ...or with spaces between arrows.


## Lists

Unordered
```markdown
+ Create a list by starting a line with `+`, `-`, or `*`
+ Sub-lists are made by indenting 2 spaces:
  - Marker character change forces new list start:
    * Ac tristique libero volutpat at
    + Facilisis in pretium nisl aliquet
    - Nulla volutpat aliquam velit
+ Very easy!
```
+ Create a list by starting a line with `+`, `-`, or `*`
+ Sub-lists are made by indenting 2 spaces:
  - Marker character change forces new list start:
    * Ac tristique libero volutpat at
    + Facilisis in pretium nisl aliquet
    - Nulla volutpat aliquam velit
+ Very easy!

Ordered
```markdown
1. Lorem ipsum dolor sit amet
2. Consectetur adipiscing elit
3. Integer molestie lorem at massa


1. You can use sequential numbers...
1. ...or keep all the numbers as `1.`
```
1. Lorem ipsum dolor sit amet
2. Consectetur adipiscing elit
3. Integer molestie lorem at massa


1. You can use sequential numbers...
1. ...or keep all the numbers as `1.`

Start numbering with offset:
```markdown
57. foo
1. bar
```
57. foo
1. bar


## Code

This is super helpful when posting any code snippet


    ```js
    const fn = () => alert("some fn");
    ```

```js
const fn = () => alert("some fn");
```

    ```css
    .hide {
        display:none
    }
    ```
```css
.hide {
    display:none
}
```
    Also can show code difference


    ```diff
    var x = 10;
    - const counter = 0;
    + let counter = 0
    ```

```diff
var x = 10;
- const counter = 0;
+ let counter = 0
```

Inline `code`

Indented code

    // Some comments
    line 1 of code
    line 2 of code
    line 3 of code


Block code "fences"
        
        ```
        Sample text here...
        ```

```
Sample text here...
```

Syntax highlighting

        ``` js
        var foo = function (bar) {
          return bar++;
        };

``` js
var foo = function (bar) {
  return bar++;
};

console.log(foo(5));
```

## Tables

Tables can be generated with headings and text alignment option

| Option | Description |
| ------ | ----------- |
| data   | path to data files to supply the data that will be passed into templates. |
| engine | engine to be used for processing templates. Handlebars is the default. |
| ext    | extension to be used for dest files. |

Right aligned columns

| Option | Description |
| ------:| -----------:|
| data   | path to data files to supply the data that will be passed into templates. |
| engine | engine to be used for processing templates. Handlebars is the default. |
| ext    | extension to be used for dest files. |

Here is an example:

```markdown
| Default aligned |Left aligned| Center aligned  | Right aligned  |
|-----------------|:-----------|:---------------:|---------------:|
| First body part |Second cell | Third cell      | fourth cell    |
| Second line     |foo         | **strong**      | baz            |
| Third line      |quux        | baz             | bar            |
| Second body     |            |                 |                |
| 2 line          |            |                 |                |
| Footer row      |            |                 |                |
```

| Default aligned |Left aligned| Center aligned  | Right aligned  |
|-----------------|:-----------|:---------------:|---------------:|
| First body part |Second cell | Third cell      | fourth cell    |
| Second line     |foo         | **strong**      | baz            |
| Third line      |quux        | baz             | bar            |
| Second body     |            |                 |                |
| 2 line          |            |                 |                |
| Footer row      |            |                 |                |

The above example table is rather time-consuming to create without the help of an ASCII table editor. However, the table syntax is flexible and the above table could also be written like this:
```markdown
| Default aligned | Left aligned | Center aligned | Right aligned
|---|:---|:---:|---:|
| First body part | Second cell | Third cell | fourth cell
| Second line |foo | **strong** | baz
| Third line |quux | baz | bar
| Second body
| 2 line
| Footer row
```

## Math Blocks
The following kramdown fragment
```markdown
\begin{aligned}
  & \phi(x,y) = \phi \left(\sum_{i=1}^n x_ie_i, \sum_{j=1}^n y_je_j \right)
  = \sum_{i=1}^n \sum_{j=1}^n x_i y_j \phi(e_i, e_j) = \\
  & (x_1, \ldots, x_n) \left( \begin{array}{ccc}
      \phi(e_1, e_1) & \cdots & \phi(e_1, e_n) \\
      \vdots & \ddots & \vdots \\
      \phi(e_n, e_1) & \cdots & \phi(e_n, e_n)
    \end{array} \right)
  \left( \begin{array}{c}
      y_1 \\
      \vdots \\
      y_n
    \end{array} \right)
\end{aligned}
```
renders (using Javascript library MathJax) as:

\begin{aligned}
  & \phi(x,y) = \phi \left(\sum_{i=1}^n x_ie_i, \sum_{j=1}^n y_je_j \right)
  = \sum_{i=1}^n \sum_{j=1}^n x_i y_j \phi(e_i, e_j) = \\
  & (x_1, \ldots, x_n) \left( \begin{array}{ccc}
      \phi(e_1, e_1) & \cdots & \phi(e_1, e_n) \\
      \vdots & \ddots & \vdots \\
      \phi(e_n, e_1) & \cdots & \phi(e_n, e_n)
    \end{array} \right)
  \left( \begin{array}{c}
      y_1 \\
      \vdots \\
      y_n
    \end{array} \right)
\end{aligned}

## Images

![Minion](https://octodex.github.com/images/minion.png)
![Stormtroopocat](https://octodex.github.com/images/stormtroopocat.jpg "The Stormtroopocat")

Like links, Images also have a footnote style syntax

![Alt text][id]

With a reference later in the document defining the URL location:

[id]: https://octodex.github.com/images/dojocat.jpg  "The Dojocat"

## Definition lists
Simple definition list:
```markdown
kramdown
: A Markdown-superset converter

Maruku
:     Another Markdown-superset converter
```
kramdown
: A Markdown-superset converter

Maruku
:     Another Markdown-superset converter

```markdown
definition term 1
definition term 2
: This is the first line. Since the first non-space characters appears in
column 3, all other lines have to be indented 2 spaces (or lazy syntax may
  be used after an indented line). This tells kramdown that the lines
  belong to the definition.
:       This is the another definition for the same term. It uses a
        different number of spaces for indentation which is okay but
        should generally be avoided.
   : The definition marker is indented 3 spaces which is allowed but
     should also be avoided.
```
definition term 1
definition term 2
: This is the first line. Since the first non-space characters appears in
column 3, all other lines have to be indented 2 spaces (or lazy syntax may
  be used after an indented line). This tells kramdown that the lines
  belong to the definition.
:       This is the another definition for the same term. It uses a
        different number of spaces for indentation which is okay but
        should generally be avoided.
   : The definition marker is indented 3 spaces which is allowed but
     should also be avoided.

```markdown
definition term
: This definition will just be text because it would normally be a
  paragraph and the there is no preceding blank line.

  > although the definition contains other block-level elements

: This definition *will* be a paragraph since it is preceded by a
  blank line.
```
definition term
: This definition will just be text because it would normally be a
  paragraph and the there is no preceding blank line.

  > although the definition contains other block-level elements

: This definition *will* be a paragraph since it is preceded by a
  blank line.

```markdown
{:#term} Term with id="term"
: {:.cls} Definition with class "cls"

{:#term1} First term
{:#term2} Second term
: {:.cls} Definition
```
{:#term} Term with id="term"
: {:.cls} Definition with class "cls"

{:#term1} First term
{:#term2} Second term
: {:.cls} Definition


## Typographic Symbols
```
--- will become an em-dash (like this —)
-- will become an en-dash (like this –)
... will become an ellipsis (like this …)
<< will become a left guillemet (like this «) – an optional following space will become a non-breakable space
>> will become a right guillemet (like this ») – an optional leading space will become a non-breakable space
&ldquo; opening and closing double quotes &rdquo;
```
--- will become an em-dash (like this —)

-- will become an en-dash (like this –)

... will become an ellipsis (like this …)

&laquo; will become a left guillemet (like this «) – an optional following space will become a non-breakable space

&raquo; &#8221; become a right guillemet (like this ») – an optional leading space will become a non-breakable space

&ldquo;opening and closing double quotes&rdquo;


## Footnotes
```markdown
[^1]: Some *crazy* footnote definition.

[^footnote]:
    > Blockquotes can be in a footnote.

        as well as code blocks

    or, naturally, simple paragraphs.

[^other-note]:       no code block here (spaces are stripped away)

[^codeblock-note]:
        this is now a code block (8 spaces indentation)
```

[^1]: Some *crazy* footnote definition.

[^footnote]:
    > Blockquotes can be in a footnote.

        as well as code blocks

    or, naturally, simple paragraphs.

[^other-note]:       no code block here (spaces are stripped away)

[^codeblock-note]:
        this is now a code block (8 spaces indentation)

## Cool Tips 

* [Kramdown syntax](https://kramdown.gettalong.org/syntax.html#automatic-links) - for Jekyll users
* [Grammarly](https://marketplace.visualstudio.com/items?itemName=znck.grammarly) extension can eliminate typo and grammar mistakes
* [ScreenTOGif](https://www.screentogif.com/) to record videos in GIF format
* Upload GIF's to [giphy](https://giphy.com/) to embed them into blog posts.
* [Stackedit](https://stackedit.io/) for Markdown Editing in Browser.