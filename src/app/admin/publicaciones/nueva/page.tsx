import type { Metadata } from "next";
import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { createEditorialListing } from "@/app/actions/admin";

export const metadata: Metadata = { title: "Nueva publicación — Admin" };

async function getCatalog() {
  const supabase = createAdminClient();
  const [{ data: categories }, { data: destinations }] = await Promise.all([
    supabase.from("categories").select("id, name").order("sort_order"),
    supabase.from("destinations").select("id, name, province").order("name"),
  ]);
  return { categories: categories ?? [], destinations: destinations ?? [] };
}

const inp = "w-full rounded-xl border border-border-soft bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-turquoise";
const lbl = "block text-sm font-semibold text-navy mb-1";

export default async function NuevaPublicacionPage() {
  const { categories, destinations } = await getCatalog();

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/publicaciones" className="text-sm text-muted hover:underline">← Publicaciones</Link>
        <h2 className="text-xl font-bold text-navy">Nueva publicación editorial</h2>
      </div>

      <div className="rounded-card border border-turquoise/30 bg-turquoise/5 p-4 text-sm text-navy">
        Esta publicación es <strong>gratuita</strong> y la publica el equipo Vivitravels.
        No está asociada a ningún prestador ni plan.
      </div>

      <form action={createEditorialListing} className="space-y-5">
        <input type="hidden" name="is_editorial" value="true" />

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={lbl} htmlFor="title">Título <span className="text-orange">*</span></label>
            <input id="title" name="title" required className={inp} placeholder="ej. Hito Tres Fronteras" />
          </div>

          <div>
            <label className={lbl} htmlFor="category_id">Categoría <span className="text-orange">*</span></label>
            <select id="category_id" name="category_id" required className={inp}>
              <option value="">Elegí una categoría</option>
              {categories.map((c: { id: string; name: string }) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className={lbl} htmlFor="destination_id">Destino</label>
            <select id="destination_id" name="destination_id" className={inp}>
              <option value="">Sin destino específico</option>
              {destinations.map((d: { id: string; name: string; province: string }) => (
                <option key={d.id} value={d.id}>{d.name} — {d.province}</option>
              ))}
            </select>
          </div>

          <div>
            <label className={lbl} htmlFor="locality">Localidad <span className="text-orange">*</span></label>
            <input id="locality" name="locality" required className={inp} placeholder="ej. Puerto Iguazú" />
          </div>

          <div>
            <label className={lbl} htmlFor="province">Provincia <span className="text-orange">*</span></label>
            <input id="province" name="province" required className={inp} placeholder="ej. Misiones" />
          </div>

          <div className="sm:col-span-2">
            <label className={lbl} htmlFor="description">Descripción</label>
            <textarea id="description" name="description" rows={4} className={inp} placeholder="Describí el lugar o actividad…" />
          </div>

          <div className="sm:col-span-2">
            <label className={lbl} htmlFor="address">Dirección</label>
            <input id="address" name="address" className={inp} placeholder="ej. Av. Tres Fronteras s/n" />
          </div>

          <div>
            <label className={lbl} htmlFor="lat">Latitud</label>
            <input id="lat" name="lat" type="number" step="any" className={inp} placeholder="-25.5985" />
          </div>

          <div>
            <label className={lbl} htmlFor="lng">Longitud</label>
            <input id="lng" name="lng" type="number" step="any" className={inp} placeholder="-54.6126" />
          </div>

          <div>
            <label className={lbl} htmlFor="official_url">Sitio oficial</label>
            <input id="official_url" name="official_url" type="url" className={inp} placeholder="https://…" />
          </div>

          <div>
            <label className={lbl} htmlFor="hours">Horarios</label>
            <input id="hours" name="hours" className={inp} placeholder="ej. Siempre abierto" />
          </div>

          <div className="sm:col-span-2">
            <label className={lbl} htmlFor="how_to_get_there">Cómo llegar</label>
            <textarea id="how_to_get_there" name="how_to_get_there" rows={2} className={inp} placeholder="Indicaciones para llegar…" />
          </div>

          <div className="sm:col-span-2">
            <label className={lbl} htmlFor="video_url">Video (YouTube o Instagram)</label>
            <input id="video_url" name="video_url" type="url" className={inp} placeholder="https://www.youtube.com/watch?v=... o https://www.instagram.com/reel/..." />
          </div>

          <div>
            <label className={lbl} htmlFor="status">Estado inicial</label>
            <select id="status" name="status" className={inp}>
              <option value="published">Publicada</option>
              <option value="draft">Borrador</option>
            </select>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" className="btn btn-primary">Crear publicación</button>
          <Link href="/admin/publicaciones" className="btn btn-ghost">Cancelar</Link>
        </div>
      </form>
    </div>
  );
}
