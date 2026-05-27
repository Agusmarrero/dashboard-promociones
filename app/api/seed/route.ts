import { NextResponse } from 'next/server'
import { collection, addDoc, Timestamp, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'

const sampleEstaciones = [
  {
    nombre: 'ANCAP Tres Cruces',
    marca: 'ANCAP',
    departamento: 'Montevideo',
    localidad: 'Montevideo',
    direccion: 'Av. Italia 1234',
    telefono: '+59821234567',
    fuente: 'URSEA',
    esCliente: false,
    clienteId: null,
  },
  {
    nombre: 'AXION Pocitos',
    marca: 'AXION',
    departamento: 'Montevideo',
    localidad: 'Montevideo',
    direccion: 'Av. Brasil 2567',
    telefono: '+59822345678',
    fuente: 'URSEA',
    esCliente: false,
    clienteId: null,
  },
  {
    nombre: 'DISA Punta del Este',
    marca: 'DISA',
    departamento: 'Maldonado',
    localidad: 'Punta del Este',
    direccion: 'Av. Roosevelt 456',
    telefono: '+59842123456',
    fuente: 'URSEA',
    esCliente: false,
    clienteId: null,
  },
  {
    nombre: 'ANCAP Colonia Centro',
    marca: 'ANCAP',
    departamento: 'Colonia',
    localidad: 'Colonia del Sacramento',
    direccion: 'Calle Real 789',
    telefono: '+59852234567',
    fuente: 'URSEA',
    esCliente: false,
    clienteId: null,
  },
  {
    nombre: 'ANCAP Salto',
    marca: 'ANCAP',
    departamento: 'Salto',
    localidad: 'Salto',
    direccion: 'Uruguay 1000',
    telefono: '+59873345678',
    fuente: 'URSEA',
    esCliente: false,
    clienteId: null,
  },
]

export async function POST() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Seed only available in development' },
      { status: 403 }
    )
  }

  if (!db) {
    return NextResponse.json(
      { error: 'Firebase not configured. Please set up environment variables.' },
      { status: 500 }
    )
  }

  try {
    const existingDocs = await getDocs(collection(db, 'estaciones'))
    if (!existingDocs.empty) {
      return NextResponse.json(
        { message: 'Database already has data', count: existingDocs.size },
        { status: 200 }
      )
    }

    const results = []
    for (const estacion of sampleEstaciones) {
      const docRef = await addDoc(collection(db, 'estaciones'), {
        ...estacion,
        creadaEn: Timestamp.now(),
        actualizadaEn: Timestamp.now(),
      })
      results.push({ id: docRef.id, nombre: estacion.nombre })
    }

    return NextResponse.json({
      message: 'Seed completed',
      count: results.length,
      estaciones: results,
    })
  } catch (error) {
    console.error('Seed error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
