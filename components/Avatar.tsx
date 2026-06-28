"use client";

// =====================================================================
//  Familien-Charaktere (Clay-Avatare)
//  Später frei konfigurierbar – aktuell vier vorgefertigte Figuren.
// =====================================================================

type CharKey = "mama" | "papa" | "lina" | "emil";

const PATHS: Record<CharKey, JSX.Element> = {
  mama: (
    <>
      <circle cx="32" cy="32" r="32" fill="#F8B8A0" />
      <path d="M10 22a22 22 0 0144 0c0 4-3 6-3 6H13s-3-2-3-6z" fill="#7A4A36" />
      <circle cx="24" cy="32" r="3.5" fill="#3a2820" />
      <circle cx="40" cy="32" r="3.5" fill="#3a2820" />
      <path d="M26 42q6 5 12 0" stroke="#C25B45" strokeWidth="3" fill="none" strokeLinecap="round" />
      <circle cx="20" cy="38" r="3" fill="#F49B9B" opacity=".6" />
      <circle cx="44" cy="38" r="3" fill="#F49B9B" opacity=".6" />
    </>
  ),
  papa: (
    <>
      <circle cx="32" cy="32" r="32" fill="#EFC09A" />
      <path d="M14 20a18 18 0 0136 2v3H14z" fill="#3F2C1E" />
      <circle cx="24" cy="32" r="3.5" fill="#3a2820" />
      <circle cx="40" cy="32" r="3.5" fill="#3a2820" />
      <path d="M25 30l-6-2M39 30l6-2" stroke="#3F2C1E" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M26 43q6 4 12 0" stroke="#9C5A3E" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M24 46h16v3a8 8 0 01-16 0z" fill="#5A3D29" />
    </>
  ),
  lina: (
    <>
      <circle cx="32" cy="32" r="32" fill="#FBC9B0" />
      <path d="M9 30a23 23 0 0146 0c0 10-6 4-6 4l-4-6-3 5-4-6-3 5-4-6-4 6s-2 5-6-4z" fill="#E89A3C" />
      <circle cx="14" cy="40" r="6" fill="#E89A3C" />
      <circle cx="50" cy="40" r="6" fill="#E89A3C" />
      <circle cx="24" cy="32" r="3.5" fill="#3a2820" />
      <circle cx="40" cy="32" r="3.5" fill="#3a2820" />
      <path d="M27 41q5 4 10 0" stroke="#D9685A" strokeWidth="3" fill="none" strokeLinecap="round" />
      <circle cx="19" cy="38" r="3.2" fill="#F58E8E" opacity=".6" />
      <circle cx="45" cy="38" r="3.2" fill="#F58E8E" opacity=".6" />
    </>
  ),
  emil: (
    <>
      <circle cx="32" cy="32" r="32" fill="#F4C6A0" />
      <path d="M16 22a16 16 0 0132 0v2l-4-3-4 3-4-3-4 3-4-3-4 3-4-3z" fill="#5A3D29" />
      <circle cx="24" cy="32" r="3.5" fill="#3a2820" />
      <circle cx="40" cy="32" r="3.5" fill="#3a2820" />
      <path d="M27 41q5 4 10 0" stroke="#C25B45" strokeWidth="3" fill="none" strokeLinecap="round" />
      <circle cx="19" cy="38" r="3" fill="#F58E8E" opacity=".55" />
      <circle cx="45" cy="38" r="3" fill="#F58E8E" opacity=".55" />
    </>
  ),
};

export function Avatar({
  char = "papa",
  size = 46,
  ring = true,
}: {
  char?: CharKey;
  size?: number;
  ring?: boolean;
}) {
  return (
    <span
      className="rounded-full grid place-items-center flex-none"
      style={{
        width: size,
        height: size,
        boxShadow:
          "4px 4px 10px rgba(170,130,80,.3), -3px -3px 7px rgba(255,255,255,.7), inset 2px 2px 4px rgba(255,255,255,.5), inset -2px -2px 5px rgba(0,0,0,.06)",
        border: ring ? "3px solid #FBF5EC" : "none",
      }}
    >
      <svg viewBox="0 0 64 64" width="70%" height="70%">
        {PATHS[char]}
      </svg>
    </span>
  );
}

// Sonnen-Figur für die Wetterkarte
export function SunFace({ size = 74 }: { size?: number }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size}>
      <g stroke="#FFE08A" strokeWidth="5" strokeLinecap="round">
        <path d="M32 6v7M32 51v7M6 32h7M51 32h7M14 14l5 5M45 45l5 5M50 14l-5 5M19 45l-5 5" />
      </g>
      <circle cx="32" cy="32" r="15" fill="#FFEBA8" />
      <circle cx="27" cy="30" r="2.4" fill="#E0A93C" />
      <circle cx="37" cy="30" r="2.4" fill="#E0A93C" />
      <path d="M28 36q4 3 8 0" stroke="#E0A93C" strokeWidth="2.4" fill="none" strokeLinecap="round" />
    </svg>
  );
}

export type { CharKey };
