"use client";

import { haptic } from "@/lib/haptics";

const TABS = [
  { key: "home", icon: "🏡", label: "Start" },
  { key: "cal", icon: "📅", label: "Kalender" },
  { key: "tasks", icon: "✅", label: "Aufgaben" },
  { key: "shop", icon: "🛒", label: "Einkauf" },
  { key: "kids", icon: "🧒", label: "Kinder" },
] as const;

export type TabKey = (typeof TABS)[number]["key"];

export function BottomNav({ active, onChange }: { active: TabKey; onChange: (t: TabKey) => void }) {
  return (
    <nav
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] z-20 flex justify-around border-t border-line"
      style={{ background: "rgba(251,244,249,.85)", backdropFilter: "blur(16px)", padding: "12px 8px calc(12px + env(safe-area-inset-bottom))" }}
    >
      {TABS.map((t) => {
        const on = t.key === active;
        return (
          <button
            key={t.key}
            onClick={() => { if (t.key !== active) haptic("soft"); onChange(t.key); }}
            className={`flex-1 flex flex-col items-center gap-1 font-extrabold text-[9px] tappable ${on ? "text-amber-deep" : "text-muted"}`}
          >
            <span
              className="w-[42px] h-[34px] rounded-[13px] grid place-items-center text-lg"
              style={{
                transition: "transform .25s cubic-bezier(.34,1.56,.64,1), background .2s",
                transform: on ? "scale(1.1)" : "scale(1)",
                ...(on ? { background: "linear-gradient(140deg,#F7D6E8,#E89BC8)", boxShadow: "3px 3px 9px rgba(209,77,140,.3), inset 1px 1px 2px rgba(255,255,255,.6)" } : {}),
              }}
            >
              {t.icon}
            </span>
            {t.label}
          </button>
        );
      })}
    </nav>
  );
}
