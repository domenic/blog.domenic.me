---
layout: layouts/post
title: "ES6 Iterators, Generators, and Iterables"
date: 2013-09-06T00:00:00Z
tags: [JavaScript]
---

I wrote up a quick guide to the terminology around ES6's iteration-related concepts, plus some notes and other
resources.

## Definitions

An **iterator** is an object with a `next` method that returns `{ done, value }` tuples.

An **iterable** is an object which has an internal method, written in the current ES6 draft specs as
`obj[@@iterator]()`, that returns an iterator.

A **generator** is a specific type of iterator whose `next` results are determined by the behavior of its corresponding
generator function. Generators also have a `throw` method, and their `next` method takes a parameter.

A **generator function** is a special type of function that acts as a constructor for generators. Generator function
bodies can use the contextual keyword `yield`, and you can send values or exceptions into the body, at the points where
`yield` appears, via the constructed generator's `next` and `throw` methods. Generator functions are written with
`function*` syntax.

A **generator comprehension** is a shorthand expression for creating generators, e.g.
`(for (x of a) for (y of b) x * y)`.

## Notes

### `for`-`of`

The new `for`-`of` loop works on iterables, i.e. you do `for (let x of iterable) { /* ... */ }`. So for example, it
works on arrays by looking up their `Array.prototype[@@iterator]()` internal method, which is specified to return an
iterator that does what you'd expect. Similarly `Map.prototype`, `Set.prototype`, and others all have `@@iterator`
methods that help them work with `for`-`of` and other constructs in the language that consume iterators.

Note that `for`-`in` has nothing to do with iterables, or indeed any of the concepts discussed here. It still works as
it did before, looping through enumerable object properties, and it will be pretty useless when given an iterable of any
sort.

### Iterable Iterators

An *iterator* can also be *iterable* if it has an `@@iterator()` internal method. Most iterators in the ES6 draft spec
are also iterable, with the internal method just returning `this`. In particular, all generators created via generator
functions or generator comprehensions have this behavior. So you can do:

```js
const lazySequence = (for (x of a) for (y of b) x * y);
for (let z of lazySequence) {
  console.log(z);
}
```

### Making Iterable Objects

To make a custom iterable object, you use the `Symbol.iterator` symbol, which is the inside-JavaScript way of referring
to the specification's `@@iterator`. It should return an iterator, thus making your object iterable. The easiest way to
write the iterator-returning method is to use generator syntax. Putting this all together, it looks like

```js
const iterable = {
  *[Symbol.iterator]() {
    yield 1;
    yield 2;
    yield 3;
  }
}

for (let x of iterable) {
  console.log(x);
}
```

### Generator Comprehension Desugaring

You can think of generator comprehensions as "sugar" for writing out and immediately invoking a generator function, with
`yield`s inserted implicitly at certain points. For example, the comprehension `(for (x of a) for (y of b) x * y)`
desugars to

```js
(function* () {
  for (x of a) {
    for (y of b) {
      yield x * y;
    }
  }
}())
```

### A Weirdness

It's not entirely clear why generator comprehensions create generators instead of simple iterable-iterators. In
particular, as you can see from the above desugaring, calling `throw` or giving a parameter to `next` is pretty useless:

```js
const g = (for (x of [1, 2, 3]) x * x);

g.next();                   // returns { done: false, value: 1 }
g.next(5);                  // returns { done: false, value: 2 }
g.throw(new Error("boo!")); // immediately throws the error
```

It seems the arguments in favor of generators instead of iterable-iterators are largely that it makes implementers' jobs
easier, at least according to
[this es-discuss thread](http://esdiscuss.org/topic/why-do-generator-expressions-return-generators) I started.

## Implementation Status

Due to the tireless work of [Andy Wingo](http://wingolog.org/), V8 (Chrome) has support for generator functions, behind
the `--harmony` flag (or "Experimental JavaScript Features" in chrome://flags). It also has some form of `for`-`of`,
which only works with generators and with the custom iterables returned by `Array.prototype.values` and
`Array.prototype.keys`, but does not work with anything else (e.g. arrays themselves). I assume this is because the
iteration protocol has not been implemented yet. V8 does not have generator comprehensions.

SpiderMonkey (Firefox) has an old version of everything here, with outdated syntax and semantics. Over the last week or
so, Andy has submitted patches to update their generator implementation. He's now working on `for`-`of` and the
iteration protocol in [bug #907077](https://bugzilla.mozilla.org/show_bug.cgi?id=907077); no word on generator
comprehensions. Note that SpiderMonkey, unlike V8, does not hide these features behind a default-off flag.

Chakra (Internet Explorer) is as always a complete mystery, with no transparency into their development cycle or even
priority list.

And I still haven't forgiven JavaScriptCore (Safari) for its long period of forgetting to implement
`Function.prototype.bind`, so I haven't even tried looking into their status.
