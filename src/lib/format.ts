import type { PriceUnit } from "./types";

const ars = new Intl.NumberFormat("es-AR", { maximumFractionDigits: 0 });

export function formatPrice(value: number) {
  return `ARS ${ars.format(value)}`;
}

const UNIT_LABEL: Record<PriceUnit, string> = {
  night: "por noche",
  person: "por persona",
  trip: "por trayecto",
  day: "por día",
  other: "",
};

export function priceUnitLabel(unit: PriceUnit) {
  return UNIT_LABEL[unit];
}

// URL pública de un archivo de Supabase Storage.
export function storageUrl(bucket: "listing-media" | "site-assets", path: string | null | undefined) {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`;
}

// Fotos de publicaciones (bucket "listing-media") y de la web: destinos, portada (bucket "site-assets").
export const mediaUrl = (path: string | null | undefined) => storageUrl("listing-media", path);
export const siteAssetUrl = (path: string | null | undefined) => storageUrl("site-assets", path);

export function whatsappLink(number: string, message?: string) {
  const digits = number.replace(/\D/g, "");
  const text = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${digits}${text}`;
}

export function externalUrl(value: string, base?: string) {
  if (/^https?:\/\//i.test(value)) return value;
  if (base) return `${base}${value.replace(/^@/, "")}`;
  return `https://${value}`;
}

// Devuelve el embed URL de YouTube/Instagram, o null si no reconoce el formato.
export function videoEmbedUrl(url: string): { type: "youtube" | "instagram"; embedUrl: string } | null {
  // YouTube: watch?v=ID, youtu.be/ID, /embed/ID, /shorts/ID
  const yt = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/
  );
  if (yt) return { type: "youtube", embedUrl: `https://www.youtube.com/embed/${yt[1]}` };

  // Instagram posts/reels: instagram.com/p/CODE o /reel/CODE
  const ig = url.match(/instagram\.com\/(?:p|reel)\/([A-Za-z0-9_-]+)/);
  if (ig) return { type: "instagram", embedUrl: url };

  return null;
}
