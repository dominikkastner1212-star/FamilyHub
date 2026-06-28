"use client";

import { useState } from "react";
import { Avatar } from "@/components/Avatar";
import { haptic } from "@/lib/haptics";
import type { Member } from "@/lib/useMembers";
import type { Task, NewTask } from "@/lib/useTasks";
import type { ChildProfile } from "@/components/KidsTab";

// =====================================================================
//  Aufgaben-Tab
//  Zwei Bereiche: "Wer holt wen" (Fahrdienste) und normale Aufgaben.
//  Jede Aufgabe kann einem Familienmitglied zugewiesen werden.
// =====================================================================

export function TasksTab({
  tasks,
  members,
  children,
  loading,
  onAdd,
  onToggle,
  onRemove,
}: {
  tasks: Task[];
  members: Member[];
  children: ChildProfile[];
  loading: boolean;
  onAdd: (t: NewTask) => Promise<any>;
  onToggle: (id: string, done: boolean) => void;
  onRemove: (id: string) => void;
}) {
  const [showForm, setShowForm] = useState<null | "todo" | "pickup">(null);
  const [title, setTitle] = useState("");
  const [assignee, setAssignee] = useState<string | null>(null);
  const [childId, setChildId] = useState<string | null>(null);
  const [dueDate, setDueDate] = useState("");
  const [dueTime, setDueTime] = useState("");
  const [location, setLocation] = useState("");

  const pickups = tasks.filter((t) => t.kind === "pickup");
  const todos = tasks.filter((t) => t.kind === "todo");

  function memberOf(id: string | null) {
    return members.find((m) => m.id === id) ?? null;
  }
  function childOf(id: string | null) {
    return children.find((c) => c.id === id) ?? null;
  }

  function reset() {
    setTitle(""); setAssignee(null); setChildId(null);
    setDueDate(""); setDueTime(""); setLocation(""); setShowForm(null);
  }

  async function submit() {
    const kind = showForm!;
    // bei Fahrdienst ist der Titel optional – wir bauen ihn aus Kind + Ort
    const child = childOf(childId);
    const finalTitle =
      title.trim() ||
      (kind === "pickup" && child ? `${child.name} abholen` : "Neue Aufgabe");
    haptic("tap");
    await onAdd({
      title: finalTitle,
      kind,
      assigneeId: assignee,
      childId,
      dueDate: dueDate || null,
      dueTime: dueTime || null,
      location: location || null,
    });
    haptic("success");
    reset();
  }

  function TaskRow({ t }: { t: Task }) {
    const m = memberOf(t.assignee_id);
    const c = childOf(t.child_id);
    return (
      <div className={`flex items-center gap-3 py-3 border-b border-line last:border-0 ${t.done ? "animate-done" : ""}`}>
        <button
          onClick={() => { onToggle(t.id, !t.done); haptic(!t.done ? "success" : "tap"); }}
          className="w-7 h-7 rounded-full grid place-items-center text-white text-[15px] font-black flex-none tappable"
          style={t.done
            ? { background: "linear-gradient(140deg,#5FC9A0,#3DAE84)", boxShadow: "3px 3px 8px rgba(61,174,132,.4)" }
            : { background: "#F1E4EE", boxShadow: "inset 2px 2px 5px rgba(160,110,150,.22), inset -2px -2px 5px rgba(255,255,255,.85)" }}
        >
          {t.done ? <span className="animate-check inline-block">✓</span> : ""}
        </button>
        <div className="min-w-0 flex-1">
          <div className={`font-bold text-[15px] ${t.done ? "line-through text-muted" : ""}`}>{t.title}</div>
          <div className="text-muted text-[12px] font-semibold flex items-center gap-2 flex-wrap mt-0.5">
            {t.location && <span>📍 {t.location}</span>}
            {t.due_time && <span>🕑 {t.due_time}</span>}
            {t.due_date && <span>{new Date(t.due_date + "T00:00:00").toLocaleDateString("de-DE", { weekday: "short", day: "numeric", month: "short" })}</span>}
            {c && <span>· {c.name}</span>}
          </div>
        </div>
        {m && (
          <div className="flex flex-col items-center gap-0.5 flex-none">
            <Avatar char={m.char} size={30} ring={false} />
            <span className="text-[9px] font-extrabold text-muted">{m.name.split(" ")[0]}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Fahrdienste */}
      <div className="clay">
        <div className="flex items-center justify-between mb-1">
          <p className="label mb-0">🚗 Wer holt wen</p>
          <button onClick={() => { setShowForm(showForm === "pickup" ? null : "pickup"); haptic("tap"); }} className="text-violet-deep font-extrabold text-sm tappable">
            {showForm === "pickup" ? "Abbrechen" : "+ Fahrt"}
          </button>
        </div>

        {showForm === "pickup" && (
          <div className="animate-expand bg-bg rounded-[16px] p-3.5 my-3 shadow-clay-in space-y-2.5">
            <select className="clay-input w-full" value={childId ?? ""} onChange={(e) => setChildId(e.target.value || null)}>
              <option value="">Wer wird geholt?</option>
              {children.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <input className="clay-input w-full" placeholder="Wohin? (z.B. Hallenbad)" value={location} onChange={(e) => setLocation(e.target.value)} />
            <div className="flex gap-2">
              <input type="date" className="clay-input flex-1" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
              <input type="time" className="clay-input w-[110px]" value={dueTime} onChange={(e) => setDueTime(e.target.value)} />
            </div>
            <MemberPicker members={members} value={assignee} onChange={setAssignee} label="Wer fährt?" />
            <button onClick={submit} className="clay-btn w-full py-3" style={{ background: "linear-gradient(140deg,#9B6FD4,#7C4FC0)" }}>Fahrt eintragen</button>
          </div>
        )}

        {pickups.length === 0 && showForm !== "pickup" ? (
          <p className="text-muted font-semibold text-sm py-2">Keine Fahrdienste geplant.</p>
        ) : (
          pickups.map((t) => <TaskRow key={t.id} t={t} />)
        )}
      </div>

      {/* Aufgaben */}
      <div className="clay">
        <div className="flex items-center justify-between mb-1">
          <p className="label mb-0">✅ Aufgaben</p>
          <button onClick={() => { setShowForm(showForm === "todo" ? null : "todo"); haptic("tap"); }} className="text-violet-deep font-extrabold text-sm tappable">
            {showForm === "todo" ? "Abbrechen" : "+ Aufgabe"}
          </button>
        </div>

        {showForm === "todo" && (
          <div className="animate-expand bg-bg rounded-[16px] p-3.5 my-3 shadow-clay-in space-y-2.5">
            <input className="clay-input w-full" placeholder="Was ist zu tun?" value={title} onChange={(e) => setTitle(e.target.value)} />
            <input type="date" className="clay-input w-full" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            <MemberPicker members={members} value={assignee} onChange={setAssignee} label="Wer macht's?" />
            <button onClick={submit} className="clay-btn w-full py-3" style={{ background: "linear-gradient(140deg,#9B6FD4,#7C4FC0)" }}>Aufgabe hinzufügen</button>
          </div>
        )}

        {loading ? (
          <p className="text-muted font-semibold text-sm py-2 animate-pulse-soft">Lädt …</p>
        ) : todos.length === 0 && showForm !== "todo" ? (
          <p className="text-muted font-semibold text-sm py-2">Keine offenen Aufgaben. 🎉</p>
        ) : (
          todos.map((t) => <TaskRow key={t.id} t={t} />)
        )}
      </div>
    </div>
  );
}

// Avatar-Auswahl, wer zuständig ist
function MemberPicker({ members, value, onChange, label }: { members: Member[]; value: string | null; onChange: (id: string | null) => void; label: string }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wide font-extrabold text-muted mb-2">{label}</div>
      <div className="flex gap-2 flex-wrap">
        {members.map((m) => {
          const on = value === m.id;
          return (
            <button key={m.id} onClick={() => { onChange(on ? null : m.id); haptic("soft"); }} className="flex flex-col items-center gap-1 tappable" style={{ opacity: on ? 1 : 0.45 }}>
              <div style={{ outline: on ? "3px solid #9B6FD4" : "none", borderRadius: "50%" }}>
                <Avatar char={m.char} size={40} ring={false} />
              </div>
              <span className="text-[10px] font-extrabold text-muted">{m.name.split(" ")[0]}</span>
            </button>
          );
        })}
        {members.length === 0 && <span className="text-muted text-sm font-semibold">Lade Mitglieder …</span>}
      </div>
    </div>
  );
}
