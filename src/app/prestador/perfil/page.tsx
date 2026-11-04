import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/auth";
import { getMyProvider } from "@/lib/provider-data";
import { PerfilForm } from "./PerfilForm";

export const metadata: Metadata = { title: "Mi perfil de prestador" };

export default async function PerfilPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const provider = await getMyProvider();
  if (!provider) redirect("/prestador/onboarding");

  return (
    <div className="max-w-2xl">
      <h2 className="mb-5 text-xl font-bold text-navy">Mi perfil de prestador</h2>
      <PerfilForm provider={provider} />
    </div>
  );
}
