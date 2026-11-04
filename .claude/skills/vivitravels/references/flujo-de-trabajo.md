# Flujo de trabajo y trampas conocidas

## Puesta en marcha
1. Clonar `https://github.com/vivitravel/vivitravel.git` (rama `main`; hace falta acceso de escritura de la organización).
2. `npm ci`.
3. Crear `.env.local` a partir de `.env.example` (URL y clave publishable de Supabase). Para tocar la base: `SUPABASE_DB_PASSWORD` (pedírsela a Bruno).
4. `npm run dev` en `http://localhost:3000`.
5. **Mantené el proyecto fuera de OneDrive**: `node_modules` tiene decenas de miles de archivos.

## Cómo verificar un cambio (obligatorio)
- Chequeos rápidos: `npx tsc --noEmit` y `npm run lint`. Antes de subir: `npm run build`.
- **Capturas visuales:** el servidor de desarrollo mantiene la página "cargando" para siempre (HMR) y las capturas headless nunca terminan. Usá el build de producción:
  1. `npm run build` y `npx next start -p 3001`.
  2. Escritorio: `msedge --headless --disable-gpu --hide-scrollbars --window-size=1280,1500 --screenshot=<ruta absoluta>.png http://localhost:3001/` (la ruta de la captura tiene que ser absoluta).
  3. Mirá la imagen y corregí lo que se vea mal.
- **Celular:** Edge headless no baja de unos 500 px de ancho, así que la captura de 390 px sale cortada aunque el sitio esté bien. Para celular, emulá 390 px en un navegador con DevTools o con el panel de Claude y comprobá `document.documentElement.scrollWidth <= 390` (sin desplazamiento horizontal) en cada página.
- Si el panel de navegador está oculto, las capturas por herramienta fallan por timeout: usá Edge headless.
- Datos de prueba: si insertás datos de demostración en la base del cliente, **borralos al terminar** (por ejemplo, borrando el usuario de prueba en `auth.users` se van en cascada su perfil, prestador y publicaciones).

## Base de datos
- Nueva migración: archivo `supabase/migrations/000N_nombre.sql` y `npm run db:apply -- supabase/migrations/000N_nombre.sql`. Si falla, se deshace todo.
- Las políticas RLS se prueban con un rol real (`set local role authenticated` más `request.jwt.claim.sub`) dentro de una transacción que se descarta. El superusuario saltea RLS y engaña.
- La API de Storage necesita políticas de insert, update **y select** para hacer upsert.

## Next.js 16 (diferencias que ya costaron tiempo)
- `cacheComponents` activo: toda lectura de `cookies`, `headers`, `params` o `searchParams` va dentro de `<Suspense>`; las lecturas públicas van en funciones con `"use cache"` y `cacheLife`. Esas funciones no pueden leer cookies: por eso el catálogo usa un cliente anónimo.
- `middleware` se llama `proxy.ts`. `params` y `searchParams` son promesas. Tipos globales `PageProps<"/ruta">` y `LayoutProps`.
- Las páginas que fallan con `notFound()` dentro de un `Suspense` responden **200** con la pantalla de "no encontrada". Es un pendiente de SEO (hay que devolver 404 real).
- `lucide-react` ya no trae íconos de marcas: Instagram y Facebook están en `src/components/icons.tsx`.
- Las imágenes remotas de Supabase están autorizadas en `next.config.ts`.

## Git
- Commits en español, con el trailer `Co-Authored-By` que corresponda.
- Si `git push` pide usuario y no hay credenciales guardadas: `git -c credential.helper= -c "credential.helper=!gh auth git-credential" push` (usa la sesión de `gh`).

## Google Drive del cliente (si trabajás con Claude y el conector de Drive)
- Carpeta raíz `1JSr9yTH_XUcvxwNGVVjR08ZVN4LU0ykr` (bocetos, esquema, manual, logo, imágenes, resolución de bloqueantes).
- **`read_file_content` solo devuelve texto**: se pierde todo lo que viene como imagen dentro de un .docx (en "Resolución puntos bloqueantes" estaban las tablas de filtros, los planes y la guía de identidad). Para ver el contenido completo, descargá el archivo.
- `download_file_content` devuelve el binario en base64; si es grande, la herramienta lo guarda en un archivo y avisa la ruta. Ese archivo es un JSON `{content, id, mimeType, title}`: decodificá `content` con node (`Buffer.from(content, "base64")`) a un archivo local. Nunca pegues base64 en la conversación. Un .docx es un zip: renombralo a `.zip` y descomprimilo para ver `word/media/*.png` y `word/document.xml`.
- Para varias descargas en paralelo conviene delegarlas a subagentes.

## Qué NO hacer
- No escribirle al cliente: pasa por Walo.
- No dejar secretos en el repositorio ni en capturas.
- No inventar alcance: si no está en la propuesta ni fue acordado, es una concesión de Walo o una cotización.
