import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import { upsertDestination, deleteDestination } from "@/app/actions/admin";

export const metadata: Metadata = { title: "Destinos — Admin" };

const inp = "rounded-xl border border-border-soft bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-turquoise";

async function getDestinations() {
  const supabase = createAdminClient();
  const { data } = await supabase.from("destinations").select("id, name, province, featured, sort_order").order("sort_order");
  return data ?? [];
}

export default async function DestinosPage() {
  const destinations = await getDestinations();

  return (
    <div className="space-y-8">
      <h2 className="text-xl font-bold text-navy">Destinos</h2>

      <div className="rounded-card border border-border-soft p-5">
        <h3 className="mb-4 font-semibold text-navy">Nuevo destino</h3>
        <form action={upsertDestination} className="grid gap-3 sm:grid-cols-[1fr_1fr_auto_auto_auto]">
          <input name="name" required placeholder="Nombre *" className={inp} />
          <input name="province" required placeholder="Provincia *" className={inp} />
          <input name="sort_order" type="number" defaultValue={0} placeholder="Orden" className={`${inp} w-20`} />
          <label className="flex items-center gap-2 text-sm">
            <input name="featured" type="checkbox" value="true" className="accent-turquoise" />
            Destacado
          </label>
          <button type="submit" className="btn btn-primary text-sm">Agregar</button>
        </form>
      </div>

      <div className="overflow-x-auto rounded-card border border-border-soft">
        <table className="w-full text-sm">
          <thead className="bg-surface text-xs font-semibold uppercase tracking-wide text-muted">
            <tr>
              <th className="px-4 py-3 text-left">Destino</th>
              <th className="px-4 py-3 text-left">Provincia</th>
              <th className="px-4 py-3 text-left">Orden</th>
              <th className="px-4 py-3 text-left">Destacado</th>
              <th className="px-4 py-3 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-soft">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {destinations.map((d: any) => (
              <tr key={d.id} className="hover:bg-surface/50">
                <td className="px-4 py-3 font-semibold text-navy">{d.name}</td>
                <td className="px-4 py-3 text-muted">{d.province}</td>
                <td className="px-4 py-3 text-muted">{d.sort_order}</td>
                <td className="px-4 py-3">
                  {d.featured ? (
                    <span className="rounded-full bg-orange/15 px-2 py-0.5 text-xs font-semibold text-orange">Sí</span>
                  ) : "—"}
                </td>
                <td className="px-4 py-3">
                  <form action={deleteDestination.bind(null, d.id)} className="inline">
                    <button
                      type="submit"
                      onClick={(e) => { if (!confirm(`¿Eliminar ${d.name}?`)) e.preventDefault(); }}
                      className="text-xs text-red-500 hover:underline"
                    >
                      Eliminar
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
