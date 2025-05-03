---
layout: layouts/post
title: "The Revealing Constructor Pattern"
date: 2014-02-14T00:00:00Z
tags: [web standards]
blurb: A new-at-the-time JavaScript design pattern, used by several web APIs, to preserve encapsulation while keeping a functional constructor.
---

I want to document an interesting pattern we've seen emerge in some recent web platform specs, including [promises](https://people.mozilla.org/~jorendorff/es6-draft.html#sec-promise-objects) and [streams](https://github.com/whatwg/streams). I'm calling it the **revealing constructor pattern**.

## The Promises Example

Let's take the case of promises first, since that may be familiar. You can construct a new promise like so:

```js
var p = new Promise(function (resolve, reject) {
    // Use `resolve` to resolve `p`.
    // Use `reject` to reject `p`.
});
```

We see here that the `Promise` constructor takes a single function as its sole parameter (called the "executor function"). It then _immediately_ calls that function with two arguments, `resolve` and `reject`. These arguments have the capability to manipulate the internal state of the newly-constructed `Promise` instance `p`.

I call this the revealing constructor pattern because the `Promise` constructor is _revealing_ its internal capabilities, but only to the code that constructs the promise in question. The ability to resolve or reject the promise is only revealed to the constructing code, and is crucially _not_ revealed to anyone _using_ the promise. So if we hand off `p` to another consumer, say

```js
doThingsWith(p);
```

then we can be sure that this consumer cannot mess with any of the internals that were revealed to us by the constructor. This is as opposed to, for example, putting `resolve` and `reject` methods on `p`, which anyone could call. (And no, adding underscores to the beginning of your method names won't save you.)

## Historical Origins

The first place anyone can remember seeing this pattern is [in the WinJS promise implementation](http://msdn.microsoft.com/en-us/library/windows/apps/br211866.aspx). Before that, promise libraries used an awkward concept called a "deferred." You would do something like this:

```js
var deferred = Q.defer();
var p = deferred.promise;

// Use `deferred.resolve` to resolve `p`.
// Use `deferred.reject` to reject `p`.

doThingsWith(p);
```

This was strange in a few ways, but most prominently, it was strange because you were constructing an object without using a constructor. This is generally an antipattern in JavaScript: we want to be able to clearly conceptualize the relationship between instances, constructor functions, and prototypes.

In contrast, with the revealing constructor pattern, we get our nice constructor invariants back. Things like:

```js
p instanceof Promise;
p.constructor === Promise;
Object.getPrototypeOf(p) === Promise.prototype;
```

These are all signs that you're dealing with a well-designed "class" in JavaScript, that will behave as you expect.

## The Streams Example

When putting together [the in-progress streams spec](htwetps://github.com/whatwg/streams), we of course drew a lot of inspiration from [Node streams](http://nodejs.org/api/stream.html). But Node streams do things kind of strangely, with regard to vending their capabilities.

To produce a Node stream representing a specific resource—which is somewhat analogous to producing a promise representing a specific asynchronous operation—you don't use the stream constructor. You don't even use something like the deferred pattern. Instead, you _subclass_ the appropriate stream class. And then you overwrite certain underscore-prefixed methods!

So for a simplified example, here is how you would create a file reader stream using the Node APIs. I'll use ES6 class syntax for brevity, but that is just sugar over the usual ES5 incantations.

```js
class FileReaderStream extends Readable {
  constructor(filename) {
    this.filename = filename;
  }

  _read(size) {
    // Use `this.filename` to eventually call `this.push(chunk)`
    // with some data from the file, or `this.push(null)` to close
    // the stream, or `this.emit("error", e)` with an error.
  }
}

var myNodeStream = new FileReaderStream("/path/to/file.txt");
```

There are two interesting actors here:

- `_read`, a method not meant to be called by users directly, but instead called by the internals of the stream when it's time to read data from the underlying source.
- `push` and `emit("error", e)`, which have the capability to manipulate the stream's internal buffer and state machine. They too are not meant to be called by users directly, but instead only by implementers, inside their `_read` method (or perhaps inside the constructor).

Interestingly, these are almost exactly analogous to the promise situation. `_read` is like the executor argment passed to the promise constructor, in that it consists of user code that does the actual work. And `push`/`emit` are capabilities, like `resolve`/`reject`, which can be used by the work-doing function to manipulate internal state.

In building the streams spec, we realized the Node pattern wasn't the way we wanted to go. Requiring subclassing for every stream instance is not ergonomic. Using underscore-prefixed methods as the extension point isn't realistic either. And letting any user access the capabilities involved is not tenable, in part because it means implementations can't build invariants around who has access to the internal buffer.

In contrast, the revealing constructor pattern works out really well. To create a file reader stream with whatwg/streams, you do something like

```js
function createFileReaderStream(filename) {
  return new ReadableStream({
    pull(enqueue, close, error) {
      // Use `filename` to eventually call `enqueue(chunk)`
      // with some data from the file, or `close()` to
      // close the stream, or `error(e)` with an error.
    }
  });
}

var myWhatwgStream = createFileReaderStream("/path/to/file.txt");
```

Notice the difference in the external API exposed. If you pass `myNodeStream` to another function, that function can mess with the stream's internal state as much as it wants, calling `push`, emitting `"error"` events, or even (despite the underscore) calling `_read`. Whereas if you pass `myWhatwgStream` around, consumers will not be able to do any of those things: the integrity of its internal state will be preserved.

(Plus, no subclassing!)

## When Would I Use This?

I admit that that the revealing constructor pattern seems a bit unorthodox. The number of actors involved—viz. the constructor itself, the work-doing function to which capabilities are given, and the capability arguments—can be hard to get your head around, at least the first few times you see them.

That said, it is a pretty elegant solution to a tricky problem. You might not need this level of encapsulation in your home-grown code. And even more widespread libraries may be able to skate by, as Node does, with documentation strategies and an attitude of "don't do anything dumb with the capabilities we leave lying around, or it'll break." But when writing platform-level libraries and abstractions, which need to maintain their integrity in the face of any environment, the revealing constructor pattern really proves its worth.

And besides, patterns become part of our vernacular. Many patterns that are commonplace today seemed just as strange when they are introduced as the revealing constructor pattern might to you now. After working with promises and streams for a while, you might encounter a situation where a revealing constructor is a natural fit for your library's needs. Who knows!

## Postscript

If those examples weren't enough, here's one that you should be able to connect with: [an event emitter using the revealing constructor pattern](https://gist.github.com/domenic/9003334). This is an evolution of some of my [earlier work](https://github.com/domenic/pubit) on event emitters with separate capabilities.
