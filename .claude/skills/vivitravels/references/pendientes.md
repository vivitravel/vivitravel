# Estado y pendientes (13/11/2026)

## Hecho
- Proyecto base Next.js 16 + Supabase conectado; repositorio `vivitravel/vivitravel`.
- Marca aplicada (guía del 28/10), logo oficial en encabezado y pie, Montserrat.
- Esquema de base con RLS, planes definitivos, topes de plan, plan Gratuito automático, atributos y filtros cargados, Storage con portada y fotos de destinos.
- Pantallas públicas: home (portada editable desde `site_settings`), destinos, página de destino, búsqueda (destino, categoría, tema, texto, precio, orden, vistas Listado y Galería), ficha con contacto directo y seguimiento de vistas y clics.
- Registro, login, favoritos (con `FavoriteButton`, página `/viajero/favoritos`).
- Filtros por atributos de categoría en búsqueda; atributos en ficha de publicación.
- Portal del prestador: alta, perfil, publicaciones (formulario multistep, subida de fotos con tope por plan), estadísticas (vistas/clics/guardados, comparación vs período anterior, origen de visitas), Mi Plan.
- Panel de administración: moderación, usuarios, destinos, categorías, atributos, planes, publicaciones (aprobar/rechazar), panel de nueva publicación editorial.
- Mi Ruta: crear rutas, agregar paradas, link compartible, mapa con puntos numerados, descarga PDF. (`/viajero/mi-ruta`, `/ruta/[token]`)
- Mapa Mapbox embebido en ficha de publicación (`MapboxMap`, `TripMap`).
- GA4 integrado; sitemap dinámico; schema.org + OpenGraph enriquecido.
- SEO: sitemap, robots.txt, schema.org, OpenGraph.
- Mails con Resend: aprobación de publicación, rechazo con motivo, aviso de vencimiento de plan (7 días antes). (`src/lib/email.ts`)
- Auto-pausa del plan Gratuito a los 30 días: `expire_subscriptions()` ya está en la DB; cron de Vercel configurado en `vercel.json` (3am UTC diario). La lógica pausa las publicaciones y vence la suscripción automáticamente.
- Opciones de edad actualizadas (spec 13/11): "Menos de 20", "De 20 a 45", "Más de 45".
- Guía turístico agregado a Servicios.
- Etiqueta "Gratuito" en cards y ficha de publicaciones editoriales.
- Página `/planes` mejorada: tabla con tachados, texto "Activo 30 días, luego se pausa" para Gratuito.

## Falta / pendiente de producción

### Para Bruno
- Aplicar migraciones 0011 y 0012 en Supabase del cliente (SQL en el repo).
- Agregar en Vercel: `NEXT_PUBLIC_MAPBOX_TOKEN`, `RESEND_API_KEY`, `RESEND_FROM`.
- Crear cuenta en resend.com y verificar dominio `vivitravels.com.ar`.
- Confirmar que `CRON_SECRET` está en Vercel (necesario para el cron de vencimientos).

### Para Sebastián
- Darse rol admin en Supabase de producción: `update profiles set role = 'admin' where id = (select id from auth.users where email = 'solicitud.vivitravels@gmail.com');`
- Enviar textos de Términos y Privacidad (prometidos el 06/11, siguen pendientes).

### Desarrollo restante
1. **QA completo** — mobile (390px) + desktop, Chrome + Safari.
2. **DNS** — apuntar `vivitravels.com.ar` a Vercel en NIC.ar (titular es Sebastián).
3. **Entrega de accesos y documentación** — credenciales, instructivo para el admin.

## Esperando de Sebastián (vía Walo)
- Textos legales (Términos y Privacidad): prometidos 06/11, sin respuesta.
- Recorrido por calles (etapa 2 vs cotización aparte).
- Logo horizontal y símbolo solo (para favicon).

## Material sin usar todavía
- 80 fotos en "Imagenes Web" del Drive (Bariloche 34, Mendoza 9, Calafate 8, Iguazú 7, etc.). Servirán para publicaciones de prueba y galerías de destino.
- La contraseña de la base se compartió por chat: **conviene restablecerla** en Supabase (Project Settings > Database).
