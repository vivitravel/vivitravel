# VIVITRAVELS – Especificación para el agente de desarrollo
Fecha: 04/11/2026 · Proyecto: MVP plataforma turística VIVITRAVELS · Cliente: Sebastián Márquez · Web actual: https://vivitravel.vercel.app

Este documento reúne todo lo que el cliente confirmó al 04/11. Es la referencia para construir la plataforma completa. Donde algo está PENDIENTE DE CONFIRMAR, se indica el comportamiento por defecto a implementar, preparado para cambiarlo fácil.

## 1. Reglas generales
- Stack: Next.js + Supabase (Auth, Postgres con RLS, Storage) + Vercel. Mails del sistema con Resend. Analítica con Google Analytics 4.
- Cuentas: todo está a nombre de vivitravelsmail@gmail.com (GitHub, Vercel, Supabase), creadas el 04/11.
- La web NO gestiona reservas ni cobros. El viajero contacta directo al prestador (WhatsApp, redes, web, mail). El cobro de los planes a prestadores se hace por link de Mercado Pago, fuera de la web.
- Mobile first: todo tiene que funcionar bien en celular.
- Idioma: español de Argentina (voseo: "Descubrí", "Publicá").
- Todo configurable desde el panel admin (categorías, filtros, destinos, planes, textos del home), sin tocar código.

## 2. Lo que ya está hecho en la web (04/11)
- Home con portada, buscador (destino + categoría), accesos a las 5 categorías, grilla de 8 destinos destacados, ejes temáticos y footer con aviso "no gestionamos reservas".
- Rutas: /destinos, /destinos/[slug], /buscar?categoria=..., /buscar?tema=...
- Colores y tipografía correctos (ver punto 13).
- Falta: login y registro, fichas de publicación, resultados con filtros, favoritos, Mi Ruta, portal del prestador, panel admin, lugares gratuitos, planes, estadísticas, eventos y SEO técnico.

## 3. Roles
- **Visitante** (sin sesión): busca, filtra, ve fichas y contacta prestadores.
- **Viajero** (con sesión): además guarda favoritos y arma Mi Ruta.
- **Prestador**: publica sus servicios según su plan y ve sus estadísticas.
- **Admin**: modera y administra todo. Nombre y mail del admin: PENDIENTE DE CONFIRMAR (crear un usuario admin de prueba).
- Login con mail y contraseña (Supabase Auth). Recuperación de contraseña por mail. RLS: cada prestador ve y edita solo lo suyo; cada viajero solo sus favoritos y rutas; el admin, todo.

## 4. Destinos y ubicación
- Alcance: toda la Argentina. Cada publicación tiene provincia y localidad (obligatorias) y ubicación en el mapa (punto con lat/long).
- 8 destinos destacados en el home (gestionables desde el admin): Bariloche, Jujuy, Iguazú, Córdoba, El Calafate, Buenos Aires, Puerto Madryn, Mendoza.
- Página de cada destino: foto, descripción y publicaciones de la zona, filtrables por categoría.
- Mapas: Mapbox (recomendado). PENDIENTE DE CONFIRMAR Mapbox vs Google Maps; dejar el proveedor desacoplado.

## 5. Categorías y filtros

Todas tienen filtro por precio (rango). El precio es obligatorio en cada publicación (número en pesos, "precio desde").

| Categoría | Filtros / campos |
|-----------|-----------------|
| Alojamientos | Tipo: hotel, cabaña, departamento · Capacidad: 1, 2, 3, 4, 5+ personas · Servicios (varios): wifi, estacionamiento, desayuno |
| Actividades y experiencias | Tipo: aventura, naturaleza, gastronómicas, culturales, experiencia · Edad recomendada: menos de 20, 20 a 40, 41 a 50, más de 50 (el rango 41 a 50 está PENDIENTE DE CONFIRMAR; implementarlo) · Nivel de riesgo: bajo, medio, alto |
| Gastronomía | Tipo: bar, restaurant, parrilla, cafetería · Tipo de comida (varios): vegetariana, vegana, sin TACC, étnica, regional · Servicios (varios): wifi, estacionamiento, terraza |
| Servicios | Transporte: auto, combi, city tour, chofer, alquiler de bicicleta (PENDIENTE: puede sumar otros tipos, por eso las opciones se editan desde el admin) |
| Camping | Tipo: familiar, agreste, parcelado, apto motorhome · Servicios (varios): ducha, agua caliente, wifi, electricidad, apto mascotas |

