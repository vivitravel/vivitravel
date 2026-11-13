-- Orígenes de visitas: agrupa vistas por fuente (Google, redes, directo, etc.)
-- Respeta RLS: el prestador solo ve eventos de sus propias publicaciones.
create or replace function listing_origins(p_from timestamptz, p_to timestamptz)
returns table (source text, total bigint)
language sql stable as $$
  select
    case
      when utm_source is not null and utm_source <> '' then utm_source
      when referrer ilike '%google%'                   then 'Google'
      when referrer ilike '%instagram%'                then 'Instagram'
      when referrer ilike '%facebook%'                 then 'Facebook'
      when referrer ilike '%tiktok%'                   then 'TikTok'
      when referrer ilike '%twitter%' or referrer ilike '%x.com%' then 'X / Twitter'
      when referrer is null or referrer = ''           then 'Directo'
      else 'Otros'
    end as source,
    count(*) as total
  from events e
  where e.type = 'view'
    and e.created_at >= p_from
    and e.created_at < p_to
  group by 1
  order by total desc;
$$;
