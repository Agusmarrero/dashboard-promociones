/**
 * Importa clientes desde "scripts/clientes Paola.xls" a Firestore.
 * Solo importa los de subcategoría 00000008 (Estaciones de Servicio).
 *
 * Setup:
 *   npm install xlrd-js   ← no necesario, usa script python intermedio
 *   npx tsx scripts/seed-clientes.ts
 *   npx tsx scripts/seed-clientes.ts --dry-run
 */

import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'
import { initializeApp, cert, getApps } from 'firebase-admin/app'
import { getFirestore, Timestamp } from 'firebase-admin/firestore'

const DRY_RUN = process.argv.includes('--dry-run')
const BATCH_SIZE = 400
const COLLECTION = 'clientes'

const SERVICE_ACCOUNT_PATH = path.join(process.cwd(), 'scripts', 'service-account.json')
const XLS_PATH = path.join(process.cwd(), 'scripts', 'clientes Paola.xls')

function initFirebase() {
  if (!fs.existsSync(SERVICE_ACCOUNT_PATH)) {
    console.error('\n❌ No se encontró scripts/service-account.json')
    process.exit(1)
  }
  if (!getApps().length) {
    initializeApp({ credential: cert(SERVICE_ACCOUNT_PATH) })
  }
  return getFirestore()
}

function extractClientesFromXls(): any[] {
  // Usa python3 (ya disponible en el sistema) para leer el .xls
  const script = `
import xlrd, json, sys
wb = xlrd.open_workbook(sys.argv[1])
sh = wb.sheets()[0]
clientes = []
for r in range(1, sh.nrows):
    row = [str(sh.cell_value(r,c)) for c in range(sh.ncols)]
    if '00000008' not in row[4]:
        continue
    cel = row[8].strip()
    tel = row[9].strip()
    email = (row[6] or row[7]).strip()
    # Normaliza teléfono: preferir celular, sino teléfono fijo
    whatsapp = cel if cel else tel
    # Agrega prefijo Uruguay si es número local
    if whatsapp and not whatsapp.startswith('+') and not whatsapp.startswith('598'):
        whatsapp = '+598' + whatsapp.lstrip('0')
    clientes.append({
        'codigoExterno': row[0].strip(),
        'nombreContacto': row[2].strip(),
        'estacionNombre': row[1].strip(),
        'telefonoWhatsapp': whatsapp,
        'email': email,
        'direccion': row[14].strip(),
        'localidad': row[15].strip(),
        'departamento': row[16].strip(),
        'activo': True,
        'estacionId': None,
    })
print(json.dumps(clientes))
`
  const tmpScript = path.join('/tmp', 'extract_clientes.py')
  fs.writeFileSync(tmpScript, script)
  const output = execSync(`python3 ${tmpScript} "${XLS_PATH}"`).toString()
  return JSON.parse(output)
}

async function main() {
  if (!fs.existsSync(XLS_PATH)) {
    console.error(`\n❌ No se encontró: ${XLS_PATH}\n`)
    process.exit(1)
  }

  console.log('📋 Leyendo clientes del XLS...')
  const clientes = extractClientesFromXls()
  console.log(`✅ ${clientes.length} clientes encontrados (subcategoría Estaciones de Servicio)`)

  if (DRY_RUN) {
    console.log('\n🔍 Modo dry-run — primeros 5 registros:')
    clientes.slice(0, 5).forEach((c) => console.log(' ', JSON.stringify(c)))
    console.log(`\n→ Se subirían ${clientes.length} clientes a la colección "${COLLECTION}"`)
    return
  }

  const db = initFirebase()
  let count = 0

  for (let i = 0; i < clientes.length; i += BATCH_SIZE) {
    const batch = db.batch()
    const chunk = clientes.slice(i, i + BATCH_SIZE)
    for (const c of chunk) {
      const ref = db.collection(COLLECTION).doc()
      batch.set(ref, {
        ...c,
        creadoEn: Timestamp.now(),
      })
    }
    await batch.commit()
    count += chunk.length
    console.log(`  ↑ ${count}/${clientes.length} subidos...`)
  }

  console.log(`\n✅ ${count} clientes importados a Firestore`)
}

main().catch((err) => {
  console.error('❌ Error:', err)
  process.exit(1)
})
