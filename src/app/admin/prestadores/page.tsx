import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import { approveProvider } from "@/app/actions/admin";

export const metadata: Metadata = { title: "Prestadores — Admin" };

async function getProviders(aprobados?: string) {
  const supabase = createAdminClient();
  let q = supabase
    .from("providers")
    .select(`id, business_name, province, locality, approved, created_at,
             profiles!inner(full_name, role),
             subscriptions(id, status, starts_at, expires_at, plans(name))`)
    .order("created_at", { ascending: false });
  if (aprobados === "false") q = q.eq("approved", false);
  if (aprobados === "true") q = q.eq("approved", true);
  const { data } = await q;
  return data ?? [];
}

type Props = { searchParams: Promise<{ aprobados?: string }> };

export default async function PrestadoresPage({ searchParams }: Props) {
  const { aprobados } = await searchParams;
  const providers = await getProviders(aprobados);

  return (
    <div className="space-y-5">
      <h2 className="text-xl font-bold text-navy">Prestadores</h2>

      <div className="flex gap-2">
        {[
          { label: "Todos", v: undefined },
          { label: "Pendientes de aprobación", v: "false" },
          { label: "Aprobados", v: "true" },
        ].map((t) => (
          <a
            key={t.label}
            href={t.v ? `/admin/prestadores?aprobados=${t.v}` : "/admin/prestadores"}
            className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
              aprobados === t.v
                ? "bg-navy text-white"
                : "border border-border-soft text-navy hover:bg-surface"
            }`}
          >
            {t.label}
          </a>
        ))}
      </div>

      <div className="overflow-x-auto rounded-card border border-border-soft">
        <table className="w-full text-sm">
          <thead className="bg-surface text-xs font-semibold uppercase tracking-wide text-muted">
            <tr>
              <th className="px-4 py-3 text-left">Prestador</th>
              <th className="px-4 py-3 text-left">Localidad</th>
              <th className="px-4 py-3 text-left">Aprobado</th>
              <th className="px-4 py-3 text-left">Plan activo</th>
              <th className="px-4 py-3 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-soft">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {providers.map((p: any) => {
              const activeSub = (p.subscriptions ?? []).find((s: any) => s.status === "active");
              return (
                <tr key={p.id} className="hover:bg-surface/50">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-navy">{p.business_name}</p>
                    <p className="text-xs text-muted">{p.profiles?.full_name ?? "—"}</p>
                  </td>
                  <td className="px-4 py-3 text-muted">{p.locality}, {p.province}</td>
                  <td className="px-4 py-3">
                    {p.approved ? (
                      <span className="rounded-full bg-turquoise/15 px-2 py-0.5 text-xs font-semibold text-turquoise">Aprobado</span>
                    ) : (
                      <span className="rounded-full bg-orange/15 px-2 py-0.5 text-xs font-semibold text-orange">Pendiente</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {activeSub ? (
                      <div>
                        <p className="font-semibold text-navy">{activeSub.plans?.name}</p>
                        {activeSub.expires_at && (
                          <p className="text-xs text-muted">
                            Vence: {new Date(activeSub.expires_at).toLocaleDateString("es-AR")}
                          </p>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted">Sin plan activo</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {!p.approved && (
                      <form action={approveProvider.bind(null, p.id)} className="inline">
                        <button type="submit" className="rounded-lg bg-turquoise px-2.5 py-1 text-xs font-semibold text-white hover:opacity-90">
                          Aprobar
                        </button>
                      </form>
                    )}
                  </td>
                </tr>
              );
            })}
            {providers.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-muted">No hay prestadores con este filtro.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
