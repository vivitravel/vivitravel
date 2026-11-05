import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Términos y condiciones",
  description: "Términos y condiciones de uso de Vivitravels.",
  robots: { index: false },
};

export default function TerminosPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-14 prose prose-navy">
      <h1>Términos y condiciones de uso</h1>
      <p className="text-muted text-sm">Última actualización: próximamente</p>

      <p>
        Los términos y condiciones de uso de <strong>Vivitravels</strong> se encuentran en elaboración.
        Si tenés consultas, escribinos a <a href="mailto:vivitravelsmail@gmail.com">vivitravelsmail@gmail.com</a>.
      </p>
    </main>
  );
}
