"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { navLinks } from "@/lib/content";
import { cn } from "@/lib/cn";
import { Logo, primaryButton } from "./ui";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-500",
        scrolled || open
          ? "border-b border-ink/8 bg-paper/85 shadow-[0_8px_30px_-24px_rgba(21,19,27,0.4)] backdrop-blur-xl"
          : "border-b border-transparent bg-transparent",
      )}
    >
      <nav
        aria-label="Main navigation"
        className="mx-auto flex h-[72px] w-full max-w-[1240px] items-center justify-between px-5 sm:px-7 lg:h-[76px] lg:px-10"
      >
        <Logo />

        <div className="hidden items-center gap-1 rounded-full border border-ink/6 bg-white/45 p-1.5 backdrop-blur-md lg:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-full px-3.5 py-2 text-[13.5px] font-medium text-ink/72 transition-colors duration-200 hover:bg-white hover:text-ink"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-4 lg:flex">
          <a
            href="/talk/"
            className={cn(primaryButton, "px-5 py-2.5 text-[13.5px]")}
          >
            Start chatting
            <ArrowUpRight
              className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              aria-hidden="true"
            />
          </a>
        </div>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Close menu" : "Open menu"}
          className="grid h-11 w-11 place-items-center rounded-full border border-ink/10 bg-white/65 text-ink backdrop-blur-md transition-colors hover:bg-white lg:hidden"
        >
          {open ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
        </button>
      </nav>

      <div
        id="mobile-menu"
        className={cn(
          "h-[calc(100dvh-72px)] overflow-y-auto border-t border-ink/8 bg-paper/97 px-5 pt-4 pb-10 backdrop-blur-2xl lg:hidden",
          open ? "block" : "hidden",
        )}
      >
        <div className="mx-auto flex max-w-md flex-col">
          {navLinks.map((link, index) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              style={{ animationDelay: `${index * 45}ms` }}
              className="enter-up flex items-center justify-between border-b border-ink/7 py-3 font-display text-[21px] font-semibold tracking-[-0.03em] text-ink transition-colors hover:text-violet-dark"
            >
              {link.label}
              <ArrowUpRight className="h-4 w-4 text-ink/40" aria-hidden="true" />
            </a>
          ))}
          <div className="mt-5 flex flex-col gap-3">
            <a
              href="/talk/"
              onClick={() => setOpen(false)}
              className={cn(primaryButton, "w-full")}
            >
              Start chatting, it&apos;s free
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>
          <p className="mt-4 flex items-center justify-center gap-2 text-[11px] text-muted">
            <span className="rounded-full border border-ink/10 bg-white/60 px-2.5 py-1">Phone</span>
            <span className="rounded-full border border-ink/10 bg-white/60 px-2.5 py-1">Laptop</span>
            <span className="rounded-full border border-ink/10 bg-white/60 px-2.5 py-1">No app</span>
            <span className="font-medium text-ink/60">Free</span>
          </p>
        </div>
      </div>
    </header>
  );
}
