import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { LayoutGrid, List } from "lucide-react";
import { ListingCard } from "@/components/ListingCard";
import { SearchForm } from "@/components/SearchForm";
import { getCategoryAttributes, searchListings } from "@/lib/data";
import type { AttributeDef, SearchFilters } from "@/lib/types";
import { getMyFavoriteIds } from "@/lib/user-data";

export const metadata: Metadata = { title: "Buscar propuestas" };

type Params = { [key: string]: string | string[] | undefined };

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) || undefined;
const num = (v: string | string[] | undefined) => {
  const s = one(v);
  if (!s) return undefined;
  const n = Number(s);
  return Number.isFinite(n) && n >= 0 ? n : undefined;
};

export default function BuscarPage({ searchParams }: PageProps<"/buscar">) {
  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-4 text-3xl font-bold">Buscar propuestas</h1>
      <Suspense fallback={<div className="h-40 animate-pulse rounded-card bg-surface" />}>
        <Results searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

async function Results({ searchParams }: { searchParams: Promise<Params> }) {
  const sp = await searchParams;
  const orden = one(sp.orden);
  const categoria = one(sp.categoria);

  // Collect attr_* params from the URL
  const attrs: Record<string, string | string[]> = {};
  for (const [k, v] of Object.entries(sp)) {
    if (k.startsWith("attr_") && v) {
      const key = k.slice(5);
      attrs[key] = Array.isArray(v) ? v.filter(Boolean) : v;
    }
  }

  const filters: SearchFilters = {
    q: one(sp.q),
    destino: one(sp.destino),
    categoria,
    tema: one(sp.tema),
    min: num(sp.min),
    max: num(sp.max),
    orden: orden === "precio_asc" || orden === "precio_desc" ? orden : "recomendados",
    attrs: Object.keys(attrs).length ? attrs : undefined,
  };
  const vista = one(sp.vista) === "galeria" ? "galeria" : "listado";

  const [listings, catAttrs, favoriteIds] = await Promise.all([
    searchListings(filters),
    categoria ? getCategoryAttributes(categoria) : Promise.resolve([] as AttributeDef[]),
    getMyFavoriteIds(),
  ]);

  const withView = (v: string) => {
    const p = new URLSearchParams();
    for (const [k, val] of Object.entries(sp)) {
      const s = one(val);
      if (s && k !== "vista") p.set(k, s);
    }
    p.set("vista", v);
    return `/buscar?${p.toString()}`;
  };

  const input =
    "w-full rounded-xl border border-border-soft bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan";

  return (
    <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
      <aside className="space-y-4">
        <form action="/buscar" className="space-y-4 rounded-card border border-border-soft p-4">
          {/* Mantiene los filtros que no se editan en este panel */}
          {filters.q && <input type="hidden" name="q" value={filters.q} />}
          {filters.destino && <input type="hidden" name="destino" value={filters.destino} />}
          {filters.categoria && <input type="hidden" name="categoria" value={filters.categoria} />}
          {filters.tema && <input type="hidden" name="tema" value={filters.tema} />}
          <input type="hidden" name="vista" value={vista} />

          <p className="font-bold">Filtros</p>

          {/* Atributos por categoría */}
          {catAttrs.map((attr) => {
            if (!attr.options || (attr.type !== "select" && attr.type !== "multiselect")) return null;
            return (
            <fieldset key={attr.key} className="space-y-2">
              <legend className="mb-1 text-sm font-semibold">{attr.label}</legend>
              {attr.type === "select" && attr.options ? (
                <select
                  name={`attr_${attr.key}`}
                  defaultValue={typeof attrs[attr.key] === "string" ? (attrs[attr.key] as string) : ""}
                  className={input}
                >
                  <option value="">Cualquiera</option>
                  {attr.options.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              ) : attr.type === "multiselect" && attr.options ? (
                <div className="space-y-1.5">
                  {attr.options.map((opt) => {
                    const selected = Array.isArray(attrs[attr.key])
                      ? (attrs[attr.key] as string[]).includes(opt)
                      : attrs[attr.key] === opt;
                    return (
                      <label key={opt} className="flex cursor-pointer items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          name={`attr_${attr.key}`}
                          value={opt}
                          defaultChecked={selected}
                          className="h-4 w-4 rounded border-border-soft accent-turquoise"
                        />
                        {opt}
                      </label>
                    );
                  })}
                </div>
              ) : null}
            </fieldset>
          )})}


          <fieldset className="space-y-2">
            <legend className="mb-1 text-sm font-semibold">Precio desde (ARS)</legend>
            <div className="grid grid-cols-2 gap-2">
              <label>
                <span className="sr-only">Mínimo</span>
                <input name="min" type="number" min={0} defaultValue={filters.min} placeholder="Mín." className={input} />
              </label>
              <label>
                <span className="sr-only">Máximo</span>
                <input name="max" type="number" min={0} defaultValue={filters.max} placeholder="Máx." className={input} />
              </label>
            </div>
          </fieldset>
          <label className="block space-y-1">
            <span className="text-sm font-semibold">Ordenar por</span>
            <select name="orden" defaultValue={filters.orden} className={input}>
              <option value="recomendados">Recomendados</option>
              <option value="precio_asc">Menor precio</option>
              <option value="precio_desc">Mayor precio</option>
            </select>
          </label>
          <div className="flex gap-2">
            <button type="submit" className="btn btn-secondary flex-1 !py-2 text-sm">Aplicar</button>
            <Link
              href={filters.categoria ? `/buscar?categoria=${filters.categoria}` : "/buscar"}
              className="btn btn-ghost !py-2 text-sm"
            >
              Limpiar
            </Link>
          </div>
        </form>
      </aside>

      <section>
        <div className="mb-5 rounded-card bg-surface p-3">
          <SearchForm
            compact
            values={{ q: filters.q, destino: filters.destino, categoria: filters.categoria }}
          />
        </div>

        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-muted" aria-live="polite">
            {listings.length} {listings.length === 1 ? "resultado" : "resultados"}
          </p>
          <div className="flex gap-1" role="group" aria-label="Vista de resultados">
            <Link
              href={withView("listado")}
              aria-current={vista === "listado"}
              className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm ${vista === "listado" ? "bg-turquoise text-white" : "border border-border-soft"}`}
            >
              <List size={16} aria-hidden /> Listado
            </Link>
            <Link
              href={withView("galeria")}
              aria-current={vista === "galeria"}
              className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm ${vista === "galeria" ? "bg-turquoise text-white" : "border border-border-soft"}`}
            >
              <LayoutGrid size={16} aria-hidden /> Galería
            </Link>
          </div>
        </div>

        {listings.length ? (
          <ul className={vista === "galeria" ? "grid gap-5 sm:grid-cols-2 xl:grid-cols-3" : "space-y-4"}>
            {listings.map((l) => (
              <li key={l.id}>
                <ListingCard listing={l} layout={vista === "galeria" ? "grid" : "row"} isFavorited={favoriteIds.has(l.id)} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="rounded-card border border-dashed border-border-soft p-10 text-center text-muted">
            No encontramos propuestas con esos filtros. Probá ampliar la búsqueda.
          </p>
        )}
      </section>
    </div>
  );
}
