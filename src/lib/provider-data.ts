import "server-only";
import { createClient } from "@/lib/supabase/server";

export type Provider = {
  id: string;
  owner_id: string;
  business_name: string;
  description: string | null;
  province: string | null;
  locality: string | null;
  whatsapp: string | null;
  instagram: string | null;
  facebook: string | null;
  website: string | null;
  email: string | null;
  phone: string | null;
  approved: boolean;
};

export type ProviderListing = {
  id: string;
  slug: string;
  title: string;
  status: string;
  price_from: number;
  created_at: string;
  category: { name: string; slug: string } | null;
};

export type ProviderListingDetail = {
  id: string;
  title: string;
  slug: string;
  category_id: string;
  description: string | null;
  province: string;
  locality: string;
  price_from: number;
  price_unit: string;
  status: string;
  whatsapp: string | null;
  instagram: string | null;
  facebook: string | null;
  website: string | null;
  email: string | null;
  phone: string | null;
  attrValues: Record<string, unknown>;
  media: { id: string; storage_path: string; sort_order: number }[];
};

export async function getMyProvider(): Promise<Provider | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from("providers")
    .select("*")
    .eq("owner_id", user.id)
    .maybeSingle();
  return data as Provider | null;
}

export async function getMyListings(providerId: string): Promise<ProviderListing[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("listings")
    .select("id, slug, title, status, price_from, created_at, categories(name, slug)")
    .eq("provider_id", providerId)
    .order("created_at", { ascending: false });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data ?? []).map((row: any) => ({
    id: row.id,
    slug: row.slug,
    title: row.title,
    status: row.status,
    price_from: Number(row.price_from),
    created_at: row.created_at,
    category: row.categories ?? null,
  }));
}

export async function getMyListingById(listingId: string, providerId: string): Promise<ProviderListingDetail | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("listings")
    .select("id, title, slug, category_id, description, province, locality, price_from, price_unit, status, whatsapp, instagram, facebook, website, email, phone, listing_attribute_values(attribute_id, value, attributes(key)), listing_media(id, storage_path, sort_order)")
    .eq("id", listingId)
    .eq("provider_id", providerId)
    .maybeSingle();
  if (!data) return null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const row = data as any;
  const attrValues: Record<string, unknown> = {};
  for (const av of row.listing_attribute_values ?? []) {
    if (av.attributes?.key) attrValues[av.attributes.key] = av.value;
  }
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    category_id: row.category_id,
    description: row.description,
    province: row.province,
    locality: row.locality,
    price_from: Number(row.price_from),
    price_unit: row.price_unit,
    status: row.status,
    whatsapp: row.whatsapp,
    instagram: row.instagram,
    facebook: row.facebook,
    website: row.website,
    email: row.email,
    phone: row.phone,
    attrValues,
    media: (row.listing_media ?? []).sort((a: any, b: any) => a.sort_order - b.sort_order),
  };
}
