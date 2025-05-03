---
layout: layouts/post
title: "The Extensible Web"
date: 2013-10-07T00:00:00Z
tags: [web standards]
blurb: A view from 2013 of how the web platform has been evolving recently, and how it can evolve better going forward by using the extensible web principles.
---

*This post adapts [my talk from JSConf EU 2013][jsconf-eu].*

The web platform has, historically, been somewhat of a kludge. It's grown, organically, into something with no real
sense of cohesion. Most of its APIs have been poorly designed, by C++ developers, via
[a binding layer meant originally for CORBA][omg-idl].

Worse, there have been major gaps in what we can do compared to native apps. And for those things that we can do, we end
up accomplishing them by drowning ourselves in custom JavaScript functionality.

The problem is in the process. Generally, new things have been introduced into our web platform via a months or years of
mailing-list standardization, writing something in prose and IDL, driven by scenario-solving—without much concern for
actual utility, much less usability. Implementers expose some fundamental capability in terms of a high-level API or
declarative form that burrows down directly to the C++ layer, giving you limited customizability. After all this time,
it eventually ends up in your hands, and you end up telling the standards bodies that [it's a huge mess][indexeddb], or
that [it solves half of your problems half of the time][appcache].

Despite all this, we've somehow done OK. Actually, a bit more than OK, given that the web is the most successful
platform ever. How did we manage this?

Well, we wrap up APIs with horrible usability into ones that are quite pleasant, like jQuery. We "prolyfill," creating
libraries like Sizzle to implement CSS selector matching, or libraries like Angular to implement custom elements, in the
hope that eventually native support will appear. We transpile from languages like CoffeeScript or SASS to add new
features to our authoring languages. And one case, promises, we even
[built an interoperable standard from the ground up][promises-aplus].

We need our platform to be better, and so we *make* it better, by ourselves.

[jsconf-eu]: http://2013.jsconf.eu/speakers/#/speakers/domenic-denicola-the-extensible-web-javascript-all-the-way-down
[omg-idl]: http://www.omg.org/gettingstarted/omg_idl.htm
[indexeddb]: https://dvcs.w3.org/hg/IndexedDB/raw-file/default/Overview.html
[appcache]: http://www.whatwg.org/specs/web-apps/current-work/multipage/offline.html
[promises-aplus]: http://www.slideshare.net/domenicdenicola/boom-promisesa-was-born

## The Extensible Web Manifesto

The [Extensible Web Manifesto](http://extensiblewebmanifesto.org/) is standards bodies saying they're ready to do
their part. Until now, we, the developers, have been shouldering all the work, writing massive JavaScript libraries or
transpilers to reinvent basic functionality.

There's a better way, where we work together toward the future.

What these standards bodies have realized is that the web platform is our language, but like all languages, it must
evolve.

This evolution of our shared language takes place in two acts:

1. extending our basic vocabulary;
2. starting to [incorporate "slang"](http://briankardell.wordpress.com/2013/05/17/dropping-the-f-bomb/).

## Extending our Vocabulary

Extending our vocabulary means two things:

- *Explaining the features of the platform that are already there.* Wouldn't it be weird if we had compound words like
  "scifi," but didn't have the words "science" or "fiction"? If some standards body, perhaps the
  [French Making Up Words Consortium](https://en.wikipedia.org/wiki/Acad%C3%A9mie_fran%C3%A7aise), just handed us the
  word "sandpaper," but we had no way in our language to talk about "sand" or "paper" individually? The web is like
  that today, and we'll go over a few examples.

- *Giving you new low-level features that you can use*. If you wanted to invent the word "scifi," somebody had better
  have come up with the words for "science" and "fiction"! Similarly, there's lots of things we just don't have "words"
  for on the web, yet. That's where native apps are hurting us.

So with this in mind, let's look at some examples.

### Custom Elements

The most fundamental unexplained gap in the platform is simply: how do those damn elements even work?

Somehow, you feed a string containing some angle brackets into the browser, and they get turned into these JS objects
with terrific APIs, which we call "the DOM." How did that happen?

[Custom elements](https://dvcs.w3.org/hg/webcomponents/raw-file/default/spec/custom/index.html) explain this process,
saying that you register a mapping of tag names to element prototypes with the browser, and that's what the HTML parser
is actually using under the hood. This is great! This is the democratization of HTML!

And better yet, this means no more crazy widget libraries with their own crazy semantics. No more jQuery UI with its
`.option` thing (sometimes a setter, sometimes a getter, sometimes a method call); no more Dojo digits; no more
Bootstrap craziness; no more WinJS with its funky `winControl` property. Just tags, that turn into elements, which
behave like you'd expect: they have properties, getters, setters, methods, and all that.

### The Shadow DOM

But what about the existing tags? Half of the reason these widget libraries exist is so that you can create your own
stupid `<select>` element, because the existing one isn't styleable or customizable.

In general, think of all the "magic" tags that exist today, like `<select>`, or `<input type="date">`, or `<details>`,
or `<video>`, or even good old `<li>`, whose bullet seems to come out of nowhere. In all cases, there's some extra
"stuff" the browser is creating, and allowing users to interact with, and sometimes even allowing you to style via
ridiculous vendor-prefixed pseudo-elements like `::-moz-placeholder`. But where does this extra stuff live?

The answer is: in the [shadow DOM](https://dvcs.w3.org/hg/webcomponents/raw-file/tip/spec/shadow/index.html). And what's
great about the shadow DOM, is that once we actually have a realistic basis for these hidden parts of the DOM, in
reality instead of in C++ magic-land, you'll be able to actually start hooking into them instead of rebuilding an entire
element just to customize its behavior and styling. That day is
[almost here](https://groups.google.com/a/chromium.org/d/msg/blink-dev/ZAdZJWahyF8/lOInKCTbmrUJ).

### Web Audio

The [web audio API](https://dvcs.w3.org/hg/audio/raw-file/tip/webaudio/specification.html) is a good example of both
facets of the "new vocabulary" theme. You can do fundamentally new things with web audio, like positional audio or audio
synthesis or so many other cool possibilities.

But remember the `<audio>` tag, from way back in 2009? It's kind of the quintessential instance of "here's some C++
magic thrown over the wall to you web developers; have fun!" Well, from an extensible web perspective, the `<audio>` tag
should be explained in terms of web audio.

### Etcetera

There are of course many other APIs which exist solely to expose a new low-level hardware or platform feature to the web
platform. One of the older examples on the hardware side is the
[geolocation API](http://www.w3.org/TR/geolocation-API/). On the software side, good examples include the
[notifications API](http://notifications.spec.whatwg.org/) and [fullscreen API](http://fullscreen.spec.whatwg.org/). But
more and more are popping up as we attempt to close all the gaps preventing full parity with native apps; one particular
driver of this is the work on Firefox OS and the related [device APIs](http://www.w3.org/2009/dap/).

### ES6 and ES7

Finally, I want to call out ECMAScript 6 (which is nearing finalization) and ECMAScript 7 (for which efforts are just
starting to ramp up). Extending the web's programming language is adding new vocabulary at its most literal level, and
the TC39 committee driving the evolution of ECMAScript does not disappoint in their efforts here.

In ES6 we'll be getting subclassable built-in objects, so that you can finally extend `Array` or `Date` or the new `Map`
and `Set` types, in a way that actually works. We'll also be getting proxies, which allow an object almost-complete
control over the meta-object protocol underlying all interactions with it. And for ES7, the proposal for
`Object.observe` is starting to firm up. Plus there is talk of adding weak references to the language, now that some of
their trickier aspects have been worked out.

## Incorporating Slang

The second half of the extensible web philosophy is that we need to tighten the feedback loop between developers and
standards bodies.

Think about it: you get all these neat new low-level tools, and you build great things out of them. But you end up
downloading megabytes of JavaScript, or transpiling your code, just to get the base platform in place. This is why
almost every web page uses jQuery: because the platform itself hasn't stepped up to the plate and incorporated jQuery's
innovations back in.

In short, we need to incorporate this kind of invented "slang" back into our shared language. Let's take a look at some
of the examples of this so far.

### `<template>`

The [`<template>` element](http://www.html5rocks.com/en/tutorials/webcomponents/template/) is a generalization of the
common `<script type="text/x-template">` trick. By rolling it into the browser, additional benefits can be realized,
allowing the template tree to be treated as an inert version of a real DOM tree, and for the element parsing and
serialization rules to specifically call out templating use cases.

### `<dialog>`

The [`<dialog>` element](http://developers.whatwg.org/commands.html#the-dialog-element) obviates all of the annoying
dialog or "lightbox" libraries we keep having to ship, each with their own strange semantics. Instead, it's a simple
tag, with some imperative APIs, some declarative features, and a nice `::backdrop` pseudo-element. Sweet!

### CSS Improvements

CSS is slowly but surely starting to roll in innovations from SASS and elsewhere.
[CSS hierarchies](http://dev.w3.org/csswg/css-hierarchies/), still under development, brings SASS's nested selectors to
the browser. [CSS variables](http://dev.w3.org/csswg/css-variables/) uses a clever trick to get something with the same
benefits as the variables in SASS and others, but fitting in well with CSS's existing semantics. And
[CSS cascade](http://dev.w3.org/csswg/css-cascade/) introduces the `unset` keyword which reduces all those complicated
CSS reset stylesheets rules to virtually nothing.

### Pointer Events

[Pointer events](https://dvcs.w3.org/hg/pointerevents/raw-file/tip/pointerEvents.html) finally unify mouse and touch
events into a single abstraction. In one stroke, this obviates many libraries built to work around this strange
dichotomy introduced by mobile Safari, and around other strangeness relating to trying to use mouse events on a touch
device. They will be a welcome addition to the web platform.

### Promises

When a pattern is adopted by jQuery, Dojo, Angular, Ember, WinJS, and YUI, as well as many other popular dedicated
libraries, it's time to put it into the platform. [Promises](https://github.com/domenic/promises-unwrapping) are on
track for ES6, and are being added to browsers now.

## What's Next?

The extensible web is an ongoing project, and several efforts are being headed up to expose even more capabilities to
developers, or roll even more common patterns into the platform. Here's a brief taste of those I'm watching closely.

### Streams

`FileReader`, `XMLHttpRequest`, `getUserMedia`, `postMessage`, object URLs, `MediaStream`s… As
[poignantly emphasized](http://imgur.com/a/9vFGa#11) in a brilliant presentation by Max Ogden, we're clearly missing a
unifying abstraction here, and that abstraction is streams.

Node.js has led the way with their battle-tested implementations, but they've also learned some lessons we should be
sure to heed in order to design a good browser stream API. In the end, the goal is to be able to take various sources of
binary data (HTTP requests, camera data, payloads stored in IndexedDB, the output of a web audio graph, …) and pipe them
into various sinks (`<img>`, `<video>`, and `<audio>` tags; other windows, frames, or workers; filesystem or remote HTTP
endpoints; or completely custom consumption code). It's going to be really cool, but we have some work to do before we
get something as well-designed as promises were.

### Fetch

The basic act of doing an HTTP request has so much complexity on the web platform: cross-domain protection; redirect
following; deserialization from bytes; cookie jars; caches… We want to provide the basic building block, and then the
ability to layer and compose each of these features on top of it.

### ZIP/ZLib

There's active investigation going on into how to expose compression primitives to the web. This is clearly something
where native bindings will be more performant, and although there are
[impressive polyfills](https://github.com/imaya/zlib.js), native APIs, preferably with asynchronous off-main-thread
compression, will enable new scenarios. This work is in its early stages, so if you want to get involved, reach out.

### `class Elements extends Array`

My personal favorite new feature is the upcoming
[`Elements` collection](http://dom.spec.whatwg.org/#collections:-elements). It's a proper array subclass, using the
aforementioned ES6 subclassable builtin support, to give you something where you can *finally* use `forEach`, `reduce`,
`filter`, and all your favorite methods.

As part of this effort we added two methods, `query` and `queryAll`, to both `Element.prototype` and to
`Elements.prototype`. They act as better versions of `querySelector` and `querySelectorAll`, in that they treat relative
selectors like `"> div"` the way you would expect instead of throwing an error. The versions on `Elements.prototype` act
as composite operations over all elements in the collection, just like in jQuery.

This is the beginning of a new, friendlier DOM, and I'm pretty excited about it.

### What Else?

What do we need? What is preventing you from building the web apps of your dreams? You tell us! The extensible web is
waiting for your participation!

## Getting Involved

The best thing you can do to get involved in the extensible web is *prolyfill*. There's only so much standardization
bandwidth to go around, so if you can create a de-facto standard like jQuery, or an open specification with wide
implementer suppport like Promises/A+, the world is waiting.

For example, if you wanted to figure out what a zlib API for the browser should look like, the best thing you can do is:

- Learn what the constraints and use cases are. (And not just your use cases, but everyone's!)
- Design an API and library to prolyfill this gap.
- Evangelize its use among developers, so that everyone recognizes it as the clear solution that browsers should just
  ship and be done with it.

More generally, if you want to be involved in helping the web succeed by guiding us toward better standards, then let's
talk. It's an area I've been diving into over the last year, stemming from my Promises/A+ work but expanding into many
other things. Finding the right approach and content is delicate, as these people are jaded by newbies coming out of the
woodwork to demand feature X. But if you approach in good faith and avoid a prideful demeanor, they're often happy to
listen. I've had a few success stories in this area already, and by this time next year I want to have a lot more.

In fact, I gave a talk on this subject at LXJS, titled
["How to Win Friends and Influence Standards Bodies"](https://www.youtube.com/watch?v=hneN6aW-d9w&hd=1). I'll probably
be adapting it into blog post form soon.

Another thing I wanted to note, before closing out, is that this extensible web philosophy has teeth. The W3C Technical
Architecture Group had four seats go up for reelection recently. Four "reformers" were elected at once: Yehuda Katz,
Alex Russell, Marcos Caceres, and Anne van Kesteren. The extensible web philosophy underlies their governance, as the
ultimate technical body which provides guidance and approval for all W3C specs. We've already seen fruit here with their
[review of the web audio spec](https://github.com/w3ctag/spec-reviews/blob/master/2013/07/WebAudio.md),
[among others](https://github.com/w3ctag/spec-reviews). They've been helping specs build on a solid grounding in
JavaScript fundamentals, and generally be less magic and more JavaScript. All their work is being done
[on GitHub](https://github.com/w3ctag), as are more and more specifications. This is happening!

To close, I'd like to give a short message of hope. It's easy to think about all these cool things that are coming, and
then get depressed about having to support IE8 or Android 2.3 at your job. But that's the price we pay for an open,
interoperable web. We can't just march to the tune of a single vendor, upgrading in lockstep. Instead we work through
this collaborative, cooperative process, to build our shared language. In the end, *the future is longer than the past*,
and I look forward not only to living in that future, but to helping shape it, together with you all.
