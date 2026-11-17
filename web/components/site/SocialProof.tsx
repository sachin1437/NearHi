"use client";

import { facts } from "@/lib/content";
import { Reveal } from "./ui";

const stats = [
  { value: "10 km", label: "smallest distance you can pick, up to anywhere" },
  { value: "0", label: "accounts to make, nothing to install" },
  { value: "18+", label: "adults only, skip or stop at any moment" },
];

export function SocialProof() {
  const logos = [...facts, ...facts];

  return (
    <section
      aria-label="The short version of how NearHi works"
      className="relative border-y border-fg/8 bg-paper-warm py-9 sm:py-11"
    >
      <div className="mx-auto max-w-[1240px] px-5 sm:px-7 lg:px-10">
        <p className="text-center text-[10.5px] font-semibold tracking-[0.2em] text-muted uppercase">
          The short version
        </p>
      </div>

      <div
        className="marquee-wrap relative mt-6 overflow-hidden"
        style={{
          maskImage: "linear-gradient(to right, transparent, black 9%, black 91%, transparent)",
          WebkitMaskImage:
            "linear-gradient(to right, transparent, black 9%, black 91%, transparent)",
        }}
      >
        <div className="animate-marquee flex w-max items-center gap-12 pr-12 sm:gap-16 sm:pr-16">
          {logos.map((logo, index) => (
            <span
              key={`${logo.name}-${index}`}
              aria-hidden={index >= facts.length}
              className={`${logo.className} shrink-0 text-fg/45 transition-colors duration-300 hover:text-fg/80`}
            >
              {logo.name}
            </span>
          ))}
        </div>
      </div>

      <div className="mx-auto mt-9 max-w-[1240px] px-5 sm:px-7 lg:px-10">
        <dl className="grid grid-cols-3 divide-x divide-ink/10 border-t border-fg/8 pt-7">
          {stats.map((stat, index) => (
            <Reveal key={stat.value} delay={index * 90} className="px-3 first:pl-0 sm:px-7">
              <div className="flex flex-col items-center gap-1 text-center sm:flex-row sm:items-baseline sm:gap-2.5 sm:text-left">
                <dt className="sr-only">{stat.label}</dt>
                <dd className="font-display text-[23px] font-semibold tracking-[-0.045em] text-fg sm:text-[30px]">
                  {stat.value}
                </dd>
                <dd className="max-w-[10rem] text-[10.5px] leading-snug text-muted sm:text-[12px]">
                  {stat.label}
                </dd>
              </div>
            </Reveal>
          ))}
        </dl>
      </div>
    </section>
  );
}
