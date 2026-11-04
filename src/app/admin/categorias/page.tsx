import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import { upsertCategory, deleteCategory } from "@/app/actions/admin";

export const metadata: Metadata = { title: "Categorías — Admin" };

const inp = "rounded-xl border border-border-soft bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-turquoise";

async function getCategories() {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("categories")
    .select("id, name, slug, icon, sort_order, attributes(id, key, label, type, required, filterable)")
    .order("sort_order");
  return data ?? [];
}

export default async function CategoriasPage() {
  const categories = await getCategories();

  return (
    <div className="space-y-8">
      <h2 className="text-xl font-bold text-navy">Categorías</h2>

      <div className="rounded-card border border-border-soft p-5">
        <h3 className="mb-4 font-semibold text-navy">Nueva categoría</h3>
        <form action={upsertCategory} className="grid gap-3 sm:grid-cols-[1fr_1fr_auto_auto]">
          <input name="name" required placeholder="Nombre *" className={inp} />
          <input name="icon" placeholder="Ícono (texto)" className={inp} />
          <input name="sort_order" type="number" defaultValue={0} placeholder="Orden" className={`${inp} w-20`} />
          <button type="submit" className="btn btn-primary text-sm">Agregar</button>
        </form>
      </div>

      <div className="overflow-x-auto rounded-card border border-border-soft">
        <table className="w-full text-sm">
          <thead className="bg-surface text-xs font-semibold uppercase tracking-wide text-muted">
            <tr>
              <th className="px-4 py-3 text-left">Categoría</th>
              <th className="px-4 py-3 text-left">Slug</th>
              <th className="px-4 py-3 text-left">Atributos</th>
              <th className="px-4 py-3 text-left">Orden</th>
              <th className="px-4 py-3 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-soft">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {categories.map((c: any) => (
              <tr key={c.id} className="hover:bg-surface/50">
                <td className="px-4 py-3 font-semibold text-navy">
                  {c.icon && <span className="mr-2">{c.icon}</span>}{c.name}
                </td>
                <td className="px-4 py-3 font-mono text-xs text-muted">{c.slug}</td>
                <td className="px-4 py-3 text-muted">
                  {(c.attributes ?? []).length > 0 ? (
                    <span className="rounded-full bg-surface px-2 py-0.5 text-xs">
                      {c.attributes.length} atributo{c.attributes.length !== 1 ? "s" : ""}
                    </span>
                  ) : "—"}
                </td>
                <td className="px-4 py-3 text-muted">{c.sort_order}</td>
                <td className="px-4 py-3">
                  <form action={deleteCategory.bind(null, c.id)} className="inline">
                    <button
                      type="submit"
                      onClick={(e) => { if (!confirm(`¿Eliminar ${c.name}?`)) e.preventDefault(); }}
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
