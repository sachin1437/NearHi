import type { Metadata } from "next";
import NhSprite from "@/components/NhSprite";

export const metadata: Metadata = {
  title: 'Privacy Policy | NearHi',
  description: 'What NearHi handles, why, and which services are involved.',
  alternates: { canonical: "/privacy/" },
};

export default function Page() {
  return (
<><NhSprite />
<header><a className="brand" href="/" aria-label="NearHi home"><span className="badge" aria-hidden="true"><svg viewBox="0 0 645 554"><use href="#nh-mark" /></svg></span>NearHi</a></header>
<main>
<h1>Privacy Policy</h1>
<p className="meta">Last updated: November 2026</p>
<p>NearHi lets two adults talk by video and text. This page says what the service handles and why. There is no account, so we never ask for your name, email address or phone number.</p>

<h2>What we handle</h2>
<ul>
  <li><strong>Your location.</strong> When you press Start, your browser shares your device&apos;s position, with your permission, and how accurate your device says it is, so we can find people roughly inside the distance you chose. Because device locations are often off by a few kilometres, people slightly outside your distance can be matched with you. It is held while you wait and removed when you are matched, skip, stop, or disconnect. The other person is never told it.</li>
  <li><strong>A random browser ID.</strong> The first time you visit, your browser makes a random ID and keeps it in its own storage. It is not linked to your name or to any account. We use it to recognise a browser that has been blocked for breaking the rules, and to attach reports to the right browser.</li>
  <li><strong>A scrambled version of your IP address.</strong> We scramble your IP address with a secret value and never store the readable address. While you are connected the scrambled version is held in memory. It is saved only if someone reports you, or if you are blocked.</li>
  <li><strong>Chat messages.</strong> They pass through our server so they can reach the other person, and we do not store them. Each message is also sent to OpenAI&apos;s moderation service for an automatic safety check. If a message is flagged it is not delivered, and a counter against your random browser ID goes up. The text itself is not kept.</li>
  <li><strong>Video and audio.</strong> They travel between the two browsers, encrypted. We do not record them. If two browsers cannot connect directly, the call is relayed through a relay service instead, still encrypted, and still not recorded by us.</li>
  <li><strong>Safety screening of video.</strong> During a call, your browser takes a small still image of the other person&apos;s video every few seconds and sends it to our server. The server passes it to OpenAI&apos;s moderation service and discards it. We do not save these images. If one is flagged, the call ends and the other person&apos;s browser ID is flagged for review. Automatic screening makes mistakes in both directions.</li>
  <li><strong>Reports.</strong> When you press Report, or the screening flags something, we store the reported browser&apos;s random ID and scrambled IP address, the reporter&apos;s random ID, a short reason and the time. Reports are kept until they are reviewed, and only the newest 500 are kept.</li>
  <li><strong>Visit and usage counts.</strong> To see how many people use NearHi, each page load sends a small note to our own server. The server counts your random browser ID through a counter that cannot be read back, mixed with a secret that changes every day, so a visit cannot be tied to you or followed from one day to the next. It also counts which page was opened and which website or link tag you arrived from, and it keeps running totals such as searches, matches, messages, and whether video connected. These are totals only. No message text, location or video is part of them. If you would rather not be counted, you can block requests to <code>/hit</code> with a content blocker.</li>
  <li><strong>Blocks.</strong> A blocked random ID or scrambled IP address stays on a block list until the block is removed.</li>
</ul>

<div className="note"><strong>Your network address is visible during a call.</strong> Because video connects your browser directly to the other person&apos;s, they can see your IP address, which can reveal roughly where you are, such as your city or internet provider. This is how direct video calls work. If that worries you, use a VPN, or do not start a call.</div>

<h2>Services we rely on</h2>
<ul>
  <li><strong>Amazon Web Services</strong> hosts the site and its database on a server in Sydney, Australia, so the data described above is processed outside India.</li>
  <li><strong>Cloudflare</strong> sits in front of the site to protect it and speed it up, so your requests, including your IP address, pass through its network.</li>
  <li><strong>Metered</strong> may relay calls that cannot connect directly. In that case your video and audio pass through its servers, still encrypted, and it sees your IP address.</li>
  <li><strong>OpenAI</strong> runs the automatic checks on chat messages and video stills. Their own policies apply to what they receive.</li>
  <li><strong>Google</strong> runs a public server that helps browsers find each other for direct calls. It sees your IP address when your browser contacts it.</li>
  <li><strong>GoDaddy</strong> provides the domain name.</li>
</ul>
<p>We do not use advertising or third-party analytics, and fonts are served from our own site. We set no cookies ourselves, but Cloudflare may set a small security cookie to tell real visitors from automated bots. The counting described above runs on our own server.</p>

<h2>Your choices</h2>
<ul>
  <li>Clearing your browser&apos;s site data gives you a new random ID. This is also how a blocked browser could come back, which is a known limit of having no accounts.</li>
  <li>If you refuse location or camera access, NearHi cannot work, because matching needs your location and calls need your camera.</li>
  <li>To ask a question, or to ask us to look at a report or block that involves you, write to <a href="mailto:nearhi.in@gmail.com">nearhi.in@gmail.com</a>. Since we hold nothing tied to your identity, we may need the random browser ID to find a record.</li>
</ul>

<h2>Under 18</h2>
<p>NearHi is for adults only. We cannot check age, so please do not use it if you are under 18. If you think a minor is using it, tell us at <a href="mailto:nearhi.in@gmail.com">nearhi.in@gmail.com</a>.</p>

<h2>Changes</h2>
<p>If this page changes, the date at the top will change with it.</p>
</main>
<footer>
  <a href="/">Home</a><a href="/terms/">Terms of Use</a><a href="/talk/">Start talking</a>
</footer></>
  );
}
