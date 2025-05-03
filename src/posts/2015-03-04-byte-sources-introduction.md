---
layout: layouts/post
title: "Byte Sources: Introduction"
date: 2015-03-04T00:00:00Z
tags: [web standards]
blurb: The intro to a short series of posts explaining some design decisions behind the web streams APIs, and how they abstract over underlying I/O interfaces.
---

_This post is the beginning of a series of posts regarding some of the more interesting issues I've encountered while working on the Streams Standard._

In the [Streams Standard](http://streams.spec.whatwg.org/) we have the concept of readable streams, which are an abstraction on top of the lower-level **underlying sources**. In an abstract sense an underlying source is "where the chunks of data come from." The most basic underlying sources are things like files or HTTP connections. (More complicated ones could be e.g. an underlying source that randomly generates data in-memory for test purposes, or one that synthesizes data from multiple concrete locations.) These basic underlying sources are concerned with direct production of bytes.

The major goal of the Streams Standard is to provide an efficient abstraction specifically for I/O. Thus, to design a suitable readable stream abstraction, we can't just think about general concepts of [reactivity](https://github.com/kriskowal/gtor/) or [async iterables](https://github.com/zenparsing/async-iteration/) or [observables](https://github.com/jhusain/asyncgenerator#introducing-observable). We need to dig deeper into how, exactly, the underlying sources will work. Otherwise we might find ourselves [scrambling](https://github.com/whatwg/streams/issues/253) to reform the API at the last minute when confronted with real-world implementation challenges. (Oops.)

The current revision of the standard describes underlying sources as belonging to two broad tags: push sources, where data is constantly flowing in, and pull sources, where you specifically request it. The prototypal examples of these categories are TCP sockets and file descriptors. Once a TCP connection is open, the remote server will begin pushing data to you. Whereas, with a file, until you ask the OS to do a read, no I/O happens.

This division is conceptually helpful, but it's instructive to go deeper and look at the actual system APIs in play here. Given that concepts like "events" are way too high-level for an OS API, they end up being shaped quite differently than how you might imagine. We'll assume a POSIX environment for this series. Along the way we'll continually be trying to bridge the gap between these C APIs and how they might manifest in JavaScript, both to give the less-C-inclined readers a chance, and to illustrate the issues we've been wrestling with in the Streams Standard.

I ended up writing the following posts:

1. Byte sources: introduction (this post)
2. [Reading from files](/reading-from-files/)
3. [Reading from sockets](/reading-from-sockets/)
