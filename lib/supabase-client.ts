import { createBrowserClient } from "@supabase/ssr";

// Client-seitiger Supabase-Zugriff (im Browser, für React-Komponenten)
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
