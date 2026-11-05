export const instant = false;

import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/auth";
import { getMyProvider } from "@/lib/provider-data";
import { getCategories } from "@/lib/data";
import { PublicacionForm } from "../PublicacionForm";

export const metadata: Metadata = { title: "Nueva publicación | Portal del prestador" };

export default async function NuevaPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const provider = await getMyProvider();
  if (!provider) redirect("/prestador/onboarding");

  const categories = await getCategories();

  return (
    <div className="max-w-2xl">
      <h2 className="mb-5 text-xl font-bold text-navy">Nueva publicación</h2>
      <PublicacionForm categories={categories} providerId={provider.id} />
    </div>
  );
}
