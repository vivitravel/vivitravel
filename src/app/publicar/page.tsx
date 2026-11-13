import Link from "next/link";
import type { Metadata } from "next";
import { Check, MapPin, BarChart2, Bell, Star } from "lucide-react";
import { getPlans } from "@/lib/data";

export const metadata: Metadata = {
  title: "Publicá tu negocio",
  description: "Sumá tu negocio turístico al directorio más completo de Argentina. Llegá a miles de viajeros que planifican su próximo destino.",
};

const BENEFICIOS = [
  { icon: MapPin,    texto: "Tu negocio visible en todo el país" },
  { icon: Star,      texto: "Ficha completa con fotos, mapa y contacto directo" },
  { icon: BarChart2, texto: "Estadísticas de vistas, clics y guardados" },
  { icon: Bell,      texto: "Recibís consultas directo por WhatsApp o mail" },
];

function formatPrice(n: number) {
  if (n === 0) return "Gratis";
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(n);
}

export default async function PublicarPage() {
  const planes = await getPlans();

  return (
    <main>
      {/* Hero */}
      <section className="bg-navy px-4 py-20 text-center text-white">
        <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-turquoise">Para prestadores</p>
        <h1 className="mb-4 text-4xl font-extrabold leading-tight sm:text-5xl">
          Publicá tu negocio<br className="hidden sm:block" /> en Vivitravels
        </h1>
        <p className="mx-auto mb-8 max-w-xl text-lg text-white/70">
          Llegá a miles de viajeros que planifican su próximo destino en Argentina. Sin intermediarios: el contacto es directo con vos.
        </p>
        <Link
          href="/registro?tipo=prestador"
          className="inline-block rounded-xl bg-orange px-8 py-3.5 text-base font-bold text-navy hover:opacity-90 transition-opacity"
        >
          Empezar gratis
        </Link>
      </section>

      {/* Beneficios */}
      <section className="bg-surface px-4 py-16">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-10 text-center text-2xl font-bold text-navy">¿Por qué publicar en Vivitravels?</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {BENEFICIOS.map(({ icon: Icon, texto }) => (
              <div key={texto} className="flex items-start gap-4 rounded-2xl bg-white p-5 shadow-sm">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-turquoise/10 text-turquoise">
                  <Icon size={20} />
                </div>
                <p className="pt-1.5 font-semibold text-navy">{texto}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Planes */}
      <section className="px-4 py-16">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-2 text-center text-2xl font-bold text-navy">Elegí tu plan</h2>
          <p className="mb-10 text-center text-sm text-muted">Precios mensuales. Empezá gratis, sin tarjeta.</p>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {planes.map((plan) => {
              const isGratuito = plan.is_free;
              const isPro = plan.includes_featured;
              return (
                <div
                  key={plan.id}
                  className={`relative flex flex-col rounded-2xl border p-6 ${
                    isPro
                      ? "border-orange bg-navy text-white shadow-xl"
                      : "border-border-soft bg-white shadow-sm"
                  }`}
                >
                  {isPro && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-orange px-4 py-1 text-xs font-bold text-navy">
                      Más elegido
                    </span>
                  )}
                  <p className={`mb-1 text-xs font-bold uppercase tracking-wider ${isPro ? "text-orange" : "text-turquoise"}`}>
                    {plan.name}
                  </p>
                  <p className={`mb-1 text-3xl font-extrabold ${isPro ? "text-white" : "text-navy"}`}>
                    {formatPrice(plan.reference_price_ars)}
                  </p>
                  {!isGratuito && (
                    <p className={`mb-4 text-xs ${isPro ? "text-white/60" : "text-muted"}`}>por mes</p>
                  )}
                  {isGratuito && (
                    <p className={`mb-4 text-xs ${isPro ? "text-white/60" : "text-muted"}`}>activo 30 días, luego se pausa</p>
                  )}
                  <ul className={`mb-6 flex-1 space-y-2 text-sm ${isPro ? "text-white/80" : "text-navy/70"}`}>
                    <li className="flex items-center gap-2">
                      <Check size={14} className={isPro ? "text-orange" : "text-turquoise"} />
                      {plan.max_listings} {plan.max_listings !== 1 ? "publicaciones" : "publicación"}
                    </li>
                    <li className="flex items-center gap-2">
                      <Check size={14} className={isPro ? "text-orange" : "text-turquoise"} />
                      {plan.max_photos_per_listing} foto{plan.max_photos_per_listing !== 1 ? "s" : ""} por publicación
                    </li>
                    {plan.max_videos_per_listing > 0 && (
                      <li className="flex items-center gap-2">
                        <Check size={14} className={isPro ? "text-orange" : "text-turquoise"} />
                        {plan.max_videos_per_listing} video{plan.max_videos_per_listing !== 1 ? "s" : ""} por publicación
                      </li>
                    )}
                    {plan.includes_advisory && (
                      <li className="flex items-center gap-2">
                        <Check size={14} className={isPro ? "text-orange" : "text-turquoise"} />
                        Asesoramiento
                      </li>
                    )}
                    {plan.includes_featured && (
                      <li className="flex items-center gap-2">
                        <Check size={14} className={isPro ? "text-orange" : "text-turquoise"} />
                        Destacado en portada
                      </li>
                    )}
                    {plan.includes_social && (
                      <li className="flex items-center gap-2">
                        <Check size={14} className={isPro ? "text-orange" : "text-turquoise"} />
                        Difusión en redes
                      </li>
                    )}
                  </ul>
                  <Link
                    href={`/registro?tipo=prestador`}
                    className={`block rounded-xl py-2.5 text-center text-sm font-bold transition-opacity hover:opacity-90 ${
                      isPro
                        ? "bg-orange text-navy"
                        : isGratuito
                          ? "border border-border-soft text-navy hover:bg-surface"
                          : "bg-turquoise text-white"
                    }`}
                  >
                    {isGratuito ? "Empezar gratis" : "Registrarme"}
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="bg-turquoise/10 px-4 py-16 text-center">
        <h2 className="mb-3 text-2xl font-bold text-navy">¿Tenés dudas?</h2>
        <p className="mb-6 text-sm text-muted">
          Podés empezar gratis hoy mismo. No hace falta tarjeta de crédito.
        </p>
        <Link
          href="/registro?tipo=prestador"
          className="inline-block rounded-xl bg-navy px-8 py-3.5 text-base font-bold text-white hover:opacity-90 transition-opacity"
        >
          Crear mi cuenta gratis
        </Link>
      </section>
    </main>
  );
}
