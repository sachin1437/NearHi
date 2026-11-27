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
<p className="meta">Last updated: November 2026</p>
<p>By using NearHi you agree to these terms. If you do not agree, please do not use it.</p>

<h2>Who can use it</h2>
<p>You must be 18 or older. By pressing Start, or by confirming it when you create a rooms account, you confirm that you are. We cannot verify age, and if we learn that someone is under 18 we will block them.</p>

<h2>What NearHi is</h2>
<p>NearHi connects you with other people for video and text chat, either one at a time with a stranger (random chat) or in group rooms run by an owner. We do not know who they are and cannot vouch for them. You decide what to say and show, and you can skip, stop or leave at any moment.</p>

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
<p>These rules apply everywhere on NearHi, including private rooms.</p>

<h2>Accounts</h2>
<p>Rooms need an account, and you sign in with Google. You pick a username once, and it cannot be changed. Do not choose a name that copies someone else or suggests you are NearHi staff. You are responsible for what happens under your account, so do not share your sign-in. One person may use one account. You can delete your account at any time from the Rooms page. We may suspend or remove an account that breaks these terms, with or without notice.</p>

<h2>Rooms</h2>
<ul>
  <li>A room has an owner, who sets its title and rules, can remove or ban people, can lock it, and can choose whether people need approval to enter. The owner is responsible for running the room, and everyone in it must follow both the owner&apos;s rules and these terms. The owner&apos;s rules cannot permit anything these terms forbid.</li>
  <li>Public rooms are listed, and their chat gets an automatic language check. Private rooms are not listed and their chat is not filtered. Private does not mean allowed: the rules above still apply, and still-image screening of video runs in every room.</li>
  <li>Video in rooms connects every member directly to every other member, so everyone in a room can see the network addresses of the others. Only join rooms you are comfortable with.</li>
  <li>A room is deleted when its owner deletes it, when its owner&apos;s account is deleted, or after 10 days with nobody inside. We may also close a room that breaks these terms. We do not keep room chat, so nothing is lost if a room is closed except its settings.</li>
</ul>

<h2>Safety checks and blocking</h2>
<p>Messages, usernames, bios and video stills are checked automatically. We may block a message, end a call, remove someone from a room, or block an account, browser or network at any time, with or without notice. The checks are not perfect: they can miss things and can wrongly flag things. If you think you were blocked by mistake, write to <a href="mailto:support@nearhi.in">support@nearhi.in</a>.</p>

<h2>Reporting</h2>
<p>Press Report during a call or in a room to flag the other person. We review reports when we can, but no one watches calls live. If someone has shared intimate images of you without your consent, write to <a href="mailto:report@nearhi.in">report@nearhi.in</a> straight away and we will act on it as fast as we can. In an emergency, contact your local emergency services.</p>

<h2>Staying safe</h2>
<ul>
  <li>Keep your name, address, school, workplace and phone number to yourself.</li>
  <li>Never send money, and be wary of anyone who asks.</li>
  <li>We strongly suggest not arranging to meet someone in person.</li>
  <li>If anything feels wrong, press Skip, Stop or Leave, then Report.</li>
</ul>

<h2>Your responsibility</h2>
<p>You are responsible for what you say and show. Other users and room owners are responsible for what they say and show, and we are not responsible for their behaviour.</p>

<h2>No guarantees</h2>
<p>NearHi is provided as it is, without promises. It may be unavailable or change at any time, and video quality depends on your connection. To the extent the law allows, we are not liable for losses that come from using NearHi or from what other users do.</p>

<h2>Privacy</h2>
<p>How your information is handled is described in the <a href="/privacy/">Privacy Policy</a>.</p>

<h2>Complaints</h2>
<p>Grievance Officer: the Founder of NearHi, <a href="mailto:founder@nearhi.in">founder@nearhi.in</a>. We will acknowledge a complaint within 24 hours and aim to resolve it within 15 days.</p>

<h2>Law</h2>
<p>These terms are governed by the laws of India.</p>

<h2>Changes and contact</h2>
<p>If these terms change, the date at the top will change with it. Questions: <a href="mailto:support@nearhi.in">support@nearhi.in</a>.</p>
</main>
<footer>
  <a href="/">Home</a><a href="/privacy/">Privacy Policy</a><a href="/talk/">Start talking</a>
</footer></>
  );
}