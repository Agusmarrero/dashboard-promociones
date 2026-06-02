import { NextRequest, NextResponse } from 'next/server'
import { getAdminDb, isAuthorized } from '@/lib/firebase/admin'

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const db = getAdminDb()
  const snapshot = await db.collection('clientes').orderBy('estacionNombre').get()

  const data = snapshot.docs.map((doc) => {
    const d = doc.data()
    return {
      id: doc.id,
      estacionId: d.estacionId ?? null,
      estacionNombre: d.estacionNombre ?? null,
      nombreContacto: d.nombreContacto ?? null,
      telefonoWhatsapp: d.telefonoWhatsapp ?? null,
      email: d.email ?? null,
      activo: d.activo ?? false,
      departamento: d.departamento ?? null,
      localidad: d.localidad ?? null,
      creadoEn: d.creadoEn?.toDate?.()?.toISOString() ?? null,
    }
  })

  return NextResponse.json(data)
}
