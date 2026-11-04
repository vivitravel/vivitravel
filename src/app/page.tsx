import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { Bed, Briefcase, Mountain, Tent, Utensils } from "lucide-react";
import { DestinationCard } from "@/components/DestinationCard";
import { ListingCard } from "@/components/ListingCard";
import { SearchForm } from "@/components/SearchForm";
import { siteAssetUrl } from "@/lib/format";
import { getCategories, getDestinations, getFeaturedListings, getSiteSettings, getTags } from "@/lib/data";
import { getMyFavoriteIds } from "@/lib/user-data";

const CATEGORY_ICON: Record<string, typeof Bed> = {
  alojamientos: Bed,
  "actividades-y-experiencias": Mountain,
  gastronomia: Utensils,
  servicios: Briefcase,
  camping: Tent,
};

export default function Home() {
  return (
    <>
      <Suspense fallback={<div className="min-h-[26rem] bg-navy" />}>
        <Hero />
      </Suspense>

      <Suspense>
        <Categories />
        <FeaturedDestinations />
        <Themes />
        <Recommended />
      </Suspense>
    </>
  );
}

async function Hero() {
  const settings = await getSiteSettings();
  const image = siteAssetUrl(settings.hero_image);
  return (
    <section className="relative isolate overflow-hidden bg-navy text-white">
      {image && (
        <Image src={image} alt="" fill priority sizes="100vw" className="-z-20 object-cover object-center" />
      )}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-navy/80 via-navy/45 to-navy/70" aria-hidden />
      <div className="mx-auto max-w-6xl px-4 py-16 md:py-24">
        <h1 className="text-4xl font-bold [text-shadow:0_2px_12px_rgba(6,39,71,0.6)] md:text-5xl">
          {settings.hero_title}
        </h1>
        <p className="mt-3 max-w-xl text-lg text-white [text-shadow:0_1px_8px_rgba(6,39,71,0.7)]">
          {settings.hero_subtitle}
        </p>
        <div className="mt-8 rounded-2xl bg-white p-4 shadow-xl">
          <Suspense fallback={<div className="h-12" />}>
            <SearchForm />
          </Suspense>
        </div>
      </div>
    </section>
  );
}

async function Categories() {
  const categories = await getCategories();
  return (
    <section className="mx-auto max-w-6xl px-4 pt-12">
      <ul className="grid grid-cols-2 items-stretch gap-3 md:grid-cols-5">
        {categories.map((c) => {
          const Icon = CATEGORY_ICON[c.slug] ?? Briefcase;
          return (
            <li key={c.id} className="flex">
              <Link
                href={`/buscar?categoria=${c.slug}`}
                className="flex w-full flex-col items-center justify-center gap-2 rounded-card border border-border-soft bg-surface p-4 text-center text-sm font-semibold transition hover:border-turquoise"
              >
                <Icon className="text-turquoise" size={28} aria-hidden />
                {c.name}
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

async function FeaturedDestinations() {
  const destinations = await getDestinations(true);
  return (
    <section className="mx-auto max-w-6xl px-4 pt-14">
      <div className="mb-5 flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-bold">Destinos destacados</h2>
          <p className="text-muted">Lugares increíbles para tu próxima aventura.</p>
        </div>
        <Link href="/destinos" className="text-sm font-semibold text-turquoise hover:underline">
          Ver todos los destinos
        </Link>
      </div>
      <ul className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {destinations.map((d) => (
          <li key={d.id}>
            <DestinationCard destination={d} />
          </li>
        ))}
      </ul>
    </section>
  );
}

async function Themes() {
  const tags = await getTags();
  return (
    <section className="mx-auto max-w-6xl px-4 pt-14">
      <h2 className="text-2xl font-bold">Experiencias para cada viajero</h2>
      <p className="mb-4 text-muted">Elegí cómo querés vivir tu viaje.</p>
      <ul className="flex flex-wrap gap-3">
        {tags.map((t) => (
          <li key={t.id}>
            <Link
              href={`/buscar?tema=${t.slug}`}
              className="inline-block rounded-full border border-turquoise px-5 py-2 text-sm font-semibold text-turquoise hover:bg-turquoise hover:text-white"
            >
              {t.name}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

async function Recommended() {
  const [listings, favoriteIds] = await Promise.all([getFeaturedListings(8), getMyFavoriteIds()]);
  return (
    <section className="mx-auto max-w-6xl px-4 pt-14">
      <h2 className="mb-5 text-2xl font-bold">Propuestas recomendadas</h2>
      {listings.length ? (
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {listings.map((l) => (
            <li key={l.id}>
              <ListingCard listing={l} isFavorited={favoriteIds.has(l.id)} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-card border border-dashed border-border-soft p-8 text-center text-muted">
          Muy pronto vas a encontrar acá las mejores propuestas de cada destino.
        </p>
      )}
    </section>
  );
}
