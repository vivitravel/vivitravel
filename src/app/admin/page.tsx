import type { Metadata } from "next";
import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";

export const metadata: Metadata = { title: "Admin — Vivitravels" };

async function getMetrics() {
  const supabase = createAdminClient();

  const [
    { count: totalListings },
    { count: inReview },
    { count: published },
    { count: paused },
    { count: totalProviders },
    { count: pendingProviders },
    { count: totalUsers },
  ] = await Promise.all([
    supabase.from("listings").select("*", { count: "exact", head: true }),
    supabase.from("listings").select("*", { count: "exact", head: true }).eq("status", "in_review"),
    supabase.from("listings").select("*", { count: "exact", head: true }).eq("status", "published"),
    supabase.from("listings").select("*", { count: "exact", head: true }).eq("status", "paused"),
    supabase.from("providers").select("*", { count: "exact", head: true }),
    supabase.from("providers").select("*", { count: "exact", head: true }).eq("approved", false),
    supabase.from("profiles").select("*", { count: "exact", head: true }),
  ]);

  return { totalListings, inReview, published, paused, totalProviders, pendingProviders, totalUsers };
}

export default async function AdminDashboard() {
  const m = await getMetrics();

  const cards = [
    { label: "En revisión", value: m.inReview ?? 0, href: "/admin/publicaciones?status=in_review", urgent: (m.inReview ?? 0) > 0 },
    { label: "Publicadas", value: m.published ?? 0, href: "/admin/publicaciones?status=published" },
    { label: "Pausadas", value: m.paused ?? 0, href: "/admin/publicaciones?status=paused" },
    { label: "Total publicaciones", value: m.totalListings ?? 0, href: "/admin/publicaciones" },
    { label: "Prestadores pendientes", value: m.pendingProviders ?? 0, href: "/admin/prestadores?aprobados=false", urgent: (m.pendingProviders ?? 0) > 0 },
    { label: "Total prestadores", value: m.totalProviders ?? 0, href: "/admin/prestadores" },
    { label: "Usuarios registrados", value: m.totalUsers ?? 0, href: "/admin/usuarios" },
  ];

  return (
    <div className="space-y-8">
      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((c) => (
          <li key={c.label}>
            <Link
              href={c.href}
              className={`block rounded-card border p-5 transition hover:shadow-sm ${
                c.urgent ? "border-orange bg-orange/5" : "border-border-soft bg-white"
              }`}
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">{c.label}</p>
              <p className={`mt-1 text-3xl font-bold ${c.urgent ? "text-orange" : "text-navy"}`}>
                {c.value}
              </p>
            </Link>
          </li>
        ))}
      </ul>

      <div className="grid gap-4 sm:grid-cols-3">
        <Link href="/admin/publicaciones/nueva" className="btn btn-primary text-center">
          + Nueva publicación editorial
        </Link>
        <Link href="/admin/destinos" className="btn btn-secondary text-center">
          Gestionar destinos
        </Link>
        <Link href="/admin/categorias" className="btn btn-secondary text-center">
          Gestionar categorías
        </Link>
      </div>
    </div>
  );
}
