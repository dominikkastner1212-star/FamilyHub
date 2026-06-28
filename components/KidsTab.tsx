"use client";
import { haptic } from "@/lib/haptics";

import { useState } from "react";
import { Avatar, type CharKey } from "./Avatar";
import { spfSentence } from "@/lib/uv";

// =====================================================================
//  Kinder-Tab mit ausführlichen Gesundheitsprofilen
//  Allergien · Medikamente · Ärzte/Notfall · Blutgruppe · Hauttyp
//  Aufklappbar pro Kind, damit die Übersicht ruhig bleibt.
// =====================================================================

export type ChildProfile = {
  id: string;
  name: string;
  age: number;
  char: CharKey;
  skinType: number;       // 1-6
  skinLabel: string;      // "Hauttyp II · sehr empfindlich"
  skinColor: string;
  bloodType: string;
  allergies: { allergen: string; severity: string; reaction?: string; emergencyMed?: string }[];
  medications: { name: string; dosage?: string; schedule?: string }[];
  contacts: { label: string; phone?: string; kind: string }[];
};

const SEV_STYLE: Record<string, string> = {
  mild: "bg-mint/15 text-mint-deep",
  moderat: "bg-amber/20 text-amber-deep",
  schwer: "bg-coral/20 text-coral-deep",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-3">
      <p className="text-[11px] uppercase tracking-wide font-extrabold text-muted mb-1.5">{title}</p>
      {children}
    </div>
  );
}

export function KidsTab({ kids, uvNow }: { kids: ChildProfile[]; uvNow: number }) {
  const [open, setOpen] = useState<string | null>(kids[0]?.id ?? null);

  return (
    <div className="space-y-4">
      {/* Sonnenschutz-Box, abgeleitet aus aktuellem UV + Hauttyp jedes Kindes */}
      <div className="clay">
        <p className="label">🧴 Sonnenschutz heute · UV {uvNow}</p>
        <div className="space-y-2">
          {kids.map((c) => (
            <div key={c.id} className="text-sm font-semibold leading-relaxed flex gap-2">
              <Avatar char={c.char} size={26} ring={false} />
              <span>{spfSentence(c.name, c.skinType, uvNow)}</span>
            </div>
          ))}
        </div>
      </div>

      {kids.map((c) => {
        const isOpen = open === c.id;
        return (
          <div key={c.id} className="clay">
            <button onClick={() => { setOpen(isOpen ? null : c.id); haptic("tap"); }} className="w-full flex items-center gap-4 text-left">
              <Avatar char={c.char} size={62} />
              <div className="flex-1">
                <div className="font-black text-lg">{c.name}</div>
                <div className="text-muted text-[13px] font-semibold">{c.age} Jahre · Blutgruppe {c.bloodType}</div>
                <span className="inline-block text-[11px] font-extrabold px-3 py-1 rounded-pill mt-1.5" style={{ background: c.skinColor + "33", color: c.skinColor }}>
                  {c.skinLabel}
                </span>
              </div>
              <span className="w-[34px] h-[34px] rounded-[12px] grid place-items-center text-muted text-lg font-extrabold bg-bg shadow-clay-in transition" style={{ transform: isOpen ? "rotate(90deg)" : "none" }}>
                ›
              </span>
            </button>

            {isOpen && (
              <div className="mt-4 pt-4 border-t border-line animate-expand">
                <Section title="⚠️ Allergien">
                  {c.allergies.length === 0 ? (
                    <p className="text-muted text-sm font-semibold">Keine bekannt</p>
                  ) : (
                    <div className="space-y-2">
                      {c.allergies.map((a, i) => (
                        <div key={i} className="bg-bg rounded-[14px] p-3 shadow-clay-in">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-[15px]">{a.allergen}</span>
                            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-pill ${SEV_STYLE[a.severity] ?? ""}`}>{a.severity}</span>
                          </div>
                          {a.reaction && <p className="text-muted text-[13px] font-semibold mt-1">Reaktion: {a.reaction}</p>}
                          {a.emergencyMed && <p className="text-coral-deep text-[13px] font-bold mt-1">Notfall: {a.emergencyMed}</p>}
                        </div>
                      ))}
                    </div>
                  )}
                </Section>

                <Section title="💊 Medikamente">
                  {c.medications.length === 0 ? (
                    <p className="text-muted text-sm font-semibold">Keine</p>
                  ) : (
                    <div className="space-y-1.5">
                      {c.medications.map((m, i) => (
                        <div key={i} className="flex justify-between items-baseline text-sm">
                          <span className="font-bold">{m.name}</span>
                          <span className="text-muted font-semibold text-[13px]">{m.dosage} {m.schedule && `· ${m.schedule}`}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </Section>

                <Section title="📞 Ärzte & Notfallkontakte">
                  <div className="space-y-1.5">
                    {c.contacts.map((k, i) => (
                      <a key={i} href={k.phone ? `tel:${k.phone}` : undefined} className="flex justify-between items-center bg-bg rounded-[14px] px-3 py-2.5 shadow-clay-in">
                        <span className="font-bold text-sm">{k.label}</span>
                        {k.phone && <span className="text-amber-deep font-extrabold text-[13px]">{k.phone}</span>}
                      </a>
                    ))}
                  </div>
                </Section>
              </div>
            )}
          </div>
        );
      })}

      <style>{`@keyframes fade{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}`}</style>
    </div>
  );
}
