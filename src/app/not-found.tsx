import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex max-w-xl flex-col items-center gap-4 px-4 py-24 text-center">
      <h1 className="text-4xl font-bold">No encontramos esa página</h1>
      <p className="text-muted">Puede que la propuesta ya no esté publicada o que el enlace sea incorrecto.</p>
      <Link href="/" className="btn btn-primary">Volver al inicio</Link>
    </main>
  );
}
