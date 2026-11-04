import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { Globe, Mail, MapPin, MessageCircle, Navigation, Phone } from "lucide-react";
import { Facebook, Instagram } from "@/components/icons";
import { TrackedLink, ViewTracker } from "@/components/tracking";
import { externalUrl, formatPrice, mediaUrl, priceUnitLabel, whatsappLink } from "@/lib/format";
import { getListingBySlug } from "@/lib/data";

type Props = PageProps<"/publicacion/[slug]">;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const listing = await getListingBySlug(slug);
  if (!listing) return {};
  const cover = mediaUrl(listing.cover);
  return {
    title: `${listing.title} en ${listing.locality}`,
    description: (listing.description ?? `${listing.title}, ${listing.locality}, ${listing.province}`).slice(0, 155),
    openGraph: cover ? { images: [cover] } : undefined,
  };
}

export default function PublicacionPage({ params }: Props) {
  return (
    <Suspense fallback={<div className="mx-auto max-w-6xl px-4 py-10">Cargando…</div>}>
      <Content params={params} />
    </Suspense>
  );
}

function renderValue(value: unknown) {
  if (value === true) return null;
  if (Array.isArray(value)) return value.join(", ");
  if (value === false || value === null || value === undefined || value === "") return undefined;
  return String(value);
}

async function Content({ params }: Pick<Props, "params">) {
  const { slug } = await params;
  const l = await getListingBySlug(slug);
  if (!l) notFound();

  const unit = priceUnitLabel(l.price_unit);
  const p = l.provider;
  const btn = "btn btn-secondary w-full";
  const outline = "btn btn-ghost w-full";
  const mapsHref =
    l.lat != null && l.lng != null
      ? `https://www.google.com/maps/dir/?api=1&destination=${l.lat},${l.lng}`
      : l.address
        ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${l.address}, ${l.locality}, ${l.province}`)}`
        : null;

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <ViewTracker listingId={l.id} />

      <nav aria-label="Ubicación" className="mb-4 text-sm text-muted">
        <Link href="/" className="hover:underline">Inicio</Link>
        {l.destination && (
          <>
            {" / "}
            <Link href={`/destinos/${l.destination.slug}`} className="hover:underline">{l.destination.name}</Link>
          </>
        )}
        {l.category && (
          <>
            {" / "}
            <Link href={`/buscar?categoria=${l.category.slug}`} className="hover:underline">{l.category.name}</Link>
          </>
        )}
      </nav>

      <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-6">
          <section aria-label="Fotos">
            {l.media.length ? (
              <div className="grid gap-2">
                <div className="relative aspect-[16/9] overflow-hidden rounded-card bg-surface">
                  <Image
                    src={mediaUrl(l.media[0].storage_path)!}
                    alt={l.media[0].alt_text ?? l.title}
                    fill
                    priority
                    sizes="(min-width: 1024px) 60vw, 100vw"
                    className="object-cover"
                  />
                </div>
                {l.media.length > 1 && (
                  <ul className="grid grid-cols-4 gap-2">
                    {l.media.slice(1, 5).map((m) => (
                      <li key={m.storage_path} className="relative aspect-[4/3] overflow-hidden rounded-xl bg-surface">
                        <Image
                          src={mediaUrl(m.storage_path)!}
                          alt={m.alt_text ?? l.title}
                          fill
                          sizes="15vw"
                          className="object-cover"
                        />
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ) : (
              <div className="flex aspect-[16/9] items-center justify-center rounded-card bg-surface text-muted">
                Sin fotos
              </div>
            )}
          </section>

          {l.description && (
            <section>
              <h2 className="mb-2 text-xl font-bold">Descripción</h2>
              <p className="whitespace-pre-line leading-relaxed">{l.description}</p>
            </section>
          )}

          {l.attributes.length > 0 && (
            <section>
              <h2 className="mb-3 text-xl font-bold">Características y servicios</h2>
              <ul className="grid gap-2 sm:grid-cols-2">
                {l.attributes.map((a) => {
                  const text = renderValue(a.value);
                  if (text === undefined) return null;
                  return (
                    <li key={a.label} className="rounded-xl bg-surface px-3 py-2 text-sm">
                      <span className="font-medium">{a.label}</span>
                      {text ? <span className="text-muted">: {text}</span> : null}
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          <section>
            <h2 className="mb-2 text-xl font-bold">Ubicación</h2>
            <p className="flex items-start gap-2">
              <MapPin size={18} className="mt-0.5 shrink-0 text-turquoise" aria-hidden />
              <span>
                {l.address ? `${l.address}, ` : ""}
                {l.locality}, {l.province}
              </span>
            </p>
            {mapsHref && (
              <a href={mapsHref} target="_blank" rel="noopener noreferrer" className="btn btn-ghost mt-3 inline-flex">
                <Navigation size={16} aria-hidden /> Cómo llegar
              </a>
            )}
          </section>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="space-y-4 rounded-card border border-border-soft p-5 shadow-sm">
            {l.category && (
              <p className="text-xs font-medium uppercase tracking-wider text-turquoise">{l.category.name}</p>
            )}
            <h1 className="text-2xl font-extrabold leading-tight">{l.title}</h1>
            {p && <p className="text-sm text-muted">Ofrece {p.business_name}</p>}
            <p>
              <span className="text-muted">Desde </span>
              <span className="text-2xl font-extrabold">{formatPrice(l.price_from)}</span>
              {unit && <span className="text-muted"> {unit}</span>}
            </p>

            <div className="grid gap-2">
              {p?.whatsapp && (
                <TrackedLink
                  listingId={l.id}
                  type="click_whatsapp"
                  href={whatsappLink(p.whatsapp, `Hola, vi "${l.title}" en Vivitravels y quiero consultar disponibilidad.`)}
                  className="btn btn-primary w-full"
                >
                  <MessageCircle size={18} aria-hidden /> Consultar por WhatsApp
                </TrackedLink>
              )}
              {p?.email && (
                <TrackedLink listingId={l.id} type="click_mail" href={`mailto:${p.email}`} className={btn}>
                  <Mail size={18} aria-hidden /> Enviar mail
                </TrackedLink>
              )}
              {p?.phone && (
                <TrackedLink listingId={l.id} type="click_phone" href={`tel:${p.phone.replace(/\s/g, "")}`} className={outline}>
                  <Phone size={18} aria-hidden /> Llamar
                </TrackedLink>
              )}
              {p?.instagram && (
                <TrackedLink
                  listingId={l.id}
                  type="click_instagram"
                  href={externalUrl(p.instagram, "https://instagram.com/")}
                  className={outline}
                >
                  <Instagram size={18} aria-hidden /> Instagram
                </TrackedLink>
              )}
              {p?.facebook && (
                <TrackedLink
                  listingId={l.id}
                  type="click_facebook"
                  href={externalUrl(p.facebook, "https://facebook.com/")}
                  className={outline}
                >
                  <Facebook size={18} aria-hidden /> Facebook
                </TrackedLink>
              )}
              {p?.website && (
                <TrackedLink listingId={l.id} type="click_web" href={externalUrl(p.website)} className={outline}>
                  <Globe size={18} aria-hidden /> Visitar sitio web
                </TrackedLink>
              )}
            </div>

            <p className="rounded-xl bg-surface p-3 text-xs text-muted">
              En Vivitravels no gestionamos reservas. Contactá directamente con el prestador para consultar
              disponibilidad, precios y condiciones.
            </p>
          </div>
        </aside>
      </div>
    </main>
  );
}
