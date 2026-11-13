"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, PlusCircle, User, CreditCard, BarChart2 } from "lucide-react";

const NAV = [
  { href: "/prestador",                         label: "Mis publicaciones",  icon: LayoutDashboard },
  { href: "/prestador/publicaciones/nueva",     label: "Nueva publicación",  icon: PlusCircle },
  { href: "/prestador/perfil",                  label: "Mi perfil",          icon: User },
  { href: "/prestador/estadisticas",            label: "Estadísticas",       icon: BarChart2 },
  { href: "/prestador/plan",                    label: "Mi plan",            icon: CreditCard },
];

export function PrestadorNav() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop sidebar */}
      <nav aria-label="Portal del prestador" className="hidden lg:block space-y-1">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== "/prestador" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${
                active
                  ? "bg-navy text-white"
                  : "text-navy hover:bg-surface"
              }`}
            >
              <Icon size={18} className={`shrink-0 ${active ? "text-orange" : "text-turquoise"}`} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Mobile horizontal tabs */}
      <nav
        aria-label="Portal del prestador (móvil)"
        className="lg:hidden -mx-4 flex gap-1 overflow-x-auto border-b border-border-soft bg-white px-4 pb-0"
      >
        {NAV.map(({ href, label }) => {
          const active = pathname === href || (href !== "/prestador" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={`shrink-0 border-b-2 px-3 py-3 text-xs font-semibold whitespace-nowrap transition-colors ${
                active
                  ? "border-navy text-navy"
                  : "border-transparent text-navy/50 hover:text-navy"
              }`}
            >
              {label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
