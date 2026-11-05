import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { MapPin } from "lucide-react";
import { getTripByToken } from "@/lib/trip-data";
import { mediaUrl } from "@/lib/format";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ token: string }>;
}): Promise<Metadata> {
  const { token } = await params;
  const trip = await getTripByToken(token);
  if (!trip) return {};
  return {
    title: trip.title,
    description: `Ruta con ${trip.items.length} paradas en Vivitravels.`,
    robots: { index: false },
  };
}

export default async function RutaPublicaPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const trip = await getTripByToken(token);
  if (!trip) notFound();

  const days = trip.items.reduce<Record<number, typeof trip.items>>((acc, item) => {
    if (!acc[item.day]) acc[item.day] = [];
    acc[item.day].push(item);
    return acc;
  }, {});
  const dayNumbers = Object.keys(days).map(Number).sort((a, b) => a - b);

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <div className="mb-8 text-center">
        <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-turquoise/15">
          <MapPin size={24} className="text-turquoise" />
        </div>
        <h1 className="text-2xl font-bold text-navy">{trip.title}</h1>
        <p className="mt-1 text-sm text-muted">
          {trip.items.length} {trip.items.length === 1 ? "parada" : "paradas"}
          {dayNumbers.length > 1 && ` · ${dayNumbers.length} días`}
        </p>
        <p className="mt-2 text-xs text-muted">Compartida en Vivitravels</p>
      </div>

      {trip.items.length === 0 ? (
        <p className="text-center text-muted">Esta ruta todavía no tiene paradas.</p>
      ) : (
        <div className="space-y-8">
          {dayNumbers.map((day) => (
            <section key={day}>
              <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-turquoise">Día {day}</h2>
              <ul className="space-y-3">
                {days[day].map((item, idx) => {
                  const cover = mediaUrl(item.listing.cover);
                  return (
                    <li key={item.id} className="flex gap-3 rounded-card border border-border-soft bg-white p-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-turquoise/15 text-sm font-bold text-turquoise">
                        {idx + 1}
                      </span>
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
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      )}

      <div className="mt-10 border-t border-border-soft pt-6 text-center">
        <p className="text-xs text-muted">Creada con</p>
        <Link href="/" className="mt-1 inline-block text-sm font-bold text-navy hover:text-turquoise">
          Vivitravels
        </Link>
      </div>
    </main>
  );
}
