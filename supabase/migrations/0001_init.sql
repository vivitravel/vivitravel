-- VIVITRAVELS: esquema inicial (MVP)
-- Roles: traveler, provider, admin. La seguridad se resuelve con Row Level Security.

create extension if not exists pgcrypto;

-- ---------- Tipos ----------
create type user_role as enum ('traveler', 'provider', 'admin');
create type listing_status as enum ('draft', 'in_review', 'published', 'paused', 'rejected');
create type subscription_status as enum ('pending', 'active', 'expired', 'suspended');
create type attribute_type as enum ('boolean', 'number', 'text', 'select', 'multiselect');
create type price_unit as enum ('night', 'person', 'trip', 'day', 'other');
create type event_type as enum (
  'view', 'click_whatsapp', 'click_instagram', 'click_facebook',
  'click_web', 'click_mail', 'click_phone', 'favorite', 'add_to_trip'
);

-- ---------- Helpers ----------
create or replace function set_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- ---------- Perfiles ----------
create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role user_role not null default 'traveler',
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger profiles_updated before update on profiles
  for each row execute function set_updated_at();

create or replace function is_admin() returns boolean
language sql security definer stable set search_path = public as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'admin');
$$;

-- Crea el perfil al registrarse. El rol siempre arranca como traveler.
create or replace function handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''));
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function handle_new_user();

-- Nadie cambia su propio rol: solo un admin (o el service role).
create or replace function prevent_role_change() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.role is distinct from old.role and auth.uid() is not null and not is_admin() then
    raise exception 'No podés cambiar tu rol';
  end if;
  return new;
end $$;
create trigger profiles_role_guard before update on profiles
  for each row execute function prevent_role_change();

-- ---------- Catálogo (lo administra el admin) ----------
create table destinations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  province text not null,
  slug text not null unique,
  photo_url text,
  featured boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  icon text,
  sort_order int not null default 0
);

-- Atributos por categoría: definen formulario y filtros sin código nuevo.
create table attributes (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references categories (id) on delete cascade,
  key text not null,
  label text not null,
  type attribute_type not null,
  options jsonb,                      -- opciones para select / multiselect
  icon text,
  filterable boolean not null default false,
  required boolean not null default false,
  sort_order int not null default 0,
  unique (category_id, key)
);

create table tags (                   -- ejes temáticos (Naturaleza, Aventura, ...)
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  sort_order int not null default 0
);

-- ---------- Planes y suscripciones ----------
create table plans (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  reference_price_ars numeric(12, 0),
  billing_period text,                -- mensual, trimestral, anual
  max_listings int,
  max_photos_per_listing int,
  includes_featured boolean not null default false,
  is_free boolean not null default false,
  trial_days int,                     -- para el plan gratuito con vencimiento
  active boolean not null default true,
  sort_order int not null default 0
);

