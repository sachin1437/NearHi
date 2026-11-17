"use client";

import { useState } from "react";
import { ArrowUpRight, Mail, Plus } from "lucide-react";
import { faqs } from "@/lib/faqs";
import { cn } from "@/lib/cn";
import { Eyebrow, Reveal } from "./ui";

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="scroll-mt-24 border-t border-fg/8 bg-paper-warm py-20 sm:py-28 lg:py-32">
      <div className="mx-auto max-w-[1240px] px-5 sm:px-7 lg:px-10">
        <div className="grid gap-12 lg:grid-cols-[0.82fr_1.18fr] lg:gap-20">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <Reveal>
              <Eyebrow>Good questions</Eyebrow>
              <h2 className="h-display mt-4 text-[clamp(2.4rem,6.2vw,3.7rem)] text-balance">
                The things you&apos;re
                <br />
                probably <span className="serif-accent text-violet-dark">wondering.</span>
              </h2>
              <p className="mt-5 max-w-sm text-[14.5px] leading-relaxed text-muted">
                Straight answers, no fine print. If yours isn&apos;t here, send us an email.
              </p>
            </Reveal>

            <Reveal delay={130}>
              <div className="noise relative mt-8 overflow-hidden rounded-[24px] border border-white/10 bg-ink p-5 text-cream">
                <div
                  className="pointer-events-none absolute -top-10 -right-6 h-28 w-28 rounded-full bg-violet/40 blur-2xl"
                  aria-hidden="true"
                />
                <div className="relative flex items-center gap-3">
                  <span className="grid h-11 w-11 place-items-center rounded-full bg-lime text-ink ring-2 ring-white/15">
                    <Mail className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-[12px] font-semibold text-cream">The NearHi team</p>
                    <p className="text-[10.5px] text-cream/45">replies by email</p>
                  </div>
                </div>
                <p className="relative mt-3 font-serif text-[19px] leading-snug text-cream/85">
                  “Ask us anything, even the weird stuff.”
                </p>
                <a
                  href="mailto:nearhi.in@gmail.com?subject=NearHi%20question"
                  className="group relative mt-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-3.5 py-2 text-[11px] font-semibold text-cream transition-colors hover:bg-surface/15"
                >
                  <Mail className="h-3.5 w-3.5 text-lime" aria-hidden="true" />
                  Email us
                  <ArrowUpRight
                    className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    aria-hidden="true"
                  />
                </a>
              </div>
            </Reveal>
          </div>

          <Reveal delay={80}>
            <div className="border-t border-fg/10">
              {faqs.map((faq, index) => {
                const isOpen = open === index;
                return (
                  <div key={faq.q} className="border-b border-fg/10">
                    <h3>
                      <button
                        type="button"
                        onClick={() => setOpen(isOpen ? null : index)}
                        aria-expanded={isOpen}
                        aria-controls={`faq-panel-${index}`}
                        id={`faq-button-${index}`}
                        className="group flex w-full items-start justify-between gap-4 py-4 text-left sm:py-5"
                      >
                        <span
                          className={cn(
                            "text-[14.5px] font-semibold text-pretty transition-colors duration-200 sm:text-[15.5px]",
                            isOpen ? "text-fg" : "text-fg/80 group-hover:text-fg",
                          )}
                        >
                          {faq.q}
                        </span>
                        <span
                          className={cn(
                            "mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full border transition-all duration-300",
                            isOpen
                              ? "rotate-45 border-ink bg-ink text-cream dark:border-lime dark:bg-lime dark:text-ink"
                              : "border-fg/12 bg-surface/50 text-fg/55 group-hover:border-fg/25 group-hover:text-fg",
                          )}
                          aria-hidden="true"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </span>
                      </button>
                    </h3>
                    <div
                      id={`faq-panel-${index}`}
                      role="region"
                      aria-labelledby={`faq-button-${index}`}
                      aria-hidden={!isOpen}
                      className={cn(
                        "grid transition-all duration-400 ease-out",
                        isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
                      )}
                    >
                      <div className="overflow-hidden">
                        <p className="max-w-[38rem] pr-8 pb-5 text-[13px] leading-[1.7] text-muted sm:text-[13.5px]">
                          {faq.a}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
