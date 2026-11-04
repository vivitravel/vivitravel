import Image from "next/image";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { formatPrice, mediaUrl, priceUnitLabel } from "@/lib/format";
import type { ListingCardData } from "@/lib/types";

export function ListingCard({
  listing,
  layout = "grid",
}: {
  listing: ListingCardData;
  layout?: "grid" | "row";
}) {
  const cover = mediaUrl(listing.cover);
  const unit = priceUnitLabel(listing.price_unit);
  const isRow = layout === "row";

  return (
    <article
      className={`overflow-hidden rounded-card border border-border-soft bg-white shadow-sm transition hover:shadow-md ${
        isRow ? "flex flex-col sm:flex-row" : "flex flex-col"
      }`}
    >
      <Link
        href={`/publicacion/${listing.slug}`}
        className={`relative block bg-surface ${isRow ? "h-48 sm:h-auto sm:w-64 sm:shrink-0" : "aspect-[4/3]"}`}
      >
        {cover ? (
          <Image src={cover} alt={listing.title} fill sizes="(min-width: 1024px) 25vw, 50vw" className="object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted">Sin foto</div>
        )}
        {listing.featured && (
          <span className="absolute left-3 top-3 rounded-full bg-orange px-3 py-1 text-xs font-bold text-navy">
            Destacado
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-4">
        {listing.category && (
          <p className="text-xs font-medium uppercase tracking-wider text-turquoise">{listing.category.name}</p>
        )}
        <h3 className="text-lg font-bold leading-snug">
          <Link href={`/publicacion/${listing.slug}`} className="hover:text-petrol">
            {listing.title}
          </Link>
        </h3>
        <p className="flex items-center gap-1 text-sm text-muted">
          <MapPin size={14} aria-hidden /> {listing.locality}, {listing.province}
        </p>
        <div className="mt-auto flex items-end justify-between pt-2">
          <p className="text-sm">
            <span className="text-muted">Desde </span>
            <span className="text-lg font-bold">{formatPrice(listing.price_from)}</span>
            {unit && <span className="text-muted"> {unit}</span>}
          </p>
          <Link href={`/publicacion/${listing.slug}`} className="btn btn-primary !px-4 !py-2 text-sm">
            Ver más
          </Link>
        </div>
      </div>
    </article>
  );
}
