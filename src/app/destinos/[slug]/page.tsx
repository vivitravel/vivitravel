import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { ListingCard } from "@/components/ListingCard";
import { getCategories, getDestinationBySlug, searchListings } from "@/lib/data";

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

  const [listings, categories] = await Promise.all([
    searchListings({ destino: slug }),
    getCategories(),
  ]);

  return (
    <main>
      <section className="bg-gradient-to-br from-navy to-petrol text-white">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <p className="text-sm text-white/80">{destination.province}</p>
          <h1 className="text-4xl font-extrabold">{destination.name}</h1>
          <div className="mt-5 flex flex-wrap gap-2">
            {categories.map((c) => (
              <Link
                key={c.id}
                href={`/buscar?destino=${slug}&categoria=${c.slug}`}
                className="rounded-full bg-white/15 px-4 py-1.5 text-sm font-medium hover:bg-white/25"
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
                <ListingCard listing={l} />
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
