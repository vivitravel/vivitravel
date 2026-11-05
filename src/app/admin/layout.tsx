export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, FileText, Building2, Users, MapPin, Tag, CreditCard } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";

const nav = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/publicaciones", label: "Publicaciones", icon: FileText },
  { href: "/admin/prestadores", label: "Prestadores", icon: Building2 },
  { href: "/admin/usuarios", label: "Usuarios", icon: Users },
  { href: "/admin/destinos", label: "Destinos", icon: MapPin },
  { href: "/admin/categorias", label: "Categorías", icon: Tag },
  { href: "/admin/planes", label: "Planes", icon: CreditCard },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user || user.rol !== "admin") redirect("/");

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-turquoise">Panel de administración</p>
          <h1 className="text-2xl font-bold text-navy">Vivitravels</h1>
        </div>
        <span className="text-sm text-muted">{user.nombre ?? user.email}</span>
      </div>
      <div className="grid gap-6 lg:grid-cols-[200px_1fr]">
        <nav aria-label="Admin" className="space-y-0.5">
          {nav.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-navy hover:bg-surface"
            >
              <Icon size={16} className="shrink-0 text-turquoise" aria-hidden />
              {label}
            </Link>
          ))}
        </nav>
        <main>{children}</main>
      </div>
    </div>
  );
}
