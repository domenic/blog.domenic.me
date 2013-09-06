---
layout: post
title: "ES6 Iterators, Generators, and Iterables"
date: 2013-09-06T00:00:00Z
comments: true
categories: [JavaScript]
---

I wrote up a quick guide to the terminology around ES6's iteration-related concepts, plus some notes and other
resources.

## Definitions

An **iterator** is an object with a `next` method that returns `{ done, value }` tuples.

An **iterable** is an object which has an internal method, written in the current ES6 draft specs as
`obj[@@iterator]()`, that returns an iterator.

A **generator** is a specific type of iterator which also has a `throw` method, and whose `next` method takes a
parameter.

A **generator function** is a special type of function that always returns a generator, and which can use the special
contextual keyword `yield` inside of itself. You can send values or exceptions into the body of the function, at the
points where `yield` appears, via the returned generator's `next` and `throw` methods. They are created with `function*`
syntax.

A **generator comprehension** is a shorthand expression for creating generators, e.g. `(for (x of a) for (y of b) x * y)`.

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

As of the time of this writing, there is no (easy) way in the current ES6 draft spec to make an arbitrary object
iterable. The only way to make iterable objects via currently-specced technology is with generator functions or
generator comprehensions. So in particular, you cannot create custom iterable objects that give sensible values for
`for`-`of` yet.

This functionality is definitely planned for ES6, however. The problem is that there's still a lot of dithering on how
to expose "unique symbols" like `@@iterator` to JavaScript authors. I believe the plan of record is something like

```js
import { iterator } from "@iter";

const iterable = {
  *[iterator]() {
    yield 1;
    yield 2;
    yield 3;
  }
}

for (let x of iterable) {
  console.log(x);
}
```

But the module system is not specified yet, so standard library modules like `"@iter"` are not specced yet, so we can't
do this.

### A Question

I am not sure why generator comprehensions create generators instead of simple iterable iterators. In particular I don't
know what calling `throw` or giving a parameter to `next` would do to the returned iterator:

```js
const aGenerator = (for (x of [1, 2, 3]) x * x);

aGenerator.next();                   // returns { done: false, value: 1 }
aGenerator.next(5);                  // ???
aGenerator.throw(new Error("boo!")); // ???
```

## Implementation Status

Due to the tireless work of [Andy Wingo](http://wingolog.org/), V8 (Chrome) has support for generator functions, behind
the `--harmony` flag (or "Experimental JavaScript Features" in chrome://flags). It also has some form of `for`-`of`,
which only works with generators and with the custom iterables returned by `Array.prototype.values` and
`Array.prototype.keys`, but does not work with anything else (e.g. arrays themselves). I assume this is because the
iteration protocol has not been implemented yet. It does not have generator comprehensions.

SpiderMonkey (Firefox) has an old version of everything here, with outdated syntax and semantics. Over the last week or
so, Andy has submitted patches to update their generator implementation. He's now working on `for`-`of` and the
iteration protocol in [bug #907077](https://bugzilla.mozilla.org/show_bug.cgi?id=907077); no word on generator
comprehensions. Note that SpiderMonkey, unlike V8, does not hide these features behind a default-off flag.

Chakra (Internet Explorer) is as always a complete mystery, with no transparency into their development cycle or even
priority list.

## Bonus

I said there was no easy way to make an arbitrary object iterable with the current draft spec. Well, there *is* a hard
way. Remember, the sticking point is trying to get a reference to that `@@iterator` symbol so we can use it with our
objects. But remember, `Array.prototype` already has that `@@iterator` symbol on it.

The trick uses a new method, `Object.getOwnPropertyKeys`, which will expose all properties of an object, even if they
are unique symbols like `@@iterator`. We'll need to do a bit of work, since `Array.prototype` has two unique symbols on
it, namely `@@iterator` and `@@unscopables`. But this should do the trick:

```js
const allProps = Object.getOwnPropertyKeys(Array.prototype);

const iterator = allProps.find(prop =>
  // @@unscopables is an array; @@iterator is a function.
  return typeof prop === "symbol" && typeof Array.prototype[prop] === "function";
);
```

Now we can create custom iterable objects, e.g. using generator method syntax like above. To end, I'll create a custom
iterable object that returns a random number each time and has a 10% chance of stopping each time you advance it. I'll
do so without using generator method syntax just to show you that you can.

```js
const randomIterable = {
  [iterator]() {
    return {
      next() {
        return {
          value: Math.random(),
          done: Math.random() < 0.1
        };
      }
    };
  }
};

for (let x of randomIterable) {
  console.log(x);
}
```

As of now, no engine implements `Object.getOwnPropertyKeys`. So it goes.
