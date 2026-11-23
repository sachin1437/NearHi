import type { Metadata } from "next";
import NhSprite from "@/components/NhSprite";

export const metadata: Metadata = {
  title: 'Terms of Use | NearHi',
  description: 'The rules for using NearHi.',
  alternates: { canonical: "/terms/" },
};

export default function Page() {
  return (
<><NhSprite />
<header><a className="brand" href="/" aria-label="NearHi home"><span className="badge" aria-hidden="true"><svg viewBox="0 0 645 554"><use href="#nh-mark" /></svg></span>NearHi</a></header>
<main>
<h1>Terms of Use</h1>
<p className="meta">Last updated: October 2026</p>
<p>By using NearHi you agree to these terms. If you do not agree, please do not use it.</p>

<h2>Who can use it</h2>
<p>You must be 18 or older. By pressing Start you confirm that you are. We cannot verify age, and if we learn that someone is under 18 we will block them.</p>

<h2>What NearHi is</h2>
<p>NearHi connects you with strangers for video and text chat. We do not know who they are and cannot vouch for them. You decide what to say and show, and you can skip or stop at any moment.</p>

<h2>Rules</h2>
<p>Do not use NearHi to:</p>
<ul>
  <li>show or send nudity or sexual content;</li>
  <li>involve minors in anything sexual. This is never allowed, and we will cooperate with law enforcement;</li>
  <li>harass, threaten, or spread hate against anyone;</li>
  <li>share someone&apos;s personal details, or record, screenshot or share a call without the other person&apos;s consent;</li>
  <li>pretend to be someone else, or break the law;</li>
  <li>send spam or advertising, or use automated tools;</li>
  <li>try to get around a block or the safety checks.</li>
</ul>

<h2>Safety checks and blocking</h2>
<p>Messages and video stills are checked automatically. We may block a message, end a call, or block a browser or network at any time, with or without notice. The checks are not perfect: they can miss things and can wrongly flag things. If you think you were blocked by mistake, write to <a href="mailto:support@nearhi.in">support@nearhi.in</a>.</p>

<h2>Reporting</h2>
<p>Press Report during a call to flag the other person. We review reports when we can, but no one watches calls live. In an emergency, contact your local emergency services.</p>

<h2>Staying safe</h2>
<ul>
  <li>Keep your name, address, school, workplace and phone number to yourself.</li>
  <li>Never send money, and be wary of anyone who asks.</li>
  <li>We strongly suggest not arranging to meet someone in person.</li>
  <li>If anything feels wrong, press Skip or Stop, then Report.</li>
</ul>

<h2>Your responsibility</h2>
<p>You are responsible for what you say and show. Other users are responsible for what they say and show, and we are not responsible for their behaviour.</p>

<h2>No guarantees</h2>
<p>NearHi is provided as it is, without promises. It may be unavailable or change at any time, and video quality depends on your connection. To the extent the law allows, we are not liable for losses that come from using NearHi or from what other users do.</p>

<h2>Privacy</h2>
<p>How your information is handled is described in the <a href="/privacy/">Privacy Policy</a>.</p>

<h2>Changes and contact</h2>
<p>If these terms change, the date at the top will change with it. Questions: <a href="mailto:hello@nearhi.in">hello@nearhi.in</a>.</p>
</main>
<footer>
  <a href="/">Home</a><a href="/privacy/">Privacy Policy</a><a href="/talk/">Start talking</a>
</footer></>
  );
}
