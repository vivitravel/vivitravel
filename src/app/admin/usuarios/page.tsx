import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import { ChangeRoleForm } from "./ChangeRoleForm";

export const metadata: Metadata = { title: "Usuarios — Admin" };

const ROLES: Record<string, string> = {
  traveler: "Viajero",
  provider: "Prestador",
  admin: "Admin",
};

async function getUsers() {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, full_name, role, created_at")
    .order("created_at", { ascending: false })
    .limit(200);
  return data ?? [];
}

export default async function UsuariosPage() {
  const users = await getUsers();

  return (
    <div className="space-y-5">
      <h2 className="text-xl font-bold text-navy">Usuarios</h2>

      <div className="overflow-x-auto rounded-card border border-border-soft">
        <table className="w-full text-sm">
          <thead className="bg-surface text-xs font-semibold uppercase tracking-wide text-muted">
            <tr>
              <th className="px-4 py-3 text-left">Nombre</th>
              <th className="px-4 py-3 text-left">Rol actual</th>
              <th className="px-4 py-3 text-left">Registrado</th>
              <th className="px-4 py-3 text-left">Cambiar rol</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-soft">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {users.map((u: any) => (
              <tr key={u.id} className="hover:bg-surface/50">
                <td className="px-4 py-3 font-semibold text-navy">{u.full_name || <span className="italic text-muted">Sin nombre</span>}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                    u.role === "admin" ? "bg-navy text-white"
                    : u.role === "provider" ? "bg-turquoise/15 text-turquoise"
                    : "bg-surface text-muted"
                  }`}>
                    {ROLES[u.role] ?? u.role}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted">
                  {new Date(u.created_at).toLocaleDateString("es-AR")}
                </td>
                <td className="px-4 py-3">
                  <ChangeRoleForm userId={u.id} currentRole={u.role} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
