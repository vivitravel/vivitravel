import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { PlusCircle, ExternalLink } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { getMyProvider, getMyListings } from "@/lib/provider-data";
import { formatPrice } from "@/lib/format";
import { DeleteListingButton } from "./DeleteListingButton";

export const metadata: Metadata = { title: "Mis publicaciones | Portal del prestador" };

const statusLabel: Record<string, { text: string; cls: string }> = {
  draft:     { text: "Borrador",    cls: "bg-gray-100 text-gray-600" },
  in_review: { text: "En revisión", cls: "bg-yellow-100 text-yellow-700" },
  published: { text: "Publicada",   cls: "bg-green-100 text-green-700" },
  paused:    { text: "Pausada",     cls: "bg-orange-100 text-orange-700" },
  rejected:  { text: "Rechazada",   cls: "bg-red-100 text-red-700" },
  expired:   { text: "Vencida",     cls: "bg-red-100 text-red-700" },
};

export default async function PrestadorPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const provider = await getMyProvider();
  if (!provider) redirect("/prestador/onboarding");

  const listings = await getMyListings(provider.id);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-bold text-navy">Mis publicaciones</h2>
        <Link href="/prestador/publicaciones/nueva" className="btn-secondary flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold">
          <PlusCircle size={16} />
          Nueva publicación
        </Link>
      </div>

      {!provider.approved && (
        <div className="mb-5 rounded-xl border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
          <strong>Tu primera publicación está en revisión.</strong> El equipo de Vivitravels la revisará y te notificará por mail.
        </div>
      )}

      {listings.length === 0 ? (
        <div className="rounded-card border border-dashed border-border-soft p-12 text-center">
          <p className="mb-4 text-muted">Todavía no tenés publicaciones.</p>
          <Link href="/prestador/publicaciones/nueva" className="btn-secondary inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold">
            <PlusCircle size={16} />
            Crear mi primera publicación
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {listings.map((l) => {
            const st = statusLabel[l.status] ?? statusLabel.draft;
            return (
              <li key={l.id} className="flex items-center justify-between gap-4 rounded-card border border-border-soft bg-white p-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${st.cls}`}>{st.text}</span>
                    {l.category && <span className="text-xs text-muted">{l.category.name}</span>}
                  </div>
                  <p className="mt-1 truncate font-semibold text-navy">{l.title}</p>
                  <p className="text-sm text-muted">{formatPrice(l.price_from)}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {l.status === "published" && (
                    <Link href={`/publicacion/${l.slug}`} target="_blank" className="rounded-lg p-2 text-turquoise hover:bg-surface" aria-label="Ver publicación">
                      <ExternalLink size={16} />
                    </Link>
                  )}
                  <Link href={`/prestador/publicaciones/${l.id}/editar`} className="rounded-xl border border-border-soft px-3 py-1.5 text-sm font-semibold text-navy hover:bg-surface">
                    Editar
                  </Link>
                  <DeleteListingButton listingId={l.id} />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
