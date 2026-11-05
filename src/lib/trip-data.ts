"use server";

import { createClient } from "@/lib/supabase/server";

export type TripSummary = {
  id: string;
  title: string;
  is_public: boolean;
  share_token: string;
  item_count: number;
  created_at: string;
};

export type TripItem = {
  id: string;
  day: number;
  position: number;
  time_note: string | null;
  note: string | null;
  listing: {
    id: string;
    title: string;
    slug: string;
    locality: string;
    province: string;
    cover: string | null;
    category: { name: string; slug: string } | null;
  };
};

export type TripDetail = {
  id: string;
  title: string;
  is_public: boolean;
  share_token: string;
  items: TripItem[];
};

export async function getMyTrips(): Promise<TripSummary[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data } = await supabase
    .from("trips")
    .select("id, title, is_public, share_token, created_at, trip_items(id)")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });
  return (data ?? []).map((t: any) => ({
    id: t.id,
    title: t.title,
    is_public: t.is_public,
    share_token: t.share_token,
    item_count: (t.trip_items ?? []).length,
    created_at: t.created_at,
  }));
}

export async function getTripById(tripId: string): Promise<TripDetail | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("trips")
    .select(`id, title, is_public, share_token,
      trip_items(id, day, position, time_note, note,
        listings(id, title, slug, locality, province,
          categories(name, slug),
          listing_media(storage_path, is_cover, sort_order)))`)
    .eq("id", tripId)
    .maybeSingle();
  if (!data) return null;
  const row: any = data;
  const items: TripItem[] = (row.trip_items ?? [])
    .sort((a: any, b: any) => a.day - b.day || a.position - b.position)
    .map((item: any) => {
      const l = item.listings;
      const media = [...(l?.listing_media ?? [])].sort(
        (a: any, b: any) => Number(b.is_cover) - Number(a.is_cover) || a.sort_order - b.sort_order,
      );
      return {
        id: item.id,
        day: item.day,
        position: item.position,
        time_note: item.time_note,
        note: item.note,
        listing: {
          id: l?.id,
          title: l?.title,
          slug: l?.slug,
          locality: l?.locality,
          province: l?.province,
          cover: media[0]?.storage_path ?? null,
          category: l?.categories ?? null,
        },
      };
    });
  return { id: row.id, title: row.title, is_public: row.is_public, share_token: row.share_token, items };
}

export async function getTripByToken(token: string): Promise<TripDetail | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("trips")
    .select(`id, title, is_public, share_token,
      trip_items(id, day, position, time_note, note,
        listings(id, title, slug, locality, province,
          categories(name, slug),
          listing_media(storage_path, is_cover, sort_order)))`)
    .eq("share_token", token)
    .eq("is_public", true)
    .maybeSingle();
  if (!data) return null;
  const row: any = data;
  const items: TripItem[] = (row.trip_items ?? [])
    .sort((a: any, b: any) => a.day - b.day || a.position - b.position)
    .map((item: any) => {
      const l = item.listings;
      const media = [...(l?.listing_media ?? [])].sort(
        (a: any, b: any) => Number(b.is_cover) - Number(a.is_cover) || a.sort_order - b.sort_order,
      );
      return {
        id: item.id,
        day: item.day,
        position: item.position,
        time_note: item.time_note,
        note: item.note,
        listing: {
          id: l?.id,
          title: l?.title,
          slug: l?.slug,
          locality: l?.locality,
          province: l?.province,
          cover: media[0]?.storage_path ?? null,
          category: l?.categories ?? null,
        },
      };
    });
  return { id: row.id, title: row.title, is_public: row.is_public, share_token: row.share_token, items };
}
