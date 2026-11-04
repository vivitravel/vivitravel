"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function login(prevState: string | null, formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) return "Completá todos los campos.";

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    if (error.message.includes("Invalid login credentials")) {
      return "Email o contraseña incorrectos.";
    }
    return "No pudimos iniciar sesión. Intentá de nuevo.";
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function registrar(prevState: string | null, formData: FormData) {
  const nombre = String(formData.get("nombre") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const confirmar = String(formData.get("confirmar") ?? "");

  if (!nombre || !email || !password) return "Completá todos los campos.";
  if (password !== confirmar) return "Las contraseñas no coinciden.";
  if (password.length < 6) return "La contraseña debe tener al menos 6 caracteres.";

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { nombre },
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

  revalidatePath("/", "layout");
  redirect("/");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