-- ---------- Prestadores ----------
create table providers (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null unique references profiles (id) on delete cascade,
  business_name text not null,
  description text,
  province text,
  locality text,
  whatsapp text,
  instagram text,
  facebook text,
  website text,
  email text,
  phone text,
  -- La primera publicación la revisa el admin; después queda aprobado.
  approved boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger providers_updated before update on providers
  for each row execute function set_updated_at();

create table subscriptions (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references providers (id) on delete cascade,
  plan_id uuid not null references plans (id),
  status subscription_status not null default 'pending',
  starts_at timestamptz,
  expires_at timestamptz,
  payment_proof_url text,
  validated_by uuid references profiles (id),
  validated_at timestamptz,
  created_at timestamptz not null default now()
);
create index on subscriptions (provider_id, status);

create or replace function provider_has_active_plan(p_provider uuid) returns boolean
language sql security definer stable set search_path = public as $$
  select exists (
    select 1 from subscriptions
    where provider_id = p_provider
      and status = 'active'
      and (expires_at is null or expires_at > now())
  );
$$;

-- ---------- Publicaciones ----------
create table listings (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references providers (id) on delete cascade,
  category_id uuid not null references categories (id),
  destination_id uuid references destinations (id),
  province text not null,
  locality text not null,
  title text not null,
  slug text not null unique,
  description text,
  address text,
  lat double precision,
  lng double precision,
  price_from numeric(12, 0) not null check (price_from >= 0),   -- el precio es obligatorio
  price_unit price_unit not null default 'other',
  status listing_status not null default 'draft',
  featured boolean not null default false,
  rejection_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger listings_updated before update on listings
  for each row execute function set_updated_at();
create index on listings (status, category_id, destination_id);
create index on listings (provider_id);

-- Reglas de publicación para prestadores (el admin puede todo):
--  * Si el prestador no está aprobado, o no tiene plan vigente, no puede publicar: va a revisión.
--  * Si ya está aprobado y tiene plan vigente, sus publicaciones salen directo.
create or replace function enforce_listing_status() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  prov providers%rowtype;
begin
  if auth.uid() is null or is_admin() then
    return new;
  end if;

  select * into prov from providers where id = new.provider_id;

  if new.status = 'published' then
    if prov.approved and provider_has_active_plan(prov.id) then
      null;                                       -- sale directo
    elsif tg_op = 'UPDATE' and old.status = 'published' and prov.approved then
      new.status := 'paused';                     -- plan vencido: se pausa
    else
      new.status := 'in_review';                  -- primera publicación o sin plan: revisión
    end if;
  end if;

  if new.status in ('paused', 'rejected') and tg_op = 'UPDATE' and old.status is distinct from new.status then
    -- el prestador no puede reabrir lo que pausó o rechazó el admin sin pasar por revisión
    if old.status in ('paused', 'rejected') then
      new.status := 'in_review';
    end if;
  end if;

  return new;
end $$;
create trigger listings_status_guard before insert or update on listings
  for each row execute function enforce_listing_status();

-- Al aprobar una publicación, el prestador queda aprobado para las siguientes.
create or replace function approve_provider_on_publish() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.status = 'published' and (tg_op = 'INSERT' or old.status is distinct from 'published') and is_admin() then
    update providers set approved = true where id = new.provider_id;
  end if;
  return new;
end $$;
create trigger listings_approve_provider after insert or update on listings
  for each row execute function approve_provider_on_publish();

create table listing_attribute_values (
  listing_id uuid not null references listings (id) on delete cascade,
  attribute_id uuid not null references attributes (id) on delete cascade,
  value jsonb not null,
  primary key (listing_id, attribute_id)
);

create table listing_media (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references listings (id) on delete cascade,
  storage_path text not null,
  sort_order int not null default 0,
  is_cover boolean not null default false,
  alt_text text
);
create index on listing_media (listing_id, sort_order);

create table listing_tags (
  listing_id uuid not null references listings (id) on delete cascade,
  tag_id uuid not null references tags (id) on delete cascade,
  primary key (listing_id, tag_id)
);

-- ---------- Viajero: favoritos y rutas ----------
create table favorites (
  user_id uuid not null references profiles (id) on delete cascade,
  listing_id uuid not null references listings (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, listing_id)
);

create table trips (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  title text not null default 'Mi ruta',
  is_public boolean not null default false,            -- link para compartir (solo lectura)
  share_token text unique default encode(gen_random_bytes(12), 'hex'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trips_updated before update on trips
  for each row execute function set_updated_at();

create table trip_items (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references trips (id) on delete cascade,
  listing_id uuid not null references listings (id) on delete cascade,
  day int not null default 1 check (day >= 1),
  position int not null default 0,
  time_note text,                                      -- horario opcional
  note text,                                           -- nota opcional
  unique (trip_id, day, position) deferrable initially deferred
);

-- ---------- Eventos y estadísticas ----------
create table events (
  id bigint generated always as identity primary key,
  listing_id uuid not null references listings (id) on delete cascade,
  type event_type not null,
  session_id text,
  user_id uuid references profiles (id) on delete set null,
  referrer text,                                       -- origen de la visita
  utm_source text,
  utm_medium text,
  utm_campaign text,
  created_at timestamptz not null default now()
);
create index on events (listing_id, type, created_at);
create index on events (created_at);

-- Totales por publicación y período. Respeta RLS: el prestador solo ve lo suyo.
create or replace function listing_stats(p_from timestamptz, p_to timestamptz)
returns table (listing_id uuid, type event_type, total bigint)
language sql stable as $$
  select e.listing_id, e.type, count(*)
  from events e
  where e.created_at >= p_from and e.created_at < p_to
  group by e.listing_id, e.type;
$$;

-- ---------- Vencimiento automático de planes ----------
-- Marca vencidas las suscripciones y pausa las publicaciones del prestador.
create or replace function expire_subscriptions() returns void
language plpgsql security definer set search_path = public as $$
begin
  update subscriptions set status = 'expired'
  where status = 'active' and expires_at is not null and expires_at <= now();

  update listings l set status = 'paused'
  where l.status = 'published'
    and not provider_has_active_plan(l.provider_id);
end $$;
-- Programar a diario (requiere habilitar pg_cron en Supabase > Database > Extensions):
--   select cron.schedule('expire-subscriptions', '0 3 * * *', 'select expire_subscriptions()');

-- ---------- Row Level Security ----------
alter table profiles enable row level security;
alter table destinations enable row level security;
alter table categories enable row level security;
alter table attributes enable row level security;
alter table tags enable row level security;
alter table plans enable row level security;
alter table providers enable row level security;
alter table subscriptions enable row level security;
alter table listings enable row level security;
alter table listing_attribute_values enable row level security;
alter table listing_media enable row level security;
alter table listing_tags enable row level security;
alter table favorites enable row level security;
alter table trips enable row level security;
alter table trip_items enable row level security;
alter table events enable row level security;

-- profiles
create policy profiles_self_select on profiles for select using (id = auth.uid() or is_admin());
create policy profiles_self_update on profiles for update using (id = auth.uid() or is_admin());

-- catálogo: lectura pública, escritura solo admin
create policy destinations_read on destinations for select using (true);
create policy destinations_admin on destinations for all using (is_admin()) with check (is_admin());
create policy categories_read on categories for select using (true);
create policy categories_admin on categories for all using (is_admin()) with check (is_admin());
create policy attributes_read on attributes for select using (true);
create policy attributes_admin on attributes for all using (is_admin()) with check (is_admin());
create policy tags_read on tags for select using (true);
create policy tags_admin on tags for all using (is_admin()) with check (is_admin());
create policy plans_read on plans for select using (true);
create policy plans_admin on plans for all using (is_admin()) with check (is_admin());

-- providers: el dueño gestiona lo suyo; el público ve prestadores con publicaciones publicadas
create policy providers_owner on providers for all
  using (owner_id = auth.uid() or is_admin())
  with check ((owner_id = auth.uid() and approved = false) or is_admin());
create policy providers_public_read on providers for select
  using (exists (select 1 from listings l where l.provider_id = providers.id and l.status = 'published'));

-- subscriptions: el prestador solo lee la suya; las gestiona el admin
create policy subscriptions_owner_read on subscriptions for select
  using (is_admin() or exists (select 1 from providers p where p.id = provider_id and p.owner_id = auth.uid()));
create policy subscriptions_admin on subscriptions for all using (is_admin()) with check (is_admin());

-- listings
create policy listings_public_read on listings for select using (status = 'published');
create policy listings_owner_read on listings for select
  using (exists (select 1 from providers p where p.id = provider_id and p.owner_id = auth.uid()));
create policy listings_owner_insert on listings for insert
  with check (exists (select 1 from providers p where p.id = provider_id and p.owner_id = auth.uid()));
create policy listings_owner_update on listings for update
  using (exists (select 1 from providers p where p.id = provider_id and p.owner_id = auth.uid()))
  with check (exists (select 1 from providers p where p.id = provider_id and p.owner_id = auth.uid()));
create policy listings_owner_delete on listings for delete
  using (exists (select 1 from providers p where p.id = provider_id and p.owner_id = auth.uid()));
create policy listings_admin on listings for all using (is_admin()) with check (is_admin());

-- tablas hijas de listings: públicas si la publicación está publicada; el dueño las escribe
create policy lav_read on listing_attribute_values for select
  using (exists (select 1 from listings l where l.id = listing_id and l.status = 'published'));
create policy lav_owner on listing_attribute_values for all
  using (exists (select 1 from listings l join providers p on p.id = l.provider_id
                 where l.id = listing_id and p.owner_id = auth.uid()))
  with check (exists (select 1 from listings l join providers p on p.id = l.provider_id
                      where l.id = listing_id and p.owner_id = auth.uid()));
create policy lav_admin on listing_attribute_values for all using (is_admin()) with check (is_admin());

create policy media_read on listing_media for select
  using (exists (select 1 from listings l where l.id = listing_id and l.status = 'published'));
create policy media_owner on listing_media for all
  using (exists (select 1 from listings l join providers p on p.id = l.provider_id
                 where l.id = listing_id and p.owner_id = auth.uid()))
  with check (exists (select 1 from listings l join providers p on p.id = l.provider_id
                      where l.id = listing_id and p.owner_id = auth.uid()));
create policy media_admin on listing_media for all using (is_admin()) with check (is_admin());

create policy ltags_read on listing_tags for select
  using (exists (select 1 from listings l where l.id = listing_id and l.status = 'published'));
create policy ltags_admin on listing_tags for all using (is_admin()) with check (is_admin());

-- favoritos y rutas: cada viajero lo suyo; las rutas públicas se leen por link
create policy favorites_owner on favorites for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy trips_owner on trips for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy trips_public_read on trips for select using (is_public);
create policy trip_items_owner on trip_items for all
  using (exists (select 1 from trips t where t.id = trip_id and t.user_id = auth.uid()))
  with check (exists (select 1 from trips t where t.id = trip_id and t.user_id = auth.uid()));
create policy trip_items_public_read on trip_items for select
  using (exists (select 1 from trips t where t.id = trip_id and t.is_public));

-- eventos: cualquiera registra eventos sobre publicaciones publicadas; leen el dueño y el admin
create policy events_insert on events for insert
  with check (exists (select 1 from listings l where l.id = listing_id and l.status = 'published'));
create policy events_owner_read on events for select
  using (is_admin() or exists (select 1 from listings l join providers p on p.id = l.provider_id
                               where l.id = listing_id and p.owner_id = auth.uid()));

-- ---------- Datos iniciales ----------
insert into categories (name, slug, icon, sort_order) values
  ('Alojamientos', 'alojamientos', 'bed', 1),
  ('Actividades y Experiencias', 'actividades-y-experiencias', 'mountain', 2),
  ('Gastronomía', 'gastronomia', 'utensils', 3),
  ('Servicios', 'servicios', 'briefcase', 4),
  ('Camping', 'camping', 'tent', 5);

insert into destinations (name, province, slug, featured, sort_order) values
  ('Bariloche', 'Río Negro', 'bariloche', true, 1),
  ('Buenos Aires', 'Buenos Aires', 'buenos-aires', true, 2),
  ('El Calafate', 'Santa Cruz', 'el-calafate', true, 3),
  ('Córdoba', 'Córdoba', 'cordoba', true, 4),
  ('Iguazú', 'Misiones', 'iguazu', true, 5),
  ('Jujuy', 'Jujuy', 'jujuy', true, 6),
  ('Mendoza', 'Mendoza', 'mendoza', true, 7),
  ('Puerto Madryn', 'Chubut', 'puerto-madryn', true, 8);

insert into tags (name, slug, sort_order) values
  ('Naturaleza', 'naturaleza', 1), ('Aventura', 'aventura', 2), ('Cultura', 'cultura', 3),
  ('Playas', 'playas', 4), ('Bienestar', 'bienestar', 5);

-- Planes: nombres y límites son provisorios hasta que Sebastián los defina (punto 12).
insert into plans (name, is_free, trial_days, sort_order) values
  ('Gratuito', true, 30, 0),
  ('Básico', false, null, 1),
  ('Premium', false, null, 2),
  ('Premium con Adicionales', false, null, 3);
