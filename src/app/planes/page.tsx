import Link from "next/link";
import type { Metadata } from "next";
import { Check, X } from "lucide-react";
import { getPlans } from "@/lib/data";
import type { Plan } from "@/lib/types";

export const metadata: Metadata = {
  title: "Planes para prestadores | Vivitravels",
  description: "Publicá tu negocio turístico en Vivitravels. Elegí el plan que mejor se adapta a tus necesidades.",
};

function formatPrice(n: number) {
  if (n === 0) return "Gratis";
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(n);
}

const FEATURES: { key: keyof Plan; label: string; render?: (p: Plan) => string }[] = [
  { key: "max_listings",           label: "Publicaciones activas",   render: (p) => `Hasta ${p.max_listings}` },
  { key: "max_photos_per_listing", label: "Fotos por publicación",   render: (p) => `Hasta ${p.max_photos_per_listing}` },
  { key: "max_videos_per_listing", label: "Videos por publicación",  render: (p) => p.max_videos_per_listing > 0 ? `Hasta ${p.max_videos_per_listing}` : "" },
  { key: "includes_advisory",      label: "Asesoramiento comercial" },
  { key: "includes_featured",      label: "Destacado en portada" },
  { key: "includes_social",        label: "Difusión en redes" },
];

export default async function PlanesPage() {
  const plans = await getPlans();

  return (
    <main className="min-h-screen bg-surface">
      {/* Hero */}
      <section className="bg-navy py-16 text-center">
        <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-turquoise">Para prestadores</p>
        <h1 className="mb-4 text-4xl font-bold text-white">Publicá tu negocio en Vivitravels</h1>
        <p className="mx-auto max-w-xl text-lg text-white/70">
          Llegá a viajeros de toda la Argentina. Elegí el plan que se adapta a tu negocio.
        </p>
      </section>

      {/* Cards */}
      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {plans.map((plan) => {
            const isPopular = plan.name === "Premium";
            return (
              <div
                key={plan.id}
                className={`relative flex flex-col rounded-2xl border bg-white p-6 shadow-sm transition-shadow hover:shadow-md ${
                  isPopular ? "border-turquoise ring-2 ring-turquoise/30" : "border-border-soft"
                }`}
              >
                {isPopular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-turquoise px-4 py-0.5 text-xs font-bold text-white">
                    Más elegido
                  </span>
                )}

                <div className="mb-4">
                  <h2 className="text-xl font-bold text-navy">{plan.name}</h2>
                  {plan.is_free && plan.trial_days && (
                    <p className="text-xs text-muted">Prueba {plan.trial_days} días</p>
                  )}
                </div>

                <div className="mb-6">
                  <span className="text-3xl font-bold text-navy">{formatPrice(plan.reference_price_ars)}</span>
                  {!plan.is_free && (
                    <span className="ml-1 text-sm text-muted">/mes</span>
                  )}
                </div>

                <ul className="mb-8 flex-1 space-y-2.5 text-sm">
                  {FEATURES.map(({ key, label, render }) => {
                    const val = plan[key];
                    if (typeof val === "boolean") {
                      return (
                        <li key={key} className={`flex items-center gap-2 ${val ? "text-navy" : "text-muted/60"}`}>
                          {val
                            ? <Check size={15} className="shrink-0 text-turquoise" />
                            : <X size={15} className="shrink-0 text-muted/40" />}
                          {label}
                        </li>
                      );
                    }
                    const text = render ? render(plan) : String(val);
                    return (
                      <li key={key} className="flex items-center gap-2 text-navy">
                        <Check size={15} className="shrink-0 text-turquoise" />
                        <span>{text || label}</span>
                      </li>
                    );
                  })}
                </ul>

                <Link
                  href="/registro"
                  className={`block rounded-xl py-2.5 text-center text-sm font-bold transition-opacity hover:opacity-90 ${
                    isPopular
                      ? "bg-turquoise text-white"
                      : plan.is_free
                        ? "border border-border-soft text-navy hover:bg-surface"
                        : "btn-primary"
                  }`}
                >
                  {plan.is_free ? "Probalo gratis" : "Empezar ahora"}
                </Link>
              </div>
            );
          })}
        </div>

        {/* Fine print */}
        <p className="mt-10 text-center text-sm text-muted">
          Los precios son de referencia en ARS. Para activar un plan pago,{" "}
          <a href="mailto:contacto@vivitravels.com.ar" className="text-turquoise underline underline-offset-2">
            contactate con nuestro equipo
          </a>
          .
        </p>
      </section>

      {/* CTA bottom */}
      <section className="border-t border-border-soft bg-white py-14 text-center">
        <h2 className="mb-3 text-2xl font-bold text-navy">¿Ya tenés una cuenta?</h2>
        <p className="mb-6 text-muted">Entrá a tu portal de prestador y gestioná tus publicaciones.</p>
        <Link href="/prestador" className="btn-secondary inline-block rounded-xl px-8 py-3 text-sm font-bold">
          Ir a mi portal
        </Link>
      </section>
    </main>
  );
}
