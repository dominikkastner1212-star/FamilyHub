"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase-client";

// =====================================================================
//  useEvents
//  Lädt Termine einer Familie, hört auf Echtzeit-Änderungen und
//  bietet add / remove. Termine können aus dem Foto-Feature kommen.
// =====================================================================

export type FamilyEvent = {
  id: string;
  title: string;
  category: string;
  icon: string | null;
  starts_at: string;     // ISO
  location: string | null;
  bring_items: string[];
  source: "local" | "apple";
};

export type NewEvent = {
  title: string;
  date: string;          // YYYY-MM-DD
  time?: string | null;  // HH:MM
  location?: string | null;
  bring?: string[];
  icon?: string;
  category?: string;
};

export function useEvents(familyId: string | null) {
  const [events, setEvents] = useState<FamilyEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    if (!familyId) return;
    let active = true;
    (async () => {
      const { data } = await supabase
        .from("events")
        .select("id, title, category, icon, starts_at, location, bring_items, source")
        .eq("family_id", familyId)
        .order("starts_at", { ascending: true });
      if (active && data) { setEvents(data as FamilyEvent[]); setLoading(false); }
    })();
    return () => { active = false; };
  }, [familyId, supabase]);

  useEffect(() => {
    if (!familyId) return;
    const channel = supabase
      .channel(`events:${familyId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "events", filter: `family_id=eq.${familyId}` },
        (payload) => {
          setEvents((prev) => {
            if (payload.eventType === "INSERT") {
              const n = payload.new as FamilyEvent;
              if (prev.some((e) => e.id === n.id)) return prev;
              return [...prev, n].sort((a, b) => a.starts_at.localeCompare(b.starts_at));
            }
            if (payload.eventType === "UPDATE") {
              const n = payload.new as FamilyEvent;
              return prev.map((e) => (e.id === n.id ? n : e));
            }
            if (payload.eventType === "DELETE") {
              return prev.filter((e) => e.id !== (payload.old as any).id);
            }
            return prev;
          });
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [familyId, supabase]);

  const add = useCallback(
    async (ev: NewEvent) => {
      if (!familyId) return;
      // Datum + Uhrzeit zu einem Zeitstempel zusammensetzen
      const startsAt = ev.time ? `${ev.date}T${ev.time}:00` : `${ev.date}T09:00:00`;
      const { data, error } = await supabase
        .from("events")
        .insert({
          family_id: familyId,
          title: ev.title,
          category: ev.category ?? "allgemein",
          icon: ev.icon ?? "📅",
          starts_at: startsAt,
          location: ev.location ?? null,
          bring_items: ev.bring ?? [],
          source: "local",
        })
        .select("id, title, category, icon, starts_at, location, bring_items, source")
        .single();
      if (error) throw error;
      return data as FamilyEvent;
    },
    [familyId, supabase]
  );

  const remove = useCallback(
    async (id: string) => {
      const backup = events;
      setEvents((p) => p.filter((e) => e.id !== id));
      const { error } = await supabase.from("events").delete().eq("id", id);
      if (error) setEvents(backup);
    },
    [events, supabase]
  );

  return { events, loading, add, remove };
}
