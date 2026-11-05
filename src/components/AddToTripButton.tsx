"use client";

import { useState, useTransition } from "react";
import { MapPin, Plus, Check, ChevronDown } from "lucide-react";
import { addToTrip, createTrip } from "@/app/actions/trip";
import { trackEvent } from "@/components/tracking";

type Trip = { id: string; title: string };

export function AddToTripButton({
  listingId,
  trips,
}: {
  listingId: string;
  trips: Trip[];
}) {
  const [open, setOpen] = useState(false);
  const [added, setAdded] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleAdd(tripId: string) {
    startTransition(async () => {
      await addToTrip(tripId, listingId, 1);
      trackEvent(listingId, "add_to_trip");
      setAdded(tripId);
      setOpen(false);
    });
  }

  function handleNew() {
    startTransition(async () => {
      const newId = await createTrip("Mi ruta");
      await addToTrip(newId, listingId, 1);
      trackEvent(listingId, "add_to_trip");
      setAdded(newId);
      setOpen(false);
    });
  }

  if (added) {
    return (
      <a
        href="/viajero/mi-ruta"
        className="btn btn-secondary w-full inline-flex items-center justify-center gap-2 !bg-turquoise/10 !text-turquoise"
      >
        <Check size={16} /> Agregada a tu ruta
      </a>
    );
  }

  return (
    <div className="relative">
      <button
        type="button"
        disabled={pending}
        onClick={() => setOpen((v) => !v)}
        className="btn btn-secondary w-full inline-flex items-center justify-center gap-2"
      >
        <MapPin size={16} />
        {pending ? "Agregando…" : "Agregar a mi ruta"}
        <ChevronDown size={14} className={`ml-auto transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full z-20 mt-1 overflow-hidden rounded-xl border border-border-soft bg-white shadow-lg">
          {trips.length > 0 && (
            <ul>
              {trips.map((t) => (
                <li key={t.id}>
                  <button
                    type="button"
                    onClick={() => handleAdd(t.id)}
                    className="w-full px-4 py-2.5 text-left text-sm hover:bg-surface"
                  >
                    {t.title}
                  </button>
                </li>
              ))}
              <li className="border-t border-border-soft" />
            </ul>
          )}
          <button
            type="button"
            onClick={handleNew}
            className="flex w-full items-center gap-2 px-4 py-2.5 text-sm font-semibold text-turquoise hover:bg-surface"
          >
            <Plus size={14} /> Nueva ruta
          </button>
        </div>
      )}
    </div>
  );
}
