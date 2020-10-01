---
layout: post
title: "DigitalOcean's Hacktoberfest is Hurting Open Source"
date: 2020-09-30T21:00:00Z
comments: true
categories: [Open Source]
---

For the last couple of years, [DigitalOcean](https://www.digitalocean.com/) has run
[Hacktoberfest](https://hacktoberfest.digitalocean.com/), which purports to "support open source" by giving free
t-shirts to people who send pull requests to open source repositories.

In reality, **Hacktoberfest is a corporate-sponsored distributed denial of service attack against the open source
maintainer community**.

So far today, on [a single repository](https://github.com/whatwg/html/pulls?q=is%3Apr+is%3Aclosed+label%3Aspam), myself
and fellow maintainers have closed 11 spam pull requests. Each of these generates notifications, often email, to the 485
watchers of the repository. And each of them requires maintainer time to visit the pull request page, evaluate its
spamminess, close it, tag it as spam, lock the thread to prevent further spam comments, and then report the spammer to
GitHub in the hopes of stopping their time-wasting rampage.

The rate of spam pull requests is, at this time, around four per hour. _And it's not even October yet in my timezone._

![A screenshot showing a spam query for the whatwg/html repository, which is at this time up to 14 spam PRs](/images/hacktoberfest-spam-listing.png)

Myself and other maintainers of the whatwg/html repository are not alone in suffering this deluge.
[My tweet](https://twitter.com/gravitystorm/status/1311386082982924289) got commiseration from
[OpenStreetMap, phpMyAdmin](https://mobile.twitter.com/gravitystorm/status/1311386082982924289),
[PubCSS](https://mobile.twitter.com/ulmerleben/status/1311378655231332355),
[GitHub, the Financial Times](https://mobile.twitter.com/JakeDChampion/status/1311389420638138370),
[ESLint](https://twitter.com/slicknet/status/1311377444188770312), a
[computer club website](https://mobile.twitter.com/zekjur/status/1311411780162326531), and
[a conference website](https://mobile.twitter.com/juliusvolz/status/1311412919196844038), just within the first couple
of hours. Since then a dedicated account "[@shitoberfest](https://twitter.com/shitoberfest)" has arisen to document the
barrage. Some [cursory](https://github.com/search?q=is%3Apr+%22improve+docs%22+created%3A%3E2020-09-29&type=Issues)
[searches](https://github.com/search?q=is%3Apr+label%3Ainvalid+created%3A%3E2020-09-29&type=Issues) show thousands of
spam pull requests, and rising.

DigitalOcean seems to be aware that they have a spam problem. Their solution, per their
[FAQ](https://hacktoberfest.digitalocean.com/faq), is to put the burden solely on the shoulders of maintainers. If we go
out of our way to tag a contribution as spam, then... we slightly decrease the chance of the spammer getting their free
t-shirt. In reality, the spammer will just keep going, submitting more pull requests to more repositories, until they
finally find a repository where the maintainer doesn't bother to tag the PR as spam, or where the maintainer isn't
available during the seven-day window DigitalOcean uses for spam-tracking.

To be clear, myself and my fellow maintainers did not ask for this. This is not an opt-in situation. If your open source
project is public on GitHub, DigitalOcean will incentivize people to spam you. There is no consent involved. Either we
contribute to DigitalOcean's marketing project, or,
[they suggest, we should quit open source](https://twitter.com/SudoFox/status/1311431141702819840).

Hacktoberfest does not support open source. Instead, it drives open source maintainers even closer to
[burnout](https://www.google.com/search?q=open+source+burnout).

![A screenshot of a spam PR which adds the heading "Great Work" to the HTML Standard README](/images/hacktoberfest-spam-pr.png)

## What can we do?

My most fervent hope is that DigitalOcean will see the harm they are doing to the open source community, and put an end
to Hacktoberfest. I hope they can do it as soon as possible, before October becomes another lowpoint in the hell-year
that is 2020. In 2021, they could consider relaunching it as an opt-in project, where maintainers consent on a
per-repository basis to deal with such t-shirt–incentivized contributors.

To protect ourselves, maintainers have a few options. First, you can take the feeble step of ensuring that any spam
against your repositories doesn't contribute to the spammer's "t-shirt points", by tagging pull requests with a "spam"
label, and [emailing hacktoberfest@digitalocean.com](https://twitter.com/MattIPv4/status/1311390498888781824).
DigitalOcean themselves, however, admit that
[this won't stop the problem they've unleashed on us](https://twitter.com/MattIPv4/status/1311390054334554113). But
maybe it will contribute to the [metrics](https://github.com/MattIPv4/hacktoberfest-data) they collect, which last year
showed that "only" 3,712 pull requests were labeled as spam by project maintainers.

If you're comfortable cutting off genuine contributions from new users, you can try enabling GitHub's
[interaction limits](https://docs.github.com/en/free-pro-team@latest/github/building-a-strong-community/limiting-interactions-in-your-repository).
However, you have to do this every 24 hours, and it has the drawback of also disabling issue creation and comments.

Another promising route would be if GitHub would cut off DigitalOcean's API access, as
[Andrew Ayer has suggested](https://twitter.com/__agwa/status/1311399074814472194). It's not clear whether DigitalOcean
is committing a terms of service violation that would support such measures. But they're certainly making GitHub a
less-pleasant place to be, and I hope GitHub can think seriously about how to discourage such corporate-sponsored
attacks on the open source community.

Finally, and most importantly, we can remember that this is how DigitalOcean treats the open source maintainer
community, and stay away from their products going forward. Although we've enjoyed using them for hosting the
[WHATWG](https://whatwg.org/) standards organization, this kind of behavior is not something we want to support, so
we're starting to investigate alternatives.
