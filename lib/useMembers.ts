"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-client";
import type { CharKey } from "@/components/Avatar";

// =====================================================================
//  useMembers
//  Lädt alle Mitglieder (Eltern) einer Familie – für die Zuweisung
//  von Aufgaben ("wer ist zuständig").
// =====================================================================

export type Member = {
  id: string;
  name: string;
  char: CharKey;
  color: string;
};

export function useMembers(familyId: string | null) {
  const [members, setMembers] = useState<Member[]>([]);

  useEffect(() => {
    if (!familyId) return;
    let active = true;
    (async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("members")
        .select("id, display_name, avatar, color")
        .eq("family_id", familyId)
        .order("created_at", { ascending: true });
      if (active && data) {
        setMembers(
          data.map((m: any) => ({
            id: m.id,
            name: m.display_name,
            char: (m.avatar?.char as CharKey) ?? "papa",
            color: m.color ?? "#9B6FD4",
          }))
        );
      }
    })();
    return () => { active = false; };
  }, [familyId]);

  return { members };
}
