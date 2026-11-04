import { redirect, notFound } from "next/navigation";
import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/auth";
import { getMyProvider, getMyListingById } from "@/lib/provider-data";
import { getCategories } from "@/lib/data";
import { PublicacionForm } from "../../PublicacionForm";

export const metadata: Metadata = { title: "Editar publicación | Portal del prestador" };

export default async function EditarPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const provider = await getMyProvider();
  if (!provider) redirect("/prestador/onboarding");

  const [listing, categories] = await Promise.all([
    getMyListingById(id, provider.id),
    getCategories(),
  ]);

  if (!listing) notFound();

  const initial = {
    id: listing.id,
    title: listing.title,
    category_id: listing.category_id,
    description: listing.description,
    province: listing.province,
    locality: listing.locality,
    price_from: listing.price_from,
    price_unit: listing.price_unit,
    whatsapp: listing.whatsapp,
    instagram: listing.instagram,
    facebook: listing.facebook,
    website: listing.website,
    email: listing.email,
    phone: listing.phone,
    attrValues: listing.attrValues,
    mediaPaths: listing.media.map((m) => m.storage_path),
  };

  return (
    <div className="max-w-2xl">
      <h2 className="mb-5 text-xl font-bold text-navy">Editar publicación</h2>
      <PublicacionForm categories={categories} providerId={provider.id} initial={initial} />
    </div>
  );
}
