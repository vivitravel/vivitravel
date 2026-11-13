"use client";

import { useState, useTransition } from "react";
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
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const action = (fn: () => Promise<void>) => {
    startTransition(() => { fn(); });
  };

  const handleReject = () => {
    if (!rejectReason.trim()) return;
    action(() => setListingStatus(listingId, "rejected", rejectReason.trim()));
    setShowRejectForm(false);
    setRejectReason("");
  };

  return (
    <div className="space-y-2">
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
            onClick={() => setShowRejectForm((v) => !v)}
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

      {showRejectForm && (
        <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3">
          <textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Motivo del rechazo (se envía al prestador)…"
            rows={2}
            className="flex-1 resize-none rounded-lg border border-red-200 bg-white px-3 py-2 text-xs text-navy placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-red-300"
          />
          <div className="flex flex-col gap-1">
            <button
              onClick={handleReject}
              disabled={pending || !rejectReason.trim()}
              className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-40"
            >
              Confirmar
            </button>
            <button
              onClick={() => { setShowRejectForm(false); setRejectReason(""); }}
              className="rounded-lg border border-red-200 px-3 py-1.5 text-xs text-red-600 hover:bg-red-100"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
