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
- Auto-pausa del plan Gratuito a los 30 días: `expire_subscriptions()` ya está en la DB; cron de Vercel configurado en `vercel.json` (3am UTC diario).
- Opciones de edad actualizadas (spec 13/11): "Menos de 20", "De 20 a 45", "Más de 45".
- Guía turístico agregado a Servicios.
- Etiqueta "Gratuito" en cards y ficha de publicaciones editoriales.
- Página `/planes` mejorada: tabla con tachados, texto "Activo 30 días, luego se pausa" para Gratuito.
- **Página `/publicar`**: landing para prestadores con hero, 4 beneficios, grilla de planes desde DB y CTAs a `/registro?tipo=prestador`.
- **Footer**: tercera columna "Para prestadores" con links a `/publicar` y `/planes`.
- **`/registro` rediseñado**: sin parámetro muestra dos tarjetas grandes (Soy viajero / Soy prestador) con descripción y CTA propio. Con `?tipo=viajero` o `?tipo=prestador` va directo al formulario con título y contexto correspondiente.
- **Rol asignado al registrarse**: al registrarse como prestador, `auth.ts` usa el service role para actualizar el perfil a `role = 'provider'` de inmediato (sin esperar onboarding).
- **UserMenu por rol**: viajero ve "Mis favoritos" y "Mi ruta"; prestador/admin ve "Mi panel". Badge de rol visible junto al nombre.
- **Navegación contextual**: layout del prestador con `PrestadorNav` (sidebar con active state en desktop, tabs horizontales en mobile, badge "Prestador"). Layout del viajero (nuevo) con `ViajeroNav` (tabs "Mis favoritos / Mis rutas" con active state, badge "Viajero").
- **Guards de ruta**: prestadores que intentan ir a `/viajero/*` son redirigidos a `/prestador`; viajeros que van a `/prestador/*` son redirigidos al onboarding.

## Falta / pendiente de producción

### Para Bruno
- Aplicar migraciones 0011 y 0012 en Supabase del cliente (SQL en el repo). ← **pendiente confirmar**
- Agregar en Vercel: `NEXT_PUBLIC_MAPBOX_TOKEN`, `RESEND_API_KEY`, `RESEND_FROM`.
- Crear cuenta en resend.com y verificar dominio `vivitravels.com.ar`.
- Confirmar que `CRON_SECRET` está en Vercel (necesario para el cron de vencimientos).

### Para Sebastián
- Darse rol admin en Supabase de producción: `update profiles set role = 'admin' where id = (select id from auth.users where email = 'solicitud.vivitravels@gmail.com');`
- Enviar textos de Términos y Privacidad (prometidos el 06/11, siguen pendientes).
- Si creó una cuenta de prestador antes del fix de roles, corregirla: `update profiles set role = 'provider' where id = (select id from auth.users where email = 'su-email');`

### Desarrollo restante
1. **QA completo** — mobile (390px) + desktop, Chrome + Safari. Recorrer flujo viajero y prestador de punta a punta.
2. **Onboarding del prestador** — verificar que el formulario funcione correctamente de punta a punta (crear perfil de prestador, subir logo, guardar).
3. **DNS** — apuntar `vivitravels.com.ar` a Vercel en NIC.ar (titular es Sebastián).
4. **Entrega de accesos y documentación** — credenciales, instructivo para el admin.

## Esperando de Sebastián (vía Walo)
- Textos legales (Términos y Privacidad): prometidos 06/11, sin respuesta.
- Recorrido por calles (etapa 2 vs cotización aparte).
- Logo horizontal y símbolo solo (para favicon).

## Material sin usar todavía
- 80 fotos en "Imagenes Web" del Drive (Bariloche 34, Mendoza 9, Calafate 8, Iguazú 7, etc.). Servirán para publicaciones de prueba y galerías de destino.
- La contraseña de la base se compartió por chat: **conviene restablecerla** en Supabase (Project Settings > Database).
