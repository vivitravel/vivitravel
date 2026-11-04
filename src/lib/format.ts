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

// URL pública de una foto guardada en Supabase Storage (bucket "listing-media").
export function mediaUrl(path: string | null | undefined) {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/listing-media/${path}`;
}

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
