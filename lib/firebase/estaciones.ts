import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
} from 'firebase/firestore'
import { db } from './config'
import type { Estacion } from '@/types'

const COLLECTION = 'estaciones'

function assertDb() {
  if (!db) throw new Error('Firebase Firestore not initialized')
  return db
}

export async function getEstaciones(): Promise<Estacion[]> {
  const firestore = assertDb()
  const q = query(collection(firestore, COLLECTION), orderBy('nombre', 'asc'))
  const snapshot = await getDocs(q)
  return snapshot.docs.map((doc) => {
    const data = doc.data()
    return {
      id: doc.id,
      ...data,
      esCliente: data.esCliente === true || !!data.clienteId,
      creadaEn: data.creadaEn?.toDate(),
      actualizadaEn: data.actualizadaEn?.toDate(),
    }
  }) as Estacion[]
}

export async function getEstacionById(id: string): Promise<Estacion | null> {
  const firestore = assertDb()
  const docRef = doc(firestore, COLLECTION, id)
  const docSnap = await getDoc(docRef)
  if (!docSnap.exists()) return null
  const data = docSnap.data()
  return {
    id: docSnap.id,
    ...data,
    esCliente: data.esCliente === true || !!data.clienteId,
    creadaEn: data.creadaEn?.toDate(),
    actualizadaEn: data.actualizadaEn?.toDate(),
  } as Estacion
}

export async function getEstacionesByDepartamento(departamento: string): Promise<Estacion[]> {
  const firestore = assertDb()
  const q = query(
    collection(firestore, COLLECTION),
    where('departamento', '==', departamento),
    orderBy('nombre', 'asc')
  )
  const snapshot = await getDocs(q)
  return snapshot.docs.map((doc) => {
    const data = doc.data()
    return {
      id: doc.id,
      ...data,
      esCliente: data.esCliente === true || !!data.clienteId,
      creadaEn: data.creadaEn?.toDate(),
      actualizadaEn: data.actualizadaEn?.toDate(),
    }
  }) as Estacion[]
}

export async function getEstacionesClientes(): Promise<Estacion[]> {
  const firestore = assertDb()
  const q = query(
    collection(firestore, COLLECTION),
    where('esCliente', '==', true),
    orderBy('nombre', 'asc')
  )
  const snapshot = await getDocs(q)
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    creadaEn: doc.data().creadaEn?.toDate(),
    actualizadaEn: doc.data().actualizadaEn?.toDate(),
  })) as Estacion[]
}

export async function createEstacion(data: Omit<Estacion, 'id' | 'creadaEn' | 'actualizadaEn'>): Promise<string> {
  const firestore = assertDb()
  const docRef = await addDoc(collection(firestore, COLLECTION), {
    ...data,
    creadaEn: Timestamp.now(),
    actualizadaEn: Timestamp.now(),
  })
  return docRef.id
}

export async function updateEstacion(id: string, data: Partial<Estacion>): Promise<void> {
  const firestore = assertDb()
  const docRef = doc(firestore, COLLECTION, id)
  await updateDoc(docRef, {
    ...data,
    actualizadaEn: Timestamp.now(),
  })
}

export async function deleteEstacion(id: string): Promise<void> {
  const firestore = assertDb()
  const docRef = doc(firestore, COLLECTION, id)
  await deleteDoc(docRef)
}

export async function marcarComoCliente(estacionId: string, clienteId: string): Promise<void> {
  const firestore = assertDb()
  const docRef = doc(firestore, COLLECTION, estacionId)
  await updateDoc(docRef, {
    esCliente: true,
    clienteId,
    actualizadaEn: Timestamp.now(),
  })
}

export async function desmarcarComoCliente(estacionId: string): Promise<void> {
  const firestore = assertDb()
  const docRef = doc(firestore, COLLECTION, estacionId)
  await updateDoc(docRef, {
    esCliente: false,
    clienteId: null,
    actualizadaEn: Timestamp.now(),
  })
}
