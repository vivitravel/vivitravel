import "server-only";
import { createClient } from "./supabase/server";

export async function getMyFavoriteIds(): Promise<Set<string>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Set();

  const { data } = await supabase
    .from("favorites")
    .select("listing_id")
    .eq("user_id", user.id);

  return new Set((data ?? []).map((r) => r.listing_id as string));
}

export async function getMyFavoriteListings() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("favorites")
    .select(`
      listing_id,
      listings (
        id, slug, title, locality, province, price_from, price_unit, featured,
        categories ( name, slug ),
        listing_media ( storage_path, is_cover, sort_order )
      )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data ?? []).map((r: any) => r.listings).filter(Boolean);
}
