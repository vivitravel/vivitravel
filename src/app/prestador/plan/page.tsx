export const instant = false;

import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/auth";
import { getMyProvider } from "@/lib/provider-data";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Mi plan | Portal del prestador" };

export default async function PlanPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const provider = await getMyProvider();
  if (!provider) redirect("/prestador/onboarding");

  const supabase = await createClient();
  const { data: sub } = await supabase
    .from("subscriptions")
    .select("status, starts_at, expires_at, plans(name, reference_price_ars, max_listings, max_photos_per_listing, max_videos_per_listing, includes_featured, includes_advisory)")
    .eq("provider_id", provider.id)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const plan = (sub as any)?.plans ?? null;
  const expires = sub?.expires_at ? new Date(sub.expires_at).toLocaleDateString("es-AR") : null;

  return (
    <div className="max-w-lg">
      <h2 className="mb-5 text-xl font-bold text-navy">Mi plan</h2>

      {plan ? (
        <div className="rounded-card border border-border-soft bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-2xl font-bold text-navy">{plan.name}</span>
            <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-700">Activo</span>
          </div>

          <dl className="space-y-2 text-sm">
            <div className="flex justify-between border-b border-border-soft py-2">
              <dt className="text-muted">Publicaciones activas</dt>
              <dd className="font-semibold text-navy">hasta {plan.max_listings}</dd>
            </div>
            <div className="flex justify-between border-b border-border-soft py-2">
              <dt className="text-muted">Fotos por publicación</dt>
              <dd className="font-semibold text-navy">hasta {plan.max_photos_per_listing}</dd>
            </div>
            <div className="flex justify-between border-b border-border-soft py-2">
              <dt className="text-muted">Videos por publicación</dt>
              <dd className="font-semibold text-navy">{plan.max_videos_per_listing > 0 ? `hasta ${plan.max_videos_per_listing}` : "No incluido"}</dd>
            </div>
            {plan.includes_featured && (
              <div className="flex justify-between border-b border-border-soft py-2">
                <dt className="text-muted">Destacado en home</dt>
                <dd className="font-semibold text-navy">✓</dd>
              </div>
            )}
            {plan.includes_advisory && (
              <div className="flex justify-between border-b border-border-soft py-2">
                <dt className="text-muted">Asesoramiento</dt>
                <dd className="font-semibold text-navy">✓</dd>
              </div>
            )}
            {expires && (
              <div className="flex justify-between py-2">
                <dt className="text-muted">Vencimiento</dt>
                <dd className="font-semibold text-navy">{expires}</dd>
              </div>
            )}
          </dl>
        </div>
      ) : (
        <div className="rounded-card border border-dashed border-border-soft p-10 text-center">
          <p className="mb-4 text-muted">No tenés un plan activo.</p>
          <p className="text-sm text-muted">Contactate con el equipo de Vivitravels para activar tu plan.</p>
        </div>
      )}
    </div>
  );
}
