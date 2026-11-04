"use client";

import { useTransition } from "react";
import Link from "next/link";
import { setListingStatus, setListingFeatured, deleteListingAdmin } from "@/app/actions/admin";

type Props = {
  listingId: string;
  currentStatus: string;
  featured: boolean;
  slug: string;
};

export function PublicacionActions({ listingId, currentStatus, featured, slug }: Props) {
  const [pending, startTransition] = useTransition();

  const action = (fn: () => Promise<void>) => {
    startTransition(() => { fn(); });
  };

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {currentStatus === "in_review" && (
        <button
          onClick={() => action(() => setListingStatus(listingId, "published"))}
          disabled={pending}
          className="rounded-lg bg-turquoise px-2.5 py-1 text-xs font-semibold text-white hover:opacity-90 disabled:opacity-50"
        >
          Publicar
        </button>
      )}
      {currentStatus === "in_review" && (
        <button
          onClick={() => action(() => setListingStatus(listingId, "rejected"))}
          disabled={pending}
          className="rounded-lg bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700 hover:bg-red-200 disabled:opacity-50"
        >
          Rechazar
        </button>
      )}
      {currentStatus === "published" && (
        <button
          onClick={() => action(() => setListingStatus(listingId, "paused"))}
          disabled={pending}
          className="rounded-lg border border-border-soft px-2.5 py-1 text-xs font-semibold text-navy hover:bg-surface disabled:opacity-50"
        >
          Pausar
        </button>
      )}
      {currentStatus === "paused" && (
        <button
          onClick={() => action(() => setListingStatus(listingId, "published"))}
          disabled={pending}
          className="rounded-lg bg-turquoise px-2.5 py-1 text-xs font-semibold text-white hover:opacity-90 disabled:opacity-50"
        >
          Reactivar
        </button>
      )}
      {currentStatus === "draft" && (
        <button
          onClick={() => action(() => setListingStatus(listingId, "published"))}
          disabled={pending}
          className="rounded-lg bg-turquoise px-2.5 py-1 text-xs font-semibold text-white hover:opacity-90 disabled:opacity-50"
        >
          Publicar
        </button>
      )}
      <button
        onClick={() => action(() => setListingFeatured(listingId, !featured))}
        disabled={pending}
        title={featured ? "Quitar destacado" : "Marcar como destacada"}
        className={`rounded-lg px-2.5 py-1 text-xs font-semibold disabled:opacity-50 ${
          featured
            ? "bg-orange/15 text-orange hover:bg-orange/25"
            : "border border-border-soft text-muted hover:bg-surface"
        }`}
      >
        {featured ? "★ Quitar" : "☆ Destacar"}
      </button>
      <Link
        href={`/publicacion/${slug}`}
        target="_blank"
        className="rounded-lg border border-border-soft px-2.5 py-1 text-xs text-muted hover:bg-surface"
      >
        Ver
      </Link>
      <button
        onClick={() => {
          if (confirm("¿Eliminar esta publicación?")) {
            action(() => deleteListingAdmin(listingId));
          }
        }}
        disabled={pending}
        className="rounded-lg px-2.5 py-1 text-xs text-red-500 hover:bg-red-50 disabled:opacity-50"
      >
        Eliminar
      </button>
    </div>
  );
}
