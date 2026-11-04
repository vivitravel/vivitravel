import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { Heart } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { getMyFavoriteListings } from "@/lib/user-data";
import { ListingCard } from "@/components/ListingCard";

export const metadata: Metadata = { title: "Mis favoritos | Vivitravels" };

export default async function FavoritosPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/viajero/favoritos");

  const listings = await getMyFavoriteListings();

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8 flex items-center gap-3">
        <Heart size={22} className="fill-red-500 text-red-500" />
        <h1 className="text-2xl font-bold text-navy">Mis favoritos</h1>
      </div>

      {listings.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border-soft p-16 text-center">
          <Heart size={40} className="mx-auto mb-4 text-muted/40" />
          <p className="mb-2 font-semibold text-navy">Todavía no guardaste nada</p>
          <p className="mb-6 text-sm text-muted">Usá el corazón en cualquier propuesta para guardarla acá.</p>
          <Link href="/buscar" className="btn-secondary inline-block rounded-xl px-6 py-2.5 text-sm font-bold">
            Explorar propuestas
          </Link>
        </div>
      ) : (
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {listings.map((l: any) => {
            const cover = l.listing_media?.find((m: any) => m.is_cover)?.storage_path
              ?? l.listing_media?.[0]?.storage_path
              ?? null;
            const card = {
              id: l.id,
              slug: l.slug,
              title: l.title,
              locality: l.locality,
              province: l.province,
              price_from: l.price_from,
              price_unit: l.price_unit,
              featured: l.featured ?? false,
              cover,
              category: l.categories ?? null,
              destination: null,
            };
            return (
              <li key={l.id}>
                <ListingCard listing={card} isFavorited={true} />
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
