"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");
  const { data: p } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (p?.role !== "admin") throw new Error("No autorizado");
  return user;
}

// ── Publicaciones ──────────────────────────────────────────────

export async function setListingStatus(listingId: string, status: string) {
  await requireAdmin();
  const supabase = createAdminClient();
  const { error } = await supabase.from("listings").update({ status }).eq("id", listingId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/publicaciones");
  revalidatePath("/admin");
}

export async function setListingFeatured(listingId: string, featured: boolean) {
  await requireAdmin();
  const supabase = createAdminClient();
  const { error } = await supabase.from("listings").update({ featured }).eq("id", listingId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/publicaciones");
}

export async function deleteListingAdmin(listingId: string) {
  await requireAdmin();
  const supabase = createAdminClient();
  const { error } = await supabase.from("listings").delete().eq("id", listingId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/publicaciones");
  revalidatePath("/admin");
}

export async function createEditorialListing(formData: FormData) {
  await requireAdmin();
  const supabase = createAdminClient();

  const categoryId = formData.get("category_id") as string;
  const destinationId = formData.get("destination_id") as string || null;
  const title = formData.get("title") as string;
  const province = formData.get("province") as string;
  const locality = formData.get("locality") as string;
  const description = formData.get("description") as string || null;
  const address = formData.get("address") as string || null;
  const lat = formData.get("lat") ? Number(formData.get("lat")) : null;
  const lng = formData.get("lng") ? Number(formData.get("lng")) : null;
  const official_url = formData.get("official_url") as string || null;
  const hours = formData.get("hours") as string || null;
  const how_to_get_there = formData.get("how_to_get_there") as string || null;
  const video_url = formData.get("video_url") as string || null;
  const status = formData.get("status") as string || "draft";

  const slug = title.toLowerCase()
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  const { data, error } = await supabase.from("listings").insert({
    is_editorial: true,
    category_id: categoryId,
    destination_id: destinationId,
    title,
    slug: `${slug}-${Date.now().toString(36)}`,
    province,
    locality,
    description,
    address,
    lat,
    lng,
    official_url,
    hours,
    how_to_get_there,
    video_url,
    status,
    provider_id: null,
    price_from: null,
    price_unit: null,
  }).select("id").single();

  if (error) throw new Error(error.message);
  redirect(`/admin/publicaciones`);
}

export async function updateListing(listingId: string, formData: FormData) {
  await requireAdmin();
  const supabase = createAdminClient();

  const fields: Record<string, unknown> = {};
  for (const key of ["title", "description", "address", "province", "locality", "official_url", "hours", "how_to_get_there", "status"]) {
    const v = formData.get(key);
    if (v !== null) fields[key] = v || null;
  }
  const lat = formData.get("lat");
  const lng = formData.get("lng");
  if (lat !== null) fields.lat = lat ? Number(lat) : null;
  if (lng !== null) fields.lng = lng ? Number(lng) : null;
  const categoryId = formData.get("category_id");
  if (categoryId) fields.category_id = categoryId;
  const destinationId = formData.get("destination_id");
  fields.destination_id = destinationId || null;
  const priceFrom = formData.get("price_from");
  if (priceFrom !== null) fields.price_from = priceFrom ? Number(priceFrom) : null;
  const priceUnit = formData.get("price_unit");
  if (priceUnit !== null) fields.price_unit = priceUnit || null;

  const { error } = await supabase.from("listings").update(fields).eq("id", listingId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/publicaciones");
  redirect("/admin/publicaciones");
}

// ── Prestadores ────────────────────────────────────────────────

export async function approveProvider(providerId: string) {
  await requireAdmin();
  const supabase = createAdminClient();
  const { error } = await supabase.from("providers").update({ approved: true }).eq("id", providerId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/prestadores");
  revalidatePath("/admin");
}

export async function activateSubscription(subscriptionId: string, months: number) {
  await requireAdmin();
  const supabase = createAdminClient();
  const expiresAt = new Date();
  expiresAt.setMonth(expiresAt.getMonth() + months);
  const { error } = await supabase.from("subscriptions").update({
    status: "active",
    starts_at: new Date().toISOString(),
    expires_at: expiresAt.toISOString(),
  }).eq("id", subscriptionId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/prestadores");
}

// ── Destinos ───────────────────────────────────────────────────

export async function upsertDestination(formData: FormData) {
  await requireAdmin();
  const supabase = createAdminClient();
  const id = formData.get("id") as string | null;
  const name = formData.get("name") as string;
  const province = formData.get("province") as string;
  const featured = formData.get("featured") === "true";
  const sort_order = Number(formData.get("sort_order") ?? 0);
  const slug = name.toLowerCase()
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  if (id) {
    const { error } = await supabase.from("destinations").update({ name, province, featured, sort_order }).eq("id", id);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase.from("destinations").insert({ name, province, slug, featured, sort_order });
    if (error) throw new Error(error.message);
  }
  revalidatePath("/admin/destinos");
  revalidatePath("/");
}

export async function deleteDestination(id: string) {
  await requireAdmin();
  const supabase = createAdminClient();
  const { error } = await supabase.from("destinations").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/destinos");
  revalidatePath("/");
}

// ── Categorías ─────────────────────────────────────────────────

export async function upsertCategory(formData: FormData) {
  await requireAdmin();
  const supabase = createAdminClient();
  const id = formData.get("id") as string | null;
  const name = formData.get("name") as string;
  const icon = formData.get("icon") as string | null;
  const sort_order = Number(formData.get("sort_order") ?? 0);
  const slug = name.toLowerCase()
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  if (id) {
    const { error } = await supabase.from("categories").update({ name, icon, sort_order }).eq("id", id);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase.from("categories").insert({ name, slug, icon, sort_order });
    if (error) throw new Error(error.message);
  }
  revalidatePath("/admin/categorias");
  revalidatePath("/");
}

export async function deleteCategory(id: string) {
  await requireAdmin();
  const supabase = createAdminClient();
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/categorias");
  revalidatePath("/");
}

// ── Usuarios ───────────────────────────────────────────────────

export async function setUserRole(userId: string, role: string) {
  await requireAdmin();
  const supabase = createAdminClient();
  const { error } = await supabase.from("profiles").update({ role }).eq("id", userId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/usuarios");
}
