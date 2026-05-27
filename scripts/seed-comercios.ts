/**
 * Importa comercios desde "scripts/clientes Paola.xls" a Firestore.
 * Importa los registros que NO son subcategoría 00000008 (Estaciones de Servicio).
 *
 *   npx tsx scripts/seed-comercios.ts
 *   npx tsx scripts/seed-comercios.ts --dry-run
 */

import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'
import { initializeApp, cert, getApps } from 'firebase-admin/app'
import { getFirestore, Timestamp } from 'firebase-admin/firestore'

const DRY_RUN = process.argv.includes('--dry-run')
const BATCH_SIZE = 400
const COLLECTION = 'comercios'

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

function extractComerciosFromXls(): any[] {
  const script = `
import xlrd, json, sys
wb = xlrd.open_workbook(sys.argv[1])
sh = wb.sheets()[0]
comercios = []
for r in range(1, sh.nrows):
    row = [str(sh.cell_value(r,c)) for c in range(sh.ncols)]
    if '00000008' in row[4]:
        continue
    cel = row[8].strip()
    tel = row[9].strip()
    email = (row[6] or row[7]).strip()
    whatsapp = cel if cel else tel
    if whatsapp and not whatsapp.startswith('+') and not whatsapp.startswith('598'):
        whatsapp = '+598' + whatsapp.lstrip('0')
    tipo = row[5].strip() or 'OTROS'
    comercios.append({
        'codigoExterno': row[0].strip(),
        'nombre': row[1].strip(),
        'nombreContacto': row[2].strip(),
        'tipo': tipo,
        'telefonoWhatsapp': whatsapp,
        'email': email,
        'direccion': row[14].strip(),
        'localidad': row[15].strip(),
        'departamento': row[16].strip(),
        'activo': True,
    })
print(json.dumps(comercios))
`
  const tmpScript = path.join('/tmp', 'extract_comercios.py')
  fs.writeFileSync(tmpScript, script)
  const output = execSync(`python3 ${tmpScript} "${XLS_PATH}"`).toString()
  return JSON.parse(output)
}

async function main() {
  if (!fs.existsSync(XLS_PATH)) {
    console.error(`\n❌ No se encontró: ${XLS_PATH}\n`)
    process.exit(1)
  }

  console.log('📋 Leyendo comercios del XLS...')
  const comercios = extractComerciosFromXls()
  console.log(`✅ ${comercios.length} comercios encontrados (no estaciones de servicio)`)

  if (DRY_RUN) {
    console.log('\n🔍 Modo dry-run — primeros 5 registros:')
    comercios.slice(0, 5).forEach((c: any) => console.log(' ', JSON.stringify(c)))
    console.log(`\n→ Se subirían ${comercios.length} comercios a la colección "${COLLECTION}"`)
    return
  }

  const db = initFirebase()
  let count = 0

  for (let i = 0; i < comercios.length; i += BATCH_SIZE) {
    const batch = db.batch()
    const chunk = comercios.slice(i, i + BATCH_SIZE)
    for (const c of chunk) {
      const ref = db.collection(COLLECTION).doc()
      batch.set(ref, {
        ...c,
        creadoEn: Timestamp.now(),
      })
    }
    await batch.commit()
    count += chunk.length
    console.log(`  ↑ ${count}/${comercios.length} subidos...`)
  }

  console.log(`\n✅ ${count} comercios importados a Firestore`)
}

main().catch((err) => {
  console.error('❌ Error:', err)
  process.exit(1)
})
