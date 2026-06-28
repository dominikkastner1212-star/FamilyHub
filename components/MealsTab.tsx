"use client";

import { useState } from "react";
import { haptic } from "@/lib/haptics";
import { useToast } from "@/components/Toast";
import { next7Days, type Recipe, type PlanEntry } from "@/lib/useMeals";

// =====================================================================
//  Essensplan-Tab
//  - Wochenplan (7 Tage): jedem Abend ein Rezept zuweisen
//  - Rezeptsammlung: anlegen & wiederverwenden
//  - Zutaten einzeln in die Einkaufsliste übernehmen
// =====================================================================

const WD = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];

export function MealsTab({
  recipes,
  plan,
  loading,
  recipeById,
  onSetMeal,
  onAddRecipe,
  onDeleteRecipe,
  onAddToShopping,
}: {
  recipes: Recipe[];
  plan: PlanEntry[];
  loading: boolean;
  recipeById: (id: string | null) => Recipe | null;
  onSetMeal: (date: string, recipeId: string | null) => Promise<void>;
  onAddRecipe: (name: string, ingredients: string[], emoji?: string, note?: string | null) => Promise<any>;
  onDeleteRecipe: (id: string) => void;
  onAddToShopping: (label: string) => Promise<void>;
}) {
  const { toast } = useToast();
  const days = next7Days();
  const [picking, setPicking] = useState<string | null>(null);   // Datum, für das gerade gewählt wird
  const [detail, setDetail] = useState<string | null>(null);     // aufgeklapptes Rezept (id)
  const [showNew, setShowNew] = useState(false);

  // Formular neues Rezept
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("🍝");
  const [ingredientsText, setIngredientsText] = useState("");

  function planFor(date: string) {
    const p = plan.find((x) => x.plan_date === date);
    return p ? recipeById(p.recipe_id) : null;
  }

  function dayLabel(iso: string, i: number) {
    const d = new Date(iso + "T00:00:00");
    const wd = WD[d.getDay()];
    return i === 0 ? "Heute" : i === 1 ? "Morgen" : `${wd} ${d.getDate()}.`;
  }

  async function assign(date: string, recipeId: string | null) {
    await onSetMeal(date, recipeId);
    setPicking(null);
    haptic("success");
    toast(recipeId ? "Gericht eingeplant ✓" : "Tag geleert", "ok");
  }

  async function createRecipe() {
    const n = name.trim();
    if (!n) return;
    const ing = ingredientsText.split(/[,\n]/).map((s) => s.trim()).filter(Boolean);
    haptic("tap");
    await onAddRecipe(n, ing, emoji);
    toast("Rezept gespeichert ✓", "ok");
    setName(""); setIngredientsText(""); setEmoji("🍝"); setShowNew(false);
  }

  async function addIngredient(label: string) {
    haptic("tap");
    await onAddToShopping(label);
    toast(`„${label}" in den Einkauf ✓`, "ok");
  }

  return (
    <div className="space-y-4">
      {/* Wochenplan */}
      <div className="clay">
        <p className="label">🗓 Diese Woche zum Abendessen</p>
        {days.map((iso, i) => {
          const r = planFor(iso);
          return (
            <div key={iso} className="flex items-center gap-3 py-2.5 border-b border-line last:border-0">
              <div className="w-[52px] text-[13px] font-extrabold text-muted flex-none">{dayLabel(iso, i)}</div>
              {r ? (
                <button onClick={() => { setPicking(picking === iso ? null : iso); haptic("soft"); }} className="flex-1 flex items-center gap-2 text-left tappable">
                  <span className="text-xl">{r.emoji}</span>
                  <span className="font-bold text-[15px]">{r.name}</span>
                </button>
              ) : (
                <button onClick={() => { setPicking(picking === iso ? null : iso); haptic("soft"); }} className="flex-1 text-left text-muted font-semibold text-sm tappable">
                  + Gericht wählen
                </button>
              )}
              {r && (
                <button onClick={() => assign(iso, null)} className="text-muted text-lg tappable flex-none px-1" title="Entfernen">×</button>
              )}
            </div>
          );
        })}

        {/* Auswahl-Popover */}
        {picking && (
          <div className="animate-expand mt-3 bg-bg rounded-[16px] p-3 shadow-clay-in">
            <div className="text-[11px] uppercase tracking-wide font-extrabold text-muted mb-2">
              Gericht für {dayLabel(picking, days.indexOf(picking))}
            </div>
            {recipes.length === 0 ? (
              <p className="text-muted text-sm font-semibold py-1">Noch keine Rezepte – lege unten eins an.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {recipes.map((r) => (
                  <button key={r.id} onClick={() => assign(picking, r.id)} className="bg-card px-3 py-2 rounded-pill text-sm font-bold shadow-clay-sm tappable flex items-center gap-1.5">
                    <span>{r.emoji}</span> {r.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Rezeptsammlung */}
      <div className="clay">
        <div className="flex items-center justify-between mb-1">
          <p className="label mb-0">📖 Eure Rezepte</p>
          <button onClick={() => { setShowNew(!showNew); haptic("tap"); }} className="text-violet-deep font-extrabold text-sm tappable">
            {showNew ? "Abbrechen" : "+ Rezept"}
          </button>
        </div>

        {showNew && (
          <div className="animate-expand bg-bg rounded-[16px] p-3.5 my-3 shadow-clay-in space-y-2.5">
            <div className="flex gap-2">
              <input className="clay-input w-[64px] text-center text-xl" value={emoji} onChange={(e) => setEmoji(e.target.value)} maxLength={2} />
              <input className="clay-input flex-1" placeholder="Name (z.B. Spaghetti Bolognese)" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <textarea className="clay-input w-full min-h-[80px] resize-none" placeholder="Zutaten – durch Komma oder Zeilen trennen&#10;z.B. Nudeln, Hackfleisch, Tomaten" value={ingredientsText} onChange={(e) => setIngredientsText(e.target.value)} />
            <button onClick={createRecipe} className="clay-btn w-full py-3" style={{ background: "linear-gradient(140deg,#9B6FD4,#7C4FC0)" }}>Rezept speichern</button>
          </div>
        )}

        {loading ? (
          <p className="text-muted font-semibold text-sm py-2 animate-pulse-soft">Lädt …</p>
        ) : recipes.length === 0 && !showNew ? (
          <div className="py-6 text-center">
            <div className="text-4xl mb-2">📖</div>
            <p className="text-muted font-semibold text-sm">Noch keine Rezepte. Lege euer erstes Lieblingsessen an.</p>
          </div>
        ) : (
          recipes.map((r) => {
            const open = detail === r.id;
            return (
              <div key={r.id} className="border-b border-line last:border-0">
                <button onClick={() => { setDetail(open ? null : r.id); haptic("soft"); }} className="w-full flex items-center gap-3 py-3 text-left tappable">
                  <span className="text-xl flex-none">{r.emoji}</span>
                  <span className="font-bold text-[15px] flex-1">{r.name}</span>
                  <span className="text-muted text-[12px] font-semibold flex-none">{r.ingredients.length} Zutaten</span>
                  <span className="text-muted flex-none transition-transform" style={{ transform: open ? "rotate(90deg)" : "none" }}>›</span>
                </button>
                {open && (
                  <div className="animate-expand pb-3 pl-9">
                    {r.ingredients.length === 0 ? (
                      <p className="text-muted text-sm font-semibold">Keine Zutaten hinterlegt.</p>
                    ) : (
                      <>
                        <p className="text-[11px] uppercase tracking-wide font-extrabold text-muted mb-2">Tippen → in den Einkauf</p>
                        <div className="flex flex-wrap gap-2">
                          {r.ingredients.map((ing, idx) => (
                            <button key={idx} onClick={() => addIngredient(ing)} className="bg-bg px-3 py-1.5 rounded-pill text-[13px] font-bold shadow-clay-in tappable flex items-center gap-1.5">
                              <span className="text-mint-deep">+</span> {ing}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                    <button onClick={() => { onDeleteRecipe(r.id); haptic("tap"); toast("Rezept gelöscht", "warn"); }} className="text-coral-deep text-[12px] font-bold mt-3 tappable">
                      Rezept löschen
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
