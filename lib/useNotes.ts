"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase-client";

// =====================================================================
//  useNotes
//  Gemeinsame Pinnwand-Notizen einer Familie, mit Live-Sync.
//  Angeheftete (pinned) Notizen erscheinen zuerst.
// =====================================================================

export type Note = {
  id: string;
  text: string;
  color: "gelb" | "rosa" | "lila" | "gruen" | "blau";
  pinned: boolean;
  created_at: string;
};

function sortNotes(a: Note, b: Note) {
  if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
  return b.created_at.localeCompare(a.created_at);
}

export function useNotes(familyId: string | null, memberId: string | null) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    if (!familyId) return;
    let active = true;
    (async () => {
      const { data } = await supabase
        .from("notes")
        .select("id, text, color, pinned, created_at")
        .eq("family_id", familyId);
      if (active && data) { setNotes((data as Note[]).sort(sortNotes)); setLoading(false); }
    })();
    return () => { active = false; };
  }, [familyId, supabase]);

  useEffect(() => {
    if (!familyId) return;
    const ch = supabase
      .channel(`notes:${familyId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "notes", filter: `family_id=eq.${familyId}` }, (payload) => {
        setNotes((prev) => {
          if (payload.eventType === "INSERT") {
            const n = payload.new as Note;
            if (prev.some((x) => x.id === n.id)) return prev;
            return [...prev, n].sort(sortNotes);
          }
          if (payload.eventType === "UPDATE") {
            return prev.map((x) => (x.id === (payload.new as Note).id ? (payload.new as Note) : x)).sort(sortNotes);
          }
          if (payload.eventType === "DELETE") {
            return prev.filter((x) => x.id !== (payload.old as any).id);
          }
          return prev;
        });
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [familyId, supabase]);

  const add = useCallback(
    async (text: string, color: Note["color"] = "gelb") => {
      if (!familyId) return;
      const { data, error } = await supabase
        .from("notes")
        .insert({ family_id: familyId, text, color, created_by: memberId })
        .select("id, text, color, pinned, created_at")
        .single();
      if (error) throw error;
      setNotes((p) => [...p, data as Note].sort(sortNotes));
      return data as Note;
    },
    [familyId, memberId, supabase]
  );

  const togglePin = useCallback(
    async (id: string, pinned: boolean) => {
      setNotes((p) => p.map((n) => (n.id === id ? { ...n, pinned } : n)).sort(sortNotes));
      await supabase.from("notes").update({ pinned }).eq("id", id);
    },
    [supabase]
  );

  const remove = useCallback(
    async (id: string) => {
      const backup = notes;
      setNotes((p) => p.filter((n) => n.id !== id));
      const { error } = await supabase.from("notes").delete().eq("id", id);
      if (error) setNotes(backup);
    },
    [notes, supabase]
  );

  return { notes, loading, add, togglePin, remove };
}
