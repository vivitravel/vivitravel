import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/auth";
import { getMyProvider } from "@/lib/provider-data";
import { PerfilForm } from "../perfil/PerfilForm";

export const metadata: Metadata = { title: "Publicá tu negocio en Vivitravels" };

export default async function OnboardingPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  // Si ya tiene provider, ir al portal
  const provider = await getMyProvider();
  if (provider) redirect("/prestador");

  return (
    <main className="mx-auto max-w-xl px-4 py-12">
      <div className="mb-8 text-center">
        <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-turquoise/10 text-4xl">
          🏔️
        </div>
        <h1 className="mb-2 text-2xl font-bold text-navy">Publicá tu negocio</h1>
        <p className="text-sm text-navy/60">
          Completá los datos de tu negocio para empezar a publicar en Vivitravels.
        </p>
      </div>
      <PerfilForm isOnboarding />
    </main>
  );
}
