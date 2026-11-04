import Link from "next/link";
import { Suspense } from "react";
import { Bed, Briefcase, Mountain, Tent, Utensils } from "lucide-react";
import { ListingCard } from "@/components/ListingCard";
import { SearchForm } from "@/components/SearchForm";
import { getCategories, getDestinations, getFeaturedListings, getTags } from "@/lib/data";

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
      <section className="bg-gradient-to-br from-navy via-petrol to-turquoise text-white">
        <div className="mx-auto max-w-6xl px-4 py-16 md:py-24">
          <h1 className="text-4xl font-extrabold md:text-5xl">Descubrí. Explorá. Viví.</h1>
          <p className="mt-3 max-w-xl text-lg text-white/90">
            Todos los destinos, en un solo lugar. Encontrá propuestas de toda la Argentina y contactá
            directo con los prestadores.
          </p>
          <div className="mt-8 rounded-2xl bg-white p-4 shadow-xl">
            <Suspense fallback={<div className="h-12" />}>
              <SearchForm />
            </Suspense>
          </div>
        </div>
      </section>

      <Suspense>
        <Categories />
        <FeaturedDestinations />
        <Themes />
        <Recommended />
      </Suspense>
    </>
  );
}

async function Categories() {
  const categories = await getCategories();
  return (
    <section className="mx-auto max-w-6xl px-4 pt-12">
      <ul className="grid grid-cols-2 gap-3 md:grid-cols-5">
        {categories.map((c) => {
          const Icon = CATEGORY_ICON[c.slug] ?? Briefcase;
          return (
            <li key={c.id}>
              <Link
                href={`/buscar?categoria=${c.slug}`}
                className="flex flex-col items-center gap-2 rounded-card border border-border-soft bg-surface p-4 text-center text-sm font-medium transition hover:border-turquoise"
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
        <Link href="/destinos" className="text-sm font-medium text-petrol hover:underline">
          Ver todos los destinos
        </Link>
      </div>
      <ul className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {destinations.map((d) => (
          <li key={d.id}>
            <Link
              href={`/destinos/${d.slug}`}
              className="group relative flex aspect-[4/5] flex-col justify-end overflow-hidden rounded-card bg-gradient-to-br from-petrol to-navy p-4 text-white"
            >
              <span className="text-lg font-bold group-hover:underline">{d.name}</span>
              <span className="text-sm text-white/80">{d.province}</span>
            </Link>
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
              className="inline-block rounded-full border border-petrol px-5 py-2 text-sm font-medium text-petrol hover:bg-petrol hover:text-white"
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
  const listings = await getFeaturedListings(8);
  return (
    <section className="mx-auto max-w-6xl px-4 pt-14">
      <h2 className="mb-5 text-2xl font-bold">Propuestas recomendadas</h2>
      {listings.length ? (
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {listings.map((l) => (
            <li key={l.id}>
              <ListingCard listing={l} />
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
