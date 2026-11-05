export const instant = false;

import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getMyProvider } from "@/lib/provider-data";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Estadísticas | Portal del prestador" };

const PERIODS = [
  { label: "Últimos 7 días", days: 7 },
  { label: "Últimos 30 días", days: 30 },
  { label: "Últimos 90 días", days: 90 },
];

type EventRow = { listing_id: string; type: string; total: number };
type Listing = { id: string; title: string; slug: string };

async function getStats(providerId: string, days: number) {
  const supabase = await createClient();
  const to = new Date();
  const from = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const [{ data: listings }, { data: events }] = await Promise.all([
    supabase
      .from("listings")
      .select("id, title, slug")
      .eq("provider_id", providerId)
      .order("title"),
    supabase.rpc("listing_stats", {
      p_from: from.toISOString(),
      p_to: to.toISOString(),
    }),
  ]);

  return { listings: (listings ?? []) as Listing[], events: (events ?? []) as EventRow[] };
}

function sumByType(events: EventRow[], listingId: string, type: string) {
  return events
    .filter((e) => e.listing_id === listingId && e.type === type)
    .reduce((acc, e) => acc + Number(e.total), 0);
}

function totalClicks(events: EventRow[], listingId: string) {
  return events
    .filter(
      (e) =>
        e.listing_id === listingId &&
        e.type.startsWith("click_"),
    )
    .reduce((acc, e) => acc + Number(e.total), 0);
}

export default async function EstadisticasPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const provider = await getMyProvider();
  if (!provider) redirect("/prestador/onboarding");

  const sp = await searchParams;
  const rawDays = Number((sp.dias as string | undefined) ?? 30);
  const days = PERIODS.find((p) => p.days === rawDays)?.days ?? 30;

  const { listings, events } = await getStats(provider.id, days);

  const totals = {
    views: events.filter((e) => e.type === "view").reduce((a, e) => a + Number(e.total), 0),
    clicks: events.filter((e) => e.type.startsWith("click_")).reduce((a, e) => a + Number(e.total), 0),
    favorites: events.filter((e) => e.type === "favorite").reduce((a, e) => a + Number(e.total), 0),
  };

  const cell = "px-4 py-3 text-sm";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-navy">Estadísticas</h2>
        <div className="flex gap-1 rounded-xl border border-border-soft p-1">
          {PERIODS.map((p) => (
            <a
              key={p.days}
              href={`/prestador/estadisticas?dias=${p.days}`}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                days === p.days
                  ? "bg-turquoise text-white"
                  : "text-muted hover:text-navy"
              }`}
            >
              {p.label}
            </a>
          ))}
        </div>
      </div>

      {/* Totales */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Vistas" value={totals.views} color="turquoise" />
        <StatCard label="Clics de contacto" value={totals.clicks} color="orange" />
        <StatCard label="Guardados" value={totals.favorites} color="navy" />
      </div>

      {/* Por publicación */}
      {listings.length === 0 ? (
        <p className="rounded-card border border-dashed border-border-soft p-10 text-center text-sm text-muted">
          Todavía no tenés publicaciones.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-card border border-border-soft">
          <table className="w-full text-sm">
            <thead className="bg-surface text-xs font-semibold uppercase tracking-wide text-muted">
              <tr>
                <th className="px-4 py-3 text-left">Publicación</th>
                <th className="px-4 py-3 text-right">Vistas</th>
                <th className="px-4 py-3 text-right">Clics</th>
                <th className="px-4 py-3 text-right">Guardados</th>
                <th className="px-4 py-3 text-right">Conv. %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-soft">
              {listings.map((l) => {
                const views = sumByType(events, l.id, "view");
                const clicks = totalClicks(events, l.id);
                const favs = sumByType(events, l.id, "favorite");
                const conv = views > 0 ? Math.round((clicks / views) * 100) : 0;
                return (
                  <tr key={l.id} className="hover:bg-surface/50">
                    <td className={`${cell} font-semibold text-navy`}>
                      <a
                        href={`/publicacion/${l.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline"
                      >
                        {l.title}
                      </a>
                    </td>
                    <td className={`${cell} text-right tabular-nums`}>{views.toLocaleString("es-AR")}</td>
                    <td className={`${cell} text-right tabular-nums`}>{clicks.toLocaleString("es-AR")}</td>
                    <td className={`${cell} text-right tabular-nums`}>{favs.toLocaleString("es-AR")}</td>
                    <td className={`${cell} text-right`}>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                          conv >= 10
                            ? "bg-turquoise/15 text-turquoise"
                            : conv >= 3
                            ? "bg-orange/15 text-orange"
                            : "bg-surface text-muted"
                        }`}
                      >
                        {conv}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-xs text-muted">
        Conversión = clics de contacto / vistas. Los datos se actualizan en tiempo real.
      </p>
    </div>
  );
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: "turquoise" | "orange" | "navy";
}) {
  const colors = {
    turquoise: "bg-turquoise/10 text-turquoise",
    orange: "bg-orange/10 text-orange",
    navy: "bg-navy/10 text-navy",
  };
  return (
    <div className={`rounded-card p-4 ${colors[color]}`}>
      <p className="text-xs font-semibold uppercase tracking-wide opacity-70">{label}</p>
      <p className="mt-1 text-3xl font-bold tabular-nums">{value.toLocaleString("es-AR")}</p>
    </div>
  );
}
