"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

type EventType =
  | "view"
  | "click_whatsapp"
  | "click_instagram"
  | "click_facebook"
  | "click_web"
  | "click_mail"
  | "click_phone"
  | "favorite"
  | "add_to_trip";

function sessionId() {
  const key = "vt_session";
  let id = sessionStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(key, id);
  }
  return id;
}

// Registra un evento de la publicación. Nunca bloquea la navegación ni rompe la página.
export function trackEvent(listingId: string, type: EventType) {
  try {
    const params = new URLSearchParams(window.location.search);
    void createClient()
      .from("events")
      .insert({
        listing_id: listingId,
        type,
        session_id: sessionId(),
        referrer: document.referrer || null,
        utm_source: params.get("utm_source"),
        utm_medium: params.get("utm_medium"),
        utm_campaign: params.get("utm_campaign"),
      })
      .then(() => undefined);
  } catch {
    /* ignorar */
  }
}

export function ViewTracker({ listingId }: { listingId: string }) {
  useEffect(() => {
    trackEvent(listingId, "view");
  }, [listingId]);
  return null;
}

export function TrackedLink({
  listingId,
  type,
  href,
  className,
  children,
}: {
  listingId: string;
  type: EventType;
  href: string;
  className?: string;
  children: React.ReactNode;
}) {
  const external = href.startsWith("http");
  return (
    <a
      href={href}
      className={className}
      onClick={() => trackEvent(listingId, type)}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {children}
    </a>
  );
}