Ejes temáticos (Naturaleza, Aventura, Cultura, Playas, Bienestar): etiquetas que asigna el admin a las publicaciones, usadas en el home y en /buscar?tema=. PENDIENTE DE CONFIRMAR; ya están en la web, dejarlos.

## 6. Publicación (ficha)
- Campos: título, categoría, descripción, provincia, localidad, ubicación en mapa, precio desde (obligatorio), campos de la categoría, fotos (según plan), videos (según plan), WhatsApp, Instagram, Facebook, web, mail.
- Videos: NO se suben archivos. El prestador pega un link de YouTube o Instagram y se muestra embebido en la ficha. Cantidad según plan.
- Ficha pública: galería de fotos, video(s), datos con íconos, mapa de ubicación, precio, botones de contacto (WhatsApp con mensaje pre-armado, Instagram, Facebook, web, mail), "Guardar" (favoritos) y "Agregar a Mi Ruta". El botón "Consultar disponibilidad" abre el WhatsApp del prestador.
- Estados: borrador, en revisión, publicada, pausada, rechazada, vencida.

## 7. Planes de prestadores

| Plan | Precio | Publicaciones activas | Fotos por publicación | Videos por publicación | Extras |
|------|--------|----------------------|----------------------|----------------------|--------|
| Gratuito | $0 | 1 | 2 | 0 | Dura 30 días · métricas |
| Básico | $19.000 | 1 | 6 | 1 | — |
| Premium | $28.000 | 3 | 10 | 2 | Asesoramiento |
| Pro | $42.000 | 7 | 15 | 3 | Destacado en home · primero en resultados · destacadas en IG/TikTok/FB · asesoramiento |

- Precios: PENDIENTE DE CONFIRMAR si son mensuales (asumir mensual). Precios y límites editables desde el admin.
- El sistema hace cumplir los límites: no deja crear más publicaciones, fotos ni videos que los del plan.
- "Destacadas en redes" y "asesoramiento" son servicios que da VIVITRAVELS fuera de la web: solo se muestran como texto en la página de planes.
- Plan Pro: sus publicaciones salen destacadas en el home y primero en los resultados.
- Página pública de planes ("Publicá tu negocio") con la tabla y un botón de registro como prestador.

## 8. Bloqueo automático por vencimiento
- Cada suscripción tiene fecha de vencimiento que carga el admin al validar el pago.
- Al llegar esa fecha, las publicaciones del prestador pasan a vencida/pausada automáticamente (job diario, Vercel Cron o pg_cron) y dejan de verse.
- Plan Gratuito: se pausa solo a los 30 días del alta (PENDIENTE DE CONFIRMAR, implementar así).
- Avisar al prestador por mail unos días antes del vencimiento y el día que vence, con el link de pago.
- El sistema NO detecta pagos: el admin marca el pago como validado y extiende el vencimiento.

## 9. Viajero
- Buscar y resultados (/buscar): texto, destino/provincia/localidad, categoría, tema, filtros de la categoría y rango de precio. Plan Pro primero.
- Vistas de resultados: Listado y Galería (selector). NO hay mapa con todos los resultados.
- Favoritos: botón "Guardar" en tarjetas y fichas; página "Mis favoritos".
- **Mi Ruta:**
  - Crear una o más rutas, agregar publicaciones y lugares gratuitos, separarlas por día, reordenar, borrar y guardar.
  - Mapa con los puntos numerados en orden. NO dibujar el recorrido por calles (queda para etapa 2).
  - Compartir la ruta por link público de solo lectura.
  - Descargar en PDF.
  - Horario y nota opcionales por parada: PENDIENTE DE CONFIRMAR (recomendado sí; implementarlo como campos opcionales).

## 10. Portal del prestador
- Alta y perfil comercial: nombre del negocio, provincia, localidad, descripción y datos de contacto.
- Mis publicaciones: crear y editar con un formulario de 3 pasos (Información → Detalles según categoría → Fotos y videos). Al enviar, la primera queda "en revisión".
- Estadísticas por publicación: visualizaciones, clics a WhatsApp, redes, web y mail, y veces guardada. Con filtro por período, comparación con el período anterior y origen de las visitas (provincia o ciudad del visitante si se puede obtener, y fuente: Google, redes, directo).
- Mi plan: plan actual, límites usados, estado, vencimiento y link de pago de Mercado Pago (configurable por el admin).

