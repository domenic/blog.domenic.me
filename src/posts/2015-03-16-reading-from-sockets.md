---
layout: layouts/post
title: "Reading from Sockets"
date: 2015-03-16T00:00:00Z
tags: [web standards]
blurb: Designing JavaScript streams APIs for network sockets, on top of non-blocking syscalls, leads us to the concept of push vs. pull sources.
---

_This post is part of a series on the byte sources underlying the readable streams in the Streams Standard. See [the introductory post](/byte-sources-introduction/) for more background and links to the rest of the series._

At the simplest level, sockets can be treated much the same as files. You can get a file descriptor for the socket, and while there are a number APIs involved in setting it up to actually connect to a remote server, once you've done that you can read from it using the same read(2) interface as [we discussed for files](/reading-from-files/).

But! For sockets, there's an advanced technique available. Instead of using the straightforward-but-blocking read(2) call, we can fine-tune our syscall usage to give us our first taste of **non-blocking I/O**.  That is, there's a way to arrange it so that—without spinning up any threads—we can continue doing work while the OS gets our data ready for us.

## Non-Blocking Socket I/O

A quick aside. In higher-level languages, non-blocking _I/O_ is often conflated with non-blocking _APIs_. These are actually distinct concepts, and for clarity we'll refer to the latter as "asynchronous" instead. So: I/O can be blocking or non-blocking; APIs can be synchronous or asynchronous. An asynchronous API in a higher-level language might be backed by non-blocking I/O syscalls, or it might be backed by blocking I/O syscalls in a threadpool (as we showed in the file case).

What's really interesting is what the APIs for non-blocking I/O look like in C. They're nothing like what you might expect from working in a higher-level language, where concepts like "events" or "callbacks" are present to do the heavy lifting. Instead, it works something like this:

- When creating the socket, you set it to non-blocking mode.
- You go do some other work, and every once in a while, you come back and try to read some data from the socket.
  - If the OS has data ready for you, you get it instantly!
  - Otherwise, if there's no data ready, the OS returns a special error code, saying to try again later.
  - (Of course, there's always the possibility that something went wrong, and you'll get a non-special error code.)

The devil is in the details of how you "go do some other work" and "every once in a while" come back to check on your socket. Or, more likely, sockets plural: what kind of self-respecting program will only be dealing with a single socket?

The usual solution consists of two parts. First, redesign your program to be centered around an event loop, which continually cycles through the various things it might have to do—computation, reacting to user input, checking on and trying to read from any non-blocking sockets, processing the resulting data once it gets read, etc. Second, take advantage of some advanced APIs like [select(2)](http://linux.die.net/man/2/select) or [epoll(4)](http://linux.die.net/man/4/epoll), to allow you to check on multiple sockets at once without needing to supply a buffer to each of them. In practice, the heavy lifting for both of these is usually provided by a library like [libevent](http://libevent.org/) (the original) or [libuv](https://github.com/libuv/libuv) (the new hotness).

## JavaScript Translation

In the previous episode, we were able to do a fairly direct translation of read(2)-in-a-threadpool into a promise-returning `file.readInto` API. For sockets, we're going to need to skip a few more steps: the jump from select(2) to evented programming is just too great to map out directly.

Let's assume we've somehow integrated our host program's event loop (e.g., the one provided by libuv) with the JavaScript event loop. We can then have some host environment code that, each time through the loop, uses select(2) or similar to check if the socket has any data available. If it does, it needs to communicate that to JavaScript somehow. An easy way to do this would be with an event:

```js
socket.on("readable", () => { ... });
```

Once we know that the socket has some data available, what should the JavaScript API for reading it look like? Its general shape will be pretty similar to our `file.readInto` from before. But this time, we know the result is going to be synchronous. That means we don't need to worry about observable data races, and so we can skip all the transfer stuff we had to do last time to avoid them. The end result ends up being:

```js
socket.on("readable", () => {
  const bytesRead = socket.readInto(buffer, offset, count);
  // `buffer`'s bytes in the range (offset, offset + bytesRead)
  // have been filled in
});
```

Not too bad!

## Sockets vs. Files

With this JavaScript translation in hand, we can more easily probe the differences between non-blocking socket I/O, and file I/O. It turns out there are quite a few.

The first point to note is that we're being proactively told: _there is data ready for you_. But where does that data live while it's waiting for you to come pick it up? The answer is that the OS kernel maintains its own buffer of data for that socket, where the data accumulates until you read it. If you decline to read it, then the buffer will just keep filling up, until eventually it reaches a built-in limit. Once that happens, you'll start losing data!

This is a big difference between sockets and the higher-level stream APIs you might be used to. Streams generally go to great pains to ensure you never lose any data. But this means that any streams wrapping a socket must be careful to always pull data out of the kernel buffer before it gets too full, and then keep it around in their own user-space buffer until it's requested.

The second interesting difference is that we have much less control over how much data we're going to read. When the socket tells us that there's data available, it doesn't tell us how much. That means that in the above code, we can easily end up in a situation where `bytesRead < count`: indeed, it will happen whenever the kernel buffer had fewer bytes available than we requested. This is in contrast with blocking file I/O, where the only time `bytesRead < count` occurs is when we've reached the end of the file.

Finally, I want to draw attention to the different way in which buffers are provided in the two scenarios. With files, since we are doing blocking I/O in a threadpool, we need to provide the buffer up front. Whereas with sockets, we can wait until the last minute to do so. This had a pretty drastic impact on the API surface when we tried to express the reuslt in JavaScript. In particular, while you could imagine a way to wrap up our JavaScript socket API into something like our JavaScript file API, you can't really do the other way around.
