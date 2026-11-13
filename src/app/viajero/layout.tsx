export const instant = false;

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { ViajeroNav } from "./ViajeroNav";

export default async function ViajeroLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  if (!user) redirect("/login");
  if (user.rol === "prestador" || user.rol === "admin") redirect("/prestador");

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-4 flex items-center gap-2">
        <h1 className="text-2xl font-bold text-navy">Mi cuenta</h1>
        <span className="rounded-full bg-navy/10 px-2.5 py-0.5 text-xs font-bold text-navy/60">
          Viajero
        </span>
      </div>
      <ViajeroNav />
      <main className="mt-6">{children}</main>
    </div>
  );
}
