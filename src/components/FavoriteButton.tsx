"use client";

import { Heart } from "lucide-react";
import { useOptimistic, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toggleFavorite } from "@/app/actions/favorites";

export function FavoriteButton({
  listingId,
  initialFavorited = false,
  size = "card",
}: {
  listingId: string;
  initialFavorited?: boolean;
  size?: "card" | "detail";
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [favorited, setOptimistic] = useOptimistic(initialFavorited);

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    startTransition(async () => {
      setOptimistic(!favorited);
      const result = await toggleFavorite(listingId);
      if ("error" in result && result.error === "login_required") {
        router.push("/login");
      }
    });
  }

  const isDetail = size === "detail";

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      aria-label={favorited ? "Quitar de favoritos" : "Guardar en favoritos"}
      className={
        isDetail
          ? `flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition-colors ${
              favorited
                ? "border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
                : "border-border-soft bg-white text-navy hover:bg-surface"
            }`
          : `flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow transition-colors hover:bg-white ${
              pending ? "opacity-60" : ""
            }`
      }
    >
      <Heart
        size={isDetail ? 16 : 15}
        className={favorited ? "fill-red-500 text-red-500" : "text-muted"}
      />
      {isDetail && <span>{favorited ? "Guardado" : "Guardar"}</span>}
    </button>
  );
}
