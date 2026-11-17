"use client";

import type { CSSProperties } from "react";
import { ArrowUpRight, Check, Play, ShieldCheck } from "lucide-react";
import { HeroRoom } from "./HeroRoom";
import { primaryButton, secondaryButton } from "./ui";

export function Hero() {
  return (
    <section id="hero" className="relative overflow-hidden pt-28 pb-16 sm:pt-32 lg:pt-40 lg:pb-24">
      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-60"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(21,19,27,0.11) 1px, transparent 0)",
          backgroundSize: "30px 30px",
          maskImage: "radial-gradient(ellipse 75% 60% at 68% 22%, black 10%, transparent 72%)",
          WebkitMaskImage: "radial-gradient(ellipse 75% 60% at 68% 22%, black 10%, transparent 72%)",
        }}
        aria-hidden="true"
      />
      <div
        className="animate-blob pointer-events-none absolute -top-32 -right-24 -z-10 h-[540px] w-[540px] rounded-full bg-[radial-gradient(circle,rgba(108,75,244,0.2),rgba(108,75,244,0)_68%)] blur-2xl"
        aria-hidden="true"
      />
      <div
        className="animate-float-slow pointer-events-none absolute top-1/3 -left-40 -z-10 h-[460px] w-[460px] rounded-full bg-[radial-gradient(circle,rgba(221,247,122,0.34),rgba(221,247,122,0)_68%)] blur-2xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute top-20 left-[54%] -z-10 hidden h-36 w-36 rounded-full bg-coral/15 blur-3xl lg:block"
        aria-hidden="true"
      />

      <div className="mx-auto grid w-full max-w-[1240px] items-center gap-14 px-5 sm:px-7 lg:grid-cols-[1.02fr_0.98fr] lg:gap-10 lg:px-10">
        <div className="relative z-10 text-center lg:text-left">
          <div
            className="enter-up inline-flex items-center gap-2 rounded-full border border-ink/10 bg-white/60 py-1.5 pr-3.5 pl-1.5 text-[11.5px] font-medium text-ink/75 shadow-[0_4px_18px_-10px_rgba(21,19,27,0.35)] backdrop-blur-md sm:text-[12px]"
            style={{ "--enter-delay": "60ms" } as CSSProperties}
          >
            <span className="flex items-center gap-1 rounded-full bg-ink px-2 py-1 text-[9px] font-bold tracking-[0.09em] text-lime uppercase">
              <span className="animate-pulse-dot h-1.5 w-1.5 rounded-full bg-lime" aria-hidden="true" />
              free
            </span>
            Pick your distance, meet someone nearby
            <ArrowUpRight className="h-3.5 w-3.5 text-ink/40" aria-hidden="true" />
          </div>

          <h1
            className="h-display enter-up mt-6 text-[clamp(3rem,10.2vw,4.15rem)] text-balance sm:text-[clamp(3.85rem,8.5vw,4.7rem)] lg:text-[clamp(4.3rem,5.8vw,5.35rem)]"
            style={{ "--enter-delay": "140ms" } as CSSProperties}
          >
            Random chat,
            <br />
            but{" "}
            <span className="serif-accent relative inline-block text-violet-dark">
              close to home
              <span className="text-ink">.</span>
              <svg
                className="text-coral absolute -bottom-1.5 left-0 h-3 w-full sm:-bottom-2 sm:h-4"
                viewBox="0 0 300 18"
                fill="none"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <path
                  d="M2 12.5C58 4.5 116 4.8 150 8.2C198 13 248 9 298 3.5"
                  stroke="currentColor"
                  strokeWidth="4.5"
                  strokeLinecap="round"
                  opacity="0.85"
                />
              </svg>
            </span>
          </h1>

          <p
            className="enter-up mx-auto mt-7 max-w-[34rem] text-[16px] leading-[1.65] text-muted text-pretty sm:text-[17px] lg:mx-0 lg:max-w-[31rem]"
            style={{ "--enter-delay": "230ms" } as CSSProperties}
          >
            Video or text chat with a random person near you. You choose how far, from 10 km to
            anywhere. No account to make, nothing to install, and you can
            <span className="whitespace-nowrap"> skip anyone, any time.</span>
          </p>

          <div
            className="enter-up mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start"
            style={{ "--enter-delay": "320ms" } as CSSProperties}
          >
            <a
              href="/talk/"
              className={`${primaryButton} w-full px-7 py-4 text-[15px] sm:w-auto`}
            >
              Start chatting
              <ArrowUpRight
                className="h-[18px] w-[18px] transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                aria-hidden="true"
              />
            </a>
            <a
              href="#how-it-works"
              className={`${secondaryButton} w-full px-6 py-4 text-[15px] sm:w-auto`}
            >
              <span className="grid h-5 w-5 place-items-center rounded-full bg-ink text-paper">
                <Play className="ml-px h-2.5 w-2.5 fill-current" aria-hidden="true" />
              </span>
              See how it works
            </a>
          </div>

          <div
            className="enter-up mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[11.5px] font-medium text-ink/60 sm:text-[12px] lg:justify-start"
            style={{ "--enter-delay": "400ms" } as CSSProperties}
          >
            {["Free right now", "No account needed", "Works in your phone browser"].map((item) => (
              <span key={item} className="inline-flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-violet-dark" aria-hidden="true" />
                {item}
              </span>
            ))}
          </div>

          <div
            className="enter-up mt-8 flex flex-col items-center gap-3 border-t border-ink/8 pt-6 sm:flex-row sm:gap-4 lg:justify-start"
            style={{ "--enter-delay": "480ms" } as CSSProperties}
          >
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-lilac text-violet-dark">
              <ShieldCheck className="h-5 w-5" aria-hidden="true" />
            </span>
            <div className="text-center sm:text-left">
              <p className="text-[12.5px] font-semibold text-ink">Adults only, 18+</p>
              <p className="mt-0.5 text-[11.5px] text-muted">
                Skip or stop at any moment. Video is screened automatically and never recorded.
              </p>
            </div>
          </div>
        </div>

        <div
          className="enter-scale relative lg:pt-4"
          style={{ "--enter-delay": "280ms" } as CSSProperties}
        >
          <HeroRoom />
        </div>
      </div>
    </section>
  );
}
