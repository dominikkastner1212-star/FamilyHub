"use client";

import { createContext, useContext, useState, useCallback, useRef } from "react";

// =====================================================================
//  Toast-System
//  Zeigt kurze Bestätigungen ("Gespeichert ✓") unten über der Navigation.
//  Sanftes Rein-/Rausgleiten, verschwindet von selbst.
// =====================================================================

type Toast = { id: number; msg: string; tone: "ok" | "info" | "warn" };
type Ctx = { toast: (msg: string, tone?: Toast["tone"]) => void };

const ToastCtx = createContext<Ctx>({ toast: () => {} });
export const useToast = () => useContext(ToastCtx);

const TONE: Record<Toast["tone"], string> = {
  ok: "linear-gradient(140deg,#5FC9A0,#3DAE84)",
  info: "linear-gradient(140deg,#9B6FD4,#7C4FC0)",
  warn: "linear-gradient(140deg,#F47B6B,#E05B49)",
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Toast[]>([]);
  const idRef = useRef(0);

  const toast = useCallback((msg: string, tone: Toast["tone"] = "ok") => {
    const id = ++idRef.current;
    setItems((p) => [...p, { id, msg, tone }]);
    setTimeout(() => setItems((p) => p.filter((t) => t.id !== id)), 2200);
  }, []);

  return (
    <ToastCtx.Provider value={{ toast }}>
      {children}
      <div className="fixed left-1/2 -translate-x-1/2 bottom-[110px] z-[60] flex flex-col items-center gap-2 pointer-events-none">
        {items.map((t) => (
          <div
            key={t.id}
            className="px-5 py-3 rounded-pill text-white font-extrabold text-sm shadow-lg animate-toast"
            style={{ background: TONE[t.tone] }}
          >
            {t.msg}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}
