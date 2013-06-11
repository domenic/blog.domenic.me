---
layout: post
title: "Explaining Away the Web's Magic"
date: 2013-06-10T00:00:00Z
comments: true
categories: [Web]
---

Today we revealed [The Extensible Web Manifesto](http://extensiblewebmanifesto.org/), calling for a new approach to
web standards that prioritizes new local-level capabilities in order to explain and extend higher-end platform features.
I want to take a minute to talk about what this means in practice, and why it's different from how we operate today.

## Show Me the Magic!

The core of the extensible web manifesto says two things:

- We should *expose new low-level capabilities* to JavaScript
- We should *explain existing high-level features* in terms of JavaScript

The first of these is fairly obvious, but important. It's this goal that has brought us things that were previously
restricted to native apps or Flash, e.g. webcam and geolocation access, or WebGL. Even something as simple as the page
visibility API is a nice, low-level capability that helps us build our apps in ways we couldn't do before.

What all of these low-level APIs have in common is that they're exposing "C++ magic" to us, the web developers. They're
bridging the gap between native hardware and OS capabilities, into the realm of web applications. This is good. This is
where the magic belongs: where our technology fails us.

The second point is where things get subtle. Because it turns out there's a lot more C++ magic going on in your browser
than just access to hardware, or to OpenGL bindings. Arguably the biggest amount of magic in the web platform is the
magic we take for granted: the magic that translates declarative HTML and CSS into what we see on the screen and
manipulate with JavaScript.

This is the more revolutionary part of the extensible web manifesto. It's drawing a line in the sand and saying: **the
C++ magic stops here**. We need to stop building high-level features of the platform out of magic when it's not
necessary to do so, and we need to explain the existing features in terms of JavaScript technology—not C++ magic—at
least until we bottom out at the low-level hardware capabilities discussed above. By taking this stand, we enable users
to extend the web platform without rebuilding it from scratch.

## \#extendthwebforward In Practice

**Custom tags** are a great example of this principle in action. If you stick to a pre-defined list defined by the W3C,
then you can use your declarative HTML all over the place. Each tag gets turned into its own JavaScript counterpart via
the parser, whether it be the humble transformation of `<p>` into `HTMLParagraphElement` or the complex wirings between
`<img>` and `HTMLImageElement`.

Everything the W3C doesn't know about, however, gets turned into the featureless blob that is `HTMLUnknownElement`. Hrm.

There's clearly a lot of magic going on here, most of it encapsulated in that "parser" thing. What if the parser was
extensible, and could be explained in terms of a JavaScript API? What if we pushed the magic further back? A good first
step might be allowing
[the registration of custom elements](http://www.polymer-project.org/platform/custom-elements.html). That way, we could
explain the inner workings of this magic parser in terms of how it looks up an element name in a registry, and then
derives instances from that registry. This has a wonderful emergent property as well: now that HTML elements are
explained by a C++ parser turning HTML into JavaScript, our JavaScript objects can use the usual mechanisms of the
language, like prototypal inheritance and constructors, to build on existing HTML elements.

The **shadow DOM** is another of my favorite examples. While `<p>` might be a relatively non-magical element, clearly
there's a lot of crazy stuff going on with `<select>`! And don't get me started on `<audio>` and `<video>`. It's as if
there's a whole, um, shadow DOM, hidden underneath the one we see, accessible only by C++. The goal of the shadow DOM
spec, going back to its [earliest conception](http://glazkov.com/2011/01/14/what-the-heck-is-shadow-dom/), has been to
bring that magic out of C++ and explain it in terms of
[JavaScript primitives](http://www.html5rocks.com/en/tutorials/webcomponents/shadowdom/).

But it's not just these large examples, attempting to explain HTML. What about something as simple as … **parsing
URLs**? Clearly, the platform has this capability:

```js
var a = document.createElement("a");
a.href = "http://infrequently.org/2012/04/bedrock/#comments";
console.log(a.protocol, a.host, a.pathname, a.hash);
```

But somehow, this capability got tied up inside the high-level abstraction of the `<a>` element, and isn't accessible
to us directly as JavaScript programmers. We're left reimplementing it, often
[incorrectly](https://github.com/joyent/node/issues/5452), on our own. It's this kind of travesty that work like
[the URL spec](http://url.spec.whatwg.org/#constructors) in particular, and the extensible web movement in general, is
trying to prevent.

Let's keep going. What does this do?

```js
var els = document.querySelectorAll(":enabled");
```

Well, hmm, something about ["an enabled state"](http://www.w3.org/TR/css3-selectors/#enableddisabled). I wonder what
that means. Probably something to do with [the `disabled` attribute](http://www.whatwg.org/specs/web-apps/current-work/multipage/association-of-controls-and-forms.html#enabling-and-disabling-form-controls:-the-disabled-attribute). How did
the browser know that? More magic! We passed in a string that's in a magic list called "CSS3 selectors spec," and it
has some magic handler that turns that into "elements where `el.disabled === true`." This is a pretty high-level
abstraction; could we explain it with technology instead of magic? What about some kind of **CSS selector
registration**?

```js
document.registerSelector(":disabled", function (el) {
    return el.disabled;
});
```

It's of course more complicated than that. To make this performant and sensible, we're going to need some way to ensure,
or at least assume, that the function passed is pure (i.e. side-effect free and gives the same answers to the same
inputs). But we [need something like that anyway](http://wiki.ecmascript.org/doku.php?id=strawman:data_parallelism).
It'll happen.

There's so many more examples. Once you start seeing the web browser in this way, trying to pick apart and explain its
C++ magic in terms of JavaScript technology, you'll have a hard time un-seeing how much work needs to be done. Here's
just a brief scratchpad idea list:

- [Low-level HTTP fetching and data streams](https://gist.github.com/wycats/cf73dd4c974352fcb767)
- More general and composable binary data streams, [à la Node.js](http://imgur.com/a/9vFGa#11)
- [Unified animations primitives](http://www.polymer-project.org/platform/web-animations.html)
- [A way of responding to requests when your app is offline](https://github.com/slightlyoff/NavigationController/blob/master/explainer.md)
- Exposed GZIP capabilities
- Custom scrollbars
- Custom tooltips
- [Custom context menus](http://davidwalsh.name/html5-context-menu)
- [Deferred, but synchronous, exception handling](http://lists.w3.org/Archives/Public/www-dom/2013AprJun/0188.html)
- [Observing and responding to changes to JS objects](http://updates.html5rocks.com/2012/11/Respond-to-change-with-Object-observe)

## What's Next

The extensible web manifesto was a statement of intent, and of prioritization.

Some of the reaction to it has been along the lines of "Well … duh!?" To which I reply: exactly! This *should* be obvious. But if you look at how the standards process has worked
[historically](https://medium.com/the-future-of-the-web/2fcd1c1bb32), that's not what happened. Implementers handed down
new high-level solutions from their ivory towers, [without knowing](http://news.cnet.com/8301-17939_109-10281477-2.html)
if they actually solved the problems we as developers actually had. Or they knew we needed some primitive, but gave us
[a slightly messed-up version of it](http://updates.html5rocks.com/2013/03/What-s-the-CSS-scope-pseudo-class-for), due
to lack of attention to common use cases. It's been somewhat tragic, actually.

The publication of the extensible web manifesto is taking a stand for a process that should help avoid these missteps,
by doing what we should have been doing all along. In short, *prioritize efforts to expose low-level tools*; then,
watch what the developer community converges on and fold that back into the web platform *now that we know it solves
common high-level use cases*. And this ideology has teeth: the W3C's newly-reformed
[Technical Architecture Group](http://www.w3.org/2001/tag/2013/03/18-agenda) has taken on the case of overseeing this
effort, ensuring that new APIs are introduced to explain away the C++ magic in terms of idiomatic JavaScript.

This is something I can get behind.
