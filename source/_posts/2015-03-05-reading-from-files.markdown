---
layout: post
title: "Reading from Files"
date: 2015-03-05T00:00:00Z
comments: true
categories: [Streams]
---

_This post is part of a series on the byte sources underlying the readable streams in the Streams Standard. See [the introductory post](/byte-sources-introduction/) for more background and links to the rest of the series._

Once you have opened a file descriptor, you'll use the [read(2)](http://linux.die.net/man/2/read) function to read bytes from it. In C the signature is

```c
ssize_t read(int fd, void *buf, size_t count);
```

Translated into JavaScript this might look something like

```js
const bytesRead = file.readInto(buffer, offset, count);
```

which will attempt to read `count` bytes into the `ArrayBuffer` `buffer`, starting at position `offset` into the `ArrayBuffer`. The returned number of bytes, `bytesRead`, might be less than the desired `count`, usually because you've reached the end of the file.

The most interesting thing to note about read(2) is that it is blocking. So our above naive translation into JavaScript would actually lock up your browser or server for the amount of time the I/O happens. This is obviously a no-go if you're trying to write a server that serves more than one user in parallel, or trying to create a responsive 60 fps web page.

But of course we know how to fix this. We'll just turn it into a promise-returning function:

```js
file.readInto(buffer, offset, count).then(bytesRead => { ... });
```

Not so fast. How exactly do we plan on translating a blocking POSIX API into a non-blocking JavaScript API? The obvious answer is to use another thread. That is, off in a background thread, we pass the memory represented by `buffer` into read(2), and when read(2) finishes, we go back to the main thread and fulfill the promise we previously vended with read(2)'s return value.

This solution has a major issue, however: **data races**. That is, it makes it possible to observe the memory in `buffer` changing out from under us, with code like the following:

```js
const view = new Uint8Array(buffer);
file.readInto(buffer, offset, count).then(bytesRead => { ... });

console.log(view[0] === view[0]);
```

Because the memory in `buffer` is being filled in by read(2) in the background thread, it's possible for this program to output `false`! Oh no!

In the io.js world, this is considered OK, and with some effort you can create situations like this using their native `Buffer` type. However, in the world of web browsers, and in general in any world where standards bodies need to get multiple vendors to agree, this is not going to fly. JavaScript's execution model is strongly based around a run-to-completion single-threaded paradigm, and if we poke holes in that by letting other threads modify our variables out from under us between two execution steps, all hell can break lose. No specs, libraries, or optimizing compilers are written to accomodate such a world.

One proposed solution would be to [*transfer*](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer/transfer) the backing memory of the `ArrayBuffer` into a new `ArrayBuffer` that is only accessible once the read(2) call has finished. In code, that might look something like this:

```js
file.readInto(buffer, offset, count).then(({ result, bytesRead }) => {
  // `result` is backed by the same memory `buffer` used to be
  // backed by, but they are not equal:
  assert(result !== buffer);
});

// `buffer`'s backing memory has now been transferred, so trying to use
// `buffer` directly (or any views onto `buffer`) will throw:
assert.throws(() => buffer.byteLength);
assert.throws(() => new Uint8Array(buffer));
```

Note how once `buffer` has been transferred, the `buffer` instance itself is now useless: it is "detached" in spec terms.

We could also imagine other ways of avoiding the data races. For example, if we had an API that allowed the background thread to first detach, then "reattach," the backing memory to `buffer`, we wouldn't need the separate `buffer` and `result` variables pointing to the same backing memory. Ideally such an API would allow us to detach and reattach _sections_ of the `ArrayBuffer`, so that I could (for example) read multiple files in parallel into different sections of one large buffer. [I proposed this on es-discuss](https://esdiscuss.org/topic/improving-detachment-for-array-buffers), but nobody seemed to be interested.

Alternately, we could decide that for a low-level JavaScript API representing a file descriptor, data races are OK after all. In that case, [Mozilla's `SharedArrayBuffer` proposal](https://blog.mozilla.org/javascript/2015/02/26/the-path-to-parallel-javascript/) would be a good fit—we'll just write to the shared array buffer in the background thread, while still allowing reading in the main thread. As mentioned before, it might be hard to get such a primitive past multiple vendors and into the relevant standards. But the desire to transpile threaded C and C++ code into asm.js is proving to be a powerful motivator, which might push it into acceptance.
