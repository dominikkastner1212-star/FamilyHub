"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-client";
import { SunFace } from "@/components/Avatar";
import { haptic } from "@/lib/haptics";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [signupKind, setSignupKind] = useState<"create" | "join">("create");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [familyName, setFamilyName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit() {
    setMsg(null);
    setBusy(true);
    try {
      if (mode === "signup") {
        // 1) Nutzer anlegen
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        const userId = data.user?.id;
        if (userId && data.session) {
          if (signupKind === "join") {
            // Per Code einer bestehenden Familie beitreten
            const { error: re } = await supabase.rpc("redeem_invitation", {
              invite_code: inviteCode.trim().toUpperCase(),
              member_name: displayName || "Mitglied",
            });
            if (re) throw re;
            haptic("success");
            router.push("/dashboard");
            return;
          }
          // Neue Familie gründen
          const { data: fam, error: fe } = await supabase
            .from("families")
            .insert({ name: familyName || "Unsere Familie", created_by: userId })
            .select()
            .single();
          if (fe) throw fe;
          const { error: me } = await supabase.from("members").insert({
            family_id: fam.id,
            user_id: userId,
            display_name: displayName || "Elternteil",
            role: "admin",
          });
          if (me) throw me;
          haptic("success");
          router.push("/dashboard");
          return;
        }
        setMsg("Fast geschafft! Bitte bestätige deine E-Mail und logge dich dann ein.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push("/dashboard");
      }
    } catch (e: any) {
      haptic("error");
      setMsg(e.message ?? "Etwas ist schiefgelaufen.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen flex flex-col justify-center px-6 relative z-10">
      <div className="text-center mb-8">
        <div className="inline-grid place-items-center mb-3">
          <SunFace size={88} />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight">Familienhub</h1>
        <p className="text-muted font-semibold mt-1">Alles für eure Familie an einem Ort.</p>
      </div>

      <div className="clay">
        <div className="flex gap-2 mb-5 p-1 bg-bg rounded-pill shadow-clay-in">
          {(["login", "signup"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`flex-1 py-2.5 rounded-pill font-extrabold text-sm transition ${
                mode === m ? "bg-amber text-white shadow-clay-sm" : "text-muted"
              }`}
            >
              {m === "login" ? "Anmelden" : "Registrieren"}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {mode === "signup" && (
            <>
              {/* gründen oder beitreten */}
              <div className="flex gap-2 p-1 bg-bg rounded-pill shadow-clay-in">
                {(["create", "join"] as const).map((k) => (
                  <button
                    key={k}
                    onClick={() => setSignupKind(k)}
                    className={`flex-1 py-2 rounded-pill font-extrabold text-[13px] transition ${signupKind === k ? "bg-violet text-white shadow-clay-sm" : "text-muted"}`}
                  >
                    {k === "create" ? "Familie gründen" : "Mit Code beitreten"}
                  </button>
                ))}
              </div>
              <input className="clay-input w-full" placeholder="Dein Name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
              {signupKind === "create" ? (
                <input className="clay-input w-full" placeholder="Name eurer Familie" value={familyName} onChange={(e) => setFamilyName(e.target.value)} />
              ) : (
                <input className="clay-input w-full tracking-wider" placeholder="Einladungscode (z.B. SONNE-4827)" value={inviteCode} onChange={(e) => setInviteCode(e.target.value)} />
              )}
            </>
          )}
          <input className="clay-input w-full" type="email" placeholder="E-Mail" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input className="clay-input w-full" type="password" placeholder="Passwort" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>

        {msg && <p className="text-coral-deep text-sm font-semibold mt-3">{msg}</p>}

        <button onClick={handleSubmit} disabled={busy} className="clay-btn w-full mt-5 py-3.5 bg-amber disabled:opacity-60">
          {busy ? "Moment …" : mode === "login" ? "Los geht's" : signupKind === "join" ? "Familie beitreten" : "Familie gründen"}
        </button>
      </div>

      <p className="text-center text-muted text-xs font-semibold mt-6 px-6">
        Deine Familiendaten bleiben privat – nur eingeladene Mitglieder sehen sie.
      </p>
    </main>
  );
}
