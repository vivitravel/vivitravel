---
name: vivitravels
description: Contexto completo del proyecto VIVITRAVELS (plataforma turística de Alora para Sebastián Márquez): alcance acordado, decisiones del cliente, stack Next.js + Supabase, esquema de base de datos, flujo de trabajo, criterio de calidad y pendientes. Usar al trabajar en este repositorio, al responder preguntas del cliente o al decidir si algo entra o no en el MVP.
---

# VIVITRAVELS: guía del proyecto

Directorio turístico de descubrimiento para toda la Argentina. **No es una plataforma de reservas**: el viajero busca, guarda y planifica; el contacto es directo con el prestador (WhatsApp, mail, redes, web, teléfono). El negocio de Sebastián se financia con suscripciones de prestadores.

## Quién es quién
- **Cliente:** Carlos Sebastián Márquez (VIVITRAVELS). Su hija maneja redes. Mail dueño de las cuentas técnicas: `vivitravelsmail@gmail.com`.
- **Alora:** **Bruno** (líder técnico, hace el desarrollo) y **Walo** (único contacto con Sebastián; toda comunicación con el cliente y decisión comercial pasa por Walo).
- Si algo requiere hablar con Sebastián o decidir precio/alcance, **avisale a Walo**, no le escribas al cliente.

## Condiciones comerciales
Propuesta "VIVITRAVELS - PROPUESTA AJUSTADA": **ARS 2.800.000** para el MVP, 60 a 75 días corridos, entrega objetivo **28/12/2026**. Pago 50% inicio (ya pagado), 25% a los 30 días (ARS 700.000), 25% antes de producción. Lo que no está en la propuesta se cotiza aparte, salvo concesiones que Walo decida y deje por escrito. Detalle: `references/alcance-y-decisiones.md`.

## Criterio de calidad (lo pidió Bruno, es regla)
- El diseño tiene que verse **prolijo, claro y excelente**. **Verificá cada cosa que hagas**: levantá el sitio, sacá capturas en escritorio y en celular (390 px) y mirálas antes de dar algo por terminado. Cómo: `references/flujo-de-trabajo.md`.
- Todo lo que se ve en el sitio tiene que ser **autoadministrable** desde el panel de administración (destinos, categorías, atributos, planes, textos e imagen de la portada, etc.). No hardcodear contenido que el cliente querría cambiar.
- Accesibilidad: contraste suficiente (el texto blanco sobre naranja no cumple; el botón principal usa texto azul marino), foco visible, textos alternativos.
- Español rioplatense con voseo ("Buscá", "Cargá").

## Stack
Next.js 16 (App Router, Cache Components, `proxy.ts` en lugar de middleware), React 19, Tailwind 4, Supabase (Postgres + Auth + Storage), hosting previsto en Vercel. Cuentas a nombre del cliente. **Next 16 cambió APIs**: antes de escribir código de Next leé la doc local en `node_modules/next/dist/docs/` (lo pide `AGENTS.md`).

## Dónde está cada cosa
- Rutas: `src/app` (home, `/destinos`, `/destinos/[slug]`, `/buscar`, `/publicacion/[slug]`).
- Componentes: `src/components`. Datos públicos cacheados: `src/lib/data.ts` (cliente anónimo en `src/lib/supabase/public.ts`). Helpers de URL de imágenes y precios: `src/lib/format.ts`.
- Marca y tokens: `src/app/globals.css`. Logos: `public/brand/`.
- Base de datos: `supabase/migrations/` (0001 a 0006 ya aplicadas en el proyecto del cliente). Detalle: `references/base-de-datos.md`.

## Estado y pendientes
Ver `references/pendientes.md` (qué está hecho, qué falta, y qué espera respuesta de Sebastián).

## Secretos
**Nunca** pongas claves en el repositorio. `.env.local` está ignorado por git; `.env.example` muestra qué variables hacen falta. La contraseña de la base y la clave del administrador provisorio se las pedís a Bruno.
