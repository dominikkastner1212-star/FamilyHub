"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-client";

// =====================================================================
//  useFamily
//  Lädt die Familie + Mitgliedschaft des eingeloggten Nutzers.
//  Liefert family_id und member_id, die fast alle Queries brauchen.
// =====================================================================

export type Membership = {
  familyId: string;
  memberId: string;
  familyName: string;
  displayName: string;
  role: "admin" | "member";
};

export function useFamily() {
  const [membership, setMembership] = useState<Membership | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    let active = true;

    (async () => {
      try {
        const { data: auth } = await supabase.auth.getUser();
        if (!auth.user) {
          if (active) { setError("not-logged-in"); setLoading(false); }
          return;
        }
        // Mitgliedschaft + Familienname in einem Rutsch holen
        const { data, error: e } = await supabase
          .from("members")
          .select("id, family_id, display_name, role, families(name)")
          .eq("user_id", auth.user.id)
          .limit(1)
          .maybeSingle();

        if (e) throw e;
        if (!data) {
          if (active) { setError("no-family"); setLoading(false); }
          return;
        }

        if (active) {
          setMembership({
            familyId: data.family_id,
            memberId: data.id,
            familyName: (data as any).families?.name ?? "Unsere Familie",
            displayName: data.display_name,
            role: data.role,
          });
          setLoading(false);
        }
      } catch (err: any) {
        if (active) { setError(err.message ?? "Fehler"); setLoading(false); }
      }
    })();

    return () => { active = false; };
  }, []);

  return { membership, loading, error };
}
