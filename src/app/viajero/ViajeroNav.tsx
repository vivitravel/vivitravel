"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, Map } from "lucide-react";

const TABS = [
  { href: "/viajero/favoritos", label: "Mis favoritos", icon: Heart },
  { href: "/viajero/mi-ruta",   label: "Mis rutas",     icon: Map },
];

export function ViajeroNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Mi cuenta"
      className="-mx-4 flex border-b border-border-soft px-4"
    >
      {TABS.map(({ href, label, icon: Icon }) => {
        const active = pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${
              active
                ? "border-navy text-navy"
                : "border-transparent text-navy/50 hover:text-navy"
            }`}
          >
            <Icon size={15} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
