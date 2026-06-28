"use client";

import { useEffect, useState } from "react";
import { SunFace } from "./Avatar";
import { uvLevel } from "@/lib/uv";

type Weather = {
  city: string;
  temp: number | null;
  tempMax?: number;
  tempMin?: number;
  wind?: number;
  uvNow?: number;
  error?: string;
};

export function WeatherCard() {
  const [w, setW] = useState<Weather | null>(null);

  useEffect(() => {
    fetch("/api/weather")
      .then((r) => r.json())
      .then(setW)
      .catch(() => setW({ city: "—", temp: null, error: "Offline" }));
  }, []);

  const uv = w?.uvNow ?? 0;
  const lvl = uvLevel(uv);
  const pct = Math.min(100, (uv / 11) * 100);

  return (
    <div
      className="rounded-clay p-5 text-white relative"
      style={{
        background: "linear-gradient(140deg,#E89BC8,#D14D8C)",
        boxShadow:
          "8px 8px 22px rgba(209,77,140,.4), -6px -6px 16px rgba(255,255,255,.5), inset 2px 2px 3px rgba(255,255,255,.45)",
      }}
    >
      <p className="text-[12px] uppercase tracking-[1.4px] font-extrabold text-white/90 mb-3">
        Wetter · {w?.city ?? "lädt …"}
      </p>

      <div className="flex justify-between items-center">
        <div>
          <div className="text-5xl font-black leading-none" style={{ textShadow: "2px 2px 4px rgba(150,40,100,.25)" }}>
            {w?.temp != null ? `${w.temp}°` : "—"}
          </div>
          {w?.temp != null && (
            <div className="flex gap-3 text-[13px] font-bold opacity-95 mt-2">
              <span>↑{w.tempMax}°</span>
              <span>↓{w.tempMin}°</span>
              <span>🌬 {w.wind} km/h</span>
            </div>
          )}
        </div>
        <SunFace size={74} />
      </div>

      <div className="mt-4 rounded-[20px] p-4" style={{ background: "rgba(255,255,255,.22)", boxShadow: "inset 2px 2px 6px rgba(150,40,100,.18)" }}>
        <div className="flex justify-between items-center mb-3">
          <span className="font-extrabold">UV-Index jetzt</span>
          <span className="font-black text-[15px] bg-white text-amber-deep px-4 py-1 rounded-pill" style={{ boxShadow: "2px 2px 6px rgba(150,40,100,.25)" }}>
            {uv} · {lvl.label}
          </span>
        </div>
        <div className="h-[11px] rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,.3)", boxShadow: "inset 1px 1px 3px rgba(150,40,100,.25)" }}>
          <i className="block h-full rounded-full" style={{ width: `${pct}%`, background: "linear-gradient(90deg,#FFE0EE,#fff)" }} />
        </div>
        <div className="mt-3 text-sm font-semibold flex gap-2.5 leading-relaxed">
          🧴 <span><b className="font-extrabold">{uv >= 6 ? "Eincremen nicht vergessen!" : "Sonnenschutz:"}</b> {lvl.advice}</span>
        </div>
      </div>
    </div>
  );
}
