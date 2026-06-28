"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Avatar } from "@/components/Avatar";
import { WeatherCard } from "@/components/WeatherCard";
import { WeekCheck } from "@/components/WeekCheck";
import { KidsTab } from "@/components/KidsTab";
import { InviteCard } from "@/components/InviteCard";
import { BottomNav, type TabKey } from "@/components/BottomNav";
import { PhotoToEvent, type ExtractedEvent } from "@/components/PhotoToEvent";
import { useToast } from "@/components/Toast";
import { haptic } from "@/lib/haptics";
import { createClient } from "@/lib/supabase-client";
import { useFamily } from "@/lib/useFamily";
import { useShopping } from "@/lib/useShopping";
import { useEvents } from "@/lib/useEvents";
import { useChildren } from "@/lib/useChildren";
import { useMembers } from "@/lib/useMembers";
import { useTasks } from "@/lib/useTasks";
import { useMeals } from "@/lib/useMeals";
import { useNotes } from "@/lib/useNotes";
import { TasksTab } from "@/components/TasksTab";
import { MealsTab } from "@/components/MealsTab";
import { NotesBoard } from "@/components/NotesBoard";
import { DEMO_WEEK, DEMO_TODAY } from "@/lib/demo-data";

const UV_NOW = 7; // wird später aus dem Wetter-State gezogen

// Einkaufs-Kategorie aus dem Filter-Label ableiten
const CAT_MAP: Record<string, "lebensmittel" | "drogerie" | "sonstiges"> = {
  Lebensmittel: "lebensmittel", Drogerie: "drogerie", Sonstiges: "sonstiges",
};

