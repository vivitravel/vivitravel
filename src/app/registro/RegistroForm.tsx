"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { registrar } from "@/app/actions/auth";

export function RegistroForm() {
  const searchParams = useSearchParams();
  const tipo = searchParams.get("tipo") === "prestador" ? "prestador" : "viajero";
  const [error, action, pending] = useActionState(registrar, null);

  const inputCls = "rounded-lg border border-border-soft bg-white px-4 py-2.5 text-sm text-navy outline-none focus:border-turquoise focus:ring-2 focus:ring-turquoise/20";

  return (
    <form action={action} className="flex flex-col gap-4">
      {error && (
        <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <input type="hidden" name="tipo" value={tipo} />

      <div className="flex flex-col gap-1.5">
        <label htmlFor="nombre" className="text-sm font-semibold text-navy">
          Tu nombre
        </label>
        <input
          id="nombre" name="nombre" type="text"
          autoComplete="given-name" required
          className={inputCls} placeholder="María"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-sm font-semibold text-navy">Email</label>
        <input
          id="email" name="email" type="email"
          autoComplete="email" required
          className={inputCls} placeholder="tu@email.com"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-sm font-semibold text-navy">Contraseña</label>
        <input
          id="password" name="password" type="password"
          autoComplete="new-password" required minLength={6}
          className={inputCls} placeholder="Mínimo 6 caracteres"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="confirmar" className="text-sm font-semibold text-navy">
          Confirmá la contraseña
        </label>
        <input
          id="confirmar" name="confirmar" type="password"
          autoComplete="new-password" required
          className={inputCls} placeholder="••••••••"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="btn-primary mt-2 rounded-lg px-4 py-2.5 text-sm font-semibold disabled:opacity-60"
      >
        {pending ? "Creando cuenta…" : tipo === "prestador" ? "Crear cuenta de prestador" : "Crear cuenta"}
      </button>
    </form>
  );
}
