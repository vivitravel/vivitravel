"use client";

import { useActionState } from "react";
import { upsertProvider } from "@/app/actions/provider";
import type { Provider } from "@/lib/provider-data";

const input =
  "w-full rounded-xl border border-border-soft bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-turquoise";
const label = "block space-y-1";
const labelText = "text-sm font-semibold text-navy";

export function PerfilForm({ provider, isOnboarding }: { provider?: Provider; isOnboarding?: boolean }) {
  const [error, action, pending] = useActionState(upsertProvider, null);

  return (
    <form action={action} className="space-y-5 rounded-card border border-border-soft bg-white p-6">
      {error && (
        <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <div className={`${label} sm:col-span-2`}>
          <span className={labelText}>Nombre del negocio *</span>
          <input name="business_name" required className={input} defaultValue={provider?.business_name ?? ""} placeholder="Ej: Cabaña Los Pinos" />
        </div>

        <div className={`${label} sm:col-span-2`}>
          <span className={labelText}>Descripción</span>
          <textarea name="description" rows={3} className={input} defaultValue={provider?.description ?? ""} placeholder="Contá brevemente qué ofrecés..." />
        </div>

        <div className={label}>
          <span className={labelText}>Provincia</span>
          <input name="province" className={input} defaultValue={provider?.province ?? ""} placeholder="Ej: Neuquén" />
        </div>

        <div className={label}>
          <span className={labelText}>Localidad</span>
          <input name="locality" className={input} defaultValue={provider?.locality ?? ""} placeholder="Ej: San Martín de los Andes" />
        </div>
      </div>

      <hr className="border-border-soft" />
      <p className="text-sm font-bold text-navy">Datos de contacto</p>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className={label}>
          <span className={labelText}>WhatsApp</span>
          <input name="whatsapp" className={input} defaultValue={provider?.whatsapp ?? ""} placeholder="+54 9 299 000 0000" />
        </div>
        <div className={label}>
          <span className={labelText}>Teléfono</span>
          <input name="phone" className={input} defaultValue={provider?.phone ?? ""} placeholder="+54 299 000 0000" />
        </div>
        <div className={label}>
          <span className={labelText}>Instagram</span>
          <input name="instagram" className={input} defaultValue={provider?.instagram ?? ""} placeholder="@tunegocio" />
        </div>
        <div className={label}>
          <span className={labelText}>Facebook</span>
          <input name="facebook" className={input} defaultValue={provider?.facebook ?? ""} placeholder="fb.com/tunegocio" />
        </div>
        <div className={label}>
          <span className={labelText}>Sitio web</span>
          <input name="website" className={input} defaultValue={provider?.website ?? ""} placeholder="https://..." />
        </div>
        <div className={label}>
          <span className={labelText}>Email de contacto</span>
          <input name="email" type="email" className={input} defaultValue={provider?.email ?? ""} placeholder="contacto@tunegocio.com" />
        </div>
      </div>

      <button type="submit" disabled={pending} className="btn-secondary w-full rounded-xl py-3 text-sm font-bold disabled:opacity-60">
        {pending ? "Guardando…" : isOnboarding ? "Crear perfil y continuar" : "Guardar cambios"}
      </button>
    </form>
  );
}
