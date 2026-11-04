"use client";

import { useState, useTransition, useEffect } from "react";
import { saveListing } from "@/app/actions/provider";
import { createBrowserClient } from "@supabase/ssr";
import type { Category, AttributeDef } from "@/lib/types";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

const input =
  "w-full rounded-xl border border-border-soft bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-turquoise";
const lbl = "block space-y-1";
const lblTxt = "text-sm font-semibold text-navy";

const PRICE_UNITS = [
  { value: "night", label: "Por noche" },
  { value: "person", label: "Por persona" },
  { value: "trip", label: "Por excursión" },
  { value: "day", label: "Por día" },
  { value: "other", label: "Precio desde" },
];

type Props = {
  categories: Category[];
  providerId: string;
  initial?: {
    id: string;
    title: string;
    category_id: string;
    description: string | null;
    province: string;
    locality: string;
    price_from: number;
    price_unit: string;
    whatsapp: string | null;
    instagram: string | null;
    facebook: string | null;
    website: string | null;
    email: string | null;
    phone: string | null;
    attrValues: Record<string, unknown>;
    mediaPaths: string[];
  };
};

export function PublicacionForm({ categories, providerId, initial }: Props) {
  const [step, setStep] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  // Step 1 state
  const [title, setTitle] = useState(initial?.title ?? "");
  const [categoryId, setCategoryId] = useState(initial?.category_id ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [province, setProvince] = useState(initial?.province ?? "");
  const [locality, setLocality] = useState(initial?.locality ?? "");
  const [priceFrom, setPriceFrom] = useState(initial?.price_from ? String(initial.price_from) : "");
  const [priceUnit, setPriceUnit] = useState(initial?.price_unit ?? "other");

  // Step 2 state
  const [catAttrs, setCatAttrs] = useState<AttributeDef[]>([]);
  const [attrValues, setAttrValues] = useState<Record<string, string | string[]>>(
    Object.fromEntries(
      Object.entries(initial?.attrValues ?? {}).map(([k, v]) => [
        k,
        Array.isArray(v) ? (v as string[]) : String(v ?? ""),
      ])
    )
  );
  const [whatsapp, setWhatsapp] = useState(initial?.whatsapp ?? "");
  const [instagram, setInstagram] = useState(initial?.instagram ?? "");
  const [facebook, setFacebook] = useState(initial?.facebook ?? "");
  const [website, setWebsite] = useState(initial?.website ?? "");
  const [emailContact, setEmailContact] = useState(initial?.email ?? "");
  const [phone, setPhone] = useState(initial?.phone ?? "");

  // Step 3 state
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);

  useEffect(() => {
    if (!categoryId) { setCatAttrs([]); return; }
    fetch(`/api/attributes?categoria=${categoryId}`)
      .then((r) => r.json())
      .then((data: AttributeDef[]) => setCatAttrs(data))
      .catch(() => setCatAttrs([]));
  }, [categoryId]);

  function validateStep1() {
    if (!title.trim()) return "El título es obligatorio.";
    if (!categoryId) return "Elegí una categoría.";
    if (!province.trim() || !locality.trim()) return "Provincia y localidad son obligatorias.";
    if (!priceFrom || Number(priceFrom) < 0) return "El precio es obligatorio.";
    return null;
  }

  function handleNext() {
    const err = step === 1 ? validateStep1() : null;
    if (err) { setError(err); return; }
    setError(null);
    setStep((s) => s + 1);
  }

  function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files ?? []).slice(0, 10);
    setFiles(selected);
    setPreviews(selected.map((f) => URL.createObjectURL(f)));
  }

  function removeFile(i: number) {
    setFiles((prev) => prev.filter((_, idx) => idx !== i));
    setPreviews((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function handleSubmit(submitAction: "guardar" | "publicar") {
    setError(null);
    startTransition(async () => {
      const uploadedPaths: string[] = [];

      if (files.length) {
        setUploadProgress("Subiendo fotos…");
        const sb = createBrowserClient(SUPABASE_URL, SUPABASE_KEY);
        for (const file of files) {
          const ext = file.name.split(".").pop() ?? "jpg";
          const path = `${providerId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
          const { error: upErr } = await sb.storage.from("listing-media").upload(path, file);
          if (upErr) { setError("Error al subir una foto. Intentá de nuevo."); setUploadProgress(null); return; }
          uploadedPaths.push(path);
        }
        setUploadProgress(null);
      }

      const fd = new FormData();
      if (initial?.id) fd.append("listing_id", initial.id);
      fd.append("title", title);
      fd.append("category_id", categoryId);
      fd.append("description", description);
      fd.append("province", province);
      fd.append("locality", locality);
      fd.append("price_from", priceFrom);
      fd.append("price_unit", priceUnit);
      fd.append("whatsapp", whatsapp);
      fd.append("instagram", instagram);
      fd.append("facebook", facebook);
      fd.append("website", website);
      fd.append("email", emailContact);
      fd.append("phone", phone);
      fd.append("submit_action", submitAction);

      for (const [key, val] of Object.entries(attrValues)) {
        if (Array.isArray(val)) {
          val.forEach((v) => fd.append(`attr_${key}`, v));
        } else if (val) {
          fd.append(`attr_${key}`, val);
        }
      }

      for (const path of uploadedPaths) {
        fd.append("media_path", path);
      }

      await saveListing(null, fd);
    });
  }

  function toggleMulti(key: string, opt: string) {
    setAttrValues((prev) => {
      const cur = prev[key];
      const arr: string[] = Array.isArray(cur) ? cur : cur ? [cur] : [];
      return {
        ...prev,
        [key]: arr.includes(opt) ? arr.filter((v) => v !== opt) : [...arr, opt],
      };
    });
  }

  const steps = ["Información", "Detalles", "Fotos y videos"];

  return (
    <div>
      {/* Stepper */}
      <div className="mb-6 flex gap-0">
        {steps.map((s, i) => (
          <div key={s} className="flex flex-1 items-center">
            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${step > i + 1 ? "bg-turquoise text-white" : step === i + 1 ? "bg-navy text-white" : "bg-surface text-navy/40"}`}>
              {step > i + 1 ? "✓" : i + 1}
            </div>
            <span className={`ml-2 hidden text-sm font-semibold sm:block ${step === i + 1 ? "text-navy" : "text-navy/40"}`}>{s}</span>
            {i < steps.length - 1 && <div className={`mx-3 h-px flex-1 ${step > i + 1 ? "bg-turquoise" : "bg-border-soft"}`} />}
          </div>
        ))}
      </div>

      {error && (
        <p role="alert" className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      )}

      <div className="rounded-card border border-border-soft bg-white p-6">
        {/* PASO 1 */}
        {step === 1 && (
          <div className="space-y-5">
            <div className={lbl}>
              <span className={lblTxt}>Título *</span>
              <input className={input} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ej: Cabaña con vista al lago" />
            </div>
            <div className={lbl}>
              <span className={lblTxt}>Categoría *</span>
              <select className={input} value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                <option value="">Elegí una categoría</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className={lbl}>
              <span className={lblTxt}>Descripción</span>
              <textarea className={input} rows={4} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Contá tu propuesta..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className={lbl}>
                <span className={lblTxt}>Provincia *</span>
                <input className={input} value={province} onChange={(e) => setProvince(e.target.value)} placeholder="Neuquén" />
              </div>
              <div className={lbl}>
                <span className={lblTxt}>Localidad *</span>
                <input className={input} value={locality} onChange={(e) => setLocality(e.target.value)} placeholder="Bariloche" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className={lbl}>
                <span className={lblTxt}>Precio desde (ARS) *</span>
                <input className={input} type="number" min={0} value={priceFrom} onChange={(e) => setPriceFrom(e.target.value)} placeholder="15000" />
              </div>
              <div className={lbl}>
                <span className={lblTxt}>Unidad</span>
                <select className={input} value={priceUnit} onChange={(e) => setPriceUnit(e.target.value)}>
                  {PRICE_UNITS.map((u) => <option key={u.value} value={u.value}>{u.label}</option>)}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* PASO 2 */}
        {step === 2 && (
          <div className="space-y-5">
            {catAttrs.length > 0 && (
              <>
                <p className="font-semibold text-navy">Detalles de la categoría</p>
                {catAttrs.map((attr) => {
                  if (!attr.options || (attr.type !== "select" && attr.type !== "multiselect")) return null;
                  return (
                    <fieldset key={attr.key}>
                      <legend className={`${lblTxt} mb-2`}>{attr.label}</legend>
                      {attr.type === "select" ? (
                        <select className={input} value={(attrValues[attr.key] as string) ?? ""} onChange={(e) => setAttrValues((p) => ({ ...p, [attr.key]: e.target.value }))}>
                          <option value="">Sin especificar</option>
                          {attr.options.map((o) => <option key={o} value={o}>{o}</option>)}
                        </select>
                      ) : (
                        <div className="grid grid-cols-2 gap-2">
                          {attr.options.map((o) => {
                            const cur = attrValues[attr.key];
                            const checked = Array.isArray(cur) ? cur.includes(o) : cur === o;
                            return (
                              <label key={o} className="flex cursor-pointer items-center gap-2 text-sm">
                                <input type="checkbox" checked={checked} onChange={() => toggleMulti(attr.key, o)} className="h-4 w-4 rounded accent-turquoise" />
                                {o}
                              </label>
                            );
                          })}
                        </div>
                      )}
                    </fieldset>
                  );
                })}
                <hr className="border-border-soft" />
              </>
            )}

            <p className="font-semibold text-navy">Datos de contacto</p>
            <div className="grid grid-cols-2 gap-4">
              <div className={lbl}>
                <span className={lblTxt}>WhatsApp</span>
                <input className={input} value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="+54 9 299 ..." />
              </div>
              <div className={lbl}>
                <span className={lblTxt}>Teléfono</span>
                <input className={input} value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
              <div className={lbl}>
                <span className={lblTxt}>Instagram</span>
                <input className={input} value={instagram} onChange={(e) => setInstagram(e.target.value)} placeholder="@tunegocio" />
              </div>
              <div className={lbl}>
                <span className={lblTxt}>Facebook</span>
                <input className={input} value={facebook} onChange={(e) => setFacebook(e.target.value)} />
              </div>
              <div className={lbl}>
                <span className={lblTxt}>Sitio web</span>
                <input className={input} value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://..." />
              </div>
              <div className={lbl}>
                <span className={lblTxt}>Email</span>
                <input className={input} type="email" value={emailContact} onChange={(e) => setEmailContact(e.target.value)} />
              </div>
            </div>
          </div>
        )}

        {/* PASO 3 */}
        {step === 3 && (
          <div className="space-y-5">
            <div>
              <p className={`${lblTxt} mb-2`}>Fotos (máx. 10)</p>
              <label className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-border-soft p-6 hover:border-turquoise">
                <span className="text-2xl">📷</span>
                <span className="text-sm text-muted">Hacé clic para seleccionar fotos</span>
                <span className="text-xs text-muted">JPG, PNG o WebP · máx. 8 MB por foto</span>
                <input type="file" multiple accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={handleFiles} />
              </label>
              {previews.length > 0 && (
                <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {previews.map((src, i) => (
                    <div key={src} className="relative aspect-square overflow-hidden rounded-lg">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={src} alt="" className="h-full w-full object-cover" />
                      <button type="button" onClick={() => removeFile(i)} className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-xs text-white">✕</button>
                      {i === 0 && <span className="absolute bottom-1 left-1 rounded bg-black/60 px-1 text-xs text-white">Portada</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>
            {uploadProgress && <p className="text-sm text-muted">{uploadProgress}</p>}
          </div>
        )}
      </div>

      {/* Nav de pasos */}
      <div className="mt-5 flex justify-between gap-3">
        {step > 1 ? (
          <button type="button" onClick={() => setStep((s) => s - 1)} className="rounded-xl border border-border-soft px-5 py-2.5 text-sm font-semibold hover:bg-surface">
            Atrás
          </button>
        ) : <div />}

        {step < 3 ? (
          <button type="button" onClick={handleNext} className="btn-secondary rounded-xl px-6 py-2.5 text-sm font-bold">
            Siguiente
          </button>
        ) : (
          <div className="flex gap-3">
            <button type="button" onClick={() => handleSubmit("guardar")} disabled={pending} className="rounded-xl border border-border-soft px-5 py-2.5 text-sm font-semibold hover:bg-surface disabled:opacity-60">
              {pending ? "Guardando…" : "Guardar borrador"}
            </button>
            <button type="button" onClick={() => handleSubmit("publicar")} disabled={pending} className="btn-secondary rounded-xl px-6 py-2.5 text-sm font-bold disabled:opacity-60">
              {pending ? "Enviando…" : "Enviar para revisión"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
