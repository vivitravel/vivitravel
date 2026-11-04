import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { ListingCard } from "@/components/ListingCard";
import { siteAssetUrl } from "@/lib/format";
import { getCategories, getDestinationBySlug, searchListings } from "@/lib/data";
import { getMyFavoriteIds } from "@/lib/user-data";

type Props = PageProps<"/destinos/[slug]">;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const destination = await getDestinationBySlug(slug);
  if (!destination) return {};
  return {
    title: `Qué hacer en ${destination.name}`,
    description: `Alojamientos, actividades, gastronomía y servicios en ${destination.name}, ${destination.province}.`,
  };
}

export default function DestinoPage({ params }: Props) {
  return (
    <Suspense fallback={<div className="mx-auto max-w-6xl px-4 py-10">Cargando…</div>}>
      <Content params={params} />
    </Suspense>
  );
}

async function Content({ params }: Pick<Props, "params">) {
  const { slug } = await params;
  const destination = await getDestinationBySlug(slug);
  if (!destination) notFound();

  const [listings, categories, favoriteIds] = await Promise.all([
    searchListings({ destino: slug }),
    getCategories(),
    getMyFavoriteIds(),
  ]);

  return (
    <main>
      <section className="relative isolate overflow-hidden bg-navy text-white">
        {siteAssetUrl(destination.photo_url) && (
          <Image src={siteAssetUrl(destination.photo_url)!} alt="" fill priority sizes="100vw" className="-z-20 object-cover" />
        )}
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-navy/85 via-navy/40 to-navy/20" aria-hidden />
        <div className="mx-auto max-w-6xl px-4 py-20">
          <p className="text-sm text-white/80">{destination.province}</p>
          <h1 className="text-4xl font-bold">{destination.name}</h1>
          <div className="mt-5 flex flex-wrap gap-2">
            {categories.map((c) => (
              <Link
                key={c.id}
                href={`/buscar?destino=${slug}&categoria=${c.slug}`}
                className="rounded-full bg-white/15 px-4 py-1.5 text-sm font-semibold hover:bg-white/25"
              >
                {c.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10">
        <h2 className="mb-5 text-2xl font-bold">Todo lo publicado en {destination.name}</h2>
        {listings.length ? (
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {listings.map((l) => (
              <li key={l.id}>
                <ListingCard listing={l} isFavorited={favoriteIds.has(l.id)} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="rounded-card border border-dashed border-border-soft p-8 text-center text-muted">
            Todavía no hay propuestas publicadas en este destino.
          </p>
        )}
      </section>
    </main>
  );
}
