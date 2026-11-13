"use client";

import { useEffect, useRef } from "react";

type Props = {
  lat: number;
  lng: number;
  title?: string;
  className?: string;
};

export function MapboxMap({ lat, lng, title, className = "h-64 w-full rounded-card" }: Props) {
  const container = useRef<HTMLDivElement>(null);
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  useEffect(() => {
    if (!container.current || !token) return;

    let map: mapboxgl.Map;
    import("mapbox-gl").then((mapboxgl) => {
      import("mapbox-gl/dist/mapbox-gl.css");
      mapboxgl.default.accessToken = token;
      map = new mapboxgl.default.Map({
        container: container.current!,
        style: "mapbox://styles/mapbox/outdoors-v12",
        center: [lng, lat],
        zoom: 13,
        attributionControl: false,
      });
      map.addControl(new mapboxgl.default.AttributionControl({ compact: true }));
      new mapboxgl.default.Marker({ color: "#087F9D" })
        .setLngLat([lng, lat])
        .setPopup(title ? new mapboxgl.default.Popup({ offset: 25 }).setText(title) : undefined)
        .addTo(map);
    });

    return () => { map?.remove(); };
  }, [lat, lng, title, token]);

  if (!token) return null;

  return <div ref={container} className={className} />;
}
