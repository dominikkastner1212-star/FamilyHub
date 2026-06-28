import type { ChildProfile } from "@/components/KidsTab";
import type { WeekEvent } from "@/components/WeekCheck";

// =====================================================================
//  Demo-Daten – zeigen die App befüllt, solange noch keine echten
//  Familiendaten in Supabase liegen. Werden später durch DB-Queries ersetzt.
// =====================================================================

export const DEMO_CHILDREN: ChildProfile[] = [
  {
    id: "lina",
    name: "Lina",
    age: 6,
    char: "lina",
    skinType: 2,
    skinLabel: "Hauttyp II · sehr empfindlich",
    skinColor: "#E05B49",
    bloodType: "A+",
    allergies: [
      { allergen: "Erdnüsse", severity: "schwer", reaction: "Atemnot, Hautausschlag", emergencyMed: "Adrenalin-Pen in der Wickeltasche" },
      { allergen: "Birkenpollen", severity: "mild", reaction: "tränende Augen" },
    ],
    medications: [{ name: "Cetirizin-Tropfen", dosage: "5 Tropfen", schedule: "bei Bedarf" }],
    contacts: [
      { label: "Kinderarzt Dr. Sommer", phone: "0561123456", kind: "arzt" },
      { label: "Notfall Mama", phone: "0170111222", kind: "notfall" },
    ],
  },
  {
    id: "emil",
    name: "Emil",
    age: 4,
    char: "emil",
    skinType: 3,
    skinLabel: "Hauttyp III · empfindlich",
    skinColor: "#B8791C",
    bloodType: "0+",
    allergies: [],
    medications: [{ name: "Ibuprofen-Saft", dosage: "5 ml", schedule: "bei Fieber" }],
    contacts: [{ label: "Kinderarzt Dr. Sommer", phone: "0561123456", kind: "arzt" }],
  },
];

export const DEMO_WEEK: WeekEvent[] = [
  { title: "Schwimmkurs Lina", day: "Mo", date: "23.", icon: "🏊", bring: ["Badesachen", "Trinkflasche"], color: "linear-gradient(140deg,#5FC9A0,#3DAE84)" },
  { title: "Sportunterricht Emil", day: "Di", date: "24.", icon: "👟", bring: ["Sportzeug"], color: "linear-gradient(140deg,#4FB6E8,#2E97CB)" },
  { title: "Ausflug Kita", day: "Mi", date: "25.", icon: "🚌", bring: ["Sonnencreme", "Brotdose", "5€"], color: "linear-gradient(140deg,#F4A84A,#E08628)" },
  { title: "Geburtstag Oma", day: "Fr", date: "27.", icon: "🎂", bring: ["Geschenk"], color: "linear-gradient(140deg,#F47B6B,#E05B49)" },
];

export const DEMO_TODAY = [
  { icon: "🏊", bg: "#D6EFE0", title: "Schwimmkurs Lina", meta: "Papa fährt", time: "15:00", color: "#3DAE84" },
  { icon: "🦷", bg: "#FCE0DB", title: "Zahnarzt Emil", meta: "Dr. Berg", time: "16:30", color: "#E05B49" },
  { icon: "🏫", bg: "#E6E0F8", title: "Elternabend", meta: "Grundschule", time: "19:00", color: "#6F5BC9" },
];

export const DEMO_SHOPPING = [
  { id: "1", label: "Sonnencreme LSF 50", category: "Drogerie", done: false },
  { id: "2", label: "Milch & Joghurt", category: "Papa", done: false },
  { id: "3", label: "Geschenk Oma", category: "Mama", done: false },
  { id: "4", label: "Apfelsaft", category: "Lina", done: false },
  { id: "5", label: "Brot", category: "erledigt", done: true },
];
