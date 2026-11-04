import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Iniciá sesión" };

export default function LoginPage() {
  return (
    <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm">
        <h1 className="mb-2 text-2xl font-bold text-navy">Iniciá sesión</h1>
        <p className="mb-8 text-sm text-navy/60">
          ¿No tenés cuenta?{" "}
          <Link href="/registro" className="font-semibold text-turquoise hover:underline">
            Registrate gratis
          </Link>
        </p>

        <LoginForm />

        <p className="mt-6 text-center text-xs text-navy/50">
          ¿Olvidaste tu contraseña?{" "}
          <Link href="/recuperar-contrasena" className="text-turquoise hover:underline">
            Recuperala acá
          </Link>
        </p>
      </div>
    </main>
  );
}
