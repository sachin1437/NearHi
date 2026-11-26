"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/cn";

type Theme = "light" | "dark";
const KEY = "nh-theme";

function apply(theme: Theme) {
  document.documentElement.setAttribute("data-theme", theme);
  try {
    localStorage.setItem(KEY, theme);
  } catch {
    // Private mode or blocked storage: the choice just won't persist.
  }
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", theme === "dark" ? "#120f17" : "#f7f4ed");
}

export function ThemeToggle({ className }: { className?: string }) {
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    const read = () =>
      setTheme(document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light");
    read();
    const onStorage = (event: StorageEvent) => {
      if (event.key === KEY) {
        if (event.newValue === "dark" || event.newValue === "light") apply(event.newValue);
        read();
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const dark = theme === "dark";
  return (
    <button
      type="button"
      onClick={() => {
        const next: Theme = dark ? "light" : "dark";
        setTheme(next);
        // Instant switch. Colour fades and page-wide animations are paused for two frames, so the
        // whole page changes in a single repaint instead of stuttering through hundreds of fades.
        const root = document.documentElement;
        root.classList.add("theme-switching");
        apply(next);
        requestAnimationFrame(() =>
          requestAnimationFrame(() => root.classList.remove("theme-switching")),
        );
      }}
      aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
      aria-pressed={dark}
      title={dark ? "Light theme" : "Dark theme"}
      className={cn(
        "grid h-10 w-10 place-items-center rounded-full border border-fg/10 bg-surface/60 text-fg backdrop-blur-md transition-colors hover:bg-surface",
        className,
      )}
    >
      {theme === null ? (
        <span className="h-[18px] w-[18px]" aria-hidden="true" />
      ) : dark ? (
        <Sun className="h-[18px] w-[18px]" aria-hidden="true" />
      ) : (
        <Moon className="h-[18px] w-[18px]" aria-hidden="true" />
      )}
    </button>
  );
}