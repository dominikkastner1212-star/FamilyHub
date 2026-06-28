"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase-client";

// =====================================================================
//  useMeals
//  Verwaltet Rezeptsammlung + Wochenplan (Abendessen, kommende 7 Tage).
// =====================================================================

export type Recipe = {
  id: string;
  name: string;
  ingredients: string[];
  note: string | null;
  emoji: string | null;
};

export type PlanEntry = {
  id: string;
  plan_date: string;   // YYYY-MM-DD
  recipe_id: string | null;
};

// die nächsten 7 Tage ab heute als ISO-Datumsliste
export function next7Days(): string[] {
  const out: string[] = [];
  const d = new Date();
  for (let i = 0; i < 7; i++) {
    const x = new Date(d);
    x.setDate(d.getDate() + i);
    out.push(x.toISOString().slice(0, 10));
  }
  return out;
}

export function useMeals(familyId: string | null, memberId: string | null) {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [plan, setPlan] = useState<PlanEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const loadAll = useCallback(async () => {
    if (!familyId) return;
    const days = next7Days();
    const [r, p] = await Promise.all([
      supabase.from("recipes").select("id, name, ingredients, note, emoji").eq("family_id", familyId).order("name"),
      supabase.from("meal_plan").select("id, plan_date, recipe_id").eq("family_id", familyId).gte("plan_date", days[0]).lte("plan_date", days[6]),
    ]);
    if (r.data) setRecipes(r.data as Recipe[]);
    if (p.data) setPlan(p.data as PlanEntry[]);
    setLoading(false);
  }, [familyId, supabase]);

  useEffect(() => { loadAll(); }, [loadAll]);

  // Live-Sync für beide Tabellen
  useEffect(() => {
    if (!familyId) return;
    const ch = supabase
      .channel(`meals:${familyId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "recipes", filter: `family_id=eq.${familyId}` }, () => loadAll())
      .on("postgres_changes", { event: "*", schema: "public", table: "meal_plan", filter: `family_id=eq.${familyId}` }, () => loadAll())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [familyId, supabase, loadAll]);

  const addRecipe = useCallback(
    async (name: string, ingredients: string[], emoji = "🍽️", note: string | null = null) => {
      if (!familyId) return;
      const { data, error } = await supabase
        .from("recipes")
        .insert({ family_id: familyId, name, ingredients, emoji, note, created_by: memberId })
        .select("id, name, ingredients, note, emoji")
        .single();
      if (error) throw error;
      setRecipes((p) => [...p, data as Recipe].sort((a, b) => a.name.localeCompare(b.name)));
      return data as Recipe;
    },
    [familyId, memberId, supabase]
  );

  const deleteRecipe = useCallback(
    async (id: string) => {
      setRecipes((p) => p.filter((r) => r.id !== id));
      await supabase.from("recipes").delete().eq("id", id);
    },
    [supabase]
  );

  // Rezept einem Tag zuordnen (oder Zuordnung entfernen, wenn recipeId null)
  const setMeal = useCallback(
    async (date: string, recipeId: string | null) => {
      if (!familyId) return;
      const existing = plan.find((p) => p.plan_date === date);
      if (recipeId === null) {
        if (existing) {
          setPlan((p) => p.filter((x) => x.plan_date !== date));
          await supabase.from("meal_plan").delete().eq("id", existing.id);
        }
        return;
      }
      // upsert über unique(family_id, plan_date)
      const { data, error } = await supabase
        .from("meal_plan")
        .upsert({ family_id: familyId, plan_date: date, recipe_id: recipeId }, { onConflict: "family_id,plan_date" })
        .select("id, plan_date, recipe_id")
        .single();
      if (error) throw error;
      setPlan((p) => {
        const without = p.filter((x) => x.plan_date !== date);
        return [...without, data as PlanEntry];
      });
    },
    [familyId, plan, supabase]
  );

  const recipeById = useCallback((id: string | null) => recipes.find((r) => r.id === id) ?? null, [recipes]);

  return { recipes, plan, loading, addRecipe, deleteRecipe, setMeal, recipeById };
}
