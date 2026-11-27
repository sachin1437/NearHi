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
<p>NearHi lets adults talk by video and text. This page says what the service handles and why. NearHi has two parts. Random chat at <code>/talk/</code> needs no account, and we never ask for your name, email address or phone number there. Rooms need a Google sign-in, so they handle more, and the section on rooms below covers it.</p>

<h2>Random chat (no account)</h2>
<ul>
  <li><strong>Your location.</strong> When you press Start, your browser shares your device&apos;s position, with your permission, and how accurate your device says it is, so we can find people roughly inside the distance you chose. Because device locations are often off by a few kilometres, people slightly outside your distance can be matched with you. It is held while you wait and removed when you are matched, skip, stop, or disconnect. The other person is never told it.</li>
  <li><strong>A random browser ID.</strong> The first time you visit, your browser makes a random ID and keeps it in its own storage. It is not linked to your name or to any account. We use it to recognise a browser that has been blocked for breaking the rules, and to attach reports to the right browser.</li>
  <li><strong>A scrambled version of your IP address.</strong> We scramble your IP address with a secret value and never store the readable address in the app. While you are connected the scrambled version is held in memory. It is saved only if someone reports you, or if you are blocked. The web server&apos;s own logs are different, see &quot;Server logs&quot; below.</li>
  <li><strong>Chat messages.</strong> They pass through our server so they can reach the other person, and we do not store them. Each message is also sent to OpenAI&apos;s moderation service for an automatic safety check. If a message is flagged it is not delivered, and a counter against your random browser ID goes up. The text itself is not kept.</li>
  <li><strong>Video and audio.</strong> They travel between the two browsers, encrypted. We do not record them. If two browsers cannot connect directly, the call is relayed through a relay service instead, still encrypted, and still not recorded by us.</li>
  <li><strong>Safety screening of video.</strong> During a call, your browser takes a small still image of the other person&apos;s video every few seconds and sends it to our server. The server passes it to OpenAI&apos;s moderation service and discards it. We do not save these images. If one is flagged, the call ends and the other person&apos;s browser ID is flagged for review. Automatic screening makes mistakes in both directions.</li>
  <li><strong>Reports.</strong> When you press Report, or the screening flags something, we store the reported browser&apos;s random ID and scrambled IP address, the reporter&apos;s random ID, a short reason and the time. Reports are kept until they are reviewed, and only the newest 500 are kept.</li>
  <li><strong>Visit and usage counts.</strong> To see how many people use NearHi, each page load sends a small note to our own server. The server counts your random browser ID through a counter that cannot be read back, mixed with a secret that changes every day, so a visit cannot be tied to you or followed from one day to the next. It also counts which page was opened and which website or link tag you arrived from, and it keeps running totals such as searches, matches, messages, and whether video connected. These are totals only. No message text, location or video is part of them. If you would rather not be counted, you can block requests to <code>/hit</code> with a content blocker.</li>
  <li><strong>Blocks.</strong> A blocked random ID or scrambled IP address stays on a block list until the block is removed.</li>
</ul>

<h2>Rooms (Google sign-in)</h2>
<p>Rooms are group video or text chats run by an owner. You must sign in with Google to join or create one.</p>
<ul>
  <li><strong>What Google gives us.</strong> When you sign in, Google tells us your Google account ID, your email address, your name and a link to your profile picture. We keep them so you can sign in again. We never see or store your Google password. We use this information only to run your NearHi account. We do not sell it, share it for advertising, or use it for anything else.</li>
  <li><strong>What you add.</strong> You choose a username of 3 to 20 letters, numbers or underscores, which cannot be changed later. You can add a short bio of up to 140 characters. We also store the time you confirmed you are 18 or older, and the time your account was created.</li>
  <li><strong>What other people in a room see.</strong> Your username, and whether your microphone and camera are on. They do not see your email address, name, picture or bio.</li>
  <li><strong>Your sign-in.</strong> After you sign in, we set one cookie called <code>nh_session</code> that keeps you signed in for 30 days or until you sign out. We store only a scrambled version of its value. It is used for nothing else.</li>
  <li><strong>Room details.</strong> We store each room&apos;s code, title, rules, type (video or text), size limit, whether it needs approval, whether it is public or private, whether it is locked, its owner&apos;s account ID and username, the account IDs the owner has banned, and the time it was created and last used. A room is kept until its owner deletes it, or until nobody has been inside for 10 days, and then it is deleted. Deleting an account also deletes the rooms that account owns.</li>
  <li><strong>Room chat.</strong> Messages pass through our server to reach the other people in the room and are not stored. In public rooms each message gets the same automatic OpenAI safety check as random chat. Private rooms are not filtered for language, so the owner and members are responsible for what is said there.</li>
  <li><strong>Room video.</strong> In a room, everyone connects directly to everyone else, up to six people, so every member can see the network address of every other member (see the note below). The same still-image screening as in random chat runs in rooms, public or private. If a still is flagged, the person is removed from the room, and after three flags the account is blocked from rooms.</li>
  <li><strong>Reports and blocks.</strong> When you report someone in a room, or screening flags them, we store the reported account&apos;s ID and scrambled IP address, the reporter&apos;s account ID, a short reason and the time, with the same limits as in random chat. A blocked account ID stays on the block list until the block is removed.</li>
  <li><strong>Deleting your account.</strong> On the Rooms page, the Delete account button removes your account details, your sign-in sessions, and the rooms you own. Reports and blocks that involve your account ID are not removed, because they exist to keep other people safe.</li>
