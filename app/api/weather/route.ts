import { NextResponse } from "next/server";

// =====================================================================
//  Wetter-Route · /api/weather
//  Holt live Wetter + UV-Index von Open-Meteo (kostenlos, kein API-Key).
//  Cache: 30 Min, damit wir die API nicht bei jedem Laden anfragen.
// =====================================================================

export const revalidate = 1800; // 30 Minuten

export async function GET() {
  const lat = process.env.NEXT_PUBLIC_WEATHER_LAT ?? "51.3127";
  const lon = process.env.NEXT_PUBLIC_WEATHER_LON ?? "9.4797";
  const city = process.env.NEXT_PUBLIC_WEATHER_CITY ?? "Kassel";

  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
    `&current=temperature_2m,weather_code,wind_speed_10m` +
    `&daily=temperature_2m_max,temperature_2m_min,uv_index_max,sunset` +
    `&hourly=uv_index&timezone=auto&forecast_days=1`;

  try {
    const res = await fetch(url, { next: { revalidate: 1800 } });
    if (!res.ok) throw new Error("Open-Meteo nicht erreichbar");
    const d = await res.json();

    // aktueller UV-Wert = nächstgelegene Stunde
    const nowHour = new Date().getHours();
    const uvNow = Math.round((d.hourly?.uv_index?.[nowHour] ?? d.daily?.uv_index_max?.[0] ?? 0) as number);

    return NextResponse.json({
      city,
      temp: Math.round(d.current?.temperature_2m ?? 0),
      tempMax: Math.round(d.daily?.temperature_2m_max?.[0] ?? 0),
      tempMin: Math.round(d.daily?.temperature_2m_min?.[0] ?? 0),
      wind: Math.round(d.current?.wind_speed_10m ?? 0),
      weatherCode: d.current?.weather_code ?? 0,
      uvNow,
      uvMax: Math.round(d.daily?.uv_index_max?.[0] ?? 0),
      sunset: d.daily?.sunset?.[0] ?? null,
    });
  } catch (e) {
    // Fallback, damit die App nie ohne Wetterkarte dasteht
    return NextResponse.json(
      { city, temp: null, error: "Wetter konnte nicht geladen werden" },
      { status: 200 }
    );
  }
}
