/**
 * Sube estaciones desde scripts/estaciones-uruguay.json a Firestore.
 * Usa Firebase Admin SDK (requiere service account).
 *
 * Setup:
 *   1. Firebase Console → Proyecto → Configuración → Cuentas de servicio
 *   2. "Generar nueva clave privada" → guardar como scripts/service-account.json
 *   3. npx tsx scripts/seed-estaciones.ts
 *
 * Flags:
 *   --dry-run   Muestra cuántos docs se subirían sin escribir nada
 *   --clear     Borra la colección entera antes de subir (¡cuidado!)
 */

import fs from 'fs'
import path from 'path'
import { initializeApp, cert, getApps } from 'firebase-admin/app'
import { getFirestore, Timestamp } from 'firebase-admin/firestore'

const DRY_RUN = process.argv.includes('--dry-run')
const CLEAR = process.argv.includes('--clear')
const BATCH_SIZE = 400
const COLLECTION = 'estaciones'

const SERVICE_ACCOUNT_PATH = path.join(process.cwd(), 'scripts', 'service-account.json')
const DATA_PATH = path.join(process.cwd(), 'scripts', 'estaciones-uruguay.json')

function initFirebase() {
  if (!fs.existsSync(SERVICE_ACCOUNT_PATH)) {
    console.error(`\n❌ No se encontró scripts/service-account.json`)
    console.error('   Ve a Firebase Console → Configuración del proyecto → Cuentas de servicio')
    console.error('   → "Generar nueva clave privada" y guardá el archivo ahí.\n')
    process.exit(1)
  }
  if (!getApps().length) {
    initializeApp({ credential: cert(SERVICE_ACCOUNT_PATH) })
  }
  return getFirestore()
}

async function clearCollection(db: FirebaseFirestore.Firestore) {
  console.log('Borrando colección existente...')
  const snapshot = await db.collection(COLLECTION).get()
  const batches: Promise<void>[] = []
  let batch = db.batch()
  let count = 0

  for (const doc of snapshot.docs) {
    batch.delete(doc.ref)
    count++
    if (count % BATCH_SIZE === 0) {
      batches.push(batch.commit().then(() => {}))
      batch = db.batch()
    }
  }
  if (count % BATCH_SIZE !== 0) batches.push(batch.commit().then(() => {}))
  await Promise.all(batches)
  console.log(`✓ ${snapshot.size} documentos borrados`)
}

async function main() {
  if (!fs.existsSync(DATA_PATH)) {
    console.error(`\n❌ No se encontró scripts/estaciones-uruguay.json`)
    console.error('   Ejecutá primero: npx tsx scripts/fetch-estaciones-osm.ts\n')
    process.exit(1)
  }

  const estaciones = JSON.parse(fs.readFileSync(DATA_PATH, 'utf-8'))
  console.log(`Estaciones a subir: ${estaciones.length}`)

  if (DRY_RUN) {
    console.log('\n[DRY RUN] No se escribió nada en Firestore.')
    console.log('Ejemplo del primer registro:')
    console.log(JSON.stringify(estaciones[0], null, 2))
    return
  }

  const db = initFirebase()

  if (CLEAR) await clearCollection(db)

  const now = Timestamp.now()
  let uploaded = 0
  let skipped = 0

  for (let i = 0; i < estaciones.length; i += BATCH_SIZE) {
    const chunk = estaciones.slice(i, i + BATCH_SIZE)
    const batch = db.batch()

    for (const estacion of chunk) {
      if (!estacion.nombre) { skipped++; continue }
      const ref = db.collection(COLLECTION).doc()
      batch.set(ref, {
        ...estacion,
        creadaEn: now,
        actualizadaEn: now,
      })
      uploaded++
    }

    await batch.commit()
    console.log(`  Subidos ${Math.min(i + BATCH_SIZE, estaciones.length)}/${estaciones.length}...`)
  }

  console.log(`\n✓ ${uploaded} estaciones subidas a Firestore`)
  if (skipped > 0) console.log(`  ${skipped} omitidas (sin nombre)`)
}

main().catch(console.error)
