/**
 * Vincula clientes con sus estaciones usando scripts/matching-clientes-estaciones.csv.
 * Para cada fila del CSV:
 *   1. Busca el cliente en Firestore por codigoExterno
 *   2. Busca la estación por nombre (normalizado)
 *   3. Actualiza estacion: esCliente=true, clienteId=<id>
 *   4. Actualiza cliente: estacionId=<id>
 *
 * npx tsx scripts/link-clientes-estaciones.ts
 * npx tsx scripts/link-clientes-estaciones.ts --dry-run
 */

import fs from 'fs'
import path from 'path'
import { initializeApp, cert, getApps } from 'firebase-admin/app'
import { getFirestore, Timestamp } from 'firebase-admin/firestore'

const DRY_RUN = process.argv.includes('--dry-run')
const CSV_PATH = path.join(process.cwd(), 'scripts', 'matching-clientes-estaciones.csv')
const SERVICE_ACCOUNT_PATH = path.join(process.cwd(), 'scripts', 'service-account.json')

function initFirebase() {
  if (!fs.existsSync(SERVICE_ACCOUNT_PATH)) {
    console.error('❌ No se encontró scripts/service-account.json')
    process.exit(1)
  }
  if (!getApps().length) {
    initializeApp({ credential: cert(SERVICE_ACCOUNT_PATH) })
  }
  return getFirestore()
}

function normalize(s: string) {
  return s.toLowerCase().trim().replace(/\s+/g, ' ')
}

function parseCSV(filePath: string) {
  const lines = fs.readFileSync(filePath, 'utf-8').trim().split('\n')
  const headers = lines[0].split(',')
  return lines.slice(1).map((line) => {
    const values = line.split(',')
    const row: Record<string, string> = {}
    headers.forEach((h, i) => { row[h.trim()] = (values[i] ?? '').trim() })
    return row
  })
}

async function main() {
  const rows = parseCSV(CSV_PATH)
  console.log(`📋 ${rows.length} filas en el CSV`)

  const db = initFirebase()

  // Cargar todas las estaciones y clientes una sola vez
  const [estSnap, cliSnap] = await Promise.all([
    db.collection('estaciones').get(),
    db.collection('clientes').get(),
  ])

  const estacionesByNombre = new Map<string, { id: string; data: any }>()
  estSnap.docs.forEach((d) => {
    estacionesByNombre.set(normalize(d.data().nombre), { id: d.id, data: d.data() })
  })

  const clientesByCodigo = new Map<string, { id: string; data: any }>()
  cliSnap.docs.forEach((d) => {
    const cod = d.data().codigoExterno
    if (cod) clientesByCodigo.set(cod.trim(), { id: d.id, data: d.data() })
  })

  console.log(`  ${estSnap.size} estaciones, ${cliSnap.size} clientes cargados`)

  let matched = 0
  let noCliente = 0
  let noEstacion = 0

  const estacionUpdates: { id: string; clienteId: string }[] = []
  const clienteUpdates: { id: string; estacionId: string }[] = []

  for (const row of rows) {
    const codigo = row['cliente_codigo']
    const estNombre = row['estacion_nombre']

    const cliente = clientesByCodigo.get(codigo)
    if (!cliente) {
      console.warn(`  ⚠️  Cliente no encontrado: codigo=${codigo} (${row['cliente_nombre']})`)
      noCliente++
      continue
    }

    const estacion = estacionesByNombre.get(normalize(estNombre))
    if (!estacion) {
      console.warn(`  ⚠️  Estación no encontrada: "${estNombre}"`)
      noEstacion++
      continue
    }

    estacionUpdates.push({ id: estacion.id, clienteId: cliente.id })
    clienteUpdates.push({ id: cliente.id, estacionId: estacion.id })
    matched++
    console.log(`  ✅ ${row['cliente_nombre']} ↔ ${estNombre}`)
  }

  console.log(`\n📊 Resultado: ${matched} matches, ${noCliente} clientes no encontrados, ${noEstacion} estaciones no encontradas`)

  if (DRY_RUN) {
    console.log('\n[DRY RUN] No se escribió nada.')
    return
  }

  const now = Timestamp.now()
  const BATCH_SIZE = 400

  // Actualizar estaciones
  for (let i = 0; i < estacionUpdates.length; i += BATCH_SIZE) {
    const batch = db.batch()
    for (const { id, clienteId } of estacionUpdates.slice(i, i + BATCH_SIZE)) {
      batch.update(db.collection('estaciones').doc(id), {
        esCliente: true,
        clienteId,
        actualizadaEn: now,
      })
    }
    await batch.commit()
  }
  console.log(`✅ ${estacionUpdates.length} estaciones actualizadas (esCliente=true)`)

  // Actualizar clientes con estacionId
  for (let i = 0; i < clienteUpdates.length; i += BATCH_SIZE) {
    const batch = db.batch()
    for (const { id, estacionId } of clienteUpdates.slice(i, i + BATCH_SIZE)) {
      batch.update(db.collection('clientes').doc(id), { estacionId })
    }
    await batch.commit()
  }
  console.log(`✅ ${clienteUpdates.length} clientes actualizados (estacionId)`)
}

main().catch((err) => {
  console.error('❌ Error:', err)
  process.exit(1)
})
