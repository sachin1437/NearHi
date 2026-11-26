"use client";

import { useEffect, useRef, useState } from "react";
import {
  Camera,
  CameraOff,
  Loader2,
  Lock,
  MapPin,
  MessageCircle,
  Mic,
  MicOff,
  PhoneOff,
  Signal,
  SkipForward,
  VideoOff,
} from "lucide-react";
import { people } from "@/lib/content";
import { cn } from "@/lib/cn";
import { Waveform } from "./ui";

const strangers = [
  { person: people.maya, km: 12, note: "hey! where are you from?", caption: "hey! where are you from?" },
  { person: people.leo, km: 38, note: "just got home, you?", caption: "just got home, you?" },
  { person: people.priya, km: 7, note: "random but hi", caption: "random but hi 🙂" },
];

function formatTime(total: number) {
  const minutes = Math.floor(total / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (total % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

export function HeroRoom() {
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [ended, setEnded] = useState(false);
  const [searching, setSearching] = useState(false);
  const [index, setIndex] = useState(0);
  const [seconds, setSeconds] = useState(2 * 60 + 14);
  const timeout = useRef<number | null>(null);
  const tiltRef = useRef<HTMLDivElement>(null);
  const current = strangers[index % strangers.length]!;

  useEffect(() => {
    if (ended || searching) return;
    const interval = window.setInterval(() => setSeconds((value) => value + 1), 1000);
    return () => window.clearInterval(interval);
  }, [ended, searching]);

  useEffect(() => () => {
    if (timeout.current) window.clearTimeout(timeout.current);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const media = window.matchMedia("(min-width: 1024px) and (prefers-reduced-motion: no-preference)");
    if (!media.matches) return;
    const el = tiltRef.current;
    if (!el) return;

    const onMove = (event: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      el.style.transform = `perspective(1500px) rotateY(${x * -4.5}deg) rotateX(${y * 3.5}deg) translateY(-2px)`;
    };
    const onLeave = () => {
      el.style.transform = "perspective(1500px) rotateY(0deg) rotateX(0deg)";
    };

    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  const skip = () => {
    if (searching) return;
    setSearching(true);
    timeout.current = window.setTimeout(() => {
      setIndex((value) => value + 1);
      setSeconds(0);
      setSearching(false);
    }, 1300);
  };

  const controlBase =
    "grid place-items-center rounded-full text-cream transition-all duration-200 hover:scale-105 hover:bg-surface/20 focus-visible:outline-paper";

  return (
    <div className="relative mx-auto w-full max-w-[570px] lg:mx-0 lg:max-w-[590px]">
      <div className="absolute -top-10 -right-10 h-56 w-56 rounded-full [background:radial-gradient(closest-side,color-mix(in_oklab,var(--color-violet)_30%,transparent),transparent)]" aria-hidden="true" />
      <div className="absolute -bottom-14 -left-12 h-56 w-56 rounded-full [background:radial-gradient(closest-side,color-mix(in_oklab,var(--color-coral)_30%,transparent),transparent)]" aria-hidden="true" />
      <div className="absolute top-1/3 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full [background:radial-gradient(closest-side,color-mix(in_oklab,var(--color-lime)_24%,transparent),transparent)]" aria-hidden="true" />

      <div className="relative">
        <div
          ref={tiltRef}
          className="noise relative z-10 rounded-[28px] border border-white/12 bg-[#17141f] p-2.5 shadow-[0_50px_100px_-40px_rgba(21,19,27,0.7)] transition-transform duration-300 ease-out sm:rounded-[32px] sm:p-3"
          style={{ transform: "perspective(1500px)" }}
        >
          <div className="relative z-10">
            <div className="flex items-center justify-between gap-3 px-1.5 pt-1 pb-3 sm:px-2">
              <div className="flex min-w-0 items-center gap-2">
                <span className="relative flex h-2 w-2 shrink-0">
                  <span className="animate-pulse-dot absolute inline-flex h-2 w-2 rounded-full bg-lime" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-lime" />
                </span>
                <div className="min-w-0">
                  <p className="truncate font-display text-[13px] font-semibold tracking-[-0.02em] text-cream">
                    {searching ? "Finding someone nearby" : "Connected"}
                  </p>
                  <p className="text-[10px] font-medium text-cream/45">
                    {searching ? "Within 50 km" : `${current.km} km away · within your 50 km`}
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-1.5">
                <span className="hidden items-center gap-1 rounded-full border border-white/10 bg-white/6 px-2 py-1 text-[9px] font-semibold tracking-[0.06em] text-cream/65 uppercase sm:flex">
                  <Lock className="h-2.5 w-2.5" aria-hidden="true" /> 18+ only
                </span>
                <span className="rounded-full border border-white/10 bg-white/6 px-2 py-1 font-mono text-[10px] tabular-nums text-cream/75">
                  <span className="sr-only">Chat duration </span>
                  {formatTime(seconds)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {searching ? (
                <div className="relative grid aspect-[5/4] place-items-center overflow-hidden rounded-xl bg-[#2b2536] ring-1 ring-white/8 sm:rounded-2xl">
                  <div className="flex flex-col items-center gap-2 text-cream/60">
                    <Loader2 className="h-5 w-5 animate-spin text-lime" aria-hidden="true" />
                    <span className="text-[10px] font-medium">Looking for someone…</span>
                  </div>
                </div>
              ) : (
                <RoomTile
                  person={{ ...current.person, name: "Stranger" }}
                  speaking
                  note={current.note}
                  badge={<Waveform className="h-3.5" />}
                />
              )}
              <RoomTile
                person={{ ...people.theo, name: "You" }}
                note={camOn ? "your camera" : "camera off"}
                cameraOff={!camOn}
              />
            </div>

            <div className="mt-2.5 flex items-center gap-2 rounded-xl border border-white/8 bg-white/5 px-3 py-2">
              <span className="shrink-0 rounded bg-lime px-1.5 py-0.5 text-[8px] font-bold tracking-[0.1em] text-ink uppercase">
                chat
              </span>
              <p className="min-w-0 flex-1 truncate text-[11px] text-cream/70">
                {searching ? "Matching you with someone inside your radius…" : `Stranger: ${current.caption}`}
              </p>
              <Waveform className="hidden h-4 shrink-0 sm:flex" />
            </div>

            <div className="relative mt-2.5 flex items-center justify-between gap-2 rounded-2xl border border-white/10 bg-white/[0.07] px-2 py-2 backdrop-blur-xl sm:px-3">
              <div className="hidden min-w-0 items-center gap-1.5 pl-1 sm:flex">
                <MapPin className="h-3.5 w-3.5 text-lime" aria-hidden="true" />
                <span className="truncate text-[10px] font-medium text-cream/50">50 km</span>
              </div>
              <div className="flex flex-1 items-center justify-center gap-1.5 sm:gap-2">
                <button
                  type="button"
                  onClick={() => setMicOn((value) => !value)}
                  aria-pressed={!micOn}
                  aria-label={micOn ? "Mute your microphone" : "Unmute your microphone"}
                  className={cn(controlBase, "h-9 w-9 sm:h-10 sm:w-10", !micOn && "bg-coral text-fg hover:bg-coral")}
                >
                  {micOn ? <Mic className="h-4 w-4" aria-hidden="true" /> : <MicOff className="h-4 w-4" aria-hidden="true" />}
                </button>
                <button
                  type="button"
                  onClick={() => setCamOn((value) => !value)}
                  aria-pressed={!camOn}
                  aria-label={camOn ? "Turn your camera off" : "Turn your camera on"}
                  className={cn(controlBase, "h-9 w-9 sm:h-10 sm:w-10", !camOn && "bg-coral text-fg hover:bg-coral")}
                >
                  {camOn ? <Camera className="h-4 w-4" aria-hidden="true" /> : <CameraOff className="h-4 w-4" aria-hidden="true" />}
                </button>
                <span
                  className={cn(controlBase, "h-9 w-9 bg-white/10 ring-1 ring-lime/40 sm:h-10 sm:w-10")}
                  aria-hidden="true"
                >
                  <MessageCircle className="h-4 w-4 text-lime" />
                </span>
                <button
                  type="button"
                  onClick={skip}
                  aria-label="Skip to someone new"
                  className={cn(controlBase, "h-9 w-9 sm:h-10 sm:w-10")}
                >
                  <SkipForward className="h-4 w-4" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => setEnded(true)}
                  aria-label="Stop the chat"
                  className="grid h-9 w-9 place-items-center rounded-full bg-[#F2555A] text-white transition-transform duration-200 hover:scale-105 sm:h-10 sm:w-10"
                >
                  <PhoneOff className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
              <div className="hidden w-[74px] items-center justify-end gap-1 pr-1 text-[9px] font-medium text-cream/40 sm:flex">
                <Signal className="h-3 w-3 text-lime" aria-hidden="true" /> Live
              </div>
            </div>

            {ended ? (
              <div className="absolute inset-0 z-40 flex flex-col items-center justify-center gap-3 rounded-[22px] bg-ink/88 p-6 text-center backdrop-blur-md">
                <span className="grid h-11 w-11 place-items-center rounded-full bg-white/10 text-cream">
                  <PhoneOff className="h-5 w-5" aria-hidden="true" />
                </span>
                <p className="font-display text-[18px] font-semibold tracking-[-0.03em] text-cream">
                  Chat stopped.
                </p>
                <p className="max-w-[15rem] text-[11px] leading-relaxed text-cream/50">
                  That is all it takes to leave. Nothing was recorded and nobody is notified.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setEnded(false);
                    setSeconds(0);
                  }}
                  className="mt-1 rounded-full bg-lime px-4 py-2 text-[11px] font-semibold text-ink transition-transform hover:scale-105"
                >
                  Find someone new
                </button>
              </div>
            ) : null}
          </div>
        </div>

        <div className="animate-float absolute -top-11 -left-2 z-20 hidden items-center gap-2.5 rounded-2xl border border-white/60 bg-surface/85 px-3 py-2.5 shadow-float backdrop-blur-xl sm:flex lg:-left-10">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-lilac text-violet-dark">
            <MapPin className="h-4 w-4" aria-hidden="true" />
          </span>
          <div>
            <p className="text-[11.5px] font-semibold text-fg">Matched nearby</p>
            <p className="text-[10px] text-muted">inside your radius</p>
          </div>
        </div>

        <div
          className="animate-float-slow absolute -right-2 -bottom-7 z-20 hidden items-center gap-2.5 rounded-2xl border border-white/10 bg-[#1d1926]/95 px-3.5 py-2.5 shadow-float backdrop-blur-xl sm:flex lg:-right-7"
          style={{ "--float-rotate": "2deg" } as React.CSSProperties}
        >
          <span className="grid h-8 w-8 place-items-center rounded-xl bg-lime text-ink">
            <SkipForward className="h-4 w-4" aria-hidden="true" />
          </span>
          <div>
            <p className="text-[11.5px] font-semibold text-cream">Not feeling it? Skip.</p>
            <p className="text-[10px] text-cream/50">Next person, one tap</p>
          </div>
          <span className="ml-1 h-2 w-2 rounded-full bg-lime" aria-hidden="true" />
        </div>

        <div
          className="animate-float absolute top-1/2 -right-3 z-20 hidden -translate-y-1/2 rotate-6 rounded-full bg-lime px-2.5 py-1 text-[9px] font-bold tracking-[0.08em] text-ink uppercase shadow-lg md:block lg:-right-6"
          style={{ animationDelay: "-2.5s" }}
        >
          no sign-up
        </div>
      </div>

      <div className="mt-7 flex items-center justify-center gap-1.5 rounded-2xl border border-fg/8 bg-surface/55 px-3 py-2.5 backdrop-blur-md sm:mt-8 sm:justify-between sm:gap-3 sm:px-4">
        {["Pick a distance", "Get matched", "Say hi"].map((step, i) => (
          <div key={step} className="flex min-w-0 items-center gap-1.5">
            <span
              className={cn(
                "grid h-4 w-4 shrink-0 place-items-center rounded-full font-mono text-[8px] font-bold",
                i === 2 ? "bg-ink text-lime" : "bg-lilac text-violet-dark",
              )}
              aria-hidden="true"
            >
              {i + 1}
            </span>
            <span className="truncate text-[10px] font-semibold text-fg/65 sm:text-[11px]">{step}</span>
            {i < 2 ? <span className="mx-0.5 hidden h-px w-3 bg-fg/15 sm:block" aria-hidden="true" /> : null}
          </div>
        ))}
      </div>
      <p className="mt-2 text-center text-[10px] text-muted">Illustrative preview. Photos are stock images, the buttons work.</p>
    </div>
  );
}

function RoomTile({
  person,
  note,
  speaking = false,
  cameraOff = false,
  badge,
}: {
  person: { name: string; src: string; avatar: string };
  note: string;
  speaking?: boolean;
  cameraOff?: boolean;
  badge?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "group/tile relative aspect-[5/4] overflow-hidden rounded-xl bg-[#2b2536] sm:rounded-2xl",
        speaking ? "ring-2 ring-lime/80" : "ring-1 ring-white/8",
      )}
    >
      <img
        src={person.src}
        alt={`${person.name} on the video call`}
        width={800}
        height={1000}
        loading="eager"
        decoding="async"
        className={cn(
          "h-full w-full object-cover transition-transform duration-700 group-hover/tile:scale-[1.04]",
          cameraOff && "scale-105 blur-[2px] brightness-[0.55]",
        )}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/0 to-black/10" />

      <div className="absolute top-2 left-2 flex items-center gap-1.5">
        <span className="rounded-md bg-black/40 px-1.5 py-0.5 text-[9.5px] font-semibold text-white backdrop-blur-md">
          {person.name}
        </span>
        {speaking ? (
          <span className="flex items-center rounded-md bg-lime px-1.5 py-0.5">
            {badge ?? <Waveform className="h-3" />}
          </span>
        ) : null}
      </div>

      <div className="absolute top-2 right-2">
        {cameraOff ? (
          <span className="grid h-5 w-5 place-items-center rounded-full bg-black/45 text-white backdrop-blur-md">
            <VideoOff className="h-2.5 w-2.5" aria-label="Camera off" />
          </span>
        ) : (
          <span className="grid h-5 w-5 place-items-center rounded-full bg-black/35 text-white/85 backdrop-blur-md">
            <Mic className="h-2.5 w-2.5" aria-hidden="true" />
          </span>
        )}
      </div>

      <div className="absolute inset-x-2 bottom-2 flex items-center justify-between gap-2">
        <p className="truncate text-[9.5px] font-medium text-white/85 sm:text-[10.5px]">{note}</p>
        {speaking ? (
          <span className="hidden items-center gap-1 rounded-full bg-black/35 px-1.5 py-0.5 text-[8px] font-semibold text-lime backdrop-blur-sm sm:flex">
            talking
          </span>
        ) : null}
      </div>
    </div>
  );
}