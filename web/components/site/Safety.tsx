"use client";

import { ArrowUpRight, Eye, Flag, Lock, MapPin, ShieldCheck, SkipForward, UserX } from "lucide-react";
import { people } from "@/lib/content";
import { cn } from "@/lib/cn";
import { Eyebrow, Reveal } from "./ui";

const tones = {
  dark: "bg-ink text-cream border-white/10",
  white: "bg-paper-warm text-fg border-fg/8",
  lilac: "bg-lilac text-fg border-fg/6",
  coral: "bg-coral-soft text-fg border-fg/6",
};

const cards = [
  {
    icon: MapPin,
    title: "The distance goes both ways",
    body: "You only match if they are inside your radius and you are inside theirs. Pick 10 km and you will not get someone from the other side of the country.",
    tone: "lilac" as const,
  },
  {
    icon: SkipForward,
    title: "Skip or stop, any time",
    body: "One tap moves you on to someone new. One tap ends the chat. No one has to be polite.",
    tone: "white" as const,
  },
  {
    icon: UserX,
    title: "Nothing to sign up for",
    body: "There is no account, no profile and no photo to upload. You show up, you chat, you leave.",
    tone: "coral" as const,
  },
  {
    icon: Flag,
    title: "Report anyone",
    body: "Messages and video are screened automatically and you can report anyone who makes you uncomfortable.",
    tone: "white" as const,
  },
  {
    icon: ShieldCheck,
    title: "Adults only",
    body: "You must be 18 or older to use NearHi. If you are not, please do not.",
    tone: "lilac" as const,
  },
];

export function Safety() {
  return (
    <section
      id="safety"
      className="relative scroll-mt-24 overflow-hidden border-y border-fg/7 bg-paper-warm py-20 sm:py-28 lg:py-32"
    >
      <div
        className="pointer-events-none absolute top-0 right-0 h-72 w-72 rounded-full [background:radial-gradient(closest-side,color-mix(in_oklab,var(--color-lilac)_75%,transparent),transparent)]"
        aria-hidden="true"
      />
      <div className="relative mx-auto max-w-[1240px] px-5 sm:px-7 lg:px-10">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <Reveal className="max-w-2xl">
            <Eyebrow>Straight answers</Eyebrow>
            <h2 className="h-display mt-4 text-[clamp(2.4rem,6.2vw,3.9rem)] text-balance">
              What you&apos;re signing up for.
              <br />
              The fine print, <span className="serif-accent text-violet-dark">made readable.</span>
            </h2>
          </Reveal>

          <Reveal delay={120}>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-4 rounded-2xl border border-fg/8 bg-surface/60 px-5 py-4 backdrop-blur-sm">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-display text-[28px] leading-none font-semibold tracking-[-0.04em]">
                    18+
                  </span>
                  <ShieldCheck className="h-5 w-5 text-violet-dark" aria-hidden="true" />
                </div>
                <p className="mt-1 text-[10.5px] font-medium text-muted">adults only</p>
              </div>
              <div className="h-9 w-px bg-fg/10" aria-hidden="true" />
              <div>
                <span className="font-display text-[28px] leading-none font-semibold tracking-[-0.04em]">0</span>
                <p className="mt-1 text-[10.5px] font-medium text-muted">calls recorded</p>
              </div>
            </div>
          </Reveal>
        </div>

        <div className="mt-11 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Reveal className="md:col-span-2">
            <article
              className={cn(
                "group relative flex h-full flex-col gap-6 overflow-hidden rounded-[26px] border p-6 sm:flex-row sm:items-stretch sm:p-8",
                tones.dark,
              )}
            >
              <div
                className="pointer-events-none absolute -top-16 -right-10 h-48 w-48 rounded-full [background:radial-gradient(closest-side,color-mix(in_oklab,var(--color-violet)_36%,transparent),transparent)]"
                aria-hidden="true"
              />
              <Lock className="h-8 w-8 shrink-0 text-lime/80" aria-hidden="true" strokeWidth={1.4} />
              <div className="relative flex flex-1 flex-col">
                <p className="text-[11px] font-semibold tracking-[0.16em] text-lime uppercase">Privacy</p>
                <p className="mt-4 flex-1 font-display text-[20px] leading-[1.35] font-medium tracking-[-0.025em] text-cream sm:text-[24px]">
                  We don&apos;t record your video or audio. A safety screen looks at a still image every few
                  seconds and throws it away.
                </p>
                <p className="mt-6 flex items-start gap-2 text-[11.5px] leading-relaxed text-cream/55">
                  <Eye className="mt-0.5 h-3.5 w-3.5 shrink-0 text-cream/40" aria-hidden="true" />
                  Nobody watches calls live, so the checks are a help, not a guarantee. Don&apos;t share
                  personal details with people you just met.
                </p>
              </div>
              <div className="relative hidden w-[196px] shrink-0 overflow-hidden rounded-2xl sm:block">
                <img
                  src={people.nova.src}
                  alt="A person smiling on a video call"
                  width={800}
                  height={1000}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/35 to-transparent" />
                <span className="absolute bottom-2.5 left-2.5 rounded-full border border-white/20 bg-ink/50 px-2 py-1 text-[8.5px] font-semibold text-cream backdrop-blur-md">
                  never recorded
                </span>
              </div>
            </article>
          </Reveal>

          {cards.map((item, index) => (
            <Reveal
              key={item.title}
              delay={((index + 1) % 3) * 80 + 40}
              className={cn(index === cards.length - 1 && "md:col-span-2 lg:col-span-1")}
            >
              <article
                className={cn(
                  "group flex h-full flex-col rounded-[26px] border p-5 transition-all duration-400 hover:-translate-y-1 hover:shadow-card sm:p-6",
                  tones[item.tone],
                )}
              >
                <span className="grid h-9 w-9 place-items-center rounded-xl border border-fg/5 bg-surface/75 text-violet-dark">
                  <item.icon className="h-[18px] w-[18px]" aria-hidden="true" />
                </span>
                <h3 className="mt-4 font-display text-[17px] leading-tight font-semibold tracking-[-0.03em]">
                  {item.title}
                </h3>
                <p className="mt-2 flex-1 text-[13px] leading-[1.65] text-fg/70">{item.body}</p>
              </article>
            </Reveal>
          ))}

          <Reveal delay={150} className="lg:col-span-2">
            <div className="flex h-full flex-col justify-between rounded-[26px] border border-dashed border-fg/15 bg-surface/35 p-6">
              <p className="font-serif text-[26px] leading-tight text-fg/80">
                “Say hi to someone who lives near you.”
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                <p className="max-w-sm text-[11px] leading-relaxed text-muted">
                  It takes about ten seconds. Allow your camera, microphone and location, choose a distance.
                </p>
                <a
                  href="/talk/"
                  className="group inline-flex items-center gap-1.5 text-[12px] font-semibold text-fg hover:text-violet-dark"
                >
                  Start chatting
                  <ArrowUpRight
                    className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    aria-hidden="true"
                  />
                </a>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}