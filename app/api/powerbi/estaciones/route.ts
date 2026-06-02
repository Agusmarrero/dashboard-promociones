import { NextRequest, NextResponse } from 'next/server'
import { getAdminDb, isAuthorized } from '@/lib/firebase/admin'

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const db = getAdminDb()
  const snapshot = await db.collection('estaciones').orderBy('nombre').get()

  const data = snapshot.docs.map((doc) => {
    const d = doc.data()
    return {
      id: doc.id,
      nombre: d.nombre ?? null,
      marca: d.marca ?? null,
      departamento: d.departamento ?? null,
      localidad: d.localidad ?? null,
      direccion: d.direccion ?? null,
      telefono: d.telefono ?? null,
      latitud: d.latitud ?? null,
      longitud: d.longitud ?? null,
      fuente: d.fuente ?? null,
      esCliente: d.esCliente ?? false,
      creadaEn: d.creadaEn?.toDate?.()?.toISOString() ?? null,
      actualizadaEn: d.actualizadaEn?.toDate?.()?.toISOString() ?? null,
    }
  })

  return NextResponse.json(data)
}
