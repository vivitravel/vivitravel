# Alcance y decisiones (actualizado al 04/11/2026)

Fuentes: Propuesta ajustada, "Puntos a confirmar", "Resolución puntos bloqueantes" (Sebastián, 29/10; **incluye tablas e imágenes**: leelas completas, no solo el texto), guía de identidad digital del 28/10, mails de Walo.

## Qué es el MVP
Tres entornos sobre una misma base: sitio público (viajeros), portal de prestadores y panel de administración. Incluye: home, categorías y destinos, buscador y filtros, fichas, registro de viajeros, favoritos, planificador "Mi Ruta" básico, portal de prestadores con estadísticas, planes administrados a mano, enlaces de pago externos (Mercado Pago), panel de administración, GA4, SEO técnico, seguridad, QA, puesta en producción y entrega del código.

## Categorías (definitivas)
Alojamientos, Actividades y Experiencias (una sola), Gastronomía, Servicios (Transporte va adentro) y Camping (categoría propia).

## Destinos destacados (8, definitivos)
Bariloche, Buenos Aires, El Calafate, Córdoba, Iguazú, Jujuy, Mendoza, Puerto Madryn. El alcance es **toda la Argentina**: cada publicación lleva provincia y localidad. Ushuaia aparece en un boceto viejo pero **no va**.

## Filtros por categoría (tabla de Sebastián)
- Alojamientos: tipo (hotel, cabaña, departamento), capacidad (1 a 5 o más), servicios (wifi, estacionamiento, desayuno).
- Actividades: tipo (aventura, naturaleza, gastronómicas, culturales, experiencia), edad recomendada (menos de 20, 20 a 40, más de 50; **hueco 41 a 50: se propuso agregarlo, falta confirmar**), nivel de riesgo (bajo, medio, alto).
- Gastronomía: tipo (bar, restaurant, parrilla, cafetería), tipo de comida (vegetariana, vegana, sin TACC, étnica, regional), servicios (wifi, estacionamiento, terraza).
- Servicios: transporte (auto, combi, city tour, chofer, alquiler de bicicleta). Solo transporte; se preguntó si suma otros tipos.
- Camping: tipo (familiar, agreste, parcelado, apto motorhome), servicios (ducha, agua caliente, wifi, electricidad, apto a mascotas).
- Filtro por **precio** en todas: el precio es obligatorio, el prestador no puede ocultarlo.

## Planes (definidos por Sebastián)
| | Gratuito | Básico | Premium | Pro |
|---|---|---|---|---|
| Precio de referencia | $0 | $19.000 | $28.000 | $42.000 |
| Duración | 30 días | sin tope | sin tope | sin tope |
| Publicaciones activas | 1 | 1 | 3 | 7 |
| Fotos por publicación | 2 | 6 | 10 | 15 |
| Videos por publicación | 0 | 1 | 2 | 3 |
| Destacado en home y primero en resultados | no | no | no | **sí** |
| Destacados en Instagram, TikTok y Facebook | no | no | no | sí |
| Asesoramiento en la publicación | no | no | sí | sí |
| Métricas | sí | sí | sí | sí |
Baja inmediata en todos. Los destacados en redes y el asesoramiento son **servicios de VIVITRAVELS fuera de la web**: el sitio solo muestra qué incluye cada plan. Falta confirmar: si los precios son mensuales y si el plan gratuito se puede reutilizar.

## Reglas de negocio ya implementadas en la base
- Un prestador nuevo arranca con el plan Gratuito activo por 30 días.
- La **primera publicación** de cada prestador la revisa el administrador; después de aprobada, sus publicaciones nuevas salen directo, siempre que tenga plan vigente. El administrador puede pausar cualquiera.
- El sistema solo valida que el formulario esté completo (datos obligatorios, fotos mínimas, precio, plan vigente); no juzga si textos o fotos son verdaderos.
- Al vencer el plan, las publicaciones se pausan (hay que programar `expire_subscriptions()` con pg_cron). **El sistema bloquea por fecha de vencimiento; no detecta pagos**: el cobro es por link de Mercado Pago y lo valida el administrador.
- Se bloquea publicar más de las permitidas y subir más fotos que las del plan.

## Concesiones sin costo (decididas por Walo/Bruno, a dejar por escrito al cliente)
Compartir la ruta con link, PDF de la ruta, estadísticas comparadas con período anterior y origen de visitas, vista Galería, Camping como categoría propia, bloqueo automático al vencer el plan. Cuidado con el precedente: cada extra que se absorbe se deja por escrito como concesión.

## Queda fuera del MVP (etapa 2 o cotización aparte)
- **Recorrido por calles en el mapa de Mi Ruta**: requiere un servicio de rutas con costo por uso. Sebastián lo aprobó dos veces; decisión comercial de Walo (el borrador propone etapa 2). En el MVP, puntos numerados en orden.
- Habitaciones como sub-publicación, reseñas y estrellas, búsqueda por fechas y huéspedes, "Ofertas", "Mis consultas" (mensajería), mapa con todos los resultados, app móvil nativa, reservas, facturación, banners autogestionables, blog, carga masiva de contenido.
- Subida de **archivos de video**: se propuso que el prestador pegue un link (YouTube se muestra en la ficha; Instagram y TikTok abren un botón "Ver video", porque insertarlos es poco confiable). Falta confirmar con Sebastián.

## Pedido nuevo (por WhatsApp, sin confirmar): atractivos del administrador
Sebastián quiere publicar él, como administrador, atractivos gratuitos sin prestador (ej. Hito Tres Fronteras): fuera de los planes, sin botón de contacto, y que se puedan sumar a Mi Ruta. Evaluación: complejidad baja; requiere permitir publicaciones sin prestador ni precio, una categoría "Atractivos" (recomendado) y ficha/tarjeta sin contacto ni precio. Condiciones: carga de contenido a cargo de Sebastián, ubicación en el mapa obligatoria. **Pendiente de la decisión de Walo.**

## Identidad visual (guía del 28/10, la que vale)
Azul marino `#092B4D` (títulos), turquesa `#087F9D` (enlaces, botón secundario), cian `#00A0BC` (detalles decorativos), naranja `#FF991F` (llamadas a la acción), blanco (fondos). Montserrat: 700 títulos, 600 botones y navegación, 400 cuerpo. Es una propuesta operativa **no certificada** contra el archivo maestro del logo. Logo: usar la imagen completa (símbolo, nombre y lema) sin recolorear, estirar ni modificar; hay versiones original, blanca, negativa y monocromática en SVG (`public/brand`). Falta la versión horizontal y un símbolo solo para favicon.

## Textos legales
Los redacta el asesor legal de Sebastián; promesa de entrega el viernes 06/11. Nosotros solo los publicamos.
