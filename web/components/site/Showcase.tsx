"use client";

import { useRef, useState } from "react";
import {
  Camera,
  CameraOff,
  Lock,
  MapPin,
  Mic,
  MessageCircle,
  MoreHorizontal,
  PhoneOff,
  Ruler,
  Send,
  Settings,
  SkipForward,
  Sparkles,
  Video,
  Volume2,
} from "lucide-react";
import { people } from "@/lib/content";
import { cn } from "@/lib/cn";
import { Eyebrow, Reveal, Waveform } from "./ui";

type TabKey = "video" | "text" | "radius";

const tabs = [
  {
    key: "video" as TabKey,
    label: "Video chat",
    icon: Video,
    title: "connected · 12 km away",
    heading: "Say hi to someone nearby.",
    description:
      "Press start and you are matched with a random person inside your radius. Talk face to face, or skip and try someone else.",
    features: ["Video and audio", "Text chat beside it", "Skip or stop any time"],
  },
  {
    key: "text" as TabKey,
    label: "Text chat",
    icon: MessageCircle,
    title: "text chat · 12 km away",
    heading: "Start with a message.",
    description:
      "Not ready to talk out loud? The text chat sits next to the video, so the first hello can be typed.",
    features: ["Chat while on video", "No account or profile", "Nothing is recorded"],
  },
  {
    key: "radius" as TabKey,
    label: "Pick a distance",
    icon: Ruler,
    title: "searching within 50 km",
    heading: "You decide how far.",
    description:
      "Choose from 10 km up to anywhere, or type your own distance. You only match with people inside your radius who have you inside theirs.",
    features: ["10 km to anywhere", "Custom distance", "Both radii must overlap"],
  },
];

