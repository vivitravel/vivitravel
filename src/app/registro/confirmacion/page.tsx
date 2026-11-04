import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Confirmá tu email" };

export default function ConfirmacionPage() {
  return (
    <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm text-center">
        <div className="mb-6 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-surface text-4xl">
            ✉️
          </div>
        </div>
        <h1 className="mb-3 text-2xl font-bold text-navy">Chequeá tu email</h1>
        <p className="mb-8 text-sm text-navy/60">
          Te mandamos un link de confirmación. Hacé clic en él para activar tu cuenta y después iniciá sesión.
        </p>
        <Link
          href="/login"
          className="btn-primary inline-block rounded-lg px-6 py-2.5 text-sm font-semibold"
        >
          Ir al login
        </Link>
      </div>
    </main>
  );
}
