import Link from "next/link";

// Wordmark provisorio con la tipografía de marca. Reemplazar por el SVG oficial (Logo Web) al integrarlo.
export function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link href="/" aria-label="Vivitravels, inicio" className="inline-flex flex-col leading-none">
      <span className="text-2xl font-extrabold tracking-tight">
        <span className={light ? "text-white" : "text-navy"}>Vivi</span>
        <span className={light ? "text-sky" : "text-turquoise"}>travels</span>
      </span>
      <span
        className={`mt-1 text-[0.6rem] font-medium tracking-[0.3em] ${light ? "text-white/80" : "text-navy/70"}`}
      >
        VIVÍ MÁS DESTINOS
      </span>
    </Link>
  );
}
