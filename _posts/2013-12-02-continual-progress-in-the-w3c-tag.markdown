---
layout: post
title: "Continual Progress in the W3C TAG"
date: 2013-12-02T00:00:00Z
comments: true
categories: [Web]
---

The W3C Technical Architecture Group has made immeasurable progress this year since
[the original wave of reformist thought](http://infrequently.org/2012/12/reforming-the-w3c-tag/) swept through it last
election season. The extensible web agenda, which I've
[spoken about previously](http://domenic.me/2013/10/07/the-extensible-web/), has been adopted into their vision for the
web's foundations and informed recent spec work across the W3C. The TAG even moved its deliverables
[onto GitHub](https://github.com/w3ctag/), allowing better collaboration with and transparency to developers.

But there's always more to do. The web is slowly but surely coming into its own as a serious modern development
platform—one which can compete with native apps across the board. New APIs, new primitives, and new tools are very much
necessary to make our open platform as attractive to developers and users as it could be. To lure them away from the
walled gardens of closed app stores and vendor-proprietary development platforms, we must provide something better.

The TAG is in a unique position to oversee these efforts, with its charter to steward the evolution of web architecture
and coordinate with other relevant groups like Ecma TC39 and the IETF. As such, I'm excited to be
[running for TAG membership](http://lists.w3.org/Archives/Public/www-tag/2013Dec/0004.html) in this
[newest election cycle](http://www.w3.org/blog/TAG/2013/11/06/tag-election-2013/).

Over the last year of my increasing involvement in web standards, I've found two things to be paramount: _developer
involvement_, and _a focus on solid low-level primitives_. Independent of any formal role in the process, I have and
will continue to champion these causes. My nomination by the jQuery Foundation to serve on the TAG only allows me to
advocate them in a more formal role.

As a web developer myself, I experience the joys and disappointments of our platform every day. Some of you might think
it's all disappointments—and I can certainly sympathize, given our
[day-to-day frustrations](https://twitter.com/domenic/status/403668805542354944). But one of the more eye-opening
experiences of the last few months has been working alongside an experienced Java developer, new to the web platform,
and seeing his almost childlike glee at how _easy_ it is to produce complex, interactive, and robust UIs. More
generally, when I think on what I actually do for a living at Lab49—produce complex financial trading and analysis
systems, built on the open web platform—it's hard not to be amazed. We've come a long way from the time when only
desktop apps were considered for serious work. Now all our clients want cross-browser and cross-device web applications,
that they can access from any computer at any time, with shareable URLs and responsive experiences and all the other
things that come with the web.

To enable developers to build such increasingly powerful experiences, we need to listen to them. That's why I spend a
lot of time speaking at and traveling to developer conferences, or being involved on Twitter, on IRC, and on GitHub,
with the community. I recently gave a talk specifically on
[how to get involved in web standards](https://www.youtube.com/watch?v=hneN6aW-d9w&hd=1), and have been working
constantly to get developer feedback on missing features or in-progress specs since then.

Developers are a tricky bunch, as many have been trained to ignore standards bodies and simply hack together their own
solutions. They're used to being ignored themselves. But times are changing. The
[extensible web manifesto](http://extensiblewebmanifesto.org/) guides us to supply the web with the low-level features
developers need, and then to listen to them and roll what they build back into the platform. The TAG's role is helping
to guide this overall process, and I hope to bring along my experience listening to and learning from the developer
community.

You may have noticed I kept saying "developers" above, and never "web developers." That's because I strongly believe we
need to look outside our own community for inspiration. There are lessons to be learned everywhere across the software
development landscape, from other UI frameworks and standard libraries, to other languages whose features we need in our
platform's _lingua franca_ of JavaScript. Perhaps most importantly, I maintain strong ties with and involvement in the
Node.js community. They provide an excellent source of inspiration and advice, as a platform that takes JavaScript far
beyond where many of us would have envisioned it only a few years ago.

Which brings us to the issue of low-level primitives. Node's great success comes in a large part from its focus on
providing such primitives: things like standard patterns for binary data, for asynchrony, or for streaming. On top of
these they've built [a standard library](http://nodejs.org/api/) that should be the envy of any platform in both its
small size and in its power.

Of course, the web platform must by necessity evolve via consensus, and so more slowly than Node. But this gives us the
benefit of watching them run out ahead of us, make mistakes, and then come back with field reports on how it went. As
such we are getting typed arrays instead of buffers; promises instead of error-first callbacks; and
[intelligently-designed streams](https://github.com/whatwg/streams/) instead of backward-compatible evolved ones. And
it's no coincidence that I've been involved in both the promises and streams efforts, as I'm very passionate about
ensuring that these foundational pieces of the platform are solid enough to build on and have learned from experiences
implementing them elsewhere.

But we're still in our infancy when it comes to building on these primitives. We need to tie them together with the rest
of the web platform. In short, we need to get to the day when the

```js
http.get("http://example.com/video.mp4")
    .pipe(videoProcessingWebWorker)
    .pipe(document.query("video"))
```

[example](https://github.com/whatwg/streams/blob/master/Requirements.md#you-must-be-able-to-transform-streams-via-the-pipe-chain)
is not just a dream, but is reality.

In my view, it's the TAG's job to get us there. The cross-group coordination issues necessary to make visions like this
a reality are a large part of the TAG's charter. We can provide a high-level vision, fueled by our interaction with the
developer community, for extending the web forward. And all the while, I'll be down in the trenches, both gathering
feedback to help shape this vision, and working on specifications and interfacing with implementers to make it happen.

If this sounds like progress to you, I'd appreciate your organization's vote.
