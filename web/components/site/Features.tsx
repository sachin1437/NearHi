"use client";

import { useState } from "react";
import {
  ArrowUpRight,
  Camera,
  CameraOff,
  Flag,
  Globe2,
  MapPin,
  MessageCircle,
  Phone,
  ShieldCheck,
  SkipForward,
  Smartphone,
  Square,
  Ruler,
} from "lucide-react";
import { people } from "@/lib/content";
import { cn } from "@/lib/cn";
import { Eyebrow, Reveal, Waveform } from "./ui";

const alsoInside = [
  { icon: Ruler, label: "Custom distance" },
  { icon: MessageCircle, label: "Text chat" },
  { icon: SkipForward, label: "Skip in one tap" },
  { icon: Square, label: "Stop any time" },
  { icon: Flag, label: "Report button" },
  { icon: Smartphone, label: "Works in your phone browser" },
];

export function Features() {
  return (
    <section id="features" className="relative scroll-mt-24 overflow-hidden py-20 sm:py-28 lg:py-32">
      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.45]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(21,19,27,0.1) 1px, transparent 0)",
          backgroundSize: "34px 34px",
          maskImage: "radial-gradient(ellipse 60% 46% at 88% 12%, black 5%, transparent 74%)",
          WebkitMaskImage: "radial-gradient(ellipse 60% 46% at 88% 12%, black 5%, transparent 74%)",
        }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute top-1/3 -right-40 -z-10 h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle,rgba(233,226,255,0.85),transparent_68%)] blur-2xl"
        aria-hidden="true"
      />
      <div className="mx-auto max-w-[1240px] px-5 sm:px-7 lg:px-10">
        <div className="flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
          <Reveal className="max-w-2xl">
            <Eyebrow>What you get</Eyebrow>
            <h2 className="h-display mt-4 text-[clamp(2.4rem,6.2vw,3.9rem)] text-balance">
              Everything you need <br className="hidden sm:block" />
              to just <span className="serif-accent text-violet-dark">say hi.</span>
            </h2>
          </Reveal>
          <Reveal delay={110} className="max-w-sm lg:pb-2">
            <p className="text-[15px] leading-relaxed text-muted">
              No account, no profile, no setup. Just a few small things that make talking to a
              stranger feel easy.
            </p>
          </Reveal>
        </div>

        <div className="mt-11 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
          <Reveal className="sm:col-span-2 lg:col-span-3">
            <RadiusCard />
          </Reveal>
          <Reveal delay={90} className="sm:col-span-2 lg:col-span-3">
            <SkipCard />
          </Reveal>
          <Reveal delay={60} className="sm:col-span-1 lg:col-span-2 lg:self-start">
            <TextCard />
          </Reveal>
          <Reveal delay={130} className="order-2 sm:order-none sm:col-span-1 lg:col-span-2">
            <CameraCard />
          </Reveal>
          <Reveal delay={190} className="order-3 sm:order-none sm:col-span-2 lg:col-span-2 lg:self-start">
            <ReportCard />
          </Reveal>
        </div>

        <Reveal delay={80}>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2.5">
            <span className="mr-1 text-[11px] font-semibold tracking-[0.12em] text-muted uppercase">
              Also inside
            </span>
            {alsoInside.map((item) => (
              <span
                key={item.label}
                className="inline-flex items-center gap-1.5 rounded-full border border-fg/9 bg-surface/55 px-3 py-1.5 text-[11.5px] font-medium text-fg/70 backdrop-blur-sm transition-colors hover:border-fg/20 hover:text-fg"
              >
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

function FeatureShell({
  children,
  className,
  icon: Icon,
  iconClassName,
}: {
  children: React.ReactNode;
  className?: string;
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  iconClassName?: string;
}) {
  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-[26px] border border-fg/8 p-5 transition-all duration-500 hover:-translate-y-1 hover:shadow-card sm:p-7",
        className,
      )}
    >
      <div
        className={cn(
          "mb-5 grid h-9 w-9 place-items-center rounded-xl border border-current/10",
          iconClassName,
        )}
      >
        <Icon className="h-[18px] w-[18px]" aria-hidden={true} />
      </div>
      {children}
    </article>
  );
}


const radii = [
  { label: "10 km", scale: 0.2 },
  { label: "25 km", scale: 0.38 },
  { label: "50 km", scale: 0.58 },
  { label: "100 km", scale: 0.78 },
  { label: "Anywhere", scale: 1 },
];

const dots = [
  { x: 56, y: 44, r: 0.15 },
  { x: 38, y: 62, r: 0.3 },
  { x: 70, y: 66, r: 0.5 },
  { x: 24, y: 34, r: 0.7 },
  { x: 80, y: 28, r: 0.9 },
  { x: 16, y: 74, r: 0.95 },
];

