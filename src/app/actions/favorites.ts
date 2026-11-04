"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function toggleFavorite(listingId: string): Promise<{ favorited: boolean } | { error: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "login_required" };

  const { data: existing } = await supabase
    .from("favorites")
    .select("id")
    .eq("user_id", user.id)
    .eq("listing_id", listingId)
    .maybeSingle();

  if (existing) {
    await supabase.from("favorites").delete().eq("id", existing.id);
    revalidatePath("/viajero/favoritos");
    return { favorited: false };
  } else {
    await supabase.from("favorites").insert({ user_id: user.id, listing_id: listingId });
    revalidatePath("/viajero/favoritos");
    return { favorited: true };
  }
}
