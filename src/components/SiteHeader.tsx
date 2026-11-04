import Link from "next/link";
import { Suspense } from "react";
import { Menu } from "lucide-react";
import { getCategories } from "@/lib/data";
import { Logo } from "./Logo";
import { AuthButtons } from "./AuthButtons";

export async function SiteHeader() {
  const categories = await getCategories();

  const links = [
    { href: "/destinos", label: "Destinos" },
    ...categories.map((c) => ({
      href: `/buscar?categoria=${c.slug}`,
      label: c.name === "Actividades y Experiencias" ? "Actividades" : c.name,
    })),
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-border-soft bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-4 py-3">
        <Logo />

        <nav aria-label="Principal" className="hidden items-center gap-6 text-sm font-semibold lg:flex">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="text-navy hover:text-turquoise">
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Suspense fallback={<div className="h-8 w-24 animate-pulse rounded-lg bg-surface" />}>
            <AuthButtons />
          </Suspense>

          <details className="relative lg:hidden">
          <summary
            aria-label="Abrir menú"
            className="flex h-10 w-10 cursor-pointer list-none items-center justify-center rounded-lg border border-border-soft"
          >
            <Menu size={20} />
          </summary>
          <nav
            aria-label="Principal (móvil)"
            className="absolute right-0 mt-2 flex w-56 flex-col rounded-xl border border-border-soft bg-white p-2 shadow-lg"
          >
            {links.map((l) => (
              <Link key={l.href} href={l.href} className="rounded-lg px-3 py-2 text-sm font-semibold hover:bg-surface">
                {l.label}
              </Link>
            ))}
          </nav>
        </details>
        </div>
      </div>
    </header>
  );
}