## 11. Panel admin
- **Moderación:** la primera publicación de cada prestador necesita aprobación del admin antes de salir. Las siguientes salen directo. El admin puede pausar o rechazar cualquiera en cualquier momento, con un motivo que le llega al prestador por mail.
- **Usuarios:** ver, buscar y suspender viajeros y prestadores.
- **Catálogo:** crear y editar destinos (y cuáles se destacan), categorías, campos y opciones de filtros, y ejes temáticos.
- **Planes:** editar precios y límites; asignar plan a cada prestador, marcar el pago como validado y cargar el vencimiento.
- **Destacados:** elegir publicaciones y destinos destacados en el home.
- **Lugares gratuitos** (ver punto 12).
- **Métricas generales:** visitas, registros, búsquedas más hechas, categorías y publicaciones con más interacción.
- **Contenido del home:** editar textos y banners.

## 12. Lugares gratuitos del administrador
- Atractivos gratuitos que no pertenecen a ningún prestador (ej: Hito Tres Fronteras en Iguazú).
- Los carga el admin desde el panel, de a uno. Usan la misma ficha: fotos, descripción, ubicación, provincia y localidad.
- Sin límites ni vencimiento, y sin precio (se muestra "Gratuito"). Sin botones de contacto con prestador.
- Aparecen en búsquedas, destinos, y se pueden agregar a Mi Ruta y a favoritos.
- Dónde se muestran: PENDIENTE DE CONFIRMAR entre (A) dentro de "Actividades y experiencias" con etiqueta "Gratuito" o (B) categoría propia "Lugares para visitar". **Por defecto: B.** Implementarlo de forma que cambiar sea solo configuración.

## 13. Identidad visual (guía del 28/10)
- Colores: azul #092B4D · turquesa #087F9D · cian #00A0BC · naranja #FF991F · blanco #FFFFFF
- Tipografía: Montserrat. Títulos 700, botones 600, texto 400.
- Logo: versión color y versión blanca. Fotos reales del cliente, grandes, de paisajes.

## 14. Eventos, analítica y SEO
- Registrar en la base cada vista de ficha y cada clic de contacto (WhatsApp, Instagram, Facebook, web, mail), cada "guardar" y cada "agregar a ruta".
- Enviar los mismos eventos a GA4.
- SEO técnico: title y description automáticos por destino y publicación, sitemap.xml, robots.txt, datos estructurados (schema.org), imágenes optimizadas y URLs limpias.
- Páginas de Términos y condiciones y Política de privacidad. Los textos los manda el cliente el 06/11; dejar las páginas listas.

## 15. Fuera de alcance (NO construir)
- Recorrido por calles en el mapa de Mi Ruta (etapa 2).
- Habitaciones como sub-publicación (etapa 2).
- Reseñas y estrellas.
- Búsqueda por fechas y cantidad de huéspedes.
- Sección "Ofertas".
- "Mis consultas" o mensajería interna.
- Reservas, cobros online o facturación dentro de la web.
- Subida de archivos de video.
- App móvil y blog.

## 16. Resumen de pendientes del cliente (mail del 04/11)
- ¿Precios de planes mensuales? → por defecto: mensual.
- Videos por link → por defecto: sí.
- Plan Gratuito se pausa a los 30 días → por defecto: sí.
- Redes y asesoramiento fuera de la web → por defecto: sí, solo texto.
- Rango de edad 41 a 50 → por defecto: agregarlo.
- Otros tipos de Servicios → por defecto: solo transporte, editable desde el admin.
- Horario y nota por parada → por defecto: sí, opcionales.
- Ejes temáticos → por defecto: sí.
- Mapbox o Google Maps → por defecto: Mapbox.
- Nombre y mail del admin → por defecto: usuario admin de prueba.
- Lugares gratuitos A o B → por defecto: B ("Lugares para visitar").

## 17. Criterios de terminado
1. Un prestador se registra, publica en plan Gratuito, el admin lo aprueba y la publicación se ve con sus filtros, precio y botones de contacto.
2. El admin asigna el plan Pro a un prestador: puede cargar 7 publicaciones con 15 fotos y 3 videos por link, y aparece primero en resultados y destacado en el home.
3. Una suscripción vencida pausa sola las publicaciones al día siguiente.
4. El admin carga un lugar gratuito y un viajero lo agrega a su ruta.
5. Un viajero arma una ruta de 3 días, la comparte por link, la descarga en PDF, cierra sesión y la vuelve a encontrar.
6. El prestador ve sus estadísticas comparadas con el período anterior y el origen de las visitas.
7. Todo funciona bien en celular, en Chrome y Safari.
