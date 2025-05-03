---
layout: layouts/post
title: "Strict Mode = Static Scoping"
date: 2013-03-19T00:00:00Z
tags: [javascript]
blurb: JavaScript strict mode has a lesser-known benefit in how it brings sanity to variable scoping.
---

It is indeed
[time to start using JavaScript's strict mode](http://www.nczonline.net/blog/2012/03/13/its-time-to-start-using-javascript-strict-mode/).
There are many reasons, but one of the most compelling is that it brings sanity to JavaScript's scoping rules, by
guaranteeing static scoping.

Simply put, code is *statically scoped* if you can statically analyze it and determine what all the identifiers refer
to. In other words, you can statically determine where every variable was declared. As we'll see, JavaScript's sloppy
mode does not have this property, giving you yet one more reason to shun it in favor of `"use strict"`.

## Sloppy Mode = Dynamic Scoping

Most of the time, JavaScript scoping is fairly simple. You look up the scope chain, as declared in the source code; if
you can't find something, it must be on the global object. But in sloppy mode, there are several situations that can
foil this algorithm.

### Use of `with`

Using the `with` statement completely destroys the sanity of your scope chain:

```js
var __filename = "/my/cool/file.js";
var anotherContext = { __filename: "/another/file.js", __dirname: "/another" };

var context = Math.random() > 0.5 ? anotherContext : {};
with(context) {
  console.log(__filename);
}
```

In this example, we can't statically determine if `console.log(__filename)` is referring to the free `__filename`
variable, set to `"/my/cool/file.js"`, or if it's referring to the property of `anotherContext`, set to
`"/another/file.js"`.

Strict mode fixes this by [banning `with` entirely](http://es5.github.com/#x12.10.1). Thus, the above code would be a
syntax error if it were placed in a strict context.

### Use of `eval`

Using `eval` in sloppy mode will introduce new variable bindings into your scope chain:

```js
function require(moduleId) {
    // loading code elided.
}

function requireStuff() {
  if (Math.random() > 0.5) {
    eval("function require(things) { console.log('We require more ' + things); }");
  }

  require("minerals");
}
```

In this example, we have a similar problem as before: `eval` might have dynamically introduced a new variable binding.
Thus, `require` can refer either to the new function introduced by `eval` into `requireStuff`'s scope, or to the
function declared in the outer scope. We just can't know, until runtime!

Strict mode fixes this by [disallowing `eval` from introducing new bindings](http://es5.github.com/#x10.4.2.1). Thus,
if the above code were strict, `require("minerals")` would always refer to the outer module-loading `require` function.

## Why Does This Matter?

In addition to the obvious implications of this for optimization and inlining in JITers, this matters because static
analysis is becoming increasingly important in modern, complex JavaScript.

For example, let's say you were writing
[a tool for using Node.js-style modules in the browser](https://github.com/substack/node-browserify). To do so, you'd
probably need to [detect `require` calls](https://github.com/substack/module-deps); in particular, if you see `require`,
you'll want to know what scope that `require` comes from: global or local? Similarly, you might want to
[detect](https://github.com/substack/insert-module-globals) references to `__filename`, `__dirname`, `Buffer`, etc. and
make them available if they're detected.

But in sloppy mode, it is literally *unknowable* what a given variable refers to. At any time, an enclosing `with` or a
nearby `eval` could come along, and really ruin your day. In such a setting, static analysis is doomed; as we've seen
in the above examples, the meaning of identifiers like `require` or `__filename` can't be determined until runtime.

## So? Just Don't Use Those Things

A common refrain from people who [can't handle typing `"use strict"`](https://twitter.com/izs/status/310833154401398784)
is that they'll simply not use these features. And this indeed suffices: if you subset the language, perhaps using tools
like JSHint to enforce your subsetting rules, you can create a more sane programming environment.

Similar arguments are applied commonly in other languages, like prohibiting the use of exceptions or templates in C++.
Even telling people to not pass expressions to their `require` calls in Node.js modules falls under this category (with
the rationale that this breaks the popular browserify tool).

I don't buy these arguments. A language should give its users built-in tools to use it correctly. In the case of
JavaScript, there is one very clear tool that has been given: a simple, backward-compatible `"use strict"` pragma at the
top of your source files. If you think that's difficult, try being a C++ programmer and writing exception-safe code: the
techniques you need to use are a lot more involved than a single pragma.

## Use Strict Mode

In [the words of Mark Miller](http://www.youtube.com/watch?v=Kq4FpMe6cRs&t=18m50s), ECMAScript 5 strict mode has
transitioned JavaScript into the "actually good" category of programming languages. Let's use it. Opt in to static
scoping, and a saner language in general. Use strict.

*This post was inspired by
[a long-ago es-discuss thread](http://www.mail-archive.com/es-discuss@mozilla.org/msg18408.html), which references
[a talk by Mark Miller](http://www.youtube.com/watch?v=Kq4FpMe6cRs&t=42m53s). Further clarifications were had in
[another, recent es-discuss thread](http://www.mail-archive.com/es-discuss@mozilla.org/msg22147.html).*
