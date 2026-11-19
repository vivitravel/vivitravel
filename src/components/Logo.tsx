import Image from "next/image";
import Link from "next/link";

// Layout horizontal: ícono V a la izquierda, texto "ViviTravels / Viví más destinos" a la derecha.
export function Logo({ light = false, height = 64 }: { light?: boolean; height?: number }) {
  const iconWidth = height; // ícono con viewBox cuadrado "350 50 750 750"
  const textColor = light ? "text-white" : "text-[#092B4D]";
  const taglineColor = light ? "text-white/70" : "text-[#087F9D]";

  return (
    <Link href="/" aria-label="Vivitravels, inicio" className="inline-flex shrink-0 items-center gap-3">
      <Image
        src={light ? "/brand/logo-icon-white.svg" : "/brand/logo-icon.svg"}
        alt=""
        width={iconWidth}
        height={height}
        priority
      />
      <span className="flex flex-col leading-none">
        <span className={`font-extrabold tracking-tight ${textColor}`} style={{ fontSize: Math.round(height * 0.42) }}>
          ViviTravels
        </span>
        <span className={`font-medium ${taglineColor}`} style={{ fontSize: Math.round(height * 0.22) }}>
          Viví más destinos
        </span>
      </span>
    </Link>
  );
}
