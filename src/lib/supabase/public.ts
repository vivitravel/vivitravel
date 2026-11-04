import { createClient } from "@supabase/supabase-js";

// Cliente anónimo sin cookies: para leer el catálogo público (se puede usar dentro de "use cache").
export function createPublicClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
