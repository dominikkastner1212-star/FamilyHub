import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

// =====================================================================
//  Foto-zu-Termin · /api/extract-event
//  Nimmt ein Foto (z.B. Kita-Aushang, Schulflyer) entgegen und lässt
//  Claude Haiku 4.5 die Termin-Daten herauslesen. Antwort als JSON.
//
//  Läuft SERVERSEITIG – der API-Key bleibt geheim, niemals im Browser.
// =====================================================================

export const runtime = "nodejs";
export const maxDuration = 30;

// erlaubte Bildtypen
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Foto-Funktion ist nicht eingerichtet. Es fehlt der API-Schlüssel." },
      { status: 503 }
    );
  }

  try {
    const body = await req.json();
    const { imageBase64, mediaType } = body as { imageBase64?: string; mediaType?: string };

    if (!imageBase64 || !mediaType) {
      return NextResponse.json({ error: "Kein Bild empfangen." }, { status: 400 });
    }
    if (!ALLOWED.includes(mediaType)) {
      return NextResponse.json({ error: "Bildformat nicht unterstützt. Bitte JPG, PNG oder WebP." }, { status: 400 });
    }

    const anthropic = new Anthropic({ apiKey });

    // Heutiges Datum mitgeben, damit "nächsten Freitag" o.Ä. korrekt aufgelöst wird
    const today = new Date().toLocaleDateString("de-DE", {
      weekday: "long", year: "numeric", month: "long", day: "numeric",
    });

    const msg = await anthropic.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 1024,
      system:
        `Du extrahierst Termin-Daten aus Fotos von Aushängen, Flyern, Einladungen oder Schulzetteln. ` +
        `Heute ist ${today}. Rechne relative Angaben (z.B. "nächsten Montag") in ein konkretes Datum um. ` +
        `Antworte AUSSCHLIESSLICH mit einem JSON-Objekt, ohne Markdown, ohne Erklärung. ` +
        `Format: {"found": boolean, "events": [{"title": string, "date": "YYYY-MM-DD", "time": "HH:MM" oder null, ` +
        `"location": string oder null, "bring": [string], "note": string oder null}]}. ` +
        `"found" ist false, wenn kein Termin erkennbar ist. "bring" sind Dinge die laut Aushang mitzubringen sind. ` +
        `Bei mehreren Terminen auf dem Bild alle auflisten.`,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: { type: "base64", media_type: mediaType as any, data: imageBase64 },
            },
            { type: "text", text: "Welche Termine stehen auf diesem Bild? Gib das JSON zurück." },
          ],
        },
      ],
    });

    // Textantwort einsammeln und JSON robust parsen
    const text = msg.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("")
      .trim();

    let parsed;
    try {
      // falls das Modell doch ```json ... ``` schickt: Fences entfernen
      const clean = text.replace(/```json|```/g, "").trim();
      parsed = JSON.parse(clean);
    } catch {
      return NextResponse.json(
        { error: "Konnte das Foto nicht eindeutig lesen. Bitte tippe den Termin manuell ein." },
        { status: 200 }
      );
    }

    return NextResponse.json(parsed);
  } catch (e: any) {
    console.error("extract-event Fehler:", e?.message);
    return NextResponse.json(
      { error: "Beim Auslesen ist etwas schiefgelaufen. Bitte versuche es erneut." },
      { status: 200 }
    );
  }
}
