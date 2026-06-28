"use client";

// =====================================================================
//  Wochenstart-Check
//  Sammelt aus den Terminen der kommenden 7 Tage automatisch zusammen,
//  was ansteht UND was mitgenommen werden muss (bring_items).
//  So startet man die Woche ohne böse Überraschungen.
// =====================================================================

export type WeekEvent = {
  title: string;
  day: string;        // "Mo"
  date: string;       // "23."
  icon: string;
  bring: string[];    // ["Sportzeug", "5€"]
  color: string;
};

// Mappt häufige Mitnehm-Dinge auf Emojis für die schnelle Erkennung
const ITEM_ICON: Record<string, string> = {
  sonnencreme: "🧴", sportzeug: "👟", geld: "💶", "5€": "💶", "10€": "💶",
  badesachen: "🩱", turnbeutel: "🎒", hausaufgaben: "📚", instrument: "🎻",
  matschhose: "🧥", trinkflasche: "🍶", brotdose: "🥪",
};

function itemIcon(s: string) {
  return ITEM_ICON[s.toLowerCase()] ?? "•";
}

export function WeekCheck({ events }: { events: WeekEvent[] }) {
  // alle Mitnehm-Dinge der Woche einsammeln (ohne Duplikate)
  const allBring = Array.from(new Set(events.flatMap((e) => e.bring)));

  return (
    <div className="clay">
      <p className="label">🗓 Dein Wochenstart</p>

      {events.length === 0 ? (
        <p className="text-muted font-semibold text-sm py-2">
          Diese Woche sind noch keine Termine eingetragen. Genießt die freie Zeit!
        </p>
      ) : (
        <>
          <div className="space-y-0">
            {events.map((e, i) => (
              <div key={i} className="flex items-center gap-3.5 py-3 border-b border-line last:border-0">
                <div
                  className="w-[42px] h-[42px] rounded-[15px] grid place-items-center flex-none text-white font-extrabold text-[12px] leading-none text-center"
                  style={{ background: e.color }}
                >
                  {e.day}
                  <br />
                  <small className="text-[9px] opacity-85 font-bold">{e.date}</small>
                </div>
                <div className="min-w-0">
                  <div className="font-extrabold text-[15px]">
                    {e.icon} {e.title}
                  </div>
                  {e.bring.length > 0 && (
                    <div className="text-muted text-[13px] font-semibold mt-0.5">
                      Mitnehmen: {e.bring.join(", ")}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {allBring.length > 0 && (
            <div className="mt-4 rounded-[18px] p-3.5 bg-bg shadow-clay-in">
              <p className="text-[11px] uppercase tracking-wide font-extrabold text-muted mb-2.5">
                Diese Woche bereitlegen
              </p>
              <div className="flex flex-wrap gap-2">
                {allBring.map((b, i) => (
                  <span key={i} className="bg-card px-3 py-1.5 rounded-pill text-[13px] font-bold shadow-clay-sm flex items-center gap-1.5">
                    <span>{itemIcon(b)}</span> {b}
                  </span>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
