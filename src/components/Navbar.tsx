"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Trophy, Table2, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface NavLink {
  href: string;
  label: string;
  icon: LucideIcon;
}

const links: NavLink[] = [
  { href: "/", label: "Home", icon: Home },
  { href: "/gironi", label: "Gironi", icon: Trophy },
  { href: "/tabellone", label: "Tabellone", icon: Table2 },
  { href: "/squadre", label: "Squadre", icon: Users },
];

/* ── Hook: measure the active item and return indicator style ── */

function useSlider(activeIndex: number) {
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const [style, setStyle] = useState<React.CSSProperties>({ opacity: 0 });
  const rafRef = useRef<number | null>(null);

  const measure = useCallback(() => {
    if (activeIndex < 0) {
      setStyle((s) => ({ ...s, opacity: 0 }));
      return;
    }
    const el = itemRefs.current[activeIndex];
    if (!el) return;

    setStyle({
      left: el.offsetLeft,
      top: el.offsetTop,
      width: el.offsetWidth,
      height: el.offsetHeight,
      opacity: 1,
    });
  }, [activeIndex]);

  useLayoutEffect(() => {
    rafRef.current = requestAnimationFrame(() => {
      measure();
      rafRef.current = null;
    });
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [measure]);

  useEffect(() => {
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [measure]);

  const setRef = useCallback(
    (index: number) => (el: HTMLAnchorElement | null) => {
      itemRefs.current[index] = el;
    },
    []
  );

  return { setRef, indicatorStyle: style };
}

/* ── Component ─────────────────────────────────────────────── */

export default function Navbar() {
  const pathname = usePathname();
  const activeIndex = links.findIndex(({ href }) => pathname === href);

  const { setRef: setDesktopRef, indicatorStyle: desktopIndicator } =
    useSlider(activeIndex);
  const { setRef: setMobileRef, indicatorStyle: mobileIndicator } =
    useSlider(activeIndex);

  return (
    <>
      {/* ── Desktop: floating pill navbar (hidden on mobile) ── */}
      <nav aria-label="Navigazione principale" className="fixed top-6 left-1/2 z-50 hidden -translate-x-1/2 md:block">
        <div className="relative flex items-center gap-1 rounded-2xl border border-border bg-card/95 px-2 py-2 shadow-lg backdrop-blur-sm">
          {/* Sliding indicator */}
          <div
            className="pointer-events-none absolute z-0 rounded-xl bg-primary transition-all duration-300 ease-in-out"
            style={desktopIndicator}
          />

          {links.map(({ href, label, icon: Icon }, i) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                ref={setDesktopRef(i)}
                href={href}
                aria-current={isActive ? "page" : undefined}
                className={`relative z-10 flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                  isActive
                    ? "text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent/80 hover:text-accent-foreground"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* ── Mobile: bottom tab bar (hidden on desktop) ── */}
      <nav aria-label="Navigazione principale" className="fixed inset-x-0 bottom-0 z-50 md:hidden">
        <div className="border-t border-border bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-sm">
          <div className="relative flex items-center justify-around px-2 py-1">
            {/* Sliding indicator */}
            <div
              className="pointer-events-none absolute z-0 rounded-xl bg-accent transition-all duration-300 ease-in-out"
              style={mobileIndicator}
            />

            {links.map(({ href, label, icon: Icon }, i) => {
              const isActive = pathname === href;
              return (
                <Link
                  key={href}
                  ref={setMobileRef(i)}
                  href={href}
                  aria-current={isActive ? "page" : undefined}
                  className={`relative z-10 flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-xl px-1 py-2 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground active:bg-accent/50 active:text-accent-foreground"
                  }`}
                >
                  <Icon className={`h-5 w-5 shrink-0 ${isActive ? "stroke-[2.5]" : ""}`} />
                  <span
                    className={`truncate text-[10px] leading-tight ${
                      isActive ? "font-semibold" : "font-medium"
                    }`}
                  >
                    {label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </>
  );
}
