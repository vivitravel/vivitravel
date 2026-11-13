export const instant = false;

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { PrestadorNav } from "./PrestadorNav";

export default async function PrestadorLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  if (!user) redirect("/login");
  if (user.rol === "viajero") redirect("/prestador/onboarding");

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex items-center gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-navy">Portal del prestador</h1>
            <span className="rounded-full bg-turquoise/10 px-2.5 py-0.5 text-xs font-bold text-turquoise">
              Prestador
            </span>
          </div>
          <p className="text-sm text-navy/60">Hola, {user.nombre ?? user.email.split("@")[0]}</p>
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
        <PrestadorNav />
        <main>{children}</main>
      </div>
    </div>
  );
}
