import Image from "next/image";
import Link from "next/link";

// Logo oficial (SVG recortado de "Logo Web"). La versión blanca va sobre fondos azules.
export function Logo({ light = false, height = 64 }: { light?: boolean; height?: number }) {
  const width = Math.round((height * 1397) / 1203);
  return (
    <Link href="/" aria-label="Vivitravels, inicio" className="inline-flex shrink-0">
      <Image
        src={light ? "/brand/logo-white.svg" : "/brand/logo-color.svg"}
        alt="Vivitravels, viví más destinos"
        width={width}
        height={height}
        priority
      />
    </Link>
  );
}
