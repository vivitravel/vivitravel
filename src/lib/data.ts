import { cacheLife } from "next/cache";
import { createPublicClient } from "./supabase/public";
import type {
  AttributeDef,
  Category,
  Destination,
  ListingCardData,
  ListingDetail,
  Plan,
  SearchFilters,
  Tag,
} from "./types";

/* Lecturas públicas del catálogo. Usan el cliente anónimo: la seguridad la da RLS. */

const CARD_COLUMNS =
  "id, slug, title, locality, province, price_from, price_unit, featured";

type MediaRow = { storage_path: string; is_cover: boolean; sort_order: number };

function pickCover(media: MediaRow[] | null | undefined) {
  if (!media?.length) return null;
  const sorted = [...media].sort(
    (a, b) => Number(b.is_cover) - Number(a.is_cover) || a.sort_order - b.sort_order,
  );
  return sorted[0].storage_path;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toCard(row: any): ListingCardData {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    locality: row.locality,
    province: row.province,
    price_from: Number(row.price_from),
    price_unit: row.price_unit,
    featured: row.featured,
    category: row.categories ?? null,
    destination: row.destinations ?? null,
    cover: pickCover(row.listing_media),
  };
}

export async function getDestinations(featuredOnly = false): Promise<Destination[]> {
  "use cache";
  cacheLife("hours");
  const db = createPublicClient();
  let query = db.from("destinations").select("*").order("sort_order");
  if (featuredOnly) query = query.eq("featured", true);
  const { data } = await query;
  return (data ?? []) as Destination[];
}

export async function getDestinationBySlug(slug: string): Promise<Destination | null> {
  "use cache";
  cacheLife("hours");
  const db = createPublicClient();
  const { data } = await db.from("destinations").select("*").eq("slug", slug).maybeSingle();
  return (data as Destination) ?? null;
}

export type SiteSettings = { hero_image: string; hero_title: string; hero_subtitle: string };

// Textos e imágenes editables desde el panel de administración.
export async function getSiteSettings(): Promise<SiteSettings> {
  "use cache";
  cacheLife("minutes");
  const db = createPublicClient();
  const { data } = await db.from("site_settings").select("key, value");
  const map = Object.fromEntries((data ?? []).map((r) => [r.key, r.value]));
  return {
    hero_image: map.hero_image || "hero/portada.jpg",
    hero_title: map.hero_title || "Descubrí. Explorá. Viví.",
    hero_subtitle:
      map.hero_subtitle ||
      "Todos los destinos, en un solo lugar. Encontrá propuestas de toda la Argentina y contactá directo con los prestadores.",
  };
}

export async function getCategories(): Promise<Category[]> {
  "use cache";
  cacheLife("hours");
  const db = createPublicClient();
  const { data } = await db.from("categories").select("*").order("sort_order");
  return (data ?? []) as Category[];
}

export async function getCategoryAttributes(categorySlug: string): Promise<AttributeDef[]> {
  "use cache";
  cacheLife("hours");
  const db = createPublicClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await db
    .from("attributes")
    .select("id, key, label, type, options, sort_order, categories!inner(slug)")
    .eq("categories.slug", categorySlug)
    .eq("filterable", true)
    .order("sort_order");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data ?? []).map((a: any) => ({
    id: a.id,
    key: a.key,
    label: a.label,
    type: a.type as AttributeDef["type"],
    options: Array.isArray(a.options) ? a.options : null,
    sort_order: a.sort_order,
  }));
}

export async function getTags(): Promise<Tag[]> {
  "use cache";
  cacheLife("hours");
  const db = createPublicClient();
  const { data } = await db.from("tags").select("id, name, slug").order("sort_order");
  return (data ?? []) as Tag[];
}

export async function getFeaturedListings(limit = 8): Promise<ListingCardData[]> {
  "use cache";
  cacheLife("minutes");
  const db = createPublicClient();
  const { data } = await db
    .from("listings")
    .select(`${CARD_COLUMNS}, categories(name, slug), destinations(name, slug), listing_media(storage_path, is_cover, sort_order)`)
    .eq("status", "published")
    .order("featured", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data ?? []).map(toCard);
}

