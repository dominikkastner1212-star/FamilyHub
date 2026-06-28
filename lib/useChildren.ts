"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase-client";
import type { ChildProfile } from "@/components/KidsTab";

// =====================================================================
//  useChildren
//  Lädt alle Kinder einer Familie samt Allergien, Medikamenten und
//  Kontakten und bringt sie in die Form, die KidsTab erwartet.
// =====================================================================

// Hauttyp-Nummer → Label + Farbe für die Anzeige
const SKIN_LABELS: Record<number, { label: string; color: string }> = {
  1: { label: "Hauttyp I · extrem empfindlich", color: "#E05B49" },
  2: { label: "Hauttyp II · sehr empfindlich", color: "#E05B49" },
  3: { label: "Hauttyp III · empfindlich", color: "#B8791C" },
  4: { label: "Hauttyp IV · mäßig empfindlich", color: "#3DAE84" },
  5: { label: "Hauttyp V · wenig empfindlich", color: "#3DAE84" },
  6: { label: "Hauttyp VI · kaum empfindlich", color: "#3DAE84" },
};

function ageFrom(birth: string | null): number {
  if (!birth) return 0;
  const d = new Date(birth);
  const diff = Date.now() - d.getTime();
  return Math.max(0, Math.floor(diff / (365.25 * 24 * 3600 * 1000)));
}

export function useChildren(familyId: string | null) {
  const [children, setChildren] = useState<ChildProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const load = useCallback(async () => {
    if (!familyId) return;
    // Kinder + verknüpfte Daten in einer Abfrage (Supabase embedded selects)
    const { data, error } = await supabase
      .from("children")
      .select(`
        id, name, birth_date, skin_type, blood_type, avatar,
        child_allergies ( allergen, severity, reaction, emergency_med ),
        child_medications ( name, dosage, schedule ),
        child_contacts ( label, phone, kind )
      `)
      .eq("family_id", familyId)
      .order("created_at", { ascending: true });

    if (error || !data) { setLoading(false); return; }

    const mapped: ChildProfile[] = data.map((c: any) => {
      const skin = SKIN_LABELS[c.skin_type] ?? { label: "Hauttyp unbekannt", color: "#9A879C" };
      return {
        id: c.id,
        name: c.name,
        age: ageFrom(c.birth_date),
        char: (c.avatar?.char as any) ?? "lina",
        skinType: c.skin_type ?? 3,
        skinLabel: skin.label,
        skinColor: skin.color,
        bloodType: c.blood_type ?? "—",
        allergies: (c.child_allergies ?? []).map((a: any) => ({
          allergen: a.allergen, severity: a.severity, reaction: a.reaction, emergencyMed: a.emergency_med,
        })),
        medications: (c.child_medications ?? []).map((m: any) => ({
          name: m.name, dosage: m.dosage, schedule: m.schedule,
        })),
        contacts: (c.child_contacts ?? []).map((k: any) => ({
          label: k.label, phone: k.phone, kind: k.kind,
        })),
      };
    });
    setChildren(mapped);
    setLoading(false);
  }, [familyId, supabase]);

  useEffect(() => { load(); }, [load]);

  return { children, loading, reload: load };
}
