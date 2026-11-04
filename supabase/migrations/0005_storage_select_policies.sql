-- El upsert de Storage (insert ... on conflict do update) también necesita permiso de lectura.
-- Los dos buckets son públicos, así que leer no expone nada que no sea ya visible por URL.
create policy site_assets_read on storage.objects for select using (bucket_id = 'site-assets');
create policy listing_media_read on storage.objects for select using (bucket_id = 'listing-media');
