export const instant = false;

import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { TrendingDown, TrendingUp, Minus } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { getMyProvider } from "@/lib/provider-data";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Estadísticas | Portal del prestador" };

const PERIODS = [
  { label: "7 días",  days: 7  },
  { label: "30 días", days: 30 },
  { label: "90 días", days: 90 },
];

type EventRow   = { listing_id: string; type: string; total: number };
type OriginRow  = { source: string; total: number };
type Listing    = { id: string; title: string; slug: string };

async function getStats(providerId: string, days: number) {
  const supabase = await createClient();
  const to      = new Date();
  const from    = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const prevFrom = new Date(Date.now() - 2 * days * 24 * 60 * 60 * 1000);

  const [
    { data: listings },
    { data: events },
    { data: prevEvents },
    { data: origins },
  ] = await Promise.all([
    supabase.from("listings").select("id, title, slug").eq("provider_id", providerId).order("title"),
    supabase.rpc("listing_stats",  { p_from: from.toISOString(),    p_to: to.toISOString()   }),
    supabase.rpc("listing_stats",  { p_from: prevFrom.toISOString(),p_to: from.toISOString() }),
    supabase.rpc("listing_origins",{ p_from: from.toISOString(),    p_to: to.toISOString()   }),
  ]);

  return {
    listings:   (listings    ?? []) as Listing[],
    events:     (events      ?? []) as EventRow[],
    prevEvents: (prevEvents  ?? []) as EventRow[],
    origins:    (origins     ?? []) as OriginRow[],
  };
}

function sumByType(events: EventRow[], listingId: string, type: string) {
  return events.filter((e) => e.listing_id === listingId && e.type === type)
               .reduce((a, e) => a + Number(e.total), 0);
}
function totalClicks(events: EventRow[], listingId: string) {
  return events.filter((e) => e.listing_id === listingId && e.type.startsWith("click_"))
               .reduce((a, e) => a + Number(e.total), 0);
}
function sumAll(events: EventRow[], type: string) {
  return events.filter((e) => type === "click" ? e.type.startsWith("click_") : e.type === type)
               .reduce((a, e) => a + Number(e.total), 0);
}

function delta(curr: number, prev: number) {
  if (prev === 0) return curr > 0 ? null : 0;
  return Math.round(((curr - prev) / prev) * 100);
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

  const sp   = await searchParams;
  const rawDays = Number((sp.dias as string | undefined) ?? 30);
  const days = PERIODS.find((p) => p.days === rawDays)?.days ?? 30;

  const { listings, events, prevEvents, origins } = await getStats(provider.id, days);

  const totals = {
    views:     sumAll(events,     "view"),
    clicks:    sumAll(events,     "click"),
    favorites: sumAll(events,     "favorite"),
  };
  const prevTotals = {
    views:     sumAll(prevEvents, "view"),
    clicks:    sumAll(prevEvents, "click"),
    favorites: sumAll(prevEvents, "favorite"),
  };

  const totalOrigins = origins.reduce((a, o) => a + Number(o.total), 0);

  const cell = "px-4 py-3 text-sm";

  return (
    <div className="space-y-6">
      {/* Header + período */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-navy">Estadísticas</h2>
          <p className="text-xs text-muted">Comparado con el período anterior de igual duración</p>
        </div>
        <div className="flex gap-1 rounded-xl border border-border-soft p-1">
          {PERIODS.map((p) => (
            <a
              key={p.days}
              href={`/prestador/estadisticas?dias=${p.days}`}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                days === p.days ? "bg-turquoise text-white" : "text-muted hover:text-navy"
              }`}
            >
              {p.label}
            </a>
          ))}
        </div>
      </div>

      {/* Tarjetas con delta */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Vistas"            value={totals.views}     prev={prevTotals.views}     color="turquoise" />
        <StatCard label="Clics de contacto" value={totals.clicks}    prev={prevTotals.clicks}    color="orange"    />
        <StatCard label="Guardados"         value={totals.favorites} prev={prevTotals.favorites} color="navy"      />
      </div>

      {/* Origen de visitas */}
      {origins.length > 0 && (
        <section className="rounded-card border border-border-soft bg-white p-5">
          <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-navy">Origen de visitas</h3>
          <ul className="space-y-2.5">
            {origins.map((o) => {
              const pct = totalOrigins > 0 ? Math.round((Number(o.total) / totalOrigins) * 100) : 0;
              return (
                <li key={o.source} className="flex items-center gap-3">
                  <span className="w-28 shrink-0 text-sm font-semibold text-navy truncate">{o.source}</span>
                  <div className="flex-1 overflow-hidden rounded-full bg-surface">
                    <div
                      className="h-2 rounded-full bg-turquoise transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-16 text-right text-xs text-muted tabular-nums">
                    {Number(o.total).toLocaleString("es-AR")} ({pct}%)
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {/* Tabla por publicación */}
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
                          conv >= 10 ? "bg-turquoise/15 text-turquoise"
                          : conv >= 3 ? "bg-orange/15 text-orange"
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
        Conversión = clics de contacto / vistas. Comparación vs el período anterior de igual duración.
      </p>
    </div>
  );
}

function StatCard({
  label, value, prev, color,
}: {
  label: string; value: number; prev: number; color: "turquoise" | "orange" | "navy";
}) {
  const colors = {
    turquoise: { bg: "bg-turquoise/10", text: "text-turquoise", bar: "bg-turquoise" },
    orange:    { bg: "bg-orange/10",    text: "text-orange",    bar: "bg-orange"    },
    navy:      { bg: "bg-navy/10",      text: "text-navy",      bar: "bg-navy"      },
  }[color];

  const pct = delta(value, prev);

  return (
    <div className={`rounded-card p-5 ${colors.bg}`}>
      <p className={`text-xs font-semibold uppercase tracking-wide opacity-70 ${colors.text}`}>{label}</p>
      <p className={`mt-1 text-3xl font-bold tabular-nums ${colors.text}`}>
        {value.toLocaleString("es-AR")}
      </p>
      {pct !== null ? (
        <p className={`mt-2 flex items-center gap-1 text-xs font-semibold ${
          pct > 0 ? "text-green-600" : pct < 0 ? "text-red-500" : "text-muted"
        }`}>
          {pct > 0 ? <TrendingUp size={13} /> : pct < 0 ? <TrendingDown size={13} /> : <Minus size={13} />}
          {pct > 0 ? `+${pct}%` : `${pct}%`} vs período anterior
        </p>
      ) : (
        <p className="mt-2 text-xs text-muted">Sin datos anteriores</p>
      )}
    </div>
  );
}
