"use client";

import { useEffect, useRef } from "react";

type Stop = {
  id: string;
  lat: number;
  lng: number;
  title: string;
  index: number; // 1-based
};

type Props = {
  stops: Stop[];
  className?: string;
};

export function TripMap({ stops, className = "h-72 w-full rounded-card overflow-hidden" }: Props) {
  const container = useRef<HTMLDivElement>(null);
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  useEffect(() => {
    if (!container.current || !token || stops.length === 0) return;

    let map: mapboxgl.Map;
    import("mapbox-gl").then((mapboxgl) => {
      import("mapbox-gl/dist/mapbox-gl.css");
      mapboxgl.default.accessToken = token;

      const lngs = stops.map((s) => s.lng);
      const lats = stops.map((s) => s.lat);
      const bounds: [[number, number], [number, number]] = [
        [Math.min(...lngs), Math.min(...lats)],
        [Math.max(...lngs), Math.max(...lats)],
      ];

      map = new mapboxgl.default.Map({
        container: container.current!,
        style: "mapbox://styles/mapbox/outdoors-v12",
        center: [stops[0].lng, stops[0].lat],
        zoom: 12,
        attributionControl: false,
      });
      map.addControl(new mapboxgl.default.AttributionControl({ compact: true }));

      map.on("load", () => {
        if (stops.length > 1) {
          map.fitBounds(bounds, { padding: 48, maxZoom: 14 });
        }
      });

      stops.forEach((stop) => {
        const el = document.createElement("div");
        el.className = "flex h-7 w-7 items-center justify-center rounded-full border-2 border-white text-xs font-bold text-white shadow-md";
        el.style.backgroundColor = "#087F9D";
        el.textContent = String(stop.index);

        new mapboxgl.default.Marker({ element: el })
          .setLngLat([stop.lng, stop.lat])
          .setPopup(new mapboxgl.default.Popup({ offset: 28 }).setText(stop.title))
          .addTo(map);
      });
    });

    return () => { map?.remove(); };
  }, [stops, token]);

  if (!token || stops.length === 0) return null;

  return <div ref={container} className={className} />;
}
