import { createAdminClient } from "@/lib/supabase/admin";
import { sendExpiryWarningEmail } from "@/lib/email";

// Vercel Cron llama a este endpoint cada día a las 3am UTC.
// Requiere la variable CRON_SECRET en Vercel y en .env.local para pruebas.
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();

  // Vencimientos
  const { error } = await supabase.rpc("expire_subscriptions");
  if (error) {
    console.error("[cron/expire]", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }

  // Avisos: suscripciones que vencen en exactamente 7 días
  const warn = new Date();
  warn.setDate(warn.getDate() + 7);
  const warnDate = warn.toISOString().slice(0, 10);

  const { data: expiring } = await supabase
    .from("provider_subscriptions")
    .select(`
      expires_at,
      plans ( name ),
      providers ( business_name, email )
    `)
    .gte("expires_at", `${warnDate}T00:00:00Z`)
    .lt("expires_at", `${warnDate}T23:59:59Z`)
    .eq("status", "active");

  let warned = 0;
  for (const sub of expiring ?? []) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const provider = (sub as any).providers;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const plan = (sub as any).plans;
    if (!provider?.email) continue;
    await sendExpiryWarningEmail({
      to: provider.email,
      providerName: provider.business_name ?? "Prestador",
      planName: plan?.name ?? "tu plan",
      expiresAt: new Date(sub.expires_at),
    }).catch(console.error);
    warned++;
  }

  return Response.json({ ok: true, ran_at: new Date().toISOString(), warned });
}
