"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function login(prevState: string | null, formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) return "Completá todos los campos.";

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    if (error.message.includes("Invalid login credentials")) {
      return "Email o contraseña incorrectos.";
    }
    return "No pudimos iniciar sesión. Intentá de nuevo.";
  }

  // Leer rol para redirigir al lugar correcto
  let destino = "/";
  if (data.user) {
    const { data: perfil } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .single();
    if (perfil?.role === "provider" || perfil?.role === "admin") {
      destino = "/prestador";
    }
  }

  revalidatePath("/", "layout");
  redirect(destino);
}

export async function registrar(prevState: string | null, formData: FormData) {
  const nombre = String(formData.get("nombre") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const confirmar = String(formData.get("confirmar") ?? "");
  const tipo = String(formData.get("tipo") ?? "viajero");

  if (!nombre || !email || !password) return "Completá todos los campos.";
  if (password !== confirmar) return "Las contraseñas no coinciden.";
  if (password.length < 6) return "La contraseña debe tener al menos 6 caracteres.";

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { nombre, full_name: nombre },
    },
  });

  if (error) {
    if (error.message.includes("already registered")) {
      return "Ya existe una cuenta con ese email.";
    }
    return "No pudimos crear la cuenta. Intentá de nuevo.";
  }

  // Si Supabase exige confirmación de email, session es null
  if (!data.session) {
    redirect("/registro/confirmacion");
  }

  // Prestador: asignar rol provider de inmediato (service role bypasses trigger uid check)
  if (tipo === "prestador" && data.user) {
    const admin = createAdminClient();
    await admin.from("profiles").update({ role: "provider" }).eq("id", data.user.id);
  }

  revalidatePath("/", "layout");
  redirect(tipo === "prestador" ? "/prestador/onboarding" : "/");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
