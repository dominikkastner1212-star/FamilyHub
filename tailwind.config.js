/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // rosa-warme Basis (passend zur Landingpage)
        bg: "#F7EEF4",
        bg2: "#FBF4F9",
        card: "#FFFCFE",
        ink: "#2D2230",
        muted: "#9A879C",
        line: "#EFE2EC",
        // Rosa/Violett-Akzente
        rose: { DEFAULT: "#E86FA6", deep: "#D14D8C" },
        violet: { DEFAULT: "#9B6FD4", deep: "#7C4FC0" },
        lilac: { DEFAULT: "#C99BE8", deep: "#A86FD4" },
        plum: { DEFAULT: "#7A4FA0", deep: "#5F3B82" },
        // funktionale Nebenakzente (bleiben fuer Termin-Typen/Status erhalten)
        coral: { DEFAULT: "#F47B6B", deep: "#E05B49" },
        sky: { DEFAULT: "#4FB6E8", deep: "#2E97CB" },
        mint: { DEFAULT: "#5FC9A0", deep: "#3DAE84" },
        sun: "#FFD15C",
        // amber als Alias auf rose, damit Alt-Referenzen weiterhin stimmig wirken
        amber: { DEFAULT: "#E86FA6", deep: "#D14D8C" },
      },
      borderRadius: { clay: "26px", pill: "20px" },
      boxShadow: {
        clay: "8px 8px 20px rgba(160,110,150,.24), -6px -6px 16px rgba(255,255,255,.9), inset 1px 1px 1px rgba(255,255,255,.6)",
        "clay-btn": "5px 5px 12px rgba(150,90,140,.3), -3px -3px 8px rgba(255,255,255,.55), inset 1px 1px 2px rgba(255,255,255,.45)",
        "clay-in": "inset 3px 3px 8px rgba(160,110,150,.16), inset -2px -2px 6px rgba(255,255,255,.8)",
        "clay-sm": "3px 3px 8px rgba(150,100,140,.22), inset 1px 1px 2px rgba(255,255,255,.5)",
      },
      fontFamily: {
        sans: ["Nunito", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
