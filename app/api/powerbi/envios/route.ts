import { NextRequest, NextResponse } from 'next/server'
import { getAdminDb, isAuthorized } from '@/lib/firebase/admin'

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const db = getAdminDb()
  const snapshot = await db.collection('envios').orderBy('creadoEn', 'desc').get()

  const data = snapshot.docs.map((doc) => {
    const d = doc.data()
    return {
      id: doc.id,
      promocionId: d.promocionId ?? null,
      clienteId: d.clienteId ?? null,
      estacionId: d.estacionId ?? null,
      estado: d.estado ?? null,
      telefono: d.telefono ?? null,
      error: d.error ?? null,
      creadoEn: d.creadoEn?.toDate?.()?.toISOString() ?? null,
    }
  })

  return NextResponse.json(data)
}
