-- Permitir que el service_role llame a expire_subscriptions vía RPC.
-- El service_role ya tiene privilegios de superusuario en Supabase, pero
-- este grant es explícito para evitar problemas con la REST API.
grant execute on function expire_subscriptions() to service_role;

-- Opcional: Para ejecutar manualmente desde la consola de Supabase con pg_cron:
-- (Habilitar la extensión pg_cron en Supabase Dashboard > Database > Extensions)
-- select cron.schedule('expire-subscriptions', '0 3 * * *', 'select expire_subscriptions()');
