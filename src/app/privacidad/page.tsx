import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de privacidad",
  description: "Política de privacidad de Vivitravels.",
  robots: { index: false },
};

export default function PrivacidadPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-14 prose prose-navy">
      <h1>Política de privacidad</h1>
      <p className="text-muted text-sm">Última actualización: próximamente</p>

      <p>
        La política de privacidad de <strong>Vivitravels</strong> se encuentra en elaboración.
        Si tenés consultas sobre el tratamiento de tus datos, escribinos a <a href="mailto:vivitravelsmail@gmail.com">vivitravelsmail@gmail.com</a>.
      </p>
    </main>
  );
}
