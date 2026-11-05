export const instant = false;

import { redirect } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, PlusCircle, User, CreditCard, BarChart2 } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";

export default async function PrestadorLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  if (!user) redirect("/login");
  if (user.rol === "viajero") redirect("/prestador/onboarding");

  const nav = [
    { href: "/prestador", label: "Mis publicaciones", icon: LayoutDashboard },
    { href: "/prestador/publicaciones/nueva", label: "Nueva publicación", icon: PlusCircle },
    { href: "/prestador/perfil", label: "Mi perfil", icon: User },
    { href: "/prestador/estadisticas", label: "Estadísticas", icon: BarChart2 },
    { href: "/prestador/plan", label: "Mi plan", icon: CreditCard },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-navy">Portal del prestador</h1>
        <p className="text-sm text-navy/60">Hola, {user.nombre ?? user.email.split("@")[0]}</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
        <nav aria-label="Portal" className="space-y-1">
          {nav.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-navy hover:bg-surface"
            >
              <Icon size={18} className="shrink-0 text-turquoise" />
              {label}
            </Link>
          ))}
        </nav>
        <main>{children}</main>
      </div>
    </div>
  );
}