export function Showcase() {
  const [active, setActive] = useState<TabKey>("video");
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const current = tabs.find((tab) => tab.key === active) ?? tabs[0]!;

  const onTabKeyDown = (event: React.KeyboardEvent, index: number) => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    let nextIndex = index;
    if (event.key === "ArrowRight") nextIndex = (index + 1) % tabs.length;
    if (event.key === "ArrowLeft") nextIndex = (index - 1 + tabs.length) % tabs.length;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = tabs.length - 1;
    const next = tabs[nextIndex];
    if (!next) return;
    setActive(next.key);
    tabRefs.current[nextIndex]?.focus();
  };

  return (
    <section
      id="how-it-works"
      className="noise relative scroll-mt-20 overflow-hidden bg-ink py-20 text-cream sm:py-28 lg:py-32"
    >
      <div
        className="pointer-events-none absolute -top-40 left-1/4 h-[440px] w-[440px] rounded-full [background:radial-gradient(closest-side,color-mix(in_oklab,var(--color-violet)_30%,transparent),transparent)]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute top-1/3 -right-32 h-[380px] w-[380px] rounded-full [background:radial-gradient(closest-side,color-mix(in_oklab,var(--color-lime)_16%,transparent),transparent)]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-24 -left-24 h-[320px] w-[320px] rounded-full [background:radial-gradient(closest-side,color-mix(in_oklab,var(--color-coral)_20%,transparent),transparent)]"
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto max-w-[1120px] px-5 sm:px-7 lg:px-10">
        <div className="flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
          <Reveal className="max-w-2xl">
            <Eyebrow tone="dark">How it works</Eyebrow>
            <h2 className="h-display mt-4 text-[clamp(2.4rem,6.2vw,4rem)] text-balance text-cream">
              Pick a distance.{" "}
              <span className="serif-accent text-lime">Say hi.</span>
            </h2>
          </Reveal>
          <Reveal delay={110} className="max-w-sm">
            <p className="text-[14.5px] leading-relaxed text-cream/55">
              This is how a chat works, from picking your distance to your first hello. The buttons below are a preview, try the tabs.
            </p>
            <p className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.06em] text-cream/35 uppercase">
              <span className="h-1.5 w-1.5 rounded-full bg-lime" aria-hidden="true" />
              Illustrative preview · stock photos
            </p>
          </Reveal>
        </div>

        <Reveal delay={80} className="mt-9">
          <div
            role="tablist"
            aria-label="How a NearHi chat works"
            className="hide-scrollbar -mx-2 flex snap-x gap-1.5 overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.045] p-1.5 backdrop-blur-xl sm:mx-0 sm:w-fit"
          >
            {tabs.map((tab, index) => {
              const selected = active === tab.key;
              return (
                <button
                  key={tab.key}
                  ref={(node) => {
                    tabRefs.current[index] = node;
                  }}
                  role="tab"
                  id={`showcase-tab-${tab.key}`}
                  aria-selected={selected}
                  aria-controls={`showcase-panel-${tab.key}`}
                  tabIndex={selected ? 0 : -1}
                  onClick={() => setActive(tab.key)}
                  onKeyDown={(event) => onTabKeyDown(event, index)}
                  className={cn(
                    "flex shrink-0 snap-start items-center gap-2 rounded-xl px-3.5 py-2.5 text-[12.5px] font-semibold whitespace-nowrap transition-all duration-300 sm:px-4 sm:text-[13px]",
                    selected
                      ? "bg-paper text-fg shadow-[0_6px_20px_-8px_rgba(0,0,0,0.55)]"
                      : "text-cream/60 hover:bg-white/8 hover:text-cream",
                  )}
                >
                  <tab.icon
                    className={cn("h-4 w-4", selected ? "text-violet-dark" : "text-cream/45")}
                    aria-hidden="true"
                  />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </Reveal>

        <div
          key={`stage-${current.key}`}
          role="tabpanel"
          id={`showcase-panel-${current.key}`}
          aria-labelledby={`showcase-tab-${current.key}`}
          className="mt-5"
        >
          <p className="sr-only">{current.description}</p>
          <Reveal delay={120} scale>
            <div className="relative">
              <div
                className="pointer-events-none absolute -inset-x-8 -top-8 bottom-0 rounded-[50px] bg-gradient-to-b from-white/8 to-transparent blur-2xl"
                aria-hidden="true"
              />
              <div className="relative rounded-[24px] border border-white/12 bg-white/[0.055] p-1.5 shadow-[0_50px_120px_-50px_rgba(0,0,0,0.9)] backdrop-blur-sm sm:rounded-[30px] sm:p-2.5">
                <div className="mb-1 flex items-center justify-between gap-3 px-2.5 py-2" aria-hidden="true">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-[#FF6B6B]" />
                    <span className="h-2 w-2 rounded-full bg-[#FFC66D]" />
                    <span className="h-2 w-2 rounded-full bg-[#7BD88F]" />
                  </div>
                  <div className="flex min-w-0 items-center gap-1.5 rounded-full border border-white/8 bg-black/20 px-2.5 py-1">
                    <Lock className="h-2.5 w-2.5 shrink-0 text-cream/40" />
                    <span className="truncate text-[9.5px] text-cream/45">
                      nearhi.in/talk
                    </span>
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5">
                    <Volume2 className="h-3 w-3 text-cream/30" />
                    <MoreHorizontal className="h-3.5 w-3.5 text-cream/30" />
                  </div>
                </div>

                <div className="theme-light overflow-hidden rounded-[18px] bg-paper sm:rounded-[22px]">
                  <div className="flex min-h-[420px] text-fg sm:min-h-[452px]">
                    <DemoSidebar current={current} />
                    <div className="flex min-w-0 flex-1 flex-col">
                      <DemoTopBar title={current.title} />
                      <div className="flex min-h-0 flex-1 gap-2.5 p-2.5 sm:p-3.5">
                        <div key={current.key} className="enter-up flex min-w-0 flex-1 flex-col">
                          {active === "video" ? <VideoPanel /> : null}
                          {active === "text" ? <TextPanel /> : null}
                          {active === "radius" ? <RadiusPanel /> : null}
                        </div>
                        <DemoChat active={current.key} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>

          <div key={`info-${current.key}`} className="enter-up mt-7 grid gap-3 sm:grid-cols-3">
            <div>
              <div className="flex h-full gap-3 rounded-2xl border border-white/8 bg-white/[0.035] p-4">
                <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-lime" aria-hidden="true" />
                <div>
                  <p className="font-display text-[15px] font-semibold tracking-[-0.02em] text-cream">
                    {current.heading}
                  </p>
                  <p className="mt-1.5 text-[12px] leading-relaxed text-cream/50">
                    {current.description}
                  </p>
                </div>
              </div>
            </div>
            <div className="sm:col-span-2">
              <div className="grid h-full gap-3 rounded-2xl border border-white/8 bg-white/[0.035] p-4 sm:grid-cols-3">
                {current.features.map((feature) => (
                  <div key={feature} className="flex items-center gap-2.5">
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-lime/15">
                      <span className="h-1.5 w-1.5 rounded-full bg-lime" aria-hidden="true" />
                    </span>
                    <span className="text-[12px] font-medium text-cream/70">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function DemoSidebar({ current }: { current: (typeof tabs)[number] }) {
  const items = [
    { label: "Video chat", icon: Video, tab: "video" },
    { label: "Text chat", icon: MessageCircle, tab: "text" },
    { label: "Distance", icon: MapPin, tab: "radius" },
  ];

  return (
    <aside
      className="hidden w-[170px] shrink-0 flex-col border-r border-fg/8 bg-paper-warm p-3 md:flex"
      aria-hidden="true"
    >
      <div className="flex items-center gap-2 px-1.5 py-1">
        <span className="grid h-6 w-6 place-items-center rounded-[8px] bg-ink">
          <svg viewBox="0 0 645 554" className="h-3 w-3.5" fill="#DDF77A">
            <use href="#nh-mark" />
          </svg>
        </span>
        <span className="font-display text-[14px] font-bold tracking-[-0.04em]">nearhi</span>
      </div>

      <div className="mt-4 space-y-0.5">
        {items.map((item) => {
          const active = item.tab === current.key;
          return (
            <div
              key={item.label}
              className={cn(
                "flex items-center gap-2 rounded-lg px-2.5 py-2 text-[10.5px] font-semibold",
                active ? "bg-ink text-cream" : "text-fg/55",
              )}
            >
              <item.icon className="h-3.5 w-3.5" />
              {item.label}
              {item.tab === "video" ? <span className="ml-auto h-1.5 w-1.5 rounded-full bg-lime" /> : null}
            </div>
          );
        })}
      </div>

      <div className="mt-5 px-2">
        <p className="text-[8px] font-bold tracking-[0.14em] text-fg/35 uppercase">your settings</p>
        <div className="mt-2 space-y-2">
          {[
            { label: "Distance: 50 km", icon: MapPin },
            { label: "Camera on", icon: Camera },
            { label: "Mic on", icon: Mic },
          ].map((row) => (
            <div key={row.label} className="flex items-center gap-2">
              <span className="grid h-5 w-5 place-items-center rounded-full bg-lilac text-violet-dark">
                <row.icon className="h-2.5 w-2.5" />
              </span>
              <span className="truncate text-[9.5px] font-medium text-fg/55">{row.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-auto flex items-center gap-2 rounded-xl border border-fg/7 bg-surface/60 p-1.5">
        <img src={people.theo.avatar} alt="" className="h-6 w-6 rounded-full object-cover" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[9.5px] font-semibold text-fg">you</p>
          <p className="text-[8px] text-fg/40">no account needed</p>
        </div>
        <Settings className="h-3 w-3 text-fg/35" />
      </div>
    </aside>
  );
}

function DemoTopBar({ title }: { title: string }) {
  return (
    <div
      className="flex items-center justify-between gap-2 border-b border-fg/7 px-3 py-2.5 sm:px-4"
      aria-hidden="true"
    >
      <div className="flex min-w-0 items-center gap-2">
        <span className="flex items-center gap-1 rounded-md bg-lime/60 px-1.5 py-0.5 text-[7.5px] font-bold tracking-[0.08em] text-ink uppercase">
          <span className="h-1 w-1 rounded-full bg-ink" /> live
        </span>
        <p className="truncate text-[11px] font-semibold sm:text-[12px]">{title}</p>
      </div>
      <div className="flex items-center gap-2">
        <span className="hidden items-center gap-1 rounded-full border border-fg/10 bg-surface/70 px-2.5 py-1.5 text-[8.5px] font-semibold text-fg/60 sm:inline-flex sm:text-[9.5px]">
          <Lock className="h-2.5 w-2.5" /> 18+
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-ink px-2.5 py-1.5 text-[8.5px] font-semibold text-cream sm:text-[9.5px]">
          <SkipForward className="h-2.5 w-2.5" /> Skip
        </span>
        <MoreHorizontal className="h-3.5 w-3.5 text-fg/35" />
      </div>
    </div>
  );
}

const thread = {
  video: [
    { who: "Stranger", text: "hey! where are you from?", time: "0:12" },
    { who: "You", text: "not far from you, apparently", time: "0:20" },
    { who: "Stranger", text: "ha, small world", time: "0:27" },
  ],
  text: [
    { who: "Stranger", text: "random but hi 🙂", time: "0:04" },
    { who: "You", text: "hi! this is oddly easy", time: "0:09" },
    { who: "Stranger", text: "right? no sign-up even", time: "0:15" },
  ],
  radius: [
    { who: "You", text: "set to 25 km, let's see", time: "0:02" },
    { who: "Stranger", text: "matched, 12 km apart", time: "0:06" },
    { who: "You", text: "hi neighbour", time: "0:11" },
  ],
} as const;

function DemoChat({ active }: { active: TabKey }) {
  return (
    <aside
      className="hidden w-[190px] shrink-0 flex-col rounded-xl border border-fg/7 bg-surface/50 p-2.5 lg:flex"
      aria-hidden="true"
    >
      <div className="flex items-center justify-between px-0.5">
        <p className="text-[9.5px] font-bold tracking-[0.09em] text-fg/45 uppercase">text chat</p>
        <MessageCircle className="h-3 w-3 text-fg/30" />
      </div>
      <div className="mt-2.5 flex-1 space-y-2.5">
        {thread[active].map((message) => (
          <div key={`${message.who}-${message.text}`} className="flex gap-1.5">
            <img
              src={message.who === "You" ? people.theo.avatar : people.maya.avatar}
              alt=""
              className="mt-0.5 h-4 w-4 rounded-full object-cover"
            />
            <div className="min-w-0">
              <div className="flex items-baseline gap-1">
                <span className="text-[8px] font-bold text-fg/55">{message.who}</span>
                <span className="text-[7px] text-fg/30">{message.time}</span>
              </div>
              <p className="mt-0.5 text-[9px] leading-snug text-fg/70">{message.text}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-2 flex items-center gap-1 rounded-lg border border-fg/8 bg-surface px-2 py-1.5">
        <span className="flex-1 text-[8.5px] text-fg/35">Say something…</span>
        <Send className="h-3 w-3 text-fg/30" />
      </div>
    </aside>
  );
}

function PersonTile({
  person,
  note,
  className,
  cameraOff = false,
  speaking = false,
}: {
  person: { name: string; src: string };
  note?: string;
  className?: string;
  cameraOff?: boolean;
  speaking?: boolean;
}) {
  return (
    <div
      className={cn(
        "group/demo relative min-h-[112px] overflow-hidden rounded-xl bg-paper-deep ring-1 ring-black/5",
        speaking && "ring-2 ring-lime-deep",
        className,
      )}
    >
      <img
        src={person.src}
        alt=""
        className={cn(
          "absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover/demo:scale-[1.03]",
          cameraOff && "scale-105 brightness-[0.62] blur-[1.5px]",
        )}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/5" />
      <div className="absolute top-2 left-2 flex items-center gap-1 rounded bg-black/40 px-1.5 py-0.5 text-[8px] font-semibold text-white backdrop-blur-sm">
        {person.name}
        {speaking ? <Waveform className="ml-0.5 h-2.5" /> : null}
      </div>
      {cameraOff ? (
        <span className="absolute top-2 right-2 grid h-4 w-4 place-items-center rounded-full bg-black/40 text-white">
          <CameraOff className="h-2.5 w-2.5" />
        </span>
      ) : null}
      {note ? (
        <p className="absolute right-2 bottom-2 left-2 truncate text-[8.5px] font-medium text-white/80">{note}</p>
      ) : null}
    </div>
  );
}

function DemoDock() {
  return (
    <div className="mt-2 flex items-center justify-between gap-2 rounded-xl bg-ink px-2.5 py-2" aria-hidden="true">
      <span className="hidden items-center gap-1.5 text-[8.5px] font-medium text-cream/45 sm:flex">
        <Lock className="h-2.5 w-2.5" /> not recorded
      </span>
      <div className="flex flex-1 items-center justify-center gap-1.5">
        {[Mic, Camera, MessageCircle, SkipForward].map((Icon, index) => (
          <span
            key={index}
            className={cn(
              "grid h-7 w-7 place-items-center rounded-full bg-white/8 text-cream/80",
              index === 2 && "bg-lime text-ink",
            )}
          >
            <Icon className="h-3 w-3" />
          </span>
        ))}
        <span className="grid h-7 w-7 place-items-center rounded-full bg-[#F2555A] text-white">
          <PhoneOff className="h-3 w-3" />
        </span>
      </div>
      <span className="hidden text-[8px] font-medium text-cream/35 sm:block">0:27</span>
    </div>
  );
}

function VideoPanel() {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="grid min-h-[254px] flex-1 grid-cols-2 grid-rows-2 gap-1.5 sm:grid-cols-3">
        <PersonTile
          person={{ ...people.maya, name: "Stranger" }}
          note="12 km away"
          speaking
          className="min-h-[110px] sm:col-span-2 sm:row-span-2 sm:min-h-[200px]"
        />
        <PersonTile person={{ ...people.theo, name: "You" }} note="camera on" className="hidden sm:block" />
        <div className="relative hidden overflow-hidden rounded-xl bg-lilac p-2.5 ring-1 ring-black/5 sm:flex sm:flex-col sm:justify-between">
          <span className="grid h-6 w-6 place-items-center rounded-full bg-surface/80 text-violet-dark">
            <MapPin className="h-3 w-3" />
          </span>
          <div>
            <p className="font-display text-[15px] leading-none font-semibold tracking-[-0.03em]">12 km</p>
            <p className="mt-1 text-[8px] leading-snug text-fg/50">inside your 50 km radius</p>
          </div>
        </div>
        <PersonTile
          person={{ ...people.theo, name: "You" }}
          note="camera on"
          className="col-span-2 sm:hidden"
        />
      </div>
      <div className="mt-2 flex items-center gap-2 rounded-lg bg-surface/65 px-2.5 py-1.5 ring-1 ring-fg/6">
        <span className="shrink-0 rounded bg-lime px-1 py-0.5 text-[6.5px] font-bold tracking-[0.08em] text-ink uppercase">
          chat
        </span>
        <p className="truncate text-[8.5px] text-fg/60">Stranger: hey! where are you from?</p>
        <Waveform tone="dark" className="ml-auto hidden h-2.5 sm:flex" />
      </div>
      <DemoDock />
    </div>
  );
}

function TextPanel() {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2">
      <div className="relative flex flex-1 flex-col overflow-hidden rounded-xl bg-lilac p-3 sm:p-4">
        <div className="absolute -top-8 -right-8 h-24 w-24 rounded-full bg-violet/15 blur-xl" aria-hidden="true" />
        <div className="relative flex items-center justify-between gap-2">
          <span className="rounded bg-ink px-1.5 py-1 text-[7px] font-bold tracking-[0.09em] text-lime uppercase">
            text chat
          </span>
          <span className="flex items-center gap-1 rounded-full bg-surface/70 px-2 py-1 text-[8px] font-semibold text-fg/55">
            <span className="h-1 w-1 rounded-full bg-violet" /> 12 km away
          </span>
        </div>
        <div className="relative flex flex-1 flex-col justify-center gap-2 py-3">
          {[
            { me: false, text: "random but hi 🙂" },
            { me: true, text: "hi! this is oddly easy" },
            { me: false, text: "right? no sign-up even" },
            { me: true, text: "ha. where are you?" },
          ].map((m) => (
            <p
              key={m.text}
              className={cn(
                "max-w-[78%] rounded-xl px-3 py-2 text-[10.5px] leading-snug sm:text-[11.5px]",
                m.me
                  ? "ml-auto rounded-br-sm bg-violet text-white"
                  : "rounded-bl-sm bg-surface text-fg/75 ring-1 ring-fg/6",
              )}
            >
              {m.text}
            </p>
          ))}
        </div>
        <div className="relative flex items-center justify-between rounded-lg border border-fg/8 bg-surface px-2.5 py-2">
          <span className="text-[9px] text-fg/35">Say something…</span>
          <Send className="h-3 w-3 text-violet-dark" />
        </div>
      </div>
      <div className="flex items-center justify-between rounded-lg bg-ink px-2.5 py-2 text-cream">
        <span className="flex items-center gap-1.5 text-[8px] font-medium text-cream/55">
          <Lock className="h-3 w-3 text-lime" /> messages are screened automatically
        </span>
        <span className="rounded bg-lime px-1.5 py-0.5 text-[6.5px] font-bold tracking-[0.06em] text-ink uppercase">
          report anyone
        </span>
      </div>
    </div>
  );
}

const radiusOptions = ["10 km", "25 km", "50 km", "100 km", "Anywhere", "Custom…"];

function RadiusPanel() {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2">
      <div className="relative flex flex-1 flex-col overflow-hidden rounded-xl bg-ink px-3 py-4 text-cream sm:p-4">
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, rgba(247,244,237,0.16) 1px, transparent 0)",
            backgroundSize: "18px 18px",
          }}
          aria-hidden="true"
        />
        <span className="relative flex w-fit items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[7px] font-semibold tracking-[0.12em] text-lime uppercase">
          <MapPin className="h-2.5 w-2.5" /> distance
        </span>
        <div className="relative my-3 grid flex-1 place-items-center">
          <div className="relative grid aspect-square h-[150px] place-items-center sm:h-[170px]">
            <span className="absolute inset-0 rounded-full border border-dashed border-white/20" />
            <span className="absolute inset-[22%] rounded-full border border-lime/40 bg-lime/10" />
            <span className="relative grid h-5 w-5 place-items-center rounded-full bg-lime ring-4 ring-lime/25">
              <span className="h-1.5 w-1.5 rounded-full bg-ink" />
            </span>
            {[
              [18, 30],
              [70, 22],
              [78, 66],
              [34, 78],
            ].map(([x, y]) => (
              <span
                key={`${x}-${y}`}
                className="absolute h-2 w-2 rounded-full bg-violet ring-2 ring-white/40"
                style={{ left: `${x}%`, top: `${y}%` }}
              />
            ))}
          </div>
        </div>
        <div className="relative flex flex-wrap justify-center gap-1">
          {radiusOptions.map((option) => (
            <span
              key={option}
              className={cn(
                "rounded-full px-2.5 py-1 text-[8.5px] font-semibold",
                option === "50 km" ? "bg-lime text-ink" : "bg-white/8 text-cream/60",
              )}
            >
              {option}
            </span>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-between rounded-lg bg-surface/70 px-2.5 py-2 ring-1 ring-fg/6">
        <div className="flex min-w-0 items-center gap-1.5">
          <span className="grid h-5 w-5 shrink-0 place-items-center rounded bg-lilac text-violet-dark">
            <Sparkles className="h-2.5 w-2.5" />
          </span>
          <p className="truncate text-[8.5px] font-medium text-fg/60">
            Matches need your radius and theirs to overlap
          </p>
        </div>
        <span className="shrink-0 text-[7.5px] font-semibold text-violet-dark">fair for both</span>
      </div>
    </div>
  );
}