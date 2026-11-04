import type { Metadata } from "next";
import { Suspense } from "react";
import { DestinationCard } from "@/components/DestinationCard";
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
          <DestinationCard destination={d} />
        </li>
      ))}
    </ul>
  );
}
