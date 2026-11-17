"use client";

import { ArrowRight, ArrowUp, Mail } from "lucide-react";
import { Logo } from "./ui";

const columns = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "#features" },
      { label: "How it works", href: "#how-it-works" },
      { label: "Why NearHi", href: "#why" },
      { label: "Safety", href: "#safety" },
      { label: "FAQ", href: "#faq" },
    ],
  },
  {
    title: "Chat",
    links: [
      { label: "Start chatting", href: "/talk/" },
      { label: "Pick a distance", href: "#how-it-works" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "nearhi.in@gmail.com", href: "mailto:nearhi.in@gmail.com" },
      { label: "Get help", href: "mailto:nearhi.in@gmail.com?subject=NearHi%20support" },
      { label: "Report a problem", href: "mailto:nearhi.in@gmail.com?subject=Report%20a%20problem" },
      { label: "Blocked by mistake?", href: "mailto:nearhi.in@gmail.com?subject=Blocked%20by%20mistake" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Terms of Use", href: "/terms/" },
      { label: "Privacy Policy", href: "/privacy/" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="noise relative overflow-hidden border-t border-white/8 bg-ink pt-16 pb-8 text-paper sm:pt-20">
      <div
        className="pointer-events-none absolute -top-40 left-1/3 h-80 w-80 rounded-full bg-violet/15 blur-[100px]"
        aria-hidden="true"
      />
      <div className="relative z-10 mx-auto max-w-[1240px] px-5 sm:px-7 lg:px-10">
        <div className="grid gap-12 border-b border-white/10 pb-12 lg:grid-cols-[1.15fr_1.85fr] lg:gap-16">
          <div>
            <Logo tone="dark" />
            <p className="mt-5 max-w-xs text-[13.5px] leading-relaxed text-paper/50">
              Random video and text chat with people close to home. Pick your distance, say hi,
              skip any time.
            </p>

            <a
              href="mailto:nearhi.in@gmail.com"
              className="group mt-7 inline-flex items-center gap-2.5 rounded-full border border-white/12 bg-white/[0.055] py-2 pr-4 pl-2 text-[12.5px] text-paper/75 transition-colors hover:border-lime/50 hover:text-paper"
            >
              <span className="grid h-8 w-8 place-items-center rounded-full bg-lime text-ink transition-transform duration-300 group-hover:scale-105">
                <Mail className="h-4 w-4" aria-hidden="true" />
              </span>
              Say hi: nearhi.in@gmail.com
            </a>
            <p className="mt-4 max-w-xs text-[10.5px] leading-relaxed text-paper/35">
              To report someone during a chat, use the Report button in the call. For adults only,
              you must be 18 or older.
            </p>
          </div>

          <nav aria-label="Footer" className="grid grid-cols-2 gap-x-6 gap-y-9 sm:grid-cols-4">
            {columns.map((column) => (
              <div key={column.title}>
                <h2 className="text-[10px] font-semibold tracking-[0.14em] text-paper/35 uppercase">
                  {column.title}
                </h2>
                <ul className="mt-4 space-y-2.5">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        className="group inline-flex items-center gap-1 text-[12.5px] text-paper/60 transition-colors duration-200 hover:text-paper"
                      >
                        {link.label}
                        {link.href.startsWith("mailto") ? (
                          <ArrowRight
                            className="h-2.5 w-2.5 opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:opacity-100"
                            aria-hidden="true"
                          />
                        ) : null}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className="pointer-events-none select-none pt-10" aria-hidden="true">
          <p className="font-display text-[clamp(3.9rem,14vw,10.5rem)] leading-[0.75] font-bold tracking-[-0.065em] text-paper/[0.055]">
            stay near.
          </p>
        </div>

        <div className="relative z-10 -mt-2 flex flex-col items-start justify-between gap-4 border-t border-white/10 pt-6 sm:flex-row sm:items-center">
          <div className="flex flex-col gap-1.5 text-[10.5px] text-paper/35 sm:flex-row sm:items-center sm:gap-4">
            <p>© {new Date().getFullYear()} NearHi. All rights reserved.</p>
            <p className="hidden items-center gap-1.5 sm:flex">
              <span className="h-1 w-1 rounded-full bg-paper/25" aria-hidden="true" />
              Made in India
            </p>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="#top"
              aria-label="Back to top"
              className="group grid h-8 w-8 place-items-center rounded-full border border-white/12 text-paper/50 transition-colors hover:border-lime/40 hover:text-lime"
            >
              <ArrowUp
                className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-y-0.5"
                aria-hidden="true"
              />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
