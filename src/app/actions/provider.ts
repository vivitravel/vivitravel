"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function generateSlug(title: string): string {
  const base = title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 50);
  const suffix = Math.random().toString(36).slice(2, 7);
  return `${base}-${suffix}`;
}

export async function upsertProvider(prevState: string | null, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return "No estás autenticado.";

  const business_name = String(formData.get("business_name") ?? "").trim();
  if (!business_name) return "El nombre del negocio es obligatorio.";

  const fields = {
    business_name,
    description: String(formData.get("description") ?? "").trim() || null,
    province: String(formData.get("province") ?? "").trim() || null,
    locality: String(formData.get("locality") ?? "").trim() || null,
    whatsapp: String(formData.get("whatsapp") ?? "").trim() || null,
    instagram: String(formData.get("instagram") ?? "").trim() || null,
    facebook: String(formData.get("facebook") ?? "").trim() || null,
    website: String(formData.get("website") ?? "").trim() || null,
    email: String(formData.get("email") ?? "").trim() || null,
    phone: String(formData.get("phone") ?? "").trim() || null,
  };

  // Check if provider exists
  const { data: existing } = await supabase
    .from("providers")
    .select("id")
    .eq("owner_id", user.id)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase.from("providers").update(fields).eq("id", existing.id);
    if (error) return "No pudimos guardar los cambios. Intentá de nuevo.";
  } else {
    const { error: insertError } = await supabase
      .from("providers")
      .insert({ ...fields, owner_id: user.id });
    if (insertError) return "No pudimos crear tu perfil. Intentá de nuevo.";

    // Upgrade role traveler → provider (allowed by trigger once providers row exists)
    await supabase.from("profiles").update({ role: "provider" }).eq("id", user.id);
  }

  revalidatePath("/prestador", "layout");
  redirect("/prestador");
}

export async function saveListing(prevState: string | null, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return "No estás autenticado.";

  const { data: provider } = await supabase
    .from("providers")
    .select("id")
    .eq("owner_id", user.id)
    .maybeSingle();
  if (!provider) return "Primero completá tu perfil de prestador.";

  const listingId = String(formData.get("listing_id") ?? "").trim() || null;
  const title = String(formData.get("title") ?? "").trim();
  const category_id = String(formData.get("category_id") ?? "").trim();
  const province = String(formData.get("province") ?? "").trim();
  const locality = String(formData.get("locality") ?? "").trim();
  const price_from = Number(formData.get("price_from") ?? 0);

  if (!title) return "El título es obligatorio.";
  if (!category_id) return "Elegí una categoría.";
  if (!province || !locality) return "Provincia y localidad son obligatorias.";
  if (!price_from || price_from < 0) return "El precio es obligatorio.";

  const listingFields = {
    provider_id: provider.id,
    category_id,
    title,
    province,
    locality,
    description: String(formData.get("description") ?? "").trim() || null,
    price_from,
    price_unit: String(formData.get("price_unit") ?? "other"),
    whatsapp: String(formData.get("whatsapp") ?? "").trim() || null,
    instagram: String(formData.get("instagram") ?? "").trim() || null,
    facebook: String(formData.get("facebook") ?? "").trim() || null,
    website: String(formData.get("website") ?? "").trim() || null,
    email: String(formData.get("email") ?? "").trim() || null,
    phone: String(formData.get("phone") ?? "").trim() || null,
    video_url: String(formData.get("video_url") ?? "").trim() || null,
  };

  let savedListingId = listingId;

  if (listingId) {
    const { error } = await supabase
      .from("listings")
      .update(listingFields)
      .eq("id", listingId)
      .eq("provider_id", provider.id);
    if (error) return "No pudimos guardar la publicación. Intentá de nuevo.";
  } else {
    const slug = generateSlug(title);
    const { data: newListing, error } = await supabase
      .from("listings")
      .insert({ ...listingFields, slug, status: "draft" })
      .select("id")
      .single();
    if (error || !newListing) return "No pudimos crear la publicación. Intentá de nuevo.";
    savedListingId = newListing.id;
  }

  // Save attribute values: attr_[key] fields
  const attrEntries: { key: string; value: unknown }[] = [];
  for (const [k, v] of formData.entries()) {
    if (!k.startsWith("attr_")) continue;
    const key = k.slice(5);
    const existing = attrEntries.find((e) => e.key === key);
    if (existing) {
      existing.value = Array.isArray(existing.value)
        ? [...(existing.value as string[]), String(v)]
        : [String(existing.value), String(v)];
    } else {
      attrEntries.push({ key, value: String(v) });
    }
  }

  if (attrEntries.length && savedListingId) {
    // Get attribute ids for these keys
    const { data: attrDefs } = await supabase
      .from("attributes")
      .select("id, key")
      .in("key", attrEntries.map((e) => e.key));

    if (attrDefs?.length) {
      // Delete old values and re-insert
      await supabase
        .from("listing_attribute_values")
        .delete()
        .eq("listing_id", savedListingId)
        .in("attribute_id", attrDefs.map((a) => a.id));

      const toInsert = attrEntries
        .map((entry) => {
          const def = attrDefs.find((a) => a.key === entry.key);
          if (!def) return null;
          return { listing_id: savedListingId, attribute_id: def.id, value: entry.value };
        })
        .filter((x): x is { listing_id: string; attribute_id: string; value: unknown } => x !== null);

      if (toInsert.length) {
        await supabase.from("listing_attribute_values").insert(toInsert);
      }
    }
  }

  // Handle media paths passed from client upload
  const mediaPaths = formData.getAll("media_path").map(String).filter(Boolean);
  if (mediaPaths.length && savedListingId) {
    const mediaRows = mediaPaths.map((storage_path, i) => ({
      listing_id: savedListingId,
      storage_path,
      sort_order: i,
      is_cover: i === 0,
    }));
    await supabase.from("listing_media").insert(mediaRows);
  }

  // Set status to in_review when submitting
  const submit = String(formData.get("submit_action") ?? "");
  if (submit === "publicar" && savedListingId) {
    await supabase
      .from("listings")
      .update({ status: "in_review" })
      .eq("id", savedListingId)
      .eq("provider_id", provider.id);
  }

  revalidatePath("/prestador");
  redirect("/prestador");
}

export async function deleteListing(listingId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { data: provider } = await supabase
    .from("providers")
    .select("id")
    .eq("owner_id", user.id)
    .maybeSingle();
  if (!provider) return;

  await supabase
    .from("listings")
    .update({ status: "draft" })
    .eq("id", listingId)
    .eq("provider_id", provider.id);

  revalidatePath("/prestador");
}
