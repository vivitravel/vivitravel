-- Corrige la recursión infinita entre las políticas de providers y listings.
-- Las consultas cruzadas pasan a funciones SECURITY DEFINER (no re-evalúan RLS).
-- También marca el perfil como 'provider' cuando alguien crea su prestador.

create or replace function owns_provider(p_provider uuid) returns boolean
language sql security definer stable set search_path = public as $$
  select exists (select 1 from providers where id = p_provider and owner_id = auth.uid());
$$;

create or replace function provider_is_public(p_provider uuid) returns boolean
language sql security definer stable set search_path = public as $$
  select exists (select 1 from listings where provider_id = p_provider and status = 'published');
$$;

create or replace function listing_is_published(p_listing uuid) returns boolean
language sql security definer stable set search_path = public as $$
  select exists (select 1 from listings where id = p_listing and status = 'published');
$$;

create or replace function owns_listing(p_listing uuid) returns boolean
language sql security definer stable set search_path = public as $$
  select exists (
    select 1 from listings l join providers p on p.id = l.provider_id
    where l.id = p_listing and p.owner_id = auth.uid()
  );
$$;

create or replace function owns_trip(p_trip uuid) returns boolean
language sql security definer stable set search_path = public as $$
  select exists (select 1 from trips where id = p_trip and user_id = auth.uid());
$$;

create or replace function trip_is_public(p_trip uuid) returns boolean
language sql security definer stable set search_path = public as $$
  select exists (select 1 from trips where id = p_trip and is_public);
$$;

-- providers
drop policy providers_public_read on providers;
create policy providers_public_read on providers for select using (provider_is_public(id));

-- subscriptions
drop policy subscriptions_owner_read on subscriptions;
create policy subscriptions_owner_read on subscriptions for select
  using (is_admin() or owns_provider(provider_id));

-- listings
drop policy listings_owner_read on listings;
drop policy listings_owner_insert on listings;
drop policy listings_owner_update on listings;
drop policy listings_owner_delete on listings;
create policy listings_owner_read on listings for select using (owns_provider(provider_id));
create policy listings_owner_insert on listings for insert with check (owns_provider(provider_id));
create policy listings_owner_update on listings for update
  using (owns_provider(provider_id)) with check (owns_provider(provider_id));
create policy listings_owner_delete on listings for delete using (owns_provider(provider_id));

-- tablas hijas de listings
drop policy lav_read on listing_attribute_values;
drop policy lav_owner on listing_attribute_values;
create policy lav_read on listing_attribute_values for select using (listing_is_published(listing_id));
create policy lav_owner on listing_attribute_values for all
  using (owns_listing(listing_id)) with check (owns_listing(listing_id));

drop policy media_read on listing_media;
drop policy media_owner on listing_media;
create policy media_read on listing_media for select using (listing_is_published(listing_id));
create policy media_owner on listing_media for all
  using (owns_listing(listing_id)) with check (owns_listing(listing_id));

drop policy ltags_read on listing_tags;
create policy ltags_read on listing_tags for select using (listing_is_published(listing_id));

-- rutas
drop policy trip_items_owner on trip_items;
drop policy trip_items_public_read on trip_items;
create policy trip_items_owner on trip_items for all
  using (owns_trip(trip_id)) with check (owns_trip(trip_id));
create policy trip_items_public_read on trip_items for select using (trip_is_public(trip_id));

-- eventos
drop policy events_insert on events;
drop policy events_owner_read on events;
create policy events_insert on events for insert with check (listing_is_published(listing_id));
create policy events_owner_read on events for select using (is_admin() or owns_listing(listing_id));

-- al crear un prestador, el perfil pasa a rol 'provider'
create or replace function set_provider_role() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  update profiles set role = 'provider' where id = new.owner_id and role = 'traveler';
  return new;
end $$;
create trigger providers_set_role after insert on providers
  for each row execute function set_provider_role();
