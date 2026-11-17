import type { Metadata } from "next";
import NhSprite from "@/components/NhSprite";
import { Navbar } from "@/components/site/Navbar";
import { Hero } from "@/components/site/Hero";
import { SocialProof } from "@/components/site/SocialProof";
import { Features } from "@/components/site/Features";
import { Showcase } from "@/components/site/Showcase";
import { Benefits } from "@/components/site/Benefits";
import { Safety } from "@/components/site/Safety";
import { Free } from "@/components/site/Free";
import { FAQ } from "@/components/site/FAQ";
import { CTA } from "@/components/site/CTA";
import { Footer } from "@/components/site/Footer";
import "./site.css";

const TITLE = "NearHi: meet new people close to home";
const SHORT = "Video and text chat with someone new, inside the distance you choose. No account, no profile.";

export const metadata: Metadata = {
  title: TITLE,
  description: SHORT + " Free, in your browser.",
  alternates: { canonical: "/" },
  robots: { index: true, follow: true, "max-image-preview": "large" },
  openGraph: {
    type: "website",
    siteName: "NearHi",
    title: TITLE,
    description: SHORT,
    url: "https://nearhi.in/",
    locale: "en",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image", title: TITLE, description: SHORT, images: ["/og-image.png"] },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "WebSite", "@id": "https://nearhi.in/#website", url: "https://nearhi.in/", name: "NearHi", inLanguage: "en" },
    {
      "@type": "WebApplication",
      "@id": "https://nearhi.in/#app",
      name: "NearHi",
      url: "https://nearhi.in/",
      description: "Radius-based random video and text chat. Pick a distance and meet someone new nearby. No account, no profile.",
      applicationCategory: "SocialNetworkingApplication",
      operatingSystem: "Any (web browser)",
      isAccessibleForFree: true,
      offers: { "@type": "Offer", price: "0", priceCurrency: "INR" },
      audience: { "@type": "PeopleAudience", suggestedMinAge: 18 },
    },
  ],
};

export default function Home() {
  return (
    <div id="top" className="relative min-h-screen overflow-x-clip bg-paper">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <noscript>
        <style>{".reveal{opacity:1!important;transform:none!important}.enter-up,.enter-scale{animation:none!important}"}</style>
      </noscript>
      <NhSprite />
      <a
        href="#main-content"
        className="sr-only z-[120] rounded-full bg-ink px-5 py-3 text-[13px] font-semibold text-paper focus:not-sr-only focus:fixed focus:top-4 focus:left-4"
      >
        Skip to content
      </a>
      <Navbar />
      <main id="main-content">
        <Hero />
        <SocialProof />
        <Features />
        <Showcase />
        <Benefits />
        <Safety />
        <Free />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
