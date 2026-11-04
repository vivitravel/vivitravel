import Link from "next/link";
import { Logo } from "./Logo";

export function SiteFooter() {
  return (
    <footer className="mt-16 bg-navy text-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 md:grid-cols-3">
        <div className="space-y-3">
          <Logo light />
          <p className="text-sm text-white/80">El turismo nos une. Descubrí, explorá y viví.</p>
        </div>
        <div className="space-y-2 text-sm">
          <p className="font-bold">Explorá</p>
          <Link className="block text-white/80 hover:text-white" href="/destinos">Destinos</Link>
          <Link className="block text-white/80 hover:text-white" href="/buscar">Todas las propuestas</Link>
        </div>
        <div className="space-y-2 text-sm">
          <p className="font-bold">Importante</p>
          <p className="text-white/80">
            En Vivitravels no gestionamos reservas. Contactá directamente con el prestador.
          </p>
        </div>
      </div>
      <div className="border-t border-white/15 py-4 text-center text-xs tracking-[0.2em] text-white/70">
        DESTINOS · EXPERIENCIAS · PERSONAS · NEGOCIOS
      </div>
    </footer>
  );
}
