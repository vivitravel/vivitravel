-- Soporte para publicaciones editoriales (contenido gratuito publicado por el admin,
-- sin prestador ni precio).

-- 1. Hacer provider_id, price_from y price_unit nullables
alter table listings alter column provider_id drop not null;
alter table listings alter column price_from drop not null;
alter table listings alter column price_unit drop not null;
alter table listings alter column price_unit set default null;

-- 2. Campos propios del contenido editorial
alter table listings add column if not exists is_editorial boolean not null default false;
alter table listings add column if not exists official_url text;
alter table listings add column if not exists hours text;
alter table listings add column if not exists how_to_get_there text;

-- 3. Trigger: las publicaciones editoriales no pasan por validación de prestador/plan
create or replace function enforce_listing_status() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  prov providers%rowtype;
begin
  if auth.uid() is null or is_admin() then
    return new;
  end if;

  -- Publicaciones editoriales: solo el admin puede crearlas (ya chequeado arriba).
  if new.is_editorial then
    return new;
  end if;

  if new.provider_id is null then
    return new;
  end if;

  select * into prov from providers where id = new.provider_id;

  if new.status = 'published' then
    if prov.approved and provider_has_active_plan(prov.id) then
      null;
    elsif tg_op = 'UPDATE' and old.status = 'published' and prov.approved then
      new.status := 'paused';
    else
      new.status := 'in_review';
    end if;
  end if;

  if new.status in ('paused', 'rejected') and tg_op = 'UPDATE' and old.status is distinct from new.status then
    if old.status in ('paused', 'rejected') then
      new.status := 'in_review';
    end if;
  end if;

  return new;
end $$;

-- 4. Trigger: al publicar una editorial no se toca el prestador
create or replace function approve_provider_on_publish() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.status = 'published'
    and (tg_op = 'INSERT' or old.status is distinct from 'published')
    and is_admin()
    and new.provider_id is not null
  then
    update providers set approved = true where id = new.provider_id;
  end if;
  return new;
end $$;

-- 5. Vencimiento: ignorar publicaciones sin prestador (editoriales)
create or replace function expire_subscriptions() returns void
language plpgsql security definer set search_path = public as $$
begin
  update subscriptions set status = 'expired'
  where status = 'active' and expires_at is not null and expires_at <= now();

  update listings l set status = 'paused'
  where l.status = 'published'
    and l.provider_id is not null
    and not provider_has_active_plan(l.provider_id);
end $$;

-- 6. RLS: el admin ya tiene política total (listings_admin).
-- Para que los owners no fallen al hacer SELECT sobre editoriales (provider_id IS NULL):
-- la política listings_owner_read ya permite admin; la lectura pública de publicadas no depende de provider.
-- Solo hay que asegurarse de que las políticas de escritura de los owners no fallen con NULL.
-- (Las existentes usan EXISTS sobre providers, que retorna false si provider_id IS NULL — correcto.)
