"use client";

import { useRef, useState } from "react";

// =====================================================================
//  Foto-zu-Termin Button + Dialog
//  Wählt ein Foto, verkleinert es im Browser (spart API-Tokens),
//  schickt es an /api/extract-event und zeigt die erkannten Termine
//  zur Bestätigung an.
// =====================================================================

type ExtractedEvent = {
  title: string;
  date: string;
  time: string | null;
  location: string | null;
  bring: string[];
  note: string | null;
};

// Bild im Browser auf max. 1280px verkleinern → weniger Tokens, schneller
function shrinkImage(file: File): Promise<{ base64: string; mediaType: string }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();
    reader.onload = () => {
      img.onload = () => {
        const max = 1280;
        let { width, height } = img;
        if (width > max || height > max) {
          const r = Math.min(max / width, max / height);
          width = Math.round(width * r);
          height = Math.round(height * r);
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Canvas-Fehler"));
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
        resolve({ base64: dataUrl.split(",")[1], mediaType: "image/jpeg" });
      };
      img.onerror = reject;
      img.src = reader.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function PhotoToEvent({ onConfirm }: { onConfirm: (e: ExtractedEvent) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [events, setEvents] = useState<ExtractedEvent[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setError(null);
    setEvents(null);
    try {
      const { base64, mediaType } = await shrinkImage(file);
      const res = await fetch("/api/extract-event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: base64, mediaType }),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else if (!data.found || !data.events?.length) {
        setError("Auf dem Foto war kein Termin zu erkennen. Tippe ihn einfach manuell ein.");
      } else {
        setEvents(data.events);
      }
    } catch {
      setError("Das Foto konnte nicht verarbeitet werden.");
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function fmtDate(d: string) {
    try {
      return new Date(d + "T00:00:00").toLocaleDateString("de-DE", { weekday: "short", day: "numeric", month: "long" });
    } catch {
      return d;
    }
  }

  return (
    <>
      <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={handleFile} className="hidden" />
      <button
        onClick={() => fileRef.current?.click()}
        disabled={busy}
        className="clay-btn w-full py-3.5 flex items-center justify-center gap-2.5 disabled:opacity-60"
        style={{ background: "linear-gradient(140deg,#8E7CDB,#6F5BC9)" }}
      >
        {busy ? (
          <>
            <span className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            Foto wird gelesen …
          </>
        ) : (
          <>📸 Termin abfotografieren</>
        )}
      </button>

      {error && (
        <div className="mt-3 rounded-[16px] p-3.5 bg-bg shadow-clay-in text-sm font-semibold text-coral-deep">
          {error}
        </div>
      )}

      {events && (
        <div className="mt-3 space-y-3">
          {events.map((ev, i) => (
            <div key={i} className="rounded-[18px] p-4 bg-bg shadow-clay-in">
              <div className="text-[11px] uppercase tracking-wide font-extrabold text-violet-deep mb-2">
                Erkannter Termin
              </div>
              <div className="font-black text-lg">{ev.title}</div>
              <div className="text-sm font-semibold text-muted mt-1">
                📅 {fmtDate(ev.date)}{ev.time ? ` · ${ev.time} Uhr` : ""}
              </div>
              {ev.location && <div className="text-sm font-semibold text-muted mt-0.5">📍 {ev.location}</div>}
              {ev.bring?.length > 0 && (
                <div className="text-sm font-semibold text-muted mt-0.5">🎒 Mitnehmen: {ev.bring.join(", ")}</div>
              )}
              {ev.note && <div className="text-sm font-semibold text-muted mt-0.5">📝 {ev.note}</div>}
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => { onConfirm(ev); setEvents((p) => p?.filter((_, j) => j !== i) ?? null); }}
                  className="clay-btn flex-1 py-2.5 text-sm bg-mint"
                  style={{ background: "linear-gradient(140deg,#5FC9A0,#3DAE84)" }}
                >
                  ✓ In Kalender übernehmen
                </button>
                <button
                  onClick={() => setEvents((p) => p?.filter((_, j) => j !== i) ?? null)}
                  className="px-4 py-2.5 rounded-pill font-extrabold text-sm text-muted bg-card shadow-clay-sm"
                >
                  Verwerfen
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

export type { ExtractedEvent };
