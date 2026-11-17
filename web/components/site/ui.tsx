"use client";

import { useEffect, useRef, useState, type ReactNode, type CSSProperties } from "react";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/cn";

export const primaryButton =
  "shine group inline-flex items-center justify-center gap-2.5 rounded-full bg-ink px-6 py-3.5 text-[15px] font-semibold text-cream dark:bg-lime dark:text-ink shadow-[0_14px_34px_-16px_rgba(21,19,27,0.75)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-ink-soft dark:hover:bg-lime-deep hover:shadow-[0_20px_44px_-18px_rgba(21,19,27,0.55)] active:translate-y-0";

export const secondaryButton =
  "group inline-flex items-center justify-center gap-2.5 rounded-full border border-fg/12 bg-surface/60 px-6 py-3.5 text-[15px] font-semibold text-fg backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-fg/25 hover:bg-surface active:translate-y-0";

export const limeButton =
  "shine group inline-flex items-center justify-center gap-2.5 rounded-full bg-lime px-6 py-3.5 text-[15px] font-semibold text-ink shadow-[0_16px_40px_-18px_rgba(221,247,122,0.9)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#e7ff92] active:translate-y-0";

type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  scale?: boolean;
};

export function Reveal({ children, className, delay = 0, scale = false }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      const frame = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(frame);
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -6% 0px", threshold: 0.06 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      data-visible={visible}
      style={{ "--reveal-delay": `${delay}ms` } as CSSProperties}
      className={cn("reveal", scale && "reveal-scale", className)}
    >
      {children}
    </div>
  );
}

export function Eyebrow({
  children,
  className,
  tone = "light",
}: {
  children: ReactNode;
  className?: string;
  tone?: "light" | "dark";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 font-sans text-[11px] font-semibold tracking-[0.18em] uppercase",
        tone === "light" ? "text-violet-dark" : "text-lime",
        className,
      )}
    >
      <span
        className={cn(
          "inline-block h-1.5 w-1.5 rounded-full",
          tone === "light" ? "bg-violet" : "bg-lime",
        )}
        aria-hidden="true"
      />
      {children}
    </span>
  );
}

export function Logo({ tone = "light", className }: { tone?: "light" | "dark"; className?: string }) {
  const dark = tone === "dark";
  return (
    <a
      href="#top"
      aria-label="NearHi home"
      className={cn("group inline-flex items-center gap-2.5 rounded-xl", className)}
    >
      <span
        className={cn(
          "grid h-9 w-9 place-items-center rounded-[12px] transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-105",
          dark ? "bg-lime" : "bg-ink",
        )}
      >
        <svg viewBox="0 0 645 554" className="h-[19px] w-[22px]" fill={dark ? "#15131B" : "#DDF77A"} aria-hidden="true">
          <use href="#nh-mark" />
        </svg>
      </span>
      <span
        className={cn(
          "font-display text-[23px] leading-none font-bold tracking-[-0.05em]",
          dark ? "text-cream" : "text-fg",
        )}
      >
        nearhi
        <span className="text-violet" aria-hidden="true">
          .
        </span>
      </span>
    </a>
  );
}

export function TextArrow({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      {children}
      <ArrowUpRight
        className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
        aria-hidden="true"
      />
    </span>
  );
}

export function Waveform({ tone = "light", className }: { tone?: "light" | "dark"; className?: string }) {
  const bars = [5, 9, 13, 8, 15, 11, 6, 12, 8, 4, 10, 6];
  return (
    <span
      className={cn("flex h-5 items-center gap-[2.5px]", className)}
      aria-hidden="true"
    >
      {bars.map((h, i) => (
        <span
          key={i}
          className={cn(
            "wave-bar w-[2.5px] rounded-full",
            tone === "light" ? "bg-lime" : "bg-ink",
          )}
          style={{ height: `${h + 3}px`, animationDelay: `${i * 90}ms` }}
        />
      ))}
    </span>
  );
}
