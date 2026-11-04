import { createAdminClient } from "@/lib/supabase/admin";

// Vercel Cron llama a este endpoint cada día a las 3am UTC.
// Requiere la variable CRON_SECRET en Vercel y en .env.local para pruebas.
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const { error } = await supabase.rpc("expire_subscriptions");

  if (error) {
    console.error("[cron/expire]", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ ok: true, ran_at: new Date().toISOString() });
}