export async function searchListings(filters: SearchFilters): Promise<ListingCardData[]> {
  "use cache";
  cacheLife("minutes");
  const db = createPublicClient();

  const destJoin = filters.destino ? "destinations!inner(name, slug)" : "destinations(name, slug)";
  const catJoin = filters.categoria ? "categories!inner(name, slug)" : "categories(name, slug)";
  const tagJoin = filters.tema ? ", listing_tags!inner(tags!inner(slug))" : "";

  let query = db
    .from("listings")
    .select(
      `${CARD_COLUMNS}, ${catJoin}, ${destJoin}, listing_media(storage_path, is_cover, sort_order)${tagJoin}`,
    )
    .eq("status", "published");

  if (filters.destino) query = query.eq("destinations.slug", filters.destino);
  if (filters.categoria) query = query.eq("categories.slug", filters.categoria);
  if (filters.tema) query = query.eq("listing_tags.tags.slug", filters.tema);
  if (filters.q) {
    const term = filters.q.replace(/[%,()]/g, " ").trim();
    if (term) query = query.or(`title.ilike.%${term}%,locality.ilike.%${term}%`);
  }
  if (filters.min !== undefined) query = query.gte("price_from", filters.min);
  if (filters.max !== undefined) query = query.lte("price_from", filters.max);

  if (filters.attrs) {
    for (const [key, rawVal] of Object.entries(filters.attrs)) {
      const vals = (Array.isArray(rawVal) ? rawVal : [rawVal]).filter(Boolean);
      if (!vals.length) continue;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: avRows } = await db
        .from("listing_attribute_values")
        .select("listing_id, value, attributes!inner(key)")
        .eq("attributes.key", key);

      if (!avRows) continue;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const matchingIds = avRows
        .filter((row: any) => {
          const v = row.value;
          if (Array.isArray(v)) return vals.some((val) => v.includes(val));
          return vals.includes(typeof v === "string" ? v : String(v));
        })
        .map((row: any) => row.listing_id as string);

      if (matchingIds.length === 0) return [];
      query = query.in("id", matchingIds);
    }
  }

  if (filters.orden === "precio_asc") query = query.order("price_from", { ascending: true });
  else if (filters.orden === "precio_desc") query = query.order("price_from", { ascending: false });
  else query = query.order("featured", { ascending: false }).order("created_at", { ascending: false });

  const { data } = await query.limit(60);
  return (data ?? []).map(toCard);
}

export async function getListingBySlug(slug: string): Promise<ListingDetail | null> {
  "use cache";
  cacheLife("minutes");
  const db = createPublicClient();
  const { data } = await db
    .from("listings")
    .select(
      `${CARD_COLUMNS}, description, address, lat, lng, video_url,
       categories(name, slug), destinations(name, slug),
       providers(business_name, whatsapp, instagram, facebook, website, email, phone),
       listing_media(storage_path, alt_text, is_cover, sort_order),
       listing_attribute_values(value, attributes(label, icon, sort_order))`,
    )
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (!data) return null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const row: any = data;
  const media = [...(row.listing_media ?? [])].sort(
    (a: MediaRow, b: MediaRow) => Number(b.is_cover) - Number(a.is_cover) || a.sort_order - b.sort_order,
  );
  const attributes = [...(row.listing_attribute_values ?? [])]
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .sort((a: any, b: any) => (a.attributes?.sort_order ?? 0) - (b.attributes?.sort_order ?? 0))
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((v: any) => ({ label: v.attributes?.label ?? "", icon: v.attributes?.icon ?? null, value: v.value }));

  return {
    ...toCard(row),
    description: row.description,
    address: row.address,
    lat: row.lat,
    lng: row.lng,
    video_url: row.video_url ?? null,
    provider: row.providers ?? null,
    media: media.map((m: { storage_path: string; alt_text: string | null }) => ({
      storage_path: m.storage_path,
      alt_text: m.alt_text,
    })),
    attributes,
  };
}

export async function getPlans(): Promise<Plan[]> {
  "use cache";
  cacheLife("hours");

  const supabase = createPublicClient();
  const { data } = await supabase
    .from("plans")
    .select("id, name, reference_price_ars, billing_period, max_listings, max_photos_per_listing, max_videos_per_listing, includes_featured, includes_advisory, includes_social, is_free, trial_days, sort_order")
    .eq("active", true)
    .order("sort_order");

  return (data ?? []) as Plan[];
}