export default function Dashboard() {
  const { toast } = useToast();
  const router = useRouter();
  const { membership, loading: famLoading, error: famError } = useFamily();
  const familyId = membership?.familyId ?? null;
  const memberId = membership?.memberId ?? null;

  const { items: shopping, loading: shopLoading, add: addShop, toggle: toggleShop } = useShopping(familyId, memberId);
  const { events, add: addEvent } = useEvents(familyId);
  const { children, loading: kidsLoading } = useChildren(familyId);
  const { members } = useMembers(familyId);
  const { tasks, loading: tasksLoading, add: addTask, toggle: toggleTask, remove: removeTask } = useTasks(familyId, memberId);
  const meals = useMeals(familyId, memberId);
  const notes = useNotes(familyId, memberId);

  const [tab, setTab] = useState<TabKey>("home");
  const [newItem, setNewItem] = useState("");
  const [filter, setFilter] = useState("Alle");
  const [shopView, setShopView] = useState<"list" | "meals">("list");

  // Wenn nicht eingeloggt → zurück zum Login
  useEffect(() => {
    if (famError === "not-logged-in") router.push("/login");
  }, [famError, router]);

  async function logout() {
    await createClient().auth.signOut();
    router.push("/login");
  }

  // Foto-Termin direkt in die DB speichern
  async function addPhotoEvent(ev: ExtractedEvent) {
    try {
      await addEvent({ title: ev.title, date: ev.date, time: ev.time, location: ev.location, bring: ev.bring, icon: "📸", category: "foto" });
      haptic("success");
      toast("Termin gespeichert ✓", "ok");
    } catch {
      haptic("error");
      toast("Konnte nicht speichern", "warn");
    }
  }

  async function toggleItem(id: string, current: boolean) {
    await toggleShop(id, !current);
    haptic(!current ? "success" : "tap");
  }

  async function addItem() {
    const v = newItem.trim();
    if (!v) return;
    setNewItem("");
    try {
      await addShop(v, CAT_MAP[filter] ?? "sonstiges");
      haptic("tap");
      toast("Hinzugefügt ✓", "ok");
    } catch {
      haptic("error");
      toast("Konnte nicht speichern", "warn");
    }
  }

  const shownShopping = filter === "Alle" ? shopping : shopping.filter((i) => i.category === CAT_MAP[filter]);

  return (
    <main className="relative z-10 pb-28">
      <div key={tab} className="animate-screen">
      {/* ---------- START ---------- */}
      {tab === "home" && (
        <>
          <header className="px-5 pt-6 pb-1 flex justify-between items-center">
            <div>
              <h1 className="text-[28px] font-extrabold tracking-tight">Hallo {membership?.familyName ?? "Familie"} 👋</h1>
              <p className="text-muted font-semibold text-sm mt-0.5">Schön, dass ihr da seid</p>
            </div>
            <button onClick={logout} className="text-[11px] font-extrabold text-muted bg-card px-3 py-2 rounded-pill shadow-clay-sm tappable">
              Abmelden
            </button>
          </header>

          <div className="px-[18px] space-y-4 mt-2">
            <WeatherCard />
            <WeekCheck events={DEMO_WEEK} />

            {(() => {
              const today = new Date().toISOString().slice(0, 10);
              const todayTasks = tasks.filter((t) => !t.done && t.due_date === today);
              if (todayTasks.length === 0) return null;
              return (
                <div className="clay">
                  <p className="label">✅ Heute zu erledigen</p>
                  {todayTasks.map((t) => {
                    const m = members.find((x) => x.id === t.assignee_id);
                    return (
                      <div key={t.id} className="flex items-center gap-3 py-2.5 border-b border-line last:border-0">
                        <span className="text-lg flex-none">{t.kind === "pickup" ? "🚗" : "✅"}</span>
                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-[15px]">{t.title}</div>
                          {(t.due_time || t.location) && (
                            <div className="text-muted text-[12px] font-semibold">
                              {t.due_time && `🕑 ${t.due_time}`}{t.due_time && t.location ? " · " : ""}{t.location}
                            </div>
                          )}
                        </div>
                        {m && <Avatar char={m.char} size={28} ring={false} />}
                      </div>
                    );
                  })}
                </div>
              );
            })()}

            <div className="clay">
              <p className="label">Heute</p>
              {DEMO_TODAY.map((e, i) => (
                <div key={i} className="flex items-center gap-3.5 py-3 border-b border-line last:border-0">
                  <div className="w-[42px] h-[42px] rounded-[15px] grid place-items-center text-xl flex-none shadow-clay-sm" style={{ background: e.bg }}>{e.icon}</div>
                  <div>
                    <div className="font-extrabold text-[15px]">{e.title}</div>
                    <div className="text-muted text-[13px] font-semibold">{e.meta}</div>
                  </div>
                  <span className="ml-auto font-extrabold text-sm" style={{ color: e.color }}>{e.time}</span>
                </div>
              ))}
            </div>

            {/* Familien-Pinnwand */}
            <div>
              <p className="label px-1 mb-2">📌 Pinnwand</p>
              <NotesBoard
                notes={notes.notes}
                loading={notes.loading}
                onAdd={notes.add}
                onTogglePin={notes.togglePin}
                onRemove={notes.remove}
              />
            </div>
          </div>
        </>
      )}

      {/* ---------- KALENDER ---------- */}
      {tab === "cal" && (
        <>
          <header className="px-5 pt-6 pb-1">
            <h1 className="text-[28px] font-extrabold tracking-tight">Kalender</h1>
            <p className="text-muted font-semibold text-sm mt-0.5">Alle Termine an einem Ort</p>
          </header>
          <div className="px-[18px] space-y-4 mt-2">
            <div className="clay">
              <p className="label">📸 Schnell eintragen</p>
              <p className="text-muted font-semibold text-sm mb-3 -mt-1">
                Aushang, Flyer oder Einladung abfotografieren – der Termin trägt sich von selbst ein.
              </p>
              <PhotoToEvent onConfirm={addPhotoEvent} />
            </div>

            {events.length > 0 && (
              <div className="clay">
                <p className="label">📋 Eure Termine</p>
                {events.map((ev) => (
                  <div key={ev.id} className="flex items-center gap-3.5 py-3 border-b border-line last:border-0">
                    <div className="w-[42px] h-[42px] rounded-[15px] grid place-items-center text-xl flex-none shadow-clay-sm" style={{ background: "#E6E0F8" }}>{ev.icon ?? "📅"}</div>
                    <div className="min-w-0">
                      <div className="font-extrabold text-[15px] truncate">{ev.title}</div>
                      <div className="text-muted text-[13px] font-semibold">
                        {new Date(ev.starts_at).toLocaleDateString("de-DE", { weekday: "short", day: "numeric", month: "short" })}
                        {" · "}
                        {new Date(ev.starts_at).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })}
                        {ev.location ? ` · ${ev.location}` : ""}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <MiniCalendar />
            <div className="clay">
              <p className="label">Kalender-Sync</p>
              <div className="flex items-center gap-3 rounded-[18px] p-3.5 font-bold text-[13px]" style={{ background: "linear-gradient(140deg,#E4F1E9,#D2E9DC)", color: "#2f5c47", boxShadow: "inset 2px 2px 6px rgba(90,150,120,.2)" }}>
                <span className="w-[38px] h-[38px] rounded-[13px] bg-white grid place-items-center text-lg shadow-clay-sm">🍎</span>
                <div>Apple Kalender · synchronisiert 12:04<br /><span className="opacity-70">Verbunden via CalDAV ✓</span></div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ---------- AUFGABEN ---------- */}
      {tab === "tasks" && (
        <>
          <header className="px-5 pt-6 pb-1">
            <h1 className="text-[28px] font-extrabold tracking-tight">Aufgaben</h1>
            <p className="text-muted font-semibold text-sm mt-0.5">Wer macht was – und wer holt wen</p>
          </header>
          <div className="px-[18px] mt-2">
            <TasksTab
              tasks={tasks}
              members={members}
              children={children}
              loading={tasksLoading}
              onAdd={addTask}
              onToggle={toggleTask}
              onRemove={removeTask}
            />
          </div>
        </>
      )}

      {/* ---------- EINKAUF ---------- */}
      {tab === "shop" && (
        <>
          <header className="px-5 pt-6 pb-1">
            <h1 className="text-[28px] font-extrabold tracking-tight">{shopView === "list" ? "Einkaufsliste" : "Essensplan"}</h1>
            <p className="text-muted font-semibold text-sm mt-0.5">{shopView === "list" ? `Geteilt · ${shopping.filter((i) => !i.done).length} offen` : "Plant das Abendessen für die Woche"}</p>
          </header>
          <div className="px-[18px] mt-2">
            {/* Umschalter Einkauf / Essensplan */}
            <div className="flex gap-2 p-1 bg-bg rounded-pill shadow-clay-in mb-4">
              {([["list", "🛒 Einkauf"], ["meals", "🍽️ Essensplan"]] as const).map(([v, lbl]) => (
                <button key={v} onClick={() => { setShopView(v); haptic("soft"); }} className={`flex-1 py-2.5 rounded-pill font-extrabold text-sm transition ${shopView === v ? "bg-violet text-white shadow-clay-sm" : "text-muted"}`}>
                  {lbl}
                </button>
              ))}
            </div>

            {shopView === "meals" ? (
              <MealsTab
                recipes={meals.recipes}
                plan={meals.plan}
                loading={meals.loading}
                recipeById={meals.recipeById}
                onSetMeal={meals.setMeal}
                onAddRecipe={meals.addRecipe}
                onDeleteRecipe={meals.deleteRecipe}
                onAddToShopping={async (label) => { await addShop(label, "lebensmittel"); }}
              />
            ) : (
            <>
            <div className="flex gap-2.5 mb-3.5">
              <input className="clay-input flex-1" placeholder="Was fehlt?" value={newItem} onChange={(e) => setNewItem(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addItem()} />
              <button onClick={addItem} className="clay-btn w-[54px] text-2xl bg-amber">+</button>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 mb-1">
              {["Alle", "Lebensmittel", "Drogerie", "Sonstiges"].map((c) => (
                <button key={c} onClick={() => { setFilter(c); haptic("soft"); }} className={`px-4 py-2 rounded-pill font-extrabold text-[13px] whitespace-nowrap shadow-clay-sm tappable ${filter === c ? "bg-violet text-white" : "bg-card text-muted"}`}>{c}</button>
              ))}
            </div>
            <div className="clay">
              {shopLoading ? (
                <div className="py-8 text-center text-muted font-semibold animate-pulse-soft">Liste wird geladen …</div>
              ) : shownShopping.length === 0 ? (
                <div className="py-8 text-center">
                  <div className="text-4xl mb-2">🛒</div>
                  <p className="text-muted font-semibold text-sm">
                    {filter === "Alle" ? "Noch nichts auf der Liste. Tippe oben ein, was fehlt." : "Hier ist nichts in dieser Kategorie."}
                  </p>
                </div>
              ) : (
                shownShopping.map((i) => (
                  <div key={i.id} className={`flex items-center gap-3.5 py-3.5 border-b border-line last:border-0 ${i.done ? "animate-done" : ""}`}>
                    <button onClick={() => toggleItem(i.id, i.done)} className="w-7 h-7 rounded-full grid place-items-center text-white text-[15px] font-black flex-none tappable" style={i.done ? { background: "linear-gradient(140deg,#5FC9A0,#3DAE84)", boxShadow: "3px 3px 8px rgba(61,174,132,.4)" } : { background: "#F1E4EE", boxShadow: "inset 2px 2px 5px rgba(160,110,150,.22), inset -2px -2px 5px rgba(255,255,255,.85)" }}>
                      {i.done ? <span className="animate-check inline-block">✓</span> : ""}
                    </button>
                    <span className={`font-bold transition-all ${i.done ? "line-through text-muted" : ""}`}>{i.label}</span>
                    <span className="ml-auto text-[11px] text-muted font-bold bg-bg px-2.5 py-1 rounded-pill capitalize">{i.category}</span>
                  </div>
                ))
              )}
            </div>
            </>
            )}
          </div>
        </>
      )}

      {/* ---------- KINDER ---------- */}
      {tab === "kids" && (
        <>
          <header className="px-5 pt-6 pb-1">
            <h1 className="text-[28px] font-extrabold tracking-tight">Kinder</h1>
            <p className="text-muted font-semibold text-sm mt-0.5">Profile, Gesundheit & Sonnenschutz</p>
          </header>
          <div className="px-[18px] mt-2 space-y-4">
            {kidsLoading ? (
              <div className="clay py-8 text-center text-muted font-semibold animate-pulse-soft">Kinder werden geladen …</div>
            ) : children.length === 0 ? (
              <div className="clay py-8 text-center">
                <div className="text-4xl mb-2">🧒</div>
                <p className="text-muted font-semibold text-sm">
                  Noch keine Kinder angelegt. Lege das erste Profil mit Hauttyp, Allergien und Notfallkontakten an.
                </p>
              </div>
            ) : (
              <KidsTab kids={children} uvNow={UV_NOW} />
            )}
            <InviteCard familyName={membership?.familyName ?? "Unsere Familie"} />
          </div>
        </>
      )}

      </div>
      <BottomNav active={tab} onChange={setTab} />
    </main>
  );
}

// Mini-Monatskalender mit farbigen Event-Punkten
function MiniCalendar() {
  const C = { a: "#E86FA6", c: "#F47B6B", g: "#8E7CDB", s: "#4FB6E8", m: "#5FC9A0" };
  const ev: Record<number, string[]> = { 5: [C.c], 12: [C.m], 18: [C.m, C.c, C.g], 19: [C.c], 20: [C.m], 21: [C.s] };
  const cells: JSX.Element[] = [];
  ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"].forEach((d) => cells.push(<div key={"wd" + d} className="text-center text-[11px] text-muted font-extrabold pb-2">{d}</div>));
  for (let i = 0; i < 7; i++) cells.push(<div key={"o" + i} className="aspect-square grid place-items-center text-sm font-bold text-[#D7C9B5]">{26 + i}</div>);
  for (let d = 1; d <= 30; d++) {
    const dots = ev[d] ?? [];
    const today = d === 18;
    cells.push(
      <div key={d} className="aspect-square rounded-[15px] grid place-items-center text-sm font-bold relative" style={today ? { color: "#fff", background: "linear-gradient(140deg,#E86FA6,#D14D8C)", boxShadow: "3px 3px 9px rgba(209,77,140,.45), inset 1px 1px 2px rgba(255,255,255,.4)" } : {}}>
        {d}
        {dots.length > 0 && <span className="absolute bottom-1.5 flex gap-[3px]">{dots.map((c, i) => <i key={i} className="w-1.5 h-1.5 rounded-full" style={{ background: c }} />)}</span>}
      </div>
    );
  }
  return (
    <div className="clay">
      <div className="flex justify-between items-center mb-4">
        <button className="nav w-10 h-10 rounded-[14px] bg-card text-lg font-extrabold shadow-clay-btn">‹</button>
        <span className="text-lg font-black">Juni 2026</span>
        <button className="nav w-10 h-10 rounded-[14px] bg-card text-lg font-extrabold shadow-clay-btn">›</button>
      </div>
      <div className="grid grid-cols-7 gap-[5px]">{cells}</div>
    </div>
  );
}
