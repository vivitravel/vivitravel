"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Heart } from "lucide-react";
import { logout } from "@/app/actions/auth";
import type { CurrentUser } from "@/lib/auth";

export function UserMenu({ user }: { user: CurrentUser }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleLogout() {
    setOpen(false);
    startTransition(() => {
      logout();
    });
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-lg border border-border-soft px-3 py-1.5 text-sm font-semibold text-navy hover:bg-surface"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-turquoise text-xs font-bold text-white">
          {(user.nombre || user.email || "?")[0].toUpperCase()}
        </span>
        <span className="hidden sm:inline">{user.nombre || user.email.split("@")[0]}</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-50 mt-2 w-48 rounded-xl border border-border-soft bg-white p-1 shadow-lg">
            <Link
              href="/viajero/favoritos"
              onClick={() => setOpen(false)}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-navy hover:bg-surface"
            >
              <Heart size={14} /> Mis favoritos
            </Link>
            {user.rol === "prestador" || user.rol === "admin" ? (
              <Link
                href="/prestador"
                onClick={() => setOpen(false)}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-navy hover:bg-surface"
              >
                Portal del prestador
              </Link>
            ) : null}
            <div className="my-1 border-t border-border-soft" />
            <button
              type="button"
              onClick={handleLogout}
              disabled={pending}
              className="w-full rounded-lg px-3 py-2 text-left text-sm text-navy hover:bg-surface disabled:opacity-60"
            >
              {pending ? "Saliendo…" : "Cerrar sesión"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
