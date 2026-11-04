import "server-only";
import { createClient } from "@/lib/supabase/server";

export type CurrentUser = {
  id: string;
  email: string;
  nombre: string | null;
  rol: "viajero" | "prestador" | "admin";
};

export async function getCurrentUser(): Promise<CurrentUser | null> {
  "use cache: private";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: perfil } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .single();

  const roleMap: Record<string, CurrentUser["rol"]> = {
    traveler: "viajero",
    provider: "prestador",
    admin: "admin",
  };

  return {
    id: user.id,
    email: user.email!,
    nombre: (perfil?.full_name as string | null) ?? null,
    rol: roleMap[(perfil?.role as string) ?? "traveler"] ?? "viajero",
  };
}
