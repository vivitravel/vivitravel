"use client";

import { useTransition } from "react";
import { deleteListing } from "@/app/actions/provider";

export function DeleteListingButton({ listingId }: { listingId: string }) {
  const [pending, startTransition] = useTransition();

  function handleDelete() {
    if (!confirm("¿Querés eliminar esta publicación? Pasará a borrador.")) return;
    startTransition(() => { deleteListing(listingId); });
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={pending}
      className="rounded-xl border border-border-soft px-3 py-1.5 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
    >
      {pending ? "…" : "Borrar"}
    </button>
  );
}
