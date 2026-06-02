import { NextRequest, NextResponse } from 'next/server'
import { getAdminDb, isAuthorized } from '@/lib/firebase/admin'

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const db = getAdminDb()
  const snapshot = await db.collection('promociones').orderBy('creadaEn', 'desc').get()

  const data = snapshot.docs.map((doc) => {
    const d = doc.data()
    return {
      id: doc.id,
      nombre: d.nombre ?? null,
      descripcion: d.descripcion ?? null,
      producto: d.producto ?? null,
      precio: d.precio ?? null,
      flyerUrl: d.flyerUrl ?? null,
      estado: d.estado ?? null,
      vigenciaDesde: d.vigenciaDesde?.toDate?.()?.toISOString() ?? null,
      vigenciaHasta: d.vigenciaHasta?.toDate?.()?.toISOString() ?? null,
      creadaEn: d.creadaEn?.toDate?.()?.toISOString() ?? null,
    }
  })

  return NextResponse.json(data)
}
