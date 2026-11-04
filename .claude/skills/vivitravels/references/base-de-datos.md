# Base de datos (Supabase / Postgres)

Proyecto Supabase a nombre del cliente. Región del pooler: `aws-0-us-east-1`. Migraciones en `supabase/migrations/`, **todas aplicadas** hasta la 0006. Se aplican con `npm run db:apply -- <archivo.sql>` (necesita `SUPABASE_DB_PASSWORD` en `.env.local`). Cada migración corre en una transacción.

## Migraciones
| # | Qué hace |
|---|---|
| 0001 | Esquema inicial (16 tablas), RLS, reglas de publicación, datos iniciales (destinos, categorías, ejes temáticos, planes provisorios) |
| 0002 | Corrige recursión infinita de RLS entre `providers` y `listings` con funciones `security definer`; el perfil pasa a rol `provider` al crear prestador |
| 0003 | Permite el paso `traveler` a `provider` solo si el usuario ya tiene un prestador |
| 0004 | Buckets de Storage (`site-assets`, `listing-media`), políticas de escritura, tabla `site_settings` |
| 0005 | Políticas de lectura de Storage (el upsert las necesita) |
| 0006 | Planes definitivos, plan Gratuito automático, topes de publicaciones y fotos, atributos y filtros de las 5 categorías |

## Tablas principales
`profiles` (rol traveler/provider/admin), `providers`, `subscriptions`, `plans`, `destinations`, `categories`, `attributes` (define formularios y filtros sin código), `listings`, `listing_attribute_values`, `listing_media`, `tags` y `listing_tags` (ejes temáticos), `favorites`, `trips` y `trip_items` (Mi Ruta; `share_token` para el link), `events` (vistas y clics con `referrer` y UTM), `site_settings` (textos e imagen de la portada).

## Seguridad (RLS)
Todo con Row Level Security. Lectura pública del catálogo y de lo **publicado**; cada prestador ve y edita lo suyo; cada viajero sus favoritos y rutas; los eventos los inserta cualquiera sobre publicaciones publicadas y los lee el dueño o el admin; nadie se sube a admin. Las consultas cruzadas entre tablas con RLS van en funciones `security definer` (`owns_provider`, `owns_listing`, `is_admin`, etc.) para evitar recursión. **Probá RLS en una transacción con `set local role` y `request.jwt.claim.sub`** y descartala con `rollback`; ya hay un juego de 21 pruebas de seguridad y 6 de planes que pasaron (están en el historial del trabajo; rehacelas ante cambios de políticas).

## Storage
- `site-assets` (público): `hero/portada.jpg`, `destinos/<slug>.jpg`. Solo escribe el admin.
- `listing-media` (público): `<provider_id>/<listing_id>/<archivo>`. El prestador escribe solo en la carpeta de su prestador.
- `destinations.photo_url` y `site_settings.hero_image` guardan la **ruta dentro del bucket**, no la URL completa (`src/lib/format.ts` arma la URL).

## Pendiente de la base
- Programar `select cron.schedule('expire-subscriptions','0 3 * * *','select expire_subscriptions()')` (hay que activar la extensión `pg_cron` en el panel de Supabase).
- Videos por publicación (links), publicaciones sin prestador (atractivos), y vistas/funciones para el panel de administración.
- Hay un usuario administrador provisorio creado por script para el primer arranque. Cambiarlo cuando exista el login.
