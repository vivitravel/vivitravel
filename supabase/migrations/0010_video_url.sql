-- Agrega campo de video (YouTube o Instagram) a publicaciones
alter table listings add column if not exists video_url text;
