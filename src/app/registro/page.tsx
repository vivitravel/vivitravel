import type { Metadata } from "next";
import Link from "next/link";
import { RegistroForm } from "./RegistroForm";

export const metadata: Metadata = { title: "Creá tu cuenta" };

export default function RegistroPage() {
  return (
    <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm">
        <h1 className="mb-2 text-2xl font-bold text-navy">Creá tu cuenta</h1>
        <p className="mb-8 text-sm text-navy/60">
          ¿Ya tenés cuenta?{" "}
          <Link href="/login" className="font-semibold text-turquoise hover:underline">
            Iniciá sesión
          </Link>
        </p>

        <RegistroForm />

        <p className="mt-6 text-center text-xs text-navy/50">
          ¿Sos prestador?{" "}
          <Link href="/publicar" className="text-turquoise hover:underline">
            Publicá tu negocio
          </Link>
        </p>
      </div>
    </main>
  );
}