function RadiusCard() {
  const [active, setActive] = useState(2);
  const scale = radii[active]!.scale;

  return (
    <FeatureShell icon={MapPin} iconClassName="bg-violet/10 text-violet-dark" className="bg-paper-warm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-display text-[22px] leading-tight font-semibold tracking-[-0.035em] sm:text-[25px]">
            Pick how far.
            <br className="hidden xl:block" /> Meet someone close.
          </h3>
          <p className="mt-2 max-w-[26rem] text-[13.5px] leading-relaxed text-muted">
            Choose 10 km, 100 km, anywhere, or type your own number. You only match with people
            inside your radius who have you inside theirs.
          </p>
        </div>
        <span className="hidden shrink-0 rounded-full bg-lime px-2.5 py-1 text-[9.5px] font-bold tracking-[0.08em] text-ink uppercase sm:inline-flex">
          your call
        </span>
      </div>

      <div className="relative mt-5">
        <div className="absolute -right-8 -bottom-10 h-36 w-36 rounded-full bg-violet/12 blur-2xl" aria-hidden="true" />
        <div className="relative rounded-2xl border border-fg/7 bg-paper p-2.5">
          <div className="mb-2 flex items-center justify-between px-1">
            <div className="flex items-center gap-1.5">
              <span className="animate-pulse-dot h-1.5 w-1.5 rounded-full bg-[#4CAF6E]" aria-hidden="true" />
              <span className="text-[10px] font-semibold text-fg/65">searching within {radii[active]!.label}</span>
            </div>
            <span className="text-[9.5px] font-medium text-muted">illustration</span>
          </div>

          <div className="relative mx-auto aspect-[16/9] w-full overflow-hidden rounded-xl bg-paper-deep">
            <div
              className="absolute inset-0 opacity-60"
              style={{
                backgroundImage: "radial-gradient(circle at 1px 1px, rgba(21,19,27,0.14) 1px, transparent 0)",
                backgroundSize: "16px 16px",
              }}
              aria-hidden="true"
            />
            <div
              className="absolute top-1/2 left-1/2 aspect-square -translate-x-1/2 -translate-y-1/2 rounded-full border border-violet/40 bg-violet/10 transition-all duration-700 ease-out"
              style={{ height: `${Math.max(scale, 0.12) * 190}%` }}
              aria-hidden="true"
            />
            <span className="absolute top-1/2 left-1/2 grid h-5 w-5 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-ink ring-4 ring-lime/70">
              <span className="h-1.5 w-1.5 rounded-full bg-lime" />
            </span>
            {dots.map((dot) => {
              const inside = dot.r <= scale;
              return (
                <span
                  key={`${dot.x}-${dot.y}`}
                  className={cn(
                    "absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 transition-all duration-500",
                    inside ? "bg-violet ring-white" : "bg-fg/15 ring-transparent",
                  )}
                  style={{ left: `${dot.x}%`, top: `${dot.y}%` }}
                  aria-hidden="true"
                />
              );
            })}
          </div>

          <div className="mt-2.5 flex flex-wrap gap-1.5" role="group" aria-label="Choose a distance">
            {radii.map((radius, index) => (
              <button
                key={radius.label}
                type="button"
                onClick={() => setActive(index)}
                aria-pressed={active === index}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-[10.5px] font-semibold transition-colors duration-200",
                  active === index
                    ? "border-ink bg-ink text-cream dark:border-lime dark:bg-lime dark:text-ink"
                    : "border-fg/10 bg-surface/60 text-fg/60 hover:border-fg/25",
                )}
              >
                {radius.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </FeatureShell>
  );
}

const strangers = [
  { person: people.maya, km: 12 },
  { person: people.leo, km: 38 },
  { person: people.priya, km: 7 },
];

function SkipCard() {
  const [skipped, setSkipped] = useState<string[]>([]);
  const toggle = (name: string) =>
    setSkipped((list) => (list.includes(name) ? list.filter((n) => n !== name) : [...list, name]));

  return (
    <FeatureShell
      icon={Phone}
      iconClassName="border-white/10 bg-white/10 text-lime"
      className="noise border-white/10 bg-ink text-cream"
    >
      <div className="relative z-10 flex flex-1 flex-col">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-display text-[22px] leading-tight font-semibold tracking-[-0.035em] text-cream sm:text-[25px]">
              Not feeling it?
              <br className="hidden xl:block" /> Skip. Next.
            </h3>
            <p className="mt-2 max-w-[26rem] text-[13.5px] leading-relaxed text-cream/55">
              One tap moves you on to someone new. No awkward goodbye, no hard feelings.
            </p>
          </div>
          <span className="hidden shrink-0 rounded-full border border-lime/25 bg-lime/10 px-2.5 py-1 text-[9.5px] font-semibold tracking-[0.08em] text-lime uppercase sm:inline-flex">
            nearby
          </span>
        </div>

        <div className="mt-5 space-y-1.5">
          {strangers.map(({ person, km }) => {
            const gone = skipped.includes(person.name);
            return (
              <div
                key={person.name}
                className={cn(
                  "flex items-center gap-2.5 rounded-xl border border-white/7 bg-white/[0.055] p-2 pr-2.5 transition-all duration-300 hover:bg-white/[0.09]",
                  gone && "opacity-40",
                )}
              >
                <div className="relative">
                  <img
                    src={person.avatar}
                    alt=""
                    width={80}
                    height={80}
                    loading="lazy"
                    decoding="async"
                    className="h-8 w-8 rounded-full object-cover"
                  />
                  <span
                    className="absolute -right-0.5 -bottom-0.5 h-2.5 w-2.5 rounded-full bg-lime ring-2 ring-[#1d1926]"
                    aria-hidden="true"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[12px] font-semibold text-cream">Stranger</p>
                  <p className="truncate text-[10px] text-cream/45">{km} km away</p>
                </div>
                <button
                  type="button"
                  onClick={() => toggle(person.name)}
                  aria-pressed={gone}
                  aria-label={gone ? "Bring this person back" : "Skip this person"}
                  className={cn(
                    "grid h-7 w-7 shrink-0 place-items-center rounded-full transition-all duration-300",
                    gone ? "bg-lime text-ink" : "bg-white/8 text-cream/70 hover:bg-lime hover:text-ink",
                  )}
                >
                  <SkipForward className="h-3 w-3" aria-hidden="true" />
                </button>
              </div>
            );
          })}
          <p className="h-4 pl-1 text-[9.5px] font-medium text-lime" aria-live="polite">
            {skipped.length ? "Skipped. Looking for someone new…" : ""}
          </p>
        </div>

        <div className="mt-5 space-y-1 rounded-xl border border-white/8 bg-white/[0.04] p-2.5">
          {[
            { time: "skip", text: "Moves you to the next match." },
            { time: "stop", text: "Ends the chat. Nothing is recorded." },
          ].map((item) => (
            <div key={item.time} className="flex items-center gap-2 px-1 py-0.5">
              <span className="font-mono text-[8px] tabular-nums text-cream/35 uppercase">{item.time}</span>
              <span className="h-px flex-1 bg-white/8" aria-hidden="true" />
              <span className="text-[9px] font-medium text-cream/55">{item.text}</span>
            </div>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-white/8 pt-3">
          <p className="text-[9px] font-medium tracking-[0.1em] text-cream/30 uppercase">illustrative preview</p>
          <p className="flex items-center gap-1 text-[9.5px] font-semibold text-lime">
            <span className="h-1 w-1 rounded-full bg-lime" aria-hidden="true" />
            stock photos
          </p>
        </div>
      </div>
    </FeatureShell>
  );
}

function TextCard() {
  return (
    <FeatureShell
      icon={MessageCircle}
      iconClassName="border-fg/5 bg-surface/70 text-violet-dark"
      className="bg-lilac"
    >
      <h3 className="font-display text-[21px] leading-tight font-semibold tracking-[-0.035em]">
        Video, with a
        <br /> text chat beside it.
      </h3>
      <p className="mt-2 text-[13px] leading-relaxed text-ink-muted/80">
        Prefer typing the first hello? Use the text chat while you get comfortable.
      </p>

      <div className="mt-5 flex-1 rounded-2xl border border-white/80 bg-surface/75 p-3.5 shadow-[0_10px_30px_-20px_rgba(52,40,90,0.5)] backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <span className="rounded-md bg-ink px-1.5 py-1 text-[8px] font-bold tracking-[0.09em] text-lime uppercase">
            text chat
          </span>
          <span className="flex items-center gap-1 text-[9px] font-medium text-muted">
            <span className="h-1.5 w-1.5 rounded-full bg-violet" aria-hidden="true" />
            12 km away
          </span>
        </div>
        <div className="mt-3 space-y-1.5">
          <p className="max-w-[80%] rounded-xl rounded-bl-sm bg-surface px-2.5 py-1.5 text-[10.5px] text-fg/75 ring-1 ring-fg/6">
            hey, where are you from?
          </p>
          <p className="ml-auto max-w-[80%] rounded-xl rounded-br-sm bg-violet px-2.5 py-1.5 text-[10.5px] text-white">
            not far from you, apparently
          </p>
          <p className="max-w-[80%] rounded-xl rounded-bl-sm bg-surface px-2.5 py-1.5 text-[10.5px] text-fg/75 ring-1 ring-fg/6">
            ha, small world
          </p>
        </div>
        <div className="mt-3 flex items-center justify-between rounded-lg border border-fg/8 bg-surface px-2.5 py-1.5">
          <span className="text-[10px] text-fg/35">Say something…</span>
          <ArrowUpRight className="h-3 w-3 text-fg/30" aria-hidden="true" />
        </div>
      </div>
    </FeatureShell>
  );
}

function CameraCard() {
  const [camOn, setCamOn] = useState(true);

  return (
    <FeatureShell
      icon={ShieldCheck}
      iconClassName="border-fg/5 bg-surface/75 text-violet-dark"
      className="bg-surface"
    >
      <h3 className="font-display text-[21px] leading-tight font-semibold tracking-[-0.035em]">
        Face to face.
        <br /> Never recorded.
      </h3>
      <p className="mt-2 text-[13px] leading-relaxed text-muted">
        We don&apos;t record video or audio. Turn your camera off whenever you like.
      </p>

      <div className="relative mt-5 flex-1 overflow-hidden rounded-2xl bg-ink">
        <img
          src={people.nova.src}
          alt="A person on a NearHi video chat"
          width={800}
          height={1000}
          loading="lazy"
          decoding="async"
          className={cn(
            "h-full min-h-[164px] w-full object-cover transition-all duration-700",
            !camOn && "scale-105 blur-md brightness-50",
          )}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent" />
        <div className="absolute inset-x-2.5 bottom-2.5 flex items-center justify-between">
          <span className="rounded-md bg-black/35 px-1.5 py-1 text-[9px] font-semibold text-white backdrop-blur">
            {camOn ? "Camera on" : "Camera off"}
          </span>
          <Waveform className="h-4" />
        </div>
        <div className="absolute top-2.5 right-2.5 rounded-full bg-lime px-2 py-0.5 text-[8px] font-bold tracking-[0.06em] text-ink uppercase">
          not recorded
        </div>
      </div>

      <div className="mt-2.5 flex gap-1.5">
        {[
          { label: "Camera on", value: true, icon: Camera },
          { label: "Camera off", value: false, icon: CameraOff },
        ].map((option) => (
          <button
            key={option.label}
            type="button"
            onClick={() => setCamOn(option.value)}
            aria-pressed={camOn === option.value}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 rounded-full border px-1 py-1 text-[9.5px] font-semibold transition-colors duration-200",
              camOn === option.value
                ? "border-ink bg-ink text-cream dark:border-lime dark:bg-lime dark:text-ink"
                : "border-fg/10 bg-surface/60 text-fg/60 hover:border-fg/25",
            )}
          >
            <option.icon className="h-3 w-3" aria-hidden="true" />
            {option.label}
          </button>
        ))}
      </div>
    </FeatureShell>
  );
}

function ReportCard() {
  return (
    <FeatureShell
      icon={Flag}
      iconClassName="border-fg/5 bg-surface/75 text-[#C94A30]"
      className="bg-coral-soft"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-[21px] leading-tight font-semibold tracking-[-0.035em]">
            Report it. Leave it.
          </h3>
          <p className="mt-2 text-[13px] leading-relaxed text-ink-muted/80">
            Anyone making you uncomfortable? Report them and move on.
          </p>
        </div>
        <span className="mt-1 hidden rounded-full border border-white bg-surface/70 px-2 py-1 text-[8.5px] font-bold tracking-[0.08em] text-[#C94A30] uppercase sm:block">
          18+
        </span>
      </div>

      <div className="mt-5 flex flex-1 flex-col justify-center gap-1.5">
        {[
          { name: "Skip", text: "go to someone new", tone: "left" },
          { name: "Stop", text: "end the chat right now", tone: "right" },
          { name: "Report", text: "flag someone who crossed a line", tone: "left" },
        ].map((line) => (
          <div
            key={line.name}
            className={cn(
              "flex max-w-[92%] items-center gap-2 rounded-xl border border-white/90 bg-surface/85 px-2.5 py-2 shadow-[0_4px_16px_-12px_rgba(90,50,40,0.6)]",
              line.tone === "right" && "self-end",
            )}
          >
            <span className="text-[9px] font-bold tracking-[0.02em] text-[#B84A34]">{line.name}</span>
            <span className="min-w-0 flex-1 truncate text-[10.5px] text-fg/75">{line.text}</span>
          </div>
        ))}
        <div className="mt-1 flex items-center gap-1.5 self-start rounded-md bg-surface/55 px-2 py-1">
          <Globe2 className="h-2.5 w-2.5 text-fg/50" aria-hidden="true" />
          <span className="text-[8px] font-semibold tracking-[0.08em] text-fg/50 uppercase">
            automatic safety screening
          </span>
        </div>
      </div>
    </FeatureShell>
  );
}
