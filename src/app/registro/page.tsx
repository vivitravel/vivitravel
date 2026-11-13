export const instant = false;

import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { MapPin, Compass } from "lucide-react";
import { RegistroForm } from "./RegistroForm";

export const metadata: Metadata = { title: "Creá tu cuenta" };

type Props = { searchParams: Promise<{ tipo?: string }> };

export default async function RegistroPage({ searchParams }: Props) {
  const { tipo } = await searchParams;

  // Sin tipo → página de elección
  if (!tipo) {
    return (
      <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-16">
        <div className="w-full max-w-2xl">
          <h1 className="mb-2 text-center text-3xl font-bold text-navy">
            ¿Cómo querés registrarte?
          </h1>
          <p className="mb-10 text-center text-sm text-navy/60">
            ¿Ya tenés cuenta?{" "}
            <Link href="/login" className="font-semibold text-turquoise hover:underline">
              Iniciá sesión
            </Link>
          </p>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {/* Viajero */}
            <div className="flex flex-col rounded-2xl border border-border-soft bg-white p-8 shadow-sm">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-turquoise/10 text-turquoise">
                <Compass size={24} />
              </div>
              <h2 className="mb-2 text-xl font-bold text-navy">Soy viajero</h2>
              <p className="mb-6 flex-1 text-sm text-navy/60">
                Guardá tus destinos favoritos, armá tu ruta y descubrí nuevas propuestas en toda Argentina.
              </p>
              <Link
                href="/registro?tipo=viajero"
                className="block rounded-xl border border-turquoise py-3 text-center text-sm font-bold text-turquoise transition-colors hover:bg-turquoise hover:text-white"
              >
                Registrarme como viajero
              </Link>
            </div>

            {/* Prestador */}
            <div className="flex flex-col rounded-2xl border-2 border-navy bg-navy p-8 shadow-xl">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-orange">
                <MapPin size={24} />
              </div>
              <h2 className="mb-2 text-xl font-bold text-white">Soy prestador</h2>
              <p className="mb-6 flex-1 text-sm text-white/70">
                Publicá tu negocio turístico, llegá a miles de viajeros y recibí consultas directo por WhatsApp o mail.
              </p>
              <Link
                href="/registro?tipo=prestador"
                className="block rounded-xl bg-orange py-3 text-center text-sm font-bold text-navy transition-opacity hover:opacity-90"
              >
                Publicar mi negocio
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // Con tipo → formulario
  const esPrestador = tipo === "prestador";

  return (
    <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm">
        <Link
          href="/registro"
          className="mb-6 inline-flex items-center gap-1 text-sm text-navy/50 hover:text-navy"
        >
          ← Volver
        </Link>
        <h1 className="mb-2 text-2xl font-bold text-navy">
          {esPrestador ? "Publicá tu negocio" : "Creá tu cuenta"}
        </h1>
        <p className="mb-8 text-sm text-navy/60">
          {esPrestador
            ? "Registrate y completá los datos de tu negocio para empezar a publicar."
            : "Guardá favoritos, armá rutas y descubrí destinos en toda Argentina."}
        </p>

        <Suspense>
          <RegistroForm />
        </Suspense>

        <p className="mt-4 text-center text-xs text-navy/50">
          ¿Ya tenés cuenta?{" "}
          <Link href="/login" className="text-turquoise hover:underline">
            Iniciá sesión
          </Link>
        </p>
      </div>
    </main>
  );
}
