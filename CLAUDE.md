@AGENTS.md

# Dashboard Promociones — CLAUDE.md

Sistema de gestión de promociones para estaciones de servicio en Uruguay. Permite crear y enviar promociones vía WhatsApp, con análisis de flyers por IA y visualización en mapas.

## Stack

- **Framework:** Next.js 16 (App Router) + React 19 + TypeScript 5
- **Estilos:** Tailwind CSS 4 + shadcn/ui (estilo base-nova)
- **Base de datos:** Firestore (Firebase) — sin ORM, acceso directo
- **Auth:** Firebase Auth (email/password + Google OAuth)
- **Storage:** Firebase Storage + Cloudinary (flyers)
- **Mensajería:** Twilio WhatsApp API
- **Mapas:** Mapbox GL + react-map-gl
- **IA:** Claude via Vercel AI SDK (`@ai-sdk/anthropic`) para análisis de flyers
- **Deploy:** Vercel

## Estructura de directorios

```
app/
  (auth)/login/          # Login page
  (dashboard)/           # Rutas protegidas (layout con auth check)
    page.tsx             # Dashboard home
    estaciones/          # Gestión de estaciones de servicio
    clientes/            # Gestión de clientes
    comercios/           # Gestión de comercios
    promociones/         # Gestión de promociones
    reportes/            # Reportes
  api/
    analizar-flyer/      # POST — Claude vision extrae datos de flyer
    whatsapp/send/       # POST — Envío WhatsApp vía Twilio
    seed/                # POST — Seeding de base de datos

components/
  ui/                    # shadcn/ui primitives
  layout/                # Sidebar, Topbar, MobileNav
  shared/                # PageHeader, LoadingSpinner, EmptyState, ConfirmDialog
  promociones/           # PromoCard, PromoForm, FlyerUpload, EnvioModal
  clientes/              # Componentes de clientes
  comercios/             # Componentes de comercios
  estaciones/            # Componentes de estaciones

hooks/                   # Custom hooks (useAuth, useEstaciones, useClientes, etc.)
lib/
  firebase/              # Toda la lógica Firestore (estaciones, clientes, promociones, comercios, envios)
  storage.ts             # Cloudinary
  twilio.ts              # Twilio helpers
types/index.ts           # Todos los tipos y enums
constants/departamentos.ts
scripts/                 # Seeding scripts (ejecutar con tsx)
```

## Comandos frecuentes

```bash
npm run dev              # Servidor de desarrollo
npm run build            # Build de producción
npm run lint             # ESLint

# Seeding
npm run seed:fetch       # Obtiene estaciones de OpenStreetMap
npm run seed:upload      # Carga datos a Firestore
npm run seed:upload:dry  # Dry run
npm run seed:upload:reset # Limpia y recarga
```

## Variables de entorno

Ver `.env.local.example`. Las claves necesarias:

- `NEXT_PUBLIC_FIREBASE_*` — configuración Firebase (cliente)
- `FIREBASE_*` / service account — para scripts admin
- `NEXT_PUBLIC_MAPBOX_TOKEN`
- `CLOUDINARY_*`
- `TWILIO_*` (opcional)
- `ANTHROPIC_API_KEY`

## Modelo de datos (Firestore)

Colecciones principales:
- **estaciones** — `Estacion`: marca, departamento, coordenadas, teléfono
- **clientes** — `Cliente`: WhatsApp, email, contacto, ligado a `estacionId`
- **promociones** — `Promocion`: flyer, fechas, producto, precio, estado
- **comercios** — `Comercio`: tipo, ubicación, contacto
- **envios** — `Envio`: estado de entrega, destinatarios

Enums clave: `Marca`, `EstadoPromocion`, `EstadoEnvio`, `TipoComercio`, `FuenteEstacion`

## Hooks pattern

Cada entidad tiene hooks separados:
```ts
useEstaciones()           // lista
useEstacion(id)           // detalle
useEstacionMutations()    // create/update/delete
```
Mismo patrón para clientes, comerciones y promociones.

## API `/api/analizar-flyer`

Recibe `multipart/form-data` con imagen. Usa Claude Opus 4.7 vía Vercel AI SDK para extraer:
`{ nombre, descripcion, producto, precio? }`

## Convenciones

- Importaciones absolutas con alias `@/`
- Server Components por defecto; `"use client"` solo cuando sea necesario
- Firestore accedido directamente desde `lib/firebase/` — no hay capa de API REST interna salvo las rutas en `app/api/`
- Scripts de seeding usan `firebase-admin` con `tsx` (no `ts-node`)
