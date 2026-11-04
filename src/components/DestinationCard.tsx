import Image from "next/image";
import Link from "next/link";
import { siteAssetUrl } from "@/lib/format";
import type { Destination } from "@/lib/types";

export function DestinationCard({ destination: d }: { destination: Destination }) {
  return (
    <Link
      href={`/destinos/${d.slug}`}
      className="group relative flex aspect-[4/5] flex-col justify-end overflow-hidden rounded-card bg-gradient-to-br from-turquoise to-navy p-4 text-white"
    >
      {siteAssetUrl(d.photo_url) && (
        <Image
          src={siteAssetUrl(d.photo_url)!}
          alt=""
          fill
          sizes="(min-width: 768px) 25vw, 50vw"
          className="object-cover transition duration-300 group-hover:scale-105"
        />
      )}
      <span className="absolute inset-0 bg-gradient-to-t from-navy/80 via-navy/10 to-transparent" aria-hidden />
      <span className="relative text-lg font-bold">{d.name}</span>
      <span className="relative text-sm text-white/85">{d.province}</span>
    </Link>
  );
}
