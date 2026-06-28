"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase-client";

// =====================================================================
//  useTasks
//  Aufgaben & Fahrdienste einer Familie, mit Live-Sync.
// =====================================================================

export type Task = {
  id: string;
  title: string;
  kind: "todo" | "pickup";
  assignee_id: string | null;
  child_id: string | null;
  due_date: string | null;
  due_time: string | null;
  location: string | null;
  done: boolean;
};

export type NewTask = {
  title: string;
  kind?: "todo" | "pickup";
  assigneeId?: string | null;
  childId?: string | null;
  dueDate?: string | null;
  dueTime?: string | null;
  location?: string | null;
};

export function useTasks(familyId: string | null, memberId: string | null) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    if (!familyId) return;
    let active = true;
    (async () => {
      const { data } = await supabase
        .from("tasks")
        .select("id, title, kind, assignee_id, child_id, due_date, due_time, location, done")
        .eq("family_id", familyId)
        .order("done", { ascending: true })
        .order("due_date", { ascending: true, nullsFirst: false });
      if (active && data) { setTasks(data as Task[]); setLoading(false); }
    })();
    return () => { active = false; };
  }, [familyId, supabase]);

  useEffect(() => {
    if (!familyId) return;
    const channel = supabase
      .channel(`tasks:${familyId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tasks", filter: `family_id=eq.${familyId}` },
        (payload) => {
          setTasks((prev) => {
            if (payload.eventType === "INSERT") {
              const n = payload.new as Task;
              if (prev.some((t) => t.id === n.id)) return prev;
              return [...prev, n];
            }
            if (payload.eventType === "UPDATE") {
              const n = payload.new as Task;
              return prev.map((t) => (t.id === n.id ? n : t));
            }
            if (payload.eventType === "DELETE") {
              return prev.filter((t) => t.id !== (payload.old as any).id);
            }
            return prev;
          });
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [familyId, supabase]);

  const add = useCallback(
    async (t: NewTask) => {
      if (!familyId) return;
      const { data, error } = await supabase
        .from("tasks")
        .insert({
          family_id: familyId,
          title: t.title,
          kind: t.kind ?? "todo",
          assignee_id: t.assigneeId ?? null,
          child_id: t.childId ?? null,
          due_date: t.dueDate ?? null,
          due_time: t.dueTime ?? null,
          location: t.location ?? null,
          created_by: memberId,
        })
        .select("id, title, kind, assignee_id, child_id, due_date, due_time, location, done")
        .single();
      if (error) throw error;
      return data as Task;
    },
    [familyId, memberId, supabase]
  );

  const toggle = useCallback(
    async (id: string, done: boolean) => {
      setTasks((p) => p.map((t) => (t.id === id ? { ...t, done } : t)));
      const { error } = await supabase
        .from("tasks")
        .update({ done, done_by: done ? memberId : null })
        .eq("id", id);
      if (error) setTasks((p) => p.map((t) => (t.id === id ? { ...t, done: !done } : t)));
    },
    [memberId, supabase]
  );

  const remove = useCallback(
    async (id: string) => {
      const backup = tasks;
      setTasks((p) => p.filter((t) => t.id !== id));
      const { error } = await supabase.from("tasks").delete().eq("id", id);
      if (error) setTasks(backup);
    },
    [tasks, supabase]
  );

  return { tasks, loading, add, toggle, remove };
}
