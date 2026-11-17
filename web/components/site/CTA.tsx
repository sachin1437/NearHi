"use client";

import { ArrowUpRight, Check, MapPin, ShieldCheck, Sparkles } from "lucide-react";
import { people } from "@/lib/content";
import { Eyebrow, Reveal, limeButton, secondaryButton } from "./ui";
import { cn } from "@/lib/cn";

const circles = [
  {
    src: people.maya.avatar,
    alt: "",
    position: "top-2 left-4 sm:left-8",
    size: "h-14 w-14 sm:h-16 sm:w-16",
    ring: "ring-lime",
    delay: "0s",
    label: "12 km",
  },
  {
    src: people.leo.avatar,
    alt: "",
    position: "top-10 right-2 sm:right-5",
    size: "h-11 w-11 sm:h-[52px] sm:w-[52px]",
    ring: "ring-paper",
    delay: "-2s",
    label: "38 km",
  },
  {
    src: people.priya.avatar,
    alt: "",
    position: "bottom-8 left-0 sm:left-4",
    size: "h-12 w-12 sm:h-[58px] sm:w-[58px]",
    ring: "ring-coral",
    delay: "-4s",
    label: "7 km",
  },
  {
    src: people.theo.avatar,
    alt: "",
    position: "right-6 bottom-1 sm:right-10",
    size: "h-12 w-12 sm:h-14 sm:w-14",
    ring: "ring-paper",
    delay: "-1s",
    label: "21 km",
  },
];

