"use client";

import { useTransition } from "react";
import { setUserRole } from "@/app/actions/admin";

export function ChangeRoleForm({ userId, currentRole }: { userId: string; currentRole: string }) {
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const role = data.get("role") as string;
    startTransition(() => { setUserRole(userId, role); });
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <select
        name="role"
        defaultValue={currentRole}
        className="rounded-lg border border-border-soft bg-white px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-turquoise"
      >
        <option value="traveler">Viajero</option>
        <option value="provider">Prestador</option>
        <option value="admin">Admin</option>
      </select>
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg border border-border-soft bg-surface px-2.5 py-1 text-xs font-semibold text-navy hover:bg-border-soft disabled:opacity-50"
      >
        Guardar
      </button>
    </form>
  );
}
