# Integración Power BI Desktop

## Objetivo

Exponer datos de Firestore a Power BI Desktop via endpoint REST protegido con API Key.

## Plan de implementación

### 1. Agregar variable de entorno

En `.env.local`:
```
POWERBI_API_KEY=genera-una-clave-larga-aleatoria-aqui
```

También agregarla en Vercel Dashboard → Settings → Environment Variables.

Generar una clave segura con:
```bash
openssl rand -hex 32
```

### 2. Crear el endpoint

Archivo: `app/api/reportes/export/route.ts`

```ts
import { NextRequest, NextResponse } from "next/server";
import { getEnvios } from "@/lib/firebase/envios";
import { getPromociones } from "@/lib/firebase/promociones";
import { getClientes } from "@/lib/firebase/clientes";
import { getEstaciones } from "@/lib/firebase/estaciones";

export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get("key");

  if (!key || key !== process.env.POWERBI_API_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [envios, promociones, clientes, estaciones] = await Promise.all([
    getEnvios(),
    getPromociones(),
    getClientes(),
    getEstaciones(),
  ]);

  return NextResponse.json({
    envios,
    promociones,
    clientes,
    estaciones,
  });
}
```

> Ajustar las funciones importadas según cómo estén exportadas en `lib/firebase/`.

### 3. Conectar Power BI Desktop

1. Abrir Power BI Desktop
2. **Inicio → Obtener datos → Web**
3. Pegar la URL:
   ```
   https://tu-dominio.vercel.app/api/reportes/export?key=TU_API_KEY
   ```
4. Power BI parsea el JSON automáticamente
5. Expandir las tablas (`envios`, `promociones`, etc.) en el editor de Power Query
6. Cargar y crear los reportes

### 4. Refresh automático (opcional)

Para actualizar los datos periódicamente en Power BI Desktop:
- **Inicio → Actualizar** — manual
- Para refresh automático necesitás Power BI Service (requiere licencia Pro)

## Notas de seguridad

- Nunca exponer la API Key en el frontend
- La key solo vive en `.env.local` y Vercel env vars
- Si la key se compromete, regenerar con `openssl rand -hex 32` y actualizar en Vercel
- Considerar rate limiting si el endpoint se usa mucho (ej. con `upstash/ratelimit`)

## Datos expuestos

| Tabla | Descripción |
|-------|-------------|
| `envios` | Estado de entregas, destinatarios, fechas |
| `promociones` | Producto, precio, estado, fechas |
| `clientes` | Contacto, estación asociada |
| `estaciones` | Marca, departamento, coordenadas |
