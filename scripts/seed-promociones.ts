/**
 * Analiza flyers con Claude, los sube a Firebase Storage y crea las promociones en Firestore.
 *
 * Setup:
 *   1. Poner los flyers en scripts/flyers/ (JPG, PNG o WebP)
 *   2. Agregar ANTHROPIC_API_KEY en .env.local
 *   3. npx tsx scripts/seed-promociones.ts
 *
 * Flags:
 *   --dry-run   Analiza los flyers con IA pero no escribe nada en Firebase
 */

import fs from 'fs'
import path from 'path'
import { initializeApp, cert, getApps } from 'firebase-admin/app'
import { getFirestore, Timestamp } from 'firebase-admin/firestore'
import { getStorage } from 'firebase-admin/storage'
import type { Bucket } from '@google-cloud/storage'
import Anthropic from '@anthropic-ai/sdk'
import * as dotenv from 'dotenv'

dotenv.config({ path: path.join(process.cwd(), '.env.local') })

const DRY_RUN = process.argv.includes('--dry-run')
const FLYERS_DIR = path.join(process.cwd(), 'scripts')
const SERVICE_ACCOUNT_PATH = path.join(process.cwd(), 'scripts', 'service-account.json')

const SUPPORTED_TYPES: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
}

function initFirebase() {
  if (!fs.existsSync(SERVICE_ACCOUNT_PATH)) {
    console.error(`\n❌ No se encontró scripts/service-account.json`)
    process.exit(1)
  }
  if (!getApps().length) {
    const sa = JSON.parse(fs.readFileSync(SERVICE_ACCOUNT_PATH, 'utf-8'))
    initializeApp({
      credential: cert(sa),
      storageBucket: `${sa.project_id}.firebasestorage.app`,
    })
  }
  return { db: getFirestore(), bucket: getStorage().bucket() }
}

async function analyzeFlyer(filePath: string, mimeType: string) {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  const base64 = fs.readFileSync(filePath).toString('base64')

  const message = await client.messages.create({
    model: 'claude-opus-4-7',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: mimeType as 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif',
              data: base64,
            },
          },
          {
            type: 'text',
            text: `Analizá este flyer de promoción de combustible/estación de servicio y extraé la siguiente información en formato JSON:
- nombre: nombre corto de la promoción (string)
- descripcion: descripción completa de la promoción (string)
- producto: el producto o servicio promocionado, ej: "Nafta Premium", "Diesel", "Lavado" (string)
- precio: monto que el cliente debe pagar para acceder, solo el número sin símbolo (number o null)
- vigenciaDesde: fecha de inicio de vigencia en formato YYYY-MM-DD (string o null)
- vigenciaHasta: fecha de fin de vigencia en formato YYYY-MM-DD (string o null)

Respondé ÚNICAMENTE con el JSON, sin texto adicional.`,
          },
        ],
      },
    ],
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : ''
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  return JSON.parse(jsonMatch ? jsonMatch[0] : text)
}

async function uploadFlyer(bucket: Bucket, filePath: string, fileName: string, mimeType: string) {
  const timestamp = Date.now()
  const storagePath = `flyers/seed/${timestamp}_${fileName}`
  await bucket.upload(filePath, {
    destination: storagePath,
    metadata: { contentType: mimeType },
  })
  const [url] = await bucket.file(storagePath).getSignedUrl({
    action: 'read',
    expires: '03-01-2030',
  })
  return { url, path: storagePath }
}

async function main() {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('\n❌ Falta ANTHROPIC_API_KEY en .env.local')
    process.exit(1)
  }

  const files = fs.readdirSync(FLYERS_DIR).filter((f) => {
    const ext = path.extname(f).toLowerCase()
    return ext in SUPPORTED_TYPES
  })

  if (files.length === 0) {
    console.error('\n❌ No se encontraron imágenes en scripts/flyers/')
    process.exit(1)
  }

  console.log(`\n📂 Encontrados ${files.length} flyer(s): ${files.join(', ')}`)
  if (DRY_RUN) console.log('🔍 Modo dry-run: no se escribirá en Firebase\n')

  const firebase = DRY_RUN ? null : initFirebase()
  const db = firebase?.db
  const bucket = firebase?.bucket

  for (const fileName of files) {
    const filePath = path.join(FLYERS_DIR, fileName)
    const ext = path.extname(fileName).toLowerCase()
    const mimeType = SUPPORTED_TYPES[ext]

    console.log(`\n🔍 Analizando: ${fileName}`)

    let data: {
      nombre: string
      descripcion: string
      producto: string
      precio: number | null
      vigenciaDesde: string | null
      vigenciaHasta: string | null
    }

    try {
      data = await analyzeFlyer(filePath, mimeType)
      console.log(`  ✅ IA extrajo:`)
      console.log(`     Nombre:      ${data.nombre}`)
      console.log(`     Producto:    ${data.producto}`)
      console.log(`     Precio:      ${data.precio ?? '(sin precio)'}`)
      console.log(`     Descripción: ${data.descripcion?.slice(0, 80)}...`)
      console.log(`     Vigencia:    ${data.vigenciaDesde ?? '?'} → ${data.vigenciaHasta ?? '?'}`)
    } catch (err) {
      console.error(`  ❌ Error al analizar con IA: ${err}`)
      continue
    }

    if (DRY_RUN || !bucket || !db) continue

    let flyerUrl = ''
    let flyerPath = ''
    try {
      const uploaded = await uploadFlyer(bucket, filePath, fileName, mimeType)
      flyerUrl = uploaded.url
      flyerPath = uploaded.path
      console.log(`  ☁️  Subido a Storage: ${flyerPath}`)
    } catch (err) {
      console.error(`  ❌ Error al subir a Storage: ${err}`)
      continue
    }

    const vigenciaDesde = data.vigenciaDesde ? new Date(data.vigenciaDesde) : new Date()
    const vigenciaHasta = data.vigenciaHasta
      ? new Date(data.vigenciaHasta)
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

    try {
      const docRef = await db.collection('promociones').add({
        nombre: data.nombre,
        descripcion: data.descripcion,
        producto: data.producto || null,
        precio: data.precio ?? null,
        flyerUrl,
        flyerPath,
        vigenciaDesde: Timestamp.fromDate(vigenciaDesde),
        vigenciaHasta: Timestamp.fromDate(vigenciaHasta),
        estado: 'borrador',
        creadaEn: Timestamp.now(),
      })
      console.log(`  🎉 Promoción creada en Firestore: ${docRef.id}`)
    } catch (err) {
      console.error(`  ❌ Error al guardar en Firestore: ${err}`)
    }
  }

  console.log('\n✅ Listo!')
}

main().catch(console.error)
