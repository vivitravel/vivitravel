"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

async function authedClient() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");
  return { supabase, userId: user.id };
}

export async function createTrip(title: string): Promise<string> {
  const { supabase, userId } = await authedClient();
  const { data, error } = await supabase
    .from("trips")
    .insert({ title: title.trim() || "Mi ruta", user_id: userId })
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  revalidatePath("/viajero/mi-ruta");
  return data.id;
}

export async function renameTrip(tripId: string, title: string) {
  const { supabase } = await authedClient();
  await supabase.from("trips").update({ title: title.trim() || "Mi ruta" }).eq("id", tripId);
  revalidatePath("/viajero/mi-ruta");
  revalidatePath(`/viajero/mi-ruta/${tripId}`);
}

export async function deleteTrip(tripId: string) {
  const { supabase } = await authedClient();
  await supabase.from("trips").delete().eq("id", tripId);
  revalidatePath("/viajero/mi-ruta");
}

export async function toggleTripPublic(tripId: string, isPublic: boolean) {
  const { supabase } = await authedClient();
  await supabase.from("trips").update({ is_public: isPublic }).eq("id", tripId);
  revalidatePath(`/viajero/mi-ruta/${tripId}`);
}

export async function addToTrip(tripId: string, listingId: string, day: number) {
  const { supabase } = await authedClient();
  // Calculate next position in that day
  const { data: existing } = await supabase
    .from("trip_items")
    .select("position")
    .eq("trip_id", tripId)
    .eq("day", day)
    .order("position", { ascending: false })
    .limit(1);
  const position = existing?.[0]?.position != null ? existing[0].position + 1 : 0;
  const { error } = await supabase.from("trip_items").insert({ trip_id: tripId, listing_id: listingId, day, position });
  if (error) throw new Error(error.message);
  revalidatePath(`/viajero/mi-ruta/${tripId}`);
}

export async function removeFromTrip(itemId: string) {
  const { supabase } = await authedClient();
  await supabase.from("trip_items").delete().eq("id", itemId);
  revalidatePath("/viajero/mi-ruta", "layout");
}

export async function updateTripItem(itemId: string, fields: { time_note?: string; note?: string; day?: number }) {
  const { supabase } = await authedClient();
  await supabase.from("trip_items").update(fields).eq("id", itemId);
  revalidatePath("/viajero/mi-ruta", "layout");
}
