// =====================================================================
//  UV- & Sonnenschutz-Logik
//  Bildet UV-Index + Hauttyp (Fitzpatrick 1-6) auf konkrete Empfehlungen ab.
// =====================================================================

export type UvLevel = {
  label: string;       // "Hoch"
  color: string;       // Akzentfarbe
  advice: string;      // allgemeiner Hinweis
};

export function uvLevel(uv: number): UvLevel {
  if (uv < 3) return { label: "Niedrig", color: "#5FC9A0", advice: "Kein besonderer Schutz nötig." };
  if (uv < 6) return { label: "Mäßig", color: "#F4A84A", advice: "LSF 30, Mittagssonne meiden." };
  if (uv < 8) return { label: "Hoch", color: "#F47B6B", advice: "LSF 50, Schatten 11–15 Uhr, nachcremen." };
  if (uv < 11) return { label: "Sehr hoch", color: "#E05B49", advice: "LSF 50+, Sonne 11–16 Uhr meiden." };
  return { label: "Extrem", color: "#8E7CDB", advice: "Draußen möglichst vermeiden, voller Schutz." };
}

// Empfohlener LSF je nach Hauttyp und UV-Stärke
export function recommendedSpf(skinType: number | null, uv: number): number {
  const base = uv < 3 ? 0 : uv < 6 ? 30 : uv < 8 ? 50 : 50;
  if (base === 0) return 0;
  // sehr helle Haut (Typ 1-2) braucht eine Stufe mehr
  if (skinType !== null && skinType <= 2 && base >= 50) return 50; // 50+ wird im Text ergänzt
  return base;
}

// Fertiger Satz pro Kind
export function spfSentence(name: string, skinType: number | null, uv: number): string {
  const spf = recommendedSpf(skinType, uv);
  if (spf === 0) return `${name}: heute kein Sonnenschutz nötig.`;
  const plus = skinType !== null && skinType <= 2 && uv >= 6 ? "+" : "";
  return `${name}: LSF ${spf}${plus}, 20 Min vor dem Rausgehen auftragen, alle 2 Std nachcremen.`;
}
