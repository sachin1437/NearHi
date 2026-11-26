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
      onClick={(event) => {
        const next: Theme = dark ? "light" : "dark";
        setTheme(next);
        const root = document.documentElement;
        const done = () => root.classList.remove("theme-switching");
        // Colour fades and page-wide animations stay paused while the theme changes, so the wave
        // only has to reveal one finished repaint instead of animating hundreds of fades.
        root.classList.add("theme-switching");

        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const start = (document as Document & {
          startViewTransition?: (cb: () => void) => { ready: Promise<void>; finished: Promise<void> };
        }).startViewTransition;
        if (reduce || !start) {
          apply(next);
          requestAnimationFrame(() => requestAnimationFrame(done));
          return;
        }

        // Wave origin: the centre of the button that was clicked.
        const rect = event.currentTarget.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;
        const radius = Math.hypot(
          Math.max(x, window.innerWidth - x),
          Math.max(y, window.innerHeight - y),
        );

        const transition = start.call(document, () => apply(next));
        transition.ready
          .then(() => {
            document.documentElement.animate(
              { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
              {
                duration: 600,
                easing: "cubic-bezier(0.4, 0, 0.2, 1)",
                pseudoElement: "::view-transition-new(root)",
              },
            );
          })
          .catch(done);
        transition.finished.then(done, done);
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