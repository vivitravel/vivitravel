# Estado y pendientes (04/11/2026)

## Hecho
- Proyecto base Next.js 16 + Supabase conectado; repositorio `vivitravel/vivitravel`.
- Marca aplicada (guía del 28/10), logo oficial en encabezado y pie, Montserrat.
- Esquema de base con RLS, planes definitivos, topes de plan, plan Gratuito automático, atributos y filtros cargados, Storage con portada y fotos de destinos.
- Pantallas públicas: home (portada editable desde `site_settings`), destinos, página de destino, búsqueda (destino, categoría, tema, texto, precio, orden, vistas Listado y Galería), ficha con contacto directo y seguimiento de vistas y clics. Revisadas en escritorio y sin desplazamiento horizontal a 390 px.

## Falta construir, en este orden sugerido
1. **Registro, login y favoritos** (habilita todo lo demás; incluye SMTP propio para los mails de confirmación).
2. **Filtros por categoría en la búsqueda** (los atributos ya están en la base, falta la interfaz) y atributos en la ficha.
3. **Portal del prestador:** alta, perfil, formulario de publicación por pasos (Información, Detalles, Fotos y publicación), subida de fotos con tope por plan, estadísticas (visualizaciones, clics, guardados, comparación con período anterior, origen), "Mi plan".
4. **Panel de administración (todo autoadministrable):** moderación (primera publicación de cada prestador), usuarios, destinos y sus fotos, categorías, atributos y opciones, planes y suscripciones (validar pago, vencimiento), destacados, ejes temáticos, textos e imagen de la portada, métricas generales.
5. **Mi Ruta:** crear ruta, agregar publicaciones, organizar por día, reordenar, mapa con puntos numerados, horario y nota opcionales (a confirmar), link compartible, PDF.
6. Mapa embebido en la ficha (proveedor a confirmar: Mapbox recomendado).
7. Integraciones: GA4, Search Console, DNS en NIC.ar (`vivitravels.com.ar`, el titular es el cliente), SMTP, `pg_cron` para vencimientos.
8. SEO: 404 reales, datos estructurados, sitemap.
9. QA completo, puesta en producción en Vercel, entrega de accesos y documentación.

## Esperando decisión o dato de Sebastián (vía Walo)
- Si los precios de los planes son mensuales; reutilización del plan Gratuito.
- Videos: links en vez de archivos.
- Rango de edad 41 a 50 en Actividades; si Servicios suma otros tipos además de transporte.
- Horario y nota por parada de Mi Ruta; ejes temáticos.
- Proveedor de mapas.
- Recorrido por calles (etapa 2 vs cotización).
- Atractivos del administrador sin prestador.
- Nombre y mail de quien administra y aprueba publicaciones.
- Textos legales (promesa 06/11).
- Logo horizontal y símbolo solo para favicon; archivo maestro de colores y tipografía.
- Confirmar que la foto de Córdoba es la que quiere (es una calle del centro).

## Material sin usar todavía
- 80 fotos de la carpeta "Imagenes Web" del Drive (destinos: Bariloche 34, Mendoza 9, Calafate 8, Iguazú 7, Otros 6, Mar del Plata 4, San Juan 3, Salta 3, Jujuy 3, Puerto Madryn 3). Hay duplicados en Bariloche y algunos archivos "Compartido desde Lightroom mobile". Servirán para publicaciones de prueba y galerías de destino; hay que subirlas a Storage limpias y con nombres claros.
- La contraseña de la base se compartió por chat durante el trabajo: **conviene restablecerla** en Supabase (Project Settings, Database).
