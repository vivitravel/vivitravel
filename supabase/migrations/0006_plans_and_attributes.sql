-- Planes y filtros definitivos según "Resolución puntos bloqueantes" (Sebastián, 29/10/2026).

-- ---------- Planes ----------
alter table plans
  add column if not exists max_videos_per_listing int not null default 0,
  add column if not exists includes_advisory boolean not null default false,
  add column if not exists includes_social boolean not null default false;   -- destacados en Instagram, TikTok y Facebook (servicio de Vivitravels, fuera de la web)

update plans set name = 'Pro' where name = 'Premium con Adicionales';

update plans set reference_price_ars = 0,     max_listings = 1, max_photos_per_listing = 2,  max_videos_per_listing = 0,
                 includes_featured = false, includes_advisory = false, includes_social = false, is_free = true, trial_days = 30
  where name = 'Gratuito';
update plans set reference_price_ars = 19000, max_listings = 1, max_photos_per_listing = 6,  max_videos_per_listing = 1,
                 includes_featured = false, includes_advisory = false, includes_social = false, is_free = false, trial_days = null
  where name = 'Básico';
update plans set reference_price_ars = 28000, max_listings = 3, max_photos_per_listing = 10, max_videos_per_listing = 2,
                 includes_featured = false, includes_advisory = true,  includes_social = false, is_free = false, trial_days = null
  where name = 'Premium';
update plans set reference_price_ars = 42000, max_listings = 7, max_photos_per_listing = 15, max_videos_per_listing = 3,
                 includes_featured = true,  includes_advisory = true,  includes_social = true,  is_free = false, trial_days = null
  where name = 'Pro';

-- ---------- Plan vigente de un prestador ----------
create or replace function provider_plan(p_provider uuid) returns plans
language sql security definer stable set search_path = public as $$
  select p.* from subscriptions s join plans p on p.id = s.plan_id
  where s.provider_id = p_provider and s.status = 'active'
    and (s.expires_at is null or s.expires_at > now())
  order by p.reference_price_ars desc nulls last
  limit 1;
$$;

-- Al crearse un prestador arranca con el plan Gratuito (30 días).
create or replace function start_free_plan() returns trigger
language plpgsql security definer set search_path = public as $$
declare free_plan plans%rowtype;
begin
  select * into free_plan from plans where is_free limit 1;
  if found then
    insert into subscriptions (provider_id, plan_id, status, starts_at, expires_at)
    values (new.id, free_plan.id, 'active', now(), now() + make_interval(days => coalesce(free_plan.trial_days, 30)));
  end if;
  return new;
end $$;
create trigger providers_start_free_plan after insert on providers
  for each row execute function start_free_plan();

-- ---------- Límites del plan ----------
-- Publicaciones activas (en revisión o publicadas) y fotos por publicación.
create or replace function enforce_listing_limit() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  pl plans%rowtype;
  active_count int;
begin
  if auth.uid() is null or is_admin() then return new; end if;
  if new.status not in ('in_review', 'published') then return new; end if;
  if tg_op = 'UPDATE' and old.status in ('in_review', 'published') then return new; end if;

  pl := provider_plan(new.provider_id);
  if pl.id is null then
    select * into pl from plans where is_free limit 1;   -- sin plan vigente: tope del gratuito
  end if;

  select count(*) into active_count from listings
  where provider_id = new.provider_id and status in ('in_review', 'published')
    and id is distinct from new.id;

  if active_count >= coalesce(pl.max_listings, 0) then
    raise exception 'Alcanzaste el máximo de % publicaciones activas de tu plan', pl.max_listings;
  end if;
  return new;
end $$;
create trigger listings_limit_guard before insert or update on listings
  for each row execute function enforce_listing_limit();

create or replace function enforce_photo_limit() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  pl plans%rowtype;
  prov uuid;
  photo_count int;
begin
  if auth.uid() is null or is_admin() then return new; end if;
  select provider_id into prov from listings where id = new.listing_id;
  pl := provider_plan(prov);
  if pl.id is null then
    select * into pl from plans where is_free limit 1;
  end if;
  select count(*) into photo_count from listing_media where listing_id = new.listing_id;
  if photo_count >= coalesce(pl.max_photos_per_listing, 0) then
    raise exception 'Tu plan permite hasta % fotos por publicación', pl.max_photos_per_listing;
  end if;
  return new;
end $$;
create trigger listing_media_limit_guard before insert on listing_media
  for each row execute function enforce_photo_limit();

-- ---------- Atributos y filtros por categoría (tabla de Sebastián) ----------
-- Las opciones se pueden editar desde el panel de administración sin código.
insert into attributes (category_id, key, label, type, options, filterable, required, sort_order)
select c.id, a.key, a.label, a.type::attribute_type, a.options::jsonb, true, true, a.ord
from categories c
join (values
  ('alojamientos', 'tipo', 'Tipo de alojamiento', 'select', '["Hotel","Cabaña","Departamento"]', 1),
  ('alojamientos', 'capacidad', 'Capacidad (personas)', 'number', null, 2),
  ('alojamientos', 'servicios', 'Servicios', 'multiselect', '["Wifi","Estacionamiento","Desayuno"]', 3),
  ('actividades-y-experiencias', 'tipo', 'Tipo de actividad', 'select', '["Aventura","Naturaleza","Gastronómicas","Culturales","Experiencia"]', 1),
  ('actividades-y-experiencias', 'edad_recomendada', 'Edad recomendada', 'multiselect', '["Menos de 20 años","20 a 40 años","41 a 50 años","Más de 50 años"]', 2),
  ('actividades-y-experiencias', 'nivel_de_riesgo', 'Nivel de riesgo', 'select', '["Bajo","Medio","Alto"]', 3),
  ('gastronomia', 'tipo', 'Tipo de lugar', 'select', '["Bar","Restaurant","Parrilla","Cafetería"]', 1),
  ('gastronomia', 'tipo_de_comida', 'Tipo de comida', 'multiselect', '["Vegetariana","Vegana","Sin TACC","Étnica","Regional"]', 2),
  ('gastronomia', 'servicios', 'Servicios', 'multiselect', '["Wifi","Estacionamiento","Terraza"]', 3),
  ('servicios', 'transporte', 'Transporte', 'select', '["Auto","Combi","City tour","Chofer","Alquiler de bicicleta"]', 1),
  ('camping', 'tipo_de_camping', 'Tipo de camping', 'select', '["Familiar","Agreste","Parcelado","Apto motorhome"]', 1),
  ('camping', 'servicios', 'Servicios', 'multiselect', '["Ducha","Agua caliente","Wifi","Electricidad","Apto a mascotas"]', 2)
) as a(slug, key, label, type, options, ord) on a.slug = c.slug
on conflict (category_id, key) do nothing;
