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
    .select("nombre, rol")
    .eq("id", user.id)
    .single();

  return {
    id: user.id,
    email: user.email!,
    nombre: perfil?.nombre ?? null,
    rol: (perfil?.rol as CurrentUser["rol"]) ?? "viajero",
  };
}
