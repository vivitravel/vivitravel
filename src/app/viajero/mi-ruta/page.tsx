export const instant = false;

import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { MapPin, Plus, Trash2 } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { getMyTrips } from "@/lib/trip-data";
import { createTrip, deleteTrip } from "@/app/actions/trip";

export const metadata: Metadata = { title: "Mis rutas | Vivitravels" };

export default async function MisRutasPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/viajero/mi-ruta");

  const trips = await getMyTrips();

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-8 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <MapPin size={22} className="text-turquoise" />
          <h1 className="text-2xl font-bold text-navy">Mis rutas</h1>
        </div>
        <form action={async () => { "use server"; const id = await createTrip("Mi ruta"); redirect(`/viajero/mi-ruta/${id}`); }}>
          <button type="submit" className="btn btn-secondary inline-flex gap-2">
            <Plus size={16} /> Nueva ruta
          </button>
        </form>
      </div>

      {trips.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border-soft p-16 text-center">
          <MapPin size={40} className="mx-auto mb-4 text-muted/40" />
          <p className="mb-2 font-semibold text-navy">Todavía no creaste ninguna ruta</p>
          <p className="mb-6 text-sm text-muted">Organizá tus viajes guardando propuestas en una ruta y compartila.</p>
          <form action={async () => { "use server"; const id = await createTrip("Mi primera ruta"); redirect(`/viajero/mi-ruta/${id}`); }}>
            <button type="submit" className="btn-secondary inline-flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-bold">
              <Plus size={16} /> Crear mi primera ruta
            </button>
          </form>
        </div>
      ) : (
        <ul className="space-y-3">
          {trips.map((t) => (
            <li key={t.id} className="flex items-center gap-4 rounded-card border border-border-soft bg-white p-4 hover:shadow-sm transition-shadow">
              <Link href={`/viajero/mi-ruta/${t.id}`} className="flex-1 min-w-0">
                <p className="font-semibold text-navy truncate">{t.title}</p>
                <p className="text-sm text-muted mt-0.5">
                  {t.item_count} {t.item_count === 1 ? "parada" : "paradas"}
                  {t.is_public && <span className="ml-2 rounded-full bg-turquoise/15 px-2 py-0.5 text-xs font-semibold text-turquoise">Pública</span>}
                </p>
              </Link>
              <form action={deleteTrip.bind(null, t.id)}>
                <button
                  type="submit"
                  className="rounded-lg p-2 text-muted hover:bg-red-50 hover:text-red-600 transition-colors"
                  aria-label="Eliminar ruta"
                >
                  <Trash2 size={16} />
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
