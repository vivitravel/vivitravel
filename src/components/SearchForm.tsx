import { Search } from "lucide-react";
import { getCategories, getDestinations } from "@/lib/data";

const field =
  "w-full rounded-xl border border-border-soft bg-white px-3 py-2.5 text-sm text-navy focus:outline-none focus:ring-2 focus:ring-sky";

// Formulario GET: funciona sin JavaScript y deja los filtros en la URL.
export async function SearchForm({
  values = {},
  compact = false,
}: {
  values?: { q?: string; destino?: string; categoria?: string };
  compact?: boolean;
}) {
  const [destinations, categories] = await Promise.all([getDestinations(), getCategories()]);

  return (
    <form action="/buscar" className={`grid gap-3 ${compact ? "md:grid-cols-4" : "md:grid-cols-[1.2fr_1fr_1fr_auto]"}`}>
      <label className="block">
        <span className="sr-only">¿A dónde querés viajar?</span>
        <input name="q" defaultValue={values.q} placeholder="¿A dónde querés viajar?" className={field} />
      </label>
      <label className="block">
        <span className="sr-only">Destino</span>
        <select name="destino" defaultValue={values.destino ?? ""} className={field}>
          <option value="">Todos los destinos</option>
          {destinations.map((d) => (
            <option key={d.id} value={d.slug}>{d.name}</option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className="sr-only">Categoría</span>
        <select name="categoria" defaultValue={values.categoria ?? ""} className={field}>
          <option value="">Todas las categorías</option>
          {categories.map((c) => (
            <option key={c.id} value={c.slug}>{c.name}</option>
          ))}
        </select>
      </label>
      <button type="submit" className="btn btn-secondary">
        <Search size={18} aria-hidden /> Buscar
      </button>
    </form>
  );
}
