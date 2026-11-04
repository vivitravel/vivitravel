export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center gap-6 px-6 py-24">
      <p className="text-sm font-medium tracking-[0.3em] text-turquoise">VIVÍ MÁS DESTINOS</p>
      <h1 className="text-4xl font-extrabold">Vivitravels</h1>
      <p className="text-muted">
        Proyecto base en construcción. Esta pantalla es solo un placeholder para verificar los
        colores y la tipografía de marca.
      </p>
      <div className="flex flex-wrap gap-3">
        <a className="btn btn-primary" href="#">Botón principal</a>
        <a className="btn btn-secondary" href="#">Botón secundario</a>
        <a className="btn btn-ghost" href="#">Botón de contorno</a>
      </div>
    </main>
  );
}