export function CTA() {
  return (
    <section id="download" className="relative scroll-mt-20 py-16 sm:py-24 lg:py-28">
      <div className="mx-auto max-w-[1240px] px-5 sm:px-7 lg:px-10">
        <Reveal scale>
          <div className="noise relative overflow-hidden rounded-[30px] bg-ink text-paper shadow-[0_50px_100px_-45px_rgba(21,19,27,0.65)] sm:rounded-[40px]">
            <div
              className="pointer-events-none absolute -top-44 -left-24 h-[430px] w-[430px] rounded-full bg-[radial-gradient(circle,rgba(108,75,244,0.55),transparent_68%)] blur-2xl"
              aria-hidden="true"
            />
            <div
              className="pointer-events-none absolute -right-20 -bottom-40 h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle,rgba(221,247,122,0.28),transparent_68%)] blur-2xl"
              aria-hidden="true"
            />
            <div
              className="pointer-events-none absolute top-1/3 right-1/3 h-60 w-60 rounded-full bg-coral/15 blur-3xl"
              aria-hidden="true"
            />
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.07]"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 1px 1px, rgba(247,244,237,0.9) 1px, transparent 0)",
                backgroundSize: "26px 26px",
                maskImage: "radial-gradient(ellipse 70% 70% at 80% 30%, black, transparent)",
                WebkitMaskImage: "radial-gradient(ellipse 70% 70% at 80% 30%, black, transparent)",
              }}
              aria-hidden="true"
            />

            <div className="relative z-10 grid items-center gap-12 px-6 py-12 sm:px-10 sm:py-16 lg:grid-cols-[1.02fr_0.98fr] lg:px-16 lg:py-20">
              <div>
                <Reveal>
                  <Eyebrow tone="dark">Ready when you are</Eyebrow>
                  <h2 className="h-display mt-5 text-[clamp(2.9rem,8.4vw,4rem)] text-balance text-paper sm:text-[clamp(3.6rem,6.6vw,4.6rem)]">
                    Enough lurking.
                    <br />
                    Say <span className="serif-accent text-lime">hi.</span>
                  </h2>
                  <p className="mt-5 max-w-md text-[14.5px] leading-relaxed text-paper/55 sm:text-[15.5px]">
                    Pick a distance, allow your camera and location, say hi. It takes about ten seconds and there is nothing to install.
                  </p>

                  <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
                    <a
                      href="/talk/"
                      className={cn(limeButton, "w-full px-6 py-3.5 sm:w-auto")}
                    >
                      Start chatting, it&apos;s free
                      <ArrowUpRight
                        className="h-[17px] w-[17px] transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                        aria-hidden="true"
                      />
                    </a>
                    <a
                      href="#faq"
                      className={cn(
                        secondaryButton,
                        "w-full border-white/15 bg-white/5 text-paper hover:border-white/30 hover:bg-white/10 sm:w-auto",
                      )}
                    >
                      Read the FAQ
                    </a>
                  </div>

                  <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] font-medium text-paper/45">
                    {["Free right now", "No account", "18+ only"].map((item) => (
                      <span key={item} className="inline-flex items-center gap-1.5">
                        <Check className="h-3.5 w-3.5 text-lime" aria-hidden="true" />
                        {item}
                      </span>
                    ))}
                  </div>

                  <div className="mt-8 flex items-center gap-3 border-t border-white/10 pt-6">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/10 text-lime">
                      <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <p className="text-[11px] leading-relaxed text-paper/50">
                      Nothing is recorded. Skip or stop at any moment.
                    </p>
                  </div>

                  <div className="mt-7">
                    <p className="mb-2.5 text-[9.5px] font-semibold tracking-[0.16em] text-paper/35 uppercase">
                      Works in your browser
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {["Chrome", "Safari", "Edge", "Firefox"].map((name) => (
                        <span
                          key={name}
                          className="rounded-full border border-white/12 bg-white/5 px-3 py-1.5 text-[11px] font-semibold text-paper/70"
                        >
                          {name}
                        </span>
                      ))}
                    </div>
                  </div>
                </Reveal>
              </div>

              <Reveal delay={160} className="relative">
                <div className="relative mx-auto h-[320px] w-full max-w-[390px] sm:h-[380px]">
                  <div
                    className="absolute top-1/2 left-1/2 h-[280px] w-[280px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-white/15 sm:h-[330px] sm:w-[330px]"
                    aria-hidden="true"
                  />
                  <div
                    className="absolute top-1/2 left-1/2 h-[210px] w-[210px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/8 sm:h-[250px] sm:w-[250px]"
                    aria-hidden="true"
                  />

                  <div className="absolute top-1/2 left-1/2 w-[218px] -translate-x-1/2 -translate-y-1/2 -rotate-[4deg] rounded-[30px] bg-lime p-5 text-ink shadow-[0_30px_60px_-20px_rgba(0,0,0,0.5)] transition-transform duration-500 hover:rotate-0 sm:w-[240px] sm:p-6">
                    <div className="flex items-center justify-between">
                      <span className="text-[8.5px] font-bold tracking-[0.14em] uppercase opacity-55">
                        new match
                      </span>
                      <span className="grid h-7 w-7 place-items-center rounded-full bg-ink/10">
                        <Sparkles className="h-3.5 w-3.5 text-ink/70" aria-hidden="true" />
                      </span>
                    </div>
                    <p className="font-display mt-1 text-[68px] leading-[0.85] font-bold tracking-[-0.08em] sm:text-[78px]">
                      hi<span className="text-violet-dark">.</span>
                    </p>
                    <p className="mt-3 text-[11px] leading-snug font-medium text-ink/65">
                      someone near you is one tap away. no profile required.
                    </p>
                    <div className="mt-4 flex items-center justify-between border-t border-ink/15 pt-3">
                      <div className="flex -space-x-2">
                        {[people.maya.avatar, people.leo.avatar, people.priya.avatar].map((src) => (
                          <img
                            key={src}
                            src={src}
                            alt=""
                            className="h-6 w-6 rounded-full object-cover ring-2 ring-lime"
                          />
                        ))}
                      </div>
                      <span className="rounded-full bg-ink px-2 py-1 text-[8px] font-bold text-lime">
                        in range
                      </span>
                    </div>
                  </div>

                  {circles.map((circle) => (
                    <div
                      key={circle.label}
                      className={cn("absolute", circle.position)}
                      aria-hidden="true"
                    >
                      <div
                        className={cn(
                          "animate-float relative rounded-full",
                          circle.size,
                        )}
                        style={{ animationDelay: circle.delay } as React.CSSProperties}
                      >
                        <img
                          src={circle.src}
                          alt=""
                          className={cn(
                            "h-full w-full rounded-full object-cover shadow-[0_12px_30px_-12px_rgba(0,0,0,0.6)] ring-2",
                            circle.ring,
                          )}
                        />
                        <span className="absolute -right-0.5 -bottom-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-ink text-[9px] ring-2 ring-ink">
                          <MapPin className="h-2.5 w-2.5 text-lime" aria-hidden="true" />
                        </span>
                      </div>
                      <span className="mt-1 block text-center text-[8px] font-semibold text-paper/50">
                        {circle.label}
                      </span>
                    </div>
                  ))}

                  <div className="animate-float-slow absolute top-[50%] -right-1 hidden sm:flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-2.5 py-1.5 text-[8.5px] font-semibold text-paper backdrop-blur-md sm:top-[50%] sm:-right-3">
                    <span className="h-1.5 w-1.5 rounded-full bg-lime" aria-hidden="true" />
                    10 km to anywhere
                  </div>
                  <div
                    className="animate-float absolute -bottom-1 left-2 rounded-full border border-white/15 bg-white/10 px-2.5 py-1.5 text-[8.5px] font-semibold text-paper backdrop-blur-md sm:left-6"
                    style={{ animationDelay: "-3s" }}
                  >
                    skip anytime
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
