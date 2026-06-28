"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase-client";
import { useToast } from "@/components/Toast";
import { haptic } from "@/lib/haptics";

// =====================================================================
//  Familie einladen
//  Erzeugt einen Code, den man per Teilen-Funktion an Partner/Oma
//  schicken kann. Der Eingeladene löst ihn beim Login ein.
// =====================================================================

export function InviteCard({ familyName }: { familyName: string }) {
  const { toast } = useToast();
  const [code, setCode] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function generate() {
    setBusy(true);
    haptic("tap");
    try {
      const supabase = createClient();
      const { data, error } = await supabase.rpc("create_invitation");
      if (error) throw error;
      setCode(data as string);
      haptic("success");
    } catch (e: any) {
      toast("Code konnte nicht erstellt werden", "warn");
      haptic("error");
    } finally {
      setBusy(false);
    }
  }

  async function share() {
    if (!code) return;
    const text = `Komm in unsere Familie "${familyName}" bei Familienhub! Dein Einladungscode: ${code}`;
    haptic("tap");
    // native Teilen-Funktion auf dem Handy, sonst in Zwischenablage
    if (navigator.share) {
      try { await navigator.share({ text }); } catch { /* abgebrochen */ }
    } else {
      await navigator.clipboard?.writeText(code);
      toast("Code kopiert ✓", "ok");
    }
  }

  return (
    <div className="clay">
      <p className="label">👪 Familie einladen</p>
      <p className="text-muted font-semibold text-sm mb-3 -mt-1">
        Hol Partner, Oma oder Babysitter dazu – sie sehen dann dieselben Termine und Listen.
      </p>

      {!code ? (
        <button onClick={generate} disabled={busy} className="clay-btn w-full py-3.5 bg-violet disabled:opacity-60" style={{ background: "linear-gradient(140deg,#9B6FD4,#7C4FC0)" }}>
          {busy ? "Erstelle Code …" : "Einladungscode erstellen"}
        </button>
      ) : (
        <div className="space-y-3">
          <div className="rounded-[18px] p-4 bg-bg shadow-clay-in text-center">
            <div className="text-[11px] uppercase tracking-wide font-extrabold text-muted mb-1">Einladungscode</div>
            <div className="text-2xl font-black tracking-wider text-violet-deep select-all">{code}</div>
            <div className="text-[12px] text-muted font-semibold mt-1">7 Tage gültig</div>
          </div>
          <button onClick={share} className="clay-btn w-full py-3.5" style={{ background: "linear-gradient(140deg,#E86FA6,#D14D8C)" }}>
            📤 Code teilen
          </button>
        </div>
      )}
    </div>
  );
}