</ul>

<div className="note"><strong>Your network address is visible during a call.</strong> Because video connects your browser directly to the other people, they can see your IP address, which can reveal roughly where you are, such as your city or internet provider. This is how direct video calls work. If that worries you, use a VPN, or do not start a call.</div>

<h2>Server logs</h2>
<p>Like most websites, our web server writes a log of every request. Each entry has your IP address, the time, the page or address requested and the browser type. We use it to keep the service secure and to investigate abuse. These logs are kept for about 14 days and then deleted. Cloudflare, which sits in front of the site, also sees these requests under its own policies.</p>

<h2>Services we rely on</h2>
<ul>
  <li><strong>Amazon Web Services</strong> hosts the site and its database on a server in Sydney, Australia, so the data described above is processed outside India.</li>
  <li><strong>Cloudflare</strong> sits in front of the site to protect it and speed it up, so your requests, including your IP address, pass through its network.</li>
  <li><strong>Google</strong> provides the sign-in for rooms, so Google knows you use NearHi when you sign in, and loads a sign-in button from its servers. Google also runs a public server that helps browsers find each other for direct calls, and it sees your IP address when your browser contacts it.</li>
  <li><strong>Metered</strong> may relay calls that cannot connect directly. In that case your video and audio pass through its servers, still encrypted, and it sees your IP address.</li>
  <li><strong>OpenAI</strong> runs the automatic checks on chat messages, usernames, bios and video stills. Their own policies apply to what they receive.</li>
  <li><strong>GoDaddy</strong> provides the domain name.</li>
</ul>
<p>We do not use advertising or third-party analytics, and fonts are served from our own site. Apart from the <code>nh_session</code> cookie described above, which is set only when you sign in, we set no cookies ourselves. Cloudflare may set a small security cookie to tell real visitors from automated bots. The counting described above runs on our own server.</p>

<h2>Your choices and rights</h2>
<ul>
  <li>Clearing your browser&apos;s site data gives you a new random ID in random chat. This is also how a blocked browser could come back, which is a known limit of having no accounts there.</li>
  <li>If you refuse location or camera access, NearHi cannot work, because matching needs your location and calls need your camera.</li>
  <li>You can see your account details on the Rooms page and delete your account there at any time.</li>
  <li>You can ask us what we hold about you, ask us to correct it, or ask us to erase it, by writing to the address below. Since random chat holds nothing tied to your identity, we may need your random browser ID to find a record.</li>
</ul>

<h2>Complaints and contact</h2>
<p>Grievance Officer: the Founder of NearHi, <a href="mailto:founder@nearhi.in">founder@nearhi.in</a>. Write there about any complaint about the service. For privacy questions and requests about your data, you can also write to <a href="mailto:privacy@nearhi.in">privacy@nearhi.in</a>. For a report or block that involves you, write to <a href="mailto:report@nearhi.in">report@nearhi.in</a>. For general help, write to <a href="mailto:support@nearhi.in">support@nearhi.in</a>. We will acknowledge your message within 24 hours and aim to resolve it within 15 days.</p>

<h2>Under 18</h2>
<p>NearHi is for adults only. We cannot check age in random chat, so please do not use it if you are under 18. Rooms ask you to confirm that you are 18 or older. If you think a minor is using NearHi, tell us at <a href="mailto:report@nearhi.in">report@nearhi.in</a>.</p>

<h2>Changes</h2>
<p>If this page changes, the date at the top will change with it.</p>
</main>
<footer>
  <a href="/">Home</a><a href="/terms/">Terms of Use</a><a href="/talk/">Start talking</a>
</footer></>
  );
}