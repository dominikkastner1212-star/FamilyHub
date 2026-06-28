"use client";

import { useState } from "react";
import { haptic } from "@/lib/haptics";
import { useToast } from "@/components/Toast";
import type { Note } from "@/lib/useNotes";

// =====================================================================
//  Familien-Pinnwand
//  Bunte Notizzettel, die alle sehen. Anheften hält wichtige oben.
// =====================================================================

const COLORS: Record<Note["color"], { bg: string; pin: string }> = {
  gelb:  { bg: "linear-gradient(140deg,#FFF3C4,#FFE89E)", pin: "#E0A93C" },
  rosa:  { bg: "linear-gradient(140deg,#FFE0EC,#FBC9DD)", pin: "#D14D8C" },
  lila:  { bg: "linear-gradient(140deg,#EADBF7,#D9C2F0)", pin: "#7C4FC0" },
  gruen: { bg: "linear-gradient(140deg,#D9F2E4,#BCE7CF)", pin: "#3DAE84" },
  blau:  { bg: "linear-gradient(140deg,#D6ECFA,#BBDDF3)", pin: "#2E97CB" },
};
const ORDER: Note["color"][] = ["gelb", "rosa", "lila", "gruen", "blau"];

export function NotesBoard({
  notes,
  loading,
  onAdd,
  onTogglePin,
  onRemove,
}: {
  notes: Note[];
  loading: boolean;
  onAdd: (text: string, color: Note["color"]) => Promise<any>;
  onTogglePin: (id: string, pinned: boolean) => void;
  onRemove: (id: string) => void;
}) {
  const { toast } = useToast();
  const [text, setText] = useState("");
  const [color, setColor] = useState<Note["color"]>("gelb");
  const [busy, setBusy] = useState(false);

  async function submit() {
    const t = text.trim();
    if (!t) return;
    setBusy(true);
    haptic("tap");
    try {
      await onAdd(t, color);
      setText("");
      toast("Notiz angepinnt ✓", "ok");
    } catch {
      toast("Konnte nicht speichern", "warn");
      haptic("error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* Neue Notiz */}
      <div className="clay">
        <p className="label">✏️ Neue Notiz</p>
        <textarea
          className="clay-input w-full min-h-[70px] resize-none"
          placeholder="Was sollen alle wissen? (z.B. Omas Geburtstag am Freitag nicht vergessen)"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <div className="flex items-center justify-between mt-3">
          <div className="flex gap-2">
            {ORDER.map((c) => (
              <button
                key={c}
                onClick={() => { setColor(c); haptic("soft"); }}
                className="w-7 h-7 rounded-full tappable"
                style={{
                  background: COLORS[c].bg,
                  outline: color === c ? `3px solid ${COLORS[c].pin}` : "none",
                  outlineOffset: "1px",
                  boxShadow: "2px 2px 5px rgba(150,100,140,.25)",
                }}
                aria-label={c}
              />
            ))}
          </div>
          <button onClick={submit} disabled={busy} className="clay-btn px-5 py-2.5 text-sm disabled:opacity-60" style={{ background: "linear-gradient(140deg,#9B6FD4,#7C4FC0)" }}>
            Anpinnen
          </button>
        </div>
      </div>

      {/* Zettel-Wand */}
      {loading ? (
        <div className="clay py-8 text-center text-muted font-semibold animate-pulse-soft">Pinnwand wird geladen …</div>
      ) : notes.length === 0 ? (
        <div className="clay py-8 text-center">
          <div className="text-4xl mb-2">📌</div>
          <p className="text-muted font-semibold text-sm">Noch nichts an der Pinnwand. Schreib die erste Notiz für die Familie.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {notes.map((n, i) => (
            <div
              key={n.id}
              className="rounded-[18px] p-3.5 relative animate-item-in"
              style={{
                background: COLORS[n.color].bg,
                boxShadow: "4px 5px 14px rgba(150,100,140,.22), inset 1px 1px 1px rgba(255,255,255,.5)",
                transform: `rotate(${i % 2 === 0 ? -1.2 : 1.2}deg)`,
              }}
            >
              {/* Pin-Knopf */}
              <button
                onClick={() => { onTogglePin(n.id, !n.pinned); haptic("tap"); }}
                className="absolute -top-2 left-1/2 -translate-x-1/2 text-base tappable"
                title={n.pinned ? "Lösen" : "Anheften"}
                style={{ opacity: n.pinned ? 1 : 0.35 }}
              >
                📌
              </button>
              <p className="text-[14px] font-bold text-ink/85 leading-snug mt-2 whitespace-pre-wrap break-words">{n.text}</p>
              <button
                onClick={() => { onRemove(n.id); haptic("tap"); }}
                className="absolute bottom-1.5 right-2 text-ink/30 text-sm font-black tappable"
                title="Löschen"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
