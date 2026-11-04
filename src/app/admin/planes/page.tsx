import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";

export const metadata: Metadata = { title: "Planes — Admin" };

async function getPlans() {
  const supabase = createAdminClient();
  const { data } = await supabase.from("plans").select("*").order("sort_order");
  return data ?? [];
}

export default async function PlanesAdminPage() {
  const plans = await getPlans();

  return (
    <div className="space-y-5">
      <h2 className="text-xl font-bold text-navy">Planes</h2>

      <div className="overflow-x-auto rounded-card border border-border-soft">
        <table className="w-full text-sm">
          <thead className="bg-surface text-xs font-semibold uppercase tracking-wide text-muted">
            <tr>
              <th className="px-4 py-3 text-left">Nombre</th>
              <th className="px-4 py-3 text-left">Precio ARS</th>
              <th className="px-4 py-3 text-left">Período</th>
              <th className="px-4 py-3 text-left">Max. public.</th>
              <th className="px-4 py-3 text-left">Incluye</th>
              <th className="px-4 py-3 text-left">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-soft">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {plans.map((p: any) => (
              <tr key={p.id} className="hover:bg-surface/50">
                <td className="px-4 py-3 font-semibold text-navy">{p.name}</td>
                <td className="px-4 py-3 text-muted">
                  {p.is_free ? "Gratis" : p.reference_price_ars ? `$${Number(p.reference_price_ars).toLocaleString("es-AR")}` : "—"}
                </td>
                <td className="px-4 py-3 text-muted">{p.billing_period ?? "—"}</td>
                <td className="px-4 py-3 text-muted">{p.max_listings ?? "Ilimitadas"}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {p.includes_featured && <span className="rounded-full bg-orange/15 px-2 py-0.5 text-xs font-semibold text-orange">Destacadas</span>}
                    {p.includes_advisory && <span className="rounded-full bg-turquoise/15 px-2 py-0.5 text-xs font-semibold text-turquoise">Asesoría</span>}
                    {p.includes_social && <span className="rounded-full bg-surface px-2 py-0.5 text-xs text-muted">Social</span>}
                  </div>
                </td>
                <td className="px-4 py-3">
                  {p.active ? (
                    <span className="rounded-full bg-turquoise/15 px-2 py-0.5 text-xs font-semibold text-turquoise">Activo</span>
                  ) : (
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">Inactivo</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-muted">Para modificar los planes, contactá a Bruno (requiere migración de base de datos).</p>
    </div>
  );
}
