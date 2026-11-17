"use client";

import { ArrowUpRight, Check, CreditCard, Lock, Smartphone } from "lucide-react";
import { cn } from "@/lib/cn";
import { Eyebrow, Reveal, limeButton } from "./ui";

const included = [
  "Video chat with someone near you",
  "Text chat alongside the video",
  "Distance from 10 km to anywhere, or your own number",
  "Skip, stop and report, any time",
  "Works in your phone or laptop browser",
];

export function Free() {
  return (
    <section id="free" className="relative scroll-mt-24 py-20 sm:py-28 lg:py-32">
      <div className="mx-auto max-w-[1240px] px-5 sm:px-7 lg:px-10">
        <div className="mx-auto max-w-2xl text-center">
          <Reveal>
            <Eyebrow>What it costs</Eyebrow>
            <h2 className="h-display mt-4 text-[clamp(2.4rem,6.2vw,3.9rem)] text-balance">
              Free. Right now.{" "}
              <span className="serif-accent text-violet-dark">Really.</span>
            </h2>
            <p className="mx-auto mt-5 max-w-md text-[15px] leading-relaxed text-muted">
              There is nothing to buy and no card to enter. You don&apos;t even need an account.
            </p>
          </Reveal>
        </div>

        <Reveal delay={100} scale className="mx-auto mt-12 max-w-[640px]">
          <div
            className={cn(
              "noise relative overflow-hidden rounded-[28px] border border-white/10 bg-ink p-6 text-paper shadow-soft sm:p-9",
            )}
          >
            <div
              className="pointer-events-none absolute -top-24 -right-16 h-60 w-60 rounded-full bg-violet/40 blur-3xl"
              aria-hidden="true"
            />
            <div
              className="pointer-events-none absolute -bottom-24 -left-16 h-60 w-60 rounded-full bg-lime/15 blur-3xl"
              aria-hidden="true"
            />
            <div className="relative">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-display text-[20px] font-semibold tracking-[-0.035em] text-paper">NearHi</p>
                  <p className="mt-1 text-[12px] text-paper/50">Everything, for now.</p>
                </div>
                <span className="rounded-full bg-lime px-2.5 py-1 text-[9.5px] font-bold tracking-[0.08em] text-ink uppercase">
                  free
                </span>
              </div>

              <p className="mt-6 font-display text-[64px] leading-none font-semibold tracking-[-0.06em] text-paper sm:text-[76px]">
                Free<span className="text-lime">.</span>
              </p>

              <div className="relative my-7 h-px w-full bg-white/10" />

              <ul className="space-y-3">
                {included.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-lime/15 text-lime">
                      <Check className="h-2.5 w-2.5" strokeWidth={3} aria-hidden="true" />
                    </span>
                    <span className="text-[13.5px] leading-snug text-paper/75">{item}</span>
                  </li>
                ))}
              </ul>

              <a href="/talk/" className={cn(limeButton, "mt-8 w-full")}>
                Start chatting
                <ArrowUpRight
                  className="h-[17px] w-[17px] transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  aria-hidden="true"
                />
              </a>
            </div>
          </div>
        </Reveal>

        <Reveal delay={160}>
          <div className="mx-auto mt-8 flex max-w-xl flex-wrap items-center justify-center gap-x-7 gap-y-3 text-[12px] font-medium text-ink/60">
            {[
              { icon: CreditCard, label: "No card needed" },
              { icon: Lock, label: "No account to make" },
              { icon: Smartphone, label: "Nothing to install" },
            ].map((item) => (
              <span key={item.label} className="inline-flex items-center gap-2">
                <item.icon className="h-3.5 w-3.5 text-violet-dark" aria-hidden="true" />
                {item.label}
              </span>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
