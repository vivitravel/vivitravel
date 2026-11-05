export const instant = false;

import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Link2, MapPin, Trash2 } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { getTripById } from "@/lib/trip-data";
import { deleteTrip, removeFromTrip, toggleTripPublic } from "@/app/actions/trip";
import { mediaUrl } from "@/lib/format";
import { CopyButton } from "./CopyButton";

export const metadata: Metadata = { title: "Mi ruta | Vivitravels" };

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://vivitravel.vercel.app";

export default async function TripDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/viajero/mi-ruta");

  const { id } = await params;
  const trip = await getTripById(id);
  if (!trip) notFound();

  const shareUrl = `${SITE_URL}/ruta/${trip.share_token}`;

  // Group items by day
  const days = trip.items.reduce<Record<number, typeof trip.items>>((acc, item) => {
    if (!acc[item.day]) acc[item.day] = [];
    acc[item.day].push(item);
    return acc;
  }, {});
  const dayNumbers = Object.keys(days).map(Number).sort((a, b) => a - b);

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <Link href="/viajero/mi-ruta" className="mb-6 inline-flex items-center gap-2 text-sm text-muted hover:text-navy">
        <ArrowLeft size={16} /> Mis rutas
      </Link>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy">{trip.title}</h1>
          <p className="mt-1 text-sm text-muted">
            {trip.items.length} {trip.items.length === 1 ? "parada" : "paradas"}
            {dayNumbers.length > 1 && ` · ${dayNumbers.length} días`}
          </p>
        </div>
        <div className="flex gap-2">
          <form action={toggleTripPublic.bind(null, trip.id, !trip.is_public)}>
            <button
              type="submit"
              className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold transition-colors ${
                trip.is_public
                  ? "border-turquoise bg-turquoise/10 text-turquoise"
                  : "border-border-soft text-muted hover:border-turquoise hover:text-turquoise"
              }`}
            >
              <Link2 size={15} />
              {trip.is_public ? "Pública" : "Compartir"}
            </button>
          </form>
          <form action={async () => { "use server"; await deleteTrip(id); redirect("/viajero/mi-ruta"); }}>
            <button type="submit" className="rounded-xl border border-border-soft px-3 py-2 text-sm text-muted hover:border-red-300 hover:text-red-600 transition-colors">
              <Trash2 size={15} />
            </button>
          </form>
        </div>
      </div>

      {trip.is_public && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-turquoise/30 bg-turquoise/5 px-4 py-3">
          <Link2 size={16} className="shrink-0 text-turquoise" />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-turquoise">Link para compartir</p>
            <p className="truncate text-sm text-navy">{shareUrl}</p>
          </div>
          <CopyButton text={shareUrl} />
        </div>
      )}

      {trip.items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border-soft p-12 text-center">
          <MapPin size={36} className="mx-auto mb-3 text-muted/40" />
          <p className="font-semibold text-navy">La ruta está vacía</p>
          <p className="mt-1 text-sm text-muted">Buscá propuestas y agregálas acá con el botón "Agregar a mi ruta".</p>
          <Link href="/buscar" className="btn-secondary mt-4 inline-block rounded-xl px-6 py-2.5 text-sm font-bold">
            Explorar propuestas
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {dayNumbers.map((day) => (
            <section key={day}>
              <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-turquoise">Día {day}</h2>
              <ul className="space-y-3">
                {days[day].map((item) => {
                  const cover = mediaUrl(item.listing.cover);
                  return (
                    <li key={item.id} className="flex gap-3 rounded-card border border-border-soft bg-white p-3">
                      {cover ? (
                        <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-xl">
                          <Image src={cover} alt={item.listing.title} fill sizes="80px" className="object-cover" />
                        </div>
                      ) : (
                        <div className="h-16 w-20 shrink-0 rounded-xl bg-surface" />
                      )}
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/publicacion/${item.listing.slug}`}
                          target="_blank"
                          className="font-semibold text-navy hover:underline line-clamp-1"
                        >
                          {item.listing.title}
                        </Link>
                        <p className="text-xs text-muted mt-0.5">
                          {item.listing.locality}, {item.listing.province}
                          {item.listing.category && ` · ${item.listing.category.name}`}
                        </p>
                        {item.time_note && <p className="mt-1 text-xs text-muted">🕐 {item.time_note}</p>}
                        {item.note && <p className="mt-1 text-xs text-muted italic">{item.note}</p>}
                      </div>
                      <form action={removeFromTrip.bind(null, item.id)}>
                        <button
                          type="submit"
                          className="rounded-lg p-1.5 text-muted hover:bg-red-50 hover:text-red-600 transition-colors"
                          aria-label="Quitar de la ruta"
                        >
                          <Trash2 size={14} />
                        </button>
                      </form>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      )}
    </main>
  );
}

