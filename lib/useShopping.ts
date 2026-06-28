"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase-client";

// =====================================================================
//  useShopping
//  Lädt die Einkaufsliste einer Familie aus Supabase, hört auf
//  Echtzeit-Änderungen (andere Familienmitglieder) und bietet
//  add / toggle / remove an.
// =====================================================================

export type ShoppingItem = {
  id: string;
  label: string;
  category: "lebensmittel" | "drogerie" | "sonstiges";
  done: boolean;
};

export function useShopping(familyId: string | null, memberId: string | null) {
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  // Initial laden
  useEffect(() => {
    if (!familyId) return;
    let active = true;
    (async () => {
      const { data } = await supabase
        .from("shopping_items")
        .select("id, label, category, done")
        .eq("family_id", familyId)
        .order("done", { ascending: true })
        .order("created_at", { ascending: false });
      if (active && data) { setItems(data as ShoppingItem[]); setLoading(false); }
    })();
    return () => { active = false; };
  }, [familyId, supabase]);

  // Echtzeit: auf Änderungen dieser Familie hören
  useEffect(() => {
    if (!familyId) return;
    const channel = supabase
      .channel(`shopping:${familyId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "shopping_items", filter: `family_id=eq.${familyId}` },
        (payload) => {
          setItems((prev) => {
            if (payload.eventType === "INSERT") {
              const n = payload.new as ShoppingItem;
              if (prev.some((i) => i.id === n.id)) return prev;
              return [n, ...prev];
            }
            if (payload.eventType === "UPDATE") {
              const n = payload.new as ShoppingItem;
              return prev.map((i) => (i.id === n.id ? n : i));
            }
            if (payload.eventType === "DELETE") {
              return prev.filter((i) => i.id !== (payload.old as any).id);
            }
            return prev;
          });
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [familyId, supabase]);

  const add = useCallback(
    async (label: string, category: ShoppingItem["category"] = "sonstiges") => {
      if (!familyId) return;
      // optimistisch einfügen für sofortiges Feedback
      const tempId = crypto.randomUUID();
      const optimistic: ShoppingItem = { id: tempId, label, category, done: false };
      setItems((p) => [optimistic, ...p]);
      const { data, error } = await supabase
        .from("shopping_items")
        .insert({ family_id: familyId, label, category, added_by: memberId })
        .select("id, label, category, done")
        .single();
      if (error) {
        setItems((p) => p.filter((i) => i.id !== tempId)); // rückgängig
        throw error;
      }
      // temporäre durch echte ersetzen
      setItems((p) => p.map((i) => (i.id === tempId ? (data as ShoppingItem) : i)));
    },
    [familyId, memberId, supabase]
  );

  const toggle = useCallback(
    async (id: string, done: boolean) => {
      setItems((p) => p.map((i) => (i.id === id ? { ...i, done } : i))); // sofort
      const { error } = await supabase.from("shopping_items").update({ done }).eq("id", id);
      if (error) setItems((p) => p.map((i) => (i.id === id ? { ...i, done: !done } : i)));
    },
    [supabase]
  );

  const remove = useCallback(
    async (id: string) => {
      const backup = items;
      setItems((p) => p.filter((i) => i.id !== id));
      const { error } = await supabase.from("shopping_items").delete().eq("id", id);
      if (error) setItems(backup);
    },
    [items, supabase]
  );

  return { items, loading, add, toggle, remove };
}
