import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { getDestinations } from "@/lib/data";

export const metadata: Metadata = {
  title: "Destinos",
  description: "Explorá los destinos más buscados de la Argentina.",
};

export default function DestinosPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-extrabold">Destinos</h1>
      <p className="mb-8 text-muted">Elegí un destino y descubrí qué hacer, dónde alojarte y dónde comer.</p>
      <Suspense>
        <DestinationGrid />
      </Suspense>
    </main>
  );
}

async function DestinationGrid() {
  const destinations = await getDestinations();
  return (
    <ul className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {destinations.map((d) => (
        <li key={d.id}>
          <Link
            href={`/destinos/${d.slug}`}
            className="group flex aspect-[4/5] flex-col justify-end rounded-card bg-gradient-to-br from-petrol to-navy p-4 text-white"
          >
            <span className="text-lg font-bold group-hover:underline">{d.name}</span>
            <span className="text-sm text-white/80">{d.province}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
