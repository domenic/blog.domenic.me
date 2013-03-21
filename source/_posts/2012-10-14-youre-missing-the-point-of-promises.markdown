---
layout: post
title: "You're Missing the Point of Promises"
date: 2012-10-14T22:05:55Z
comments: true
categories: [Promises]
---

*This post originally appeared [as a gist](https://gist.github.com/domenic/3889970). Since then, the development of
Promises/A+ has made its emphasis on the Promises/A spec seem somewhat outdated.*

**Promises** are a software abstraction that makes working with asynchronous operations much more pleasant. In the most
basic definition, your code will move from continuation-passing style:

```js
getTweetsFor("domenic", function (err, results) {
  // the rest of your code goes here.
});
```

to one where your functions return a value, called a *promise*, which represents the eventual results of that operation.

```js
var promiseForTweets = getTweetsFor("domenic");
```

This is powerful since you can now treat these promises as first-class objects, passing them around, aggregating them,
and so on, instead of inserting dummy callbacks that tie together other callbacks in order to do the same.

I've talked about how cool I think promises are [at length][presentation]. This essay isn't about that. Instead, it's
about a disturbing trend I am seeing in recent JavaScript libraries that have added promise support: *they completely
miss the point of promises*.


[presentation]: http://www.slideshare.net/domenicdenicola/callbacks-promises-and-coroutines-oh-my-the-evolution-of-asynchronicity-in-javascript


## Thenables and CommonJS Promises/A

When someone says "promise" in a JavaScript context, usually they mean—or at least *think* they
mean—[CommonJS Promises/A][]. This is one of the smallest "specs" I've seen. The meat of it is entirely about specifying
the behavior of a single function, `then`:

> A promise is defined as an object that has a function as the value for the property `then`:

> `then(fulfilledHandler, errorHandler, progressHandler)`

> Adds a `fulfilledHandler`, `errorHandler`, and `progressHandler` to be called for completion of a promise. The
> `fulfilledHandler` is called when the promise is fulfilled. The `errorHandler` is called when a promise fails. The
> `progressHandler` is called for progress events. All arguments are optional and non-function values are ignored. The
> `progressHandler` is not only an optional argument, but progress events are purely optional. Promise implementors are
> not required to ever call a `progressHandler` (the `progressHandler` may be ignored), this parameter exists so that
> implementors may call it if they have progress events to report.

> This function should return a new promise that is fulfilled when the given `fulfilledHandler` or `errorHandler`
> callback is finished. This allows promise operations to be chained together. The value returned from the callback
> handler is the fulfillment value for the returned promise. If the callback throws an error, the returned promise will
> be moved to failed state.

People mostly understand the first paragraph. It boils down to *callback aggregation*. You use `then` to attach
callbacks to a promise, whether for success or for errors (or even progress). When the promise transitions state—which
is out of scope of this very small spec!—your callbacks will be called. This is pretty useful, I guess.

What people don't seem to notice is the second paragraph. Which is a shame, since it's the most important one.


[CommonJS Promises/A]: http://wiki.commonjs.org/wiki/Promises/A


## What Is the Point of Promises?

The thing is, promises are not *about* callback aggregation. That's a simple utility. Promises are about something
much deeper, namely providing a direct correspondence between synchronous functions and asynchronous functions.

What does this mean? Well, there are two very important aspects of synchronous functions:

- They *return values*
- They *throw exceptions*

Both of these are essentially about composition. That is, you can feed the return value of one function straight into
another, and keep doing this indefinitely. *More importantly*, if at any point that process fails, one function in the
composition chain can throw an exception, which then bypasses all further compositional layers until it comes into the
hands of someone who can handle it with a `catch`.

Now, in an asynchronous world, you can no longer return values: they simply aren't ready in time. Similarly, you can't
throw exceptions, because nobody's there to catch them. So we descend into the so-called "callback hell," where
composition of return values involves nested callbacks, and composition of errors involves passing them up the chain
manually, and oh by the way you'd better *never* throw an exception or else you'll need to introduce something crazy
like [domains][].

*The point of promises is to give us back functional composition and error bubbling in the async world.* They do this
by saying that your functions should return a promise, which can do one of two things:

- Become *fulfilled by a value*
- Become *rejected with an exception*

And, *if* you have a correctly implemented `then` function that follows Promises/A, then fulfillment and rejection will
compose just like their synchronous counterparts, with fulfillments flowing up a compositional chain, but being
interrupted at any time by a rejection that is only handled by someone who declares they are ready to handle it.

In other words, the following asynchronous code:

```js
getTweetsFor("domenic") // promise-returning function
  .then(function (tweets) {
    var shortUrls = parseTweetsForUrls(tweets);
    var mostRecentShortUrl = shortUrls[0];
    return expandUrlUsingTwitterApi(mostRecentShortUrl); // promise-returning function
  })
  .then(httpGet) // promise-returning function
  .then(
    function (responseBody) {
      console.log("Most recent link text:", responseBody);
    },
    function (error) {
      console.error("Error with the twitterverse:", error);
    }
  );
```

parallels<sup>[*][]</sup> the synchronous code:

```js
try {
  var tweets = getTweetsFor("domenic"); // blocking
  var shortUrls = parseTweetsForUrls(tweets);
  var mostRecentShortUrl = shortUrls[0];
  var responseBody = httpGet(expandUrlUsingTwitterApi(mostRecentShortUrl)); // blocking x 2
  console.log("Most recent link text:", responseBody);
} catch (error) {
  console.error("Error with the twitterverse: ", error);
}
```

Note in particular how errors flowed from any step in the process to our `catch` handler, without explicit by-hand
bubbling code. And with the upcoming ECMAScript 6 revision of JavaScript, plus some [party tricks][], the code becomes
not only parallel but almost identical.

[domains]: http://nodejs.org/api/domain.html
[*]: https://github.com/kriskowal/q/wiki/On-Exceptions
[party tricks]: http://taskjs.org/

## That Second Paragraph

All of this is essentially enabled by that second paragraph:

> This function should return a new promise that is fulfilled when the given `fulfilledHandler` or `errorHandler`
> callback is finished. This allows promise operations to be chained together. The value returned from the callback
> handler is the fulfillment value for the returned promise. If the callback throws an error, the returned promise will
> be moved to failed state.

In other words, `then` is *not* a mechanism for attaching callbacks to an aggregate collection. It's a mechanism for
*applying a transformation* to a promise, and yielding a *new* promise from that transformation.

This explains the crucial first phrase: "this function should return a new promise." Libraries like jQuery (before 1.8)
don't do this: they simply mutate the state of the existing promise. That means if you give a promise out to multiple
consumers, they can interfere with its state. To realize how ridiculous that is, consider the synchronous parallel: if
you gave out a function's return value to two people, and one of them could somehow change it into a thrown exception!
Indeed, Promises/A points this out explicitly:

> Once a promise is fulfilled or failed, the promise's value MUST not be changed, just as a values in JavaScript,
> primitives and object identities, can not change (although objects themselves may always be mutable even if their
> identity isn't).

Now consider the last two sentences. They inform how this new promise is created. In short:

- If either handler returns a value, the new promise is fulfilled with that value.
- If either handler throws an exception, the new promise is rejected with that exception.

This breaks down into four scenarios, depending on the state of the promise. Here we give their synchronous parallels so
you can see why it's crucially important to have semantics for all four:

1. Fulfilled, fulfillment handler returns a value: simple functional transformation
2. Fulfilled, fulfillment handler throws an exception: getting data, and throwing an exception in response to it
3. Rejected, rejection handler returns a value: a `catch` clause got the error and handled it
4. Rejected, rejection handler throws an exception: a `catch` clause got the error and re-threw it (or a new one)

Without these transformations being applied, you lose all the power of the synchronous/asynchronous parallel, and your
so-called "promises" become simple callback aggregators. This is the problem with jQuery's current "promises": they only
support scenario 1 above, omitting entirely support for scenarios 2–4. This was also the problem with Node.js 0.1's
`EventEmitter`-based "promises" (which weren't even `then`able).

Furthermore, note that by catching exceptions and transforming them into rejections, we take care of both intentional
and unintentional exceptions, just like in sync code. That is, if you write `aFunctionThatDoesNotExist()` in either
handler, your promise becomes rejected and that error will bubble up the chain to the nearest rejection handler just as
if you had written `throw new Error("bad data")`. Look ma, no domains!


## So What?

Maybe you're breathlessly taken by my inexorable logic and explanatory powers. More likely, you're asking yourself why
this guy is raging so hard over some poorly-behaved libraries.

Here's the problem:

> A promise is defined as an object that has a function as the value for the property `then`

As authors of Promises/A-consuming libraries, we would like to assume this statement to be true: that something that
is "thenable" actually behaves as a Promises/A promise, with all the power that entails.

If you can make this assumption, you can write [very extensive libraries][chai-as-promised] that are entirely agnostic
to the implementation of the promises they accept! Whether they be from [Q][], [when.js][], or even [WinJS][], you can
use the simple composition rules of the Promises/A spec to build on promise behavior. For example, here's a generalized
[retry function][] that works with any Promises/A implementation.

Unfortunately, libraries like jQuery break this. This necessitates [ugly hacks][] to detect the presence of objects
masquerading as promises, and who call themselves in their API documentation promises, but aren't really Promises/A
promises. If the consumers of your API start trying to pass you jQuery promises, you have two choices: fail in
mysterious and hard-to-decipher ways when your compositional techniques fail, or fail up-front and block them from using
your library entirely. This sucks.


[chai-as-promised]: https://github.com/domenic/chai-as-promised/
[Q]: https://github.com/kriskowal/q
[when.js]: https://github.com/cujojs/when
[WinJS]: http://msdn.microsoft.com/en-us/library/windows/apps/br211867.aspx
[retry function]: https://gist.github.com/2936696
[ugly hacks]: https://github.com/domenic/chai-as-promised/blob/4bc1d6b217acde85c8af56dc3cd09f05bb752549/lib/chai-as-promised.js#L28-30


## The Way Forward

So this is why I want to avoid an unfortunate [callback aggregator solution][ember] ending up in Ember. That's why I
wrote this essay. And that's why, in the hours following writing the original version of this essay, I worked up
[a general Promises/A compliance suite][tests] that we can all use to get on the same page in the future.

Since the release of that test suite, great progress has been made in promise interoperability and understanding. One
library, [rsvp.js][], was released with the explicit goal of providing these features of Promises/A. Others
[followed suit][]. But the most exciting result was the formation of the [Promises/A+ organization][promises-aplus],
a loose coalition of implementors who have produced the [Promises/A+ specification][promises-aplus-spec] extending and
clarifying the prose of the original Promises/A spec into something unambiguous and [well-tested][promises-aplus-tests].


There's still work to be done, of course. Notably, at current time of writing, the latest jQuery version is 1.9.1, and
its promises implementation is completely broken with regard to the error handling semantics. Hopefully, with the above
explanation to set the stage and the Promises/A+ spec and test suite in place, this problem can be corrected in jQuery
2.0.

In the meantime, here are the libraries that conform to Promises/A+, and that I can thus unreservedly recommend:

- [Q][] by Kris Kowal and myself: a full-featured promise library with a large, powerful API surface, adapters for
  Node.js, progress support, and preliminary support for long stack traces.
- [rsvp.js][] by Yehuda Katz: a very small and lightweight, but still fully compliant, promise library.
- [when.js][] by Brian Cavalier: an intermediate library with utilities for managing collections of eventual tasks,
  as well as support for both progress and cancellation.

If you are stuck with a crippled "promise" from a source like jQuery, I recommend using one of the above libraries'
assimilation utilities (usually under the name `when`) to convert to a real promise as soon as possible. For example:

```js
var promise = Q.when($.get("https://github.com/kriskowal/q"));
// aaaah, much better
```

[ember]: https://github.com/emberjs/ember.js/commit/f7ac080db3a2a15f5814dc26fc86712cf7d252c8
[tests]: https://github.com/domenic/promise-tests
[rsvp.js]: https://github.com/tildeio/rsvp.js
[followed suit]: https://twitter.com/wookiehangover/status/258641272913412096
[promises-aplus]: https://github.com/promises-aplus
[promises-aplus-spec]: http://promises-aplus.github.com/promises-spec/
[promises-aplus-tests]: https://github.com/promises-aplus/promises-tests
[not fully compliant]: https://github.com/promises-aplus/promises-spec/issues/4
