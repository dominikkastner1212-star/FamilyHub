"use client";

// =====================================================================
//  Haptik & Feedback-Helfer
//  Kleine, dezente Vibrationen beim Antippen – auf dem Handy macht das
//  enorm viel fürs "wertige" Gefühl. Auf Geräten ohne Vibration (Desktop)
//  passiert einfach nichts, kein Fehler.
// =====================================================================

type Pattern = "tap" | "success" | "soft" | "error";

const PATTERNS: Record<Pattern, number | number[]> = {
  tap: 8,            // kurzer Klick beim Antippen
  soft: 4,          // ganz leichtes Ticken (z.B. Tab-Wechsel)
  success: [10, 40, 18], // zufriedenes "erledigt"-Muster
  error: [30, 30, 30],   // spürbar anders bei Fehlern
};

export function haptic(p: Pattern = "tap") {
  if (typeof window === "undefined") return;
  // navigator.vibrate gibt es nur auf unterstützten (meist Android-)Geräten.
  // iOS Safari ignoriert es – dort sorgt die CSS-Animation fürs Feedback.
  try {
    navigator.vibrate?.(PATTERNS[p]);
  } catch {
    /* still */
  }
}
