"use client";

import { ArrowUpRight, BatteryLow, MapPin, ShieldCheck, SkipForward, Wallet, Zap } from "lucide-react";
import { groupPhotos } from "@/lib/content";
import { Eyebrow, Reveal, Waveform } from "./ui";

const benefits = [
  {
    icon: Zap,
    title: "No account. No download.",
    body: "Open nearhi.in, allow your camera and location, pick a distance. That is the whole setup.",
    iconClass: "bg-violet/10 text-violet-dark",
  },
  {
    icon: BatteryLow,
    title: "Not in the mood? Skip.",
    body: "Skip to the next person or stop at any moment. No awkward goodbyes, no hard feelings.",
    iconClass: "bg-lime text-ink",
  },
  {
    icon: ShieldCheck,
    title: "Not recorded.",
    body: "We don't record video or audio. An automatic safety screen checks a still image every few seconds and discards it. Nobody watches live, so treat it as a help, not a guarantee.",
    iconClass: "bg-ink text-lime",
  },
  {
    icon: Wallet,
    title: "Free right now.",
    body: "No account, no card, no paywall. Right now it costs you nothing.",
    iconClass: "bg-coral-soft text-[#C94A30]",
  },
];

export function Benefits() {
  return (
    <section id="why" className="relative scroll-mt-24 overflow-hidden py-20 sm:py-28 lg:py-32">
      <div
        className="pointer-events-none absolute top-1/4 -left-32 h-80 w-80 rounded-full bg-lilac/60 blur-3xl"
        aria-hidden="true"
      />
      <div className="relative mx-auto max-w-[1240px] px-5 sm:px-7 lg:px-10">
        <div className="grid items-center gap-14 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16 xl:gap-24">
          <div>
            <Reveal>
              <Eyebrow>Why NearHi</Eyebrow>
              <h2 className="h-display mt-4 text-[clamp(2.4rem,6.2vw,3.9rem)] text-balance">
                Less scrolling.
                <br />
                More <span className="serif-accent text-violet-dark">saying hi.</span>
              </h2>
              <p className="mt-5 max-w-md text-[15px] leading-relaxed text-muted">
                Most chat apps put the whole world between you and the next person. NearHi starts
                with the people around you, so a conversation with a stranger can still feel like it
                happens close to home.
              </p>
            </Reveal>

            <div className="mt-9 space-y-1">
              {benefits.map((benefit, index) => (
                <Reveal key={benefit.title} delay={80 + index * 75}>
                  <div className="group flex gap-4 rounded-2xl p-3.5 transition-colors duration-300 hover:bg-white/55 sm:-mx-1">
                    <span
                      className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl transition-transform duration-300 group-hover:-rotate-3 group-hover:scale-105 ${benefit.iconClass}`}
                    >
                      <benefit.icon className="h-[18px] w-[18px]" aria-hidden="true" />
                    </span>
                    <div>
                      <h3 className="font-display text-[16px] font-semibold tracking-[-0.025em] text-ink">
                        {benefit.title}
                      </h3>
                      <p className="mt-1 max-w-md text-[13.5px] leading-relaxed text-muted">
                        {benefit.body}
                      </p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>

            <Reveal delay={380}>
              <a
                href="/talk/"
                className="group mt-6 inline-flex items-center gap-2 pl-3.5 text-[13.5px] font-semibold text-ink transition-colors hover:text-violet-dark sm:pl-2.5"
              >
                Start chatting
                <ArrowUpRight
                  className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  aria-hidden="true"
                />
              </a>
            </Reveal>
          </div>

          <Reveal delay={120} scale className="relative">
            <div
              className="absolute -top-6 -right-5 h-32 w-32 rounded-[36px] bg-lime/70 sm:-top-8 sm:-right-8 sm:h-40 sm:w-40"
              aria-hidden="true"
            />
            <div
              className="absolute -bottom-8 -left-8 h-36 w-36 rounded-full border-[14px] border-violet/15"
              aria-hidden="true"
            />

            <figure className="relative">
              <div className="relative overflow-hidden rounded-[28px] border border-ink/8 bg-paper-deep shadow-soft sm:rounded-[34px]">
                <img
                  src={groupPhotos.bedroom}
                  alt="People laughing together on a video call"
                  width={1400}
                  height={1050}
                  loading="lazy"
                  decoding="async"
                  className="aspect-[4/3.5] w-full object-cover transition-transform duration-[1200ms] ease-out hover:scale-[1.025] sm:aspect-[4/4.3]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/65 via-ink/0 to-transparent" />

                <figcaption className="absolute inset-x-3 bottom-3 flex items-center gap-3 rounded-2xl border border-white/15 bg-ink/70 p-3 backdrop-blur-xl sm:inset-x-4 sm:bottom-4">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-lime text-ink">
                    <MapPin className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[11.5px] font-semibold text-paper">
                      Matched 12 km away
                    </p>
                    <p className="mt-0.5 flex items-center gap-1 text-[9.5px] text-paper/55">
                      <span className="h-1.5 w-1.5 rounded-full bg-lime" aria-hidden="true" />
                      Say hi, it is that easy
                    </p>
                  </div>
                  <Waveform className="hidden sm:flex" />
                </figcaption>
              </div>

              <div className="animate-float absolute -top-4 -left-3 flex items-center gap-2.5 rounded-2xl border border-white/70 bg-white/90 px-3 py-2.5 shadow-float backdrop-blur-xl sm:-top-6 sm:-left-5">
                <span className="grid h-8 w-8 place-items-center rounded-full bg-lime text-ink">
                  <SkipForward className="h-4 w-4" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-[10.5px] font-semibold text-ink">Skip anytime</p>
                  <p className="mt-0.5 text-[9px] text-muted">next person, one tap</p>
                </div>
              </div>

              <div
                className="animate-float-slow absolute -right-2 bottom-20 rotate-3 rounded-full bg-lime px-3 py-1.5 text-[9.5px] font-bold tracking-[0.04em] text-ink shadow-lg sm:-right-5 sm:bottom-24"
                style={{ "--float-rotate": "3deg" } as React.CSSProperties}
              >
                no sign-up
              </div>
            </figure>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
