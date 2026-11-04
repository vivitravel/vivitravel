import type { Metadata } from "next";
import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatPrice } from "@/lib/format";
import { PublicacionActions } from "./PublicacionActions";

export const metadata: Metadata = { title: "Publicaciones — Admin" };

const STATUS_LABEL: Record<string, { label: string; cls: string }> = {
  draft:     { label: "Borrador",    cls: "bg-gray-100 text-gray-700" },
  in_review: { label: "En revisión", cls: "bg-orange/15 text-orange" },
  published: { label: "Publicada",   cls: "bg-turquoise/15 text-turquoise" },
  paused:    { label: "Pausada",     cls: "bg-yellow-100 text-yellow-700" },
  rejected:  { label: "Rechazada",   cls: "bg-red-100 text-red-700" },
};

async function getListings(status?: string) {
  const supabase = createAdminClient();
  let q = supabase
    .from("listings")
    .select(`id, title, slug, status, featured, is_editorial, price_from, created_at,
             categories(name), destinations(name),
             providers(business_name)`)
    .order("created_at", { ascending: false })
    .limit(100);
  if (status) q = q.eq("status", status);
  const { data } = await q;
  return data ?? [];
}

type Props = { searchParams: Promise<{ status?: string }> };

export default async function PublicacionesPage({ searchParams }: Props) {
  const { status } = await searchParams;
  const listings = await getListings(status);

  const tabs = [
    { label: "Todas", value: undefined },
    { label: "En revisión", value: "in_review" },
    { label: "Publicadas", value: "published" },
    { label: "Pausadas", value: "paused" },
    { label: "Borradores", value: "draft" },
    { label: "Rechazadas", value: "rejected" },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-navy">Publicaciones</h2>
        <Link href="/admin/publicaciones/nueva" className="btn btn-primary text-sm">
          + Nueva editorial
        </Link>
      </div>

      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => (
          <Link
            key={t.label}
            href={t.value ? `/admin/publicaciones?status=${t.value}` : "/admin/publicaciones"}
            className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
              status === t.value
                ? "bg-navy text-white"
                : "border border-border-soft text-navy hover:bg-surface"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {listings.length === 0 ? (
        <p className="rounded-card border border-dashed border-border-soft p-10 text-center text-muted">
          No hay publicaciones con este filtro.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-card border border-border-soft">
          <table className="w-full text-sm">
            <thead className="bg-surface text-xs font-semibold uppercase tracking-wide text-muted">
              <tr>
                <th className="px-4 py-3 text-left">Título</th>
                <th className="px-4 py-3 text-left">Destino / Categoría</th>
                <th className="px-4 py-3 text-left">Prestador</th>
                <th className="px-4 py-3 text-left">Estado</th>
                <th className="px-4 py-3 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-soft">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {listings.map((l: any) => {
                const st = STATUS_LABEL[l.status] ?? { label: l.status, cls: "bg-gray-100 text-gray-700" };
                return (
                  <tr key={l.id} className="hover:bg-surface/50">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-navy">{l.title}</p>
                      {l.is_editorial && (
                        <span className="text-xs text-turquoise">Editorial gratuita</span>
                      )}
                      {l.featured && (
                        <span className="ml-2 rounded-full bg-orange/15 px-2 py-0.5 text-xs font-semibold text-orange">★ Destacada</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted">
                      <p>{l.destinations?.name ?? "—"}</p>
                      <p className="text-xs">{l.categories?.name ?? "—"}</p>
                    </td>
                    <td className="px-4 py-3 text-muted">
                      {l.providers?.business_name ?? <span className="italic">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${st.cls}`}>
                        {st.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <PublicacionActions
                        listingId={l.id}
                        currentStatus={l.status}
                        featured={l.featured}
                        slug={l.slug}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
