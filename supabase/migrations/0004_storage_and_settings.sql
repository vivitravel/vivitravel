-- Almacenamiento de imágenes y configuración editable del sitio.
-- Todo lo que se ve en el sitio (destinos, portada, fotos de publicaciones) sale de acá,
-- para que el panel de administración pueda cambiarlo sin tocar código.

-- ---------- Buckets ----------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('site-assets', 'site-assets', true, 10485760, array['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']),
  ('listing-media', 'listing-media', true, 8388608, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- El primer segmento de la ruta en listing-media es el id del prestador dueño.
create or replace function storage_owns_provider(p_folder text) returns boolean
language plpgsql security definer stable set search_path = public as $$
begin
  return owns_provider(p_folder::uuid);
exception when others then
  return false;
end $$;

-- site-assets: solo el admin escribe (la lectura es pública por ser bucket público)
create policy site_assets_admin_insert on storage.objects for insert
  with check (bucket_id = 'site-assets' and is_admin());
create policy site_assets_admin_update on storage.objects for update
  using (bucket_id = 'site-assets' and is_admin());
create policy site_assets_admin_delete on storage.objects for delete
  using (bucket_id = 'site-assets' and is_admin());

-- listing-media: el prestador escribe en la carpeta de su prestador; el admin en cualquiera
create policy listing_media_insert on storage.objects for insert
  with check (bucket_id = 'listing-media'
              and (is_admin() or storage_owns_provider((storage.foldername(name))[1])));
create policy listing_media_update on storage.objects for update
  using (bucket_id = 'listing-media'
         and (is_admin() or storage_owns_provider((storage.foldername(name))[1])));
create policy listing_media_delete on storage.objects for delete
  using (bucket_id = 'listing-media'
         and (is_admin() or storage_owns_provider((storage.foldername(name))[1])));

-- ---------- Configuración editable del sitio ----------
create table site_settings (
  key text primary key,
  value jsonb not null,
  description text,
  updated_at timestamptz not null default now()
);
create trigger site_settings_updated before update on site_settings
  for each row execute function set_updated_at();

alter table site_settings enable row level security;
create policy site_settings_read on site_settings for select using (true);
create policy site_settings_admin on site_settings for all using (is_admin()) with check (is_admin());

insert into site_settings (key, value, description) values
  ('hero_image', '""', 'Imagen de portada de la home (ruta en el bucket site-assets)'),
  ('hero_title', '"Descubrí. Explorá. Viví."', 'Título principal de la home'),
  ('hero_subtitle', '"Todos los destinos, en un solo lugar. Encontrá propuestas de toda la Argentina y contactá directo con los prestadores."', 'Texto bajo el título de la home');
