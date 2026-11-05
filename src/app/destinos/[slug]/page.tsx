import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { ListingCard } from "@/components/ListingCard";
import { mediaUrl, siteAssetUrl } from "@/lib/format";
import { getCategories, getDestinationBySlug, searchListings } from "@/lib/data";
import { getMyFavoriteIds } from "@/lib/user-data";

type Props = PageProps<"/destinos/[slug]">;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const destination = await getDestinationBySlug(slug);
  if (!destination) return {};
  const photo = siteAssetUrl(destination.photo_url);
  const desc = `Alojamientos, actividades, gastronomía y servicios en ${destination.name}, ${destination.province}. Descubrí las mejores propuestas y contactá directo con los prestadores.`;
  return {
    title: `Qué hacer en ${destination.name} | Turismo en ${destination.province}`,
    description: desc,
    openGraph: {
      title: `${destination.name} — Qué hacer y dónde ir`,
      description: desc,
      type: "website",
      ...(photo ? { images: [{ url: photo, width: 1200, height: 630, alt: destination.name }] } : {}),
    },
    twitter: {
      card: photo ? "summary_large_image" : "summary",
      title: `${destination.name} — Vivitravels`,
      description: desc,
      ...(photo ? { images: [photo] } : {}),
    },
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

  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://vivitravel.vercel.app";

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "TouristDestination",
      name: destination.name,
      description: `Alojamientos, actividades, gastronomía y servicios en ${destination.name}, ${destination.province}.`,
      url: `${SITE_URL}/destinos/${destination.slug}`,
      address: { "@type": "PostalAddress", addressRegion: destination.province, addressCountry: "AR" },
      ...(siteAssetUrl(destination.photo_url) ? { image: siteAssetUrl(destination.photo_url) } : {}),
      touristType: listings.map((l) => l.category?.name).filter(Boolean).filter((v, i, a) => a.indexOf(v) === i),
    },
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: `Propuestas turísticas en ${destination.name}`,
      numberOfItems: listings.length,
      itemListElement: listings.slice(0, 20).map((l, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: l.title,
        url: `${SITE_URL}/publicacion/${l.slug}`,
        ...(mediaUrl(l.cover) ? { image: mediaUrl(l.cover) } : {}),
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Inicio", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "Destinos", item: `${SITE_URL}/destinos` },
        { "@type": "ListItem", position: 3, name: destination.name, item: `${SITE_URL}/destinos/${destination.slug}` },
      ],
    },
  ];

  return (
    <main>
      {jsonLd.map((schema, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      ))}
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
