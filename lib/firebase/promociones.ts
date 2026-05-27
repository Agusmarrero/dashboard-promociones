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
import type { Promocion, EstadoPromocion } from '@/types'

const COLLECTION = 'promociones'

function assertDb() {
  if (!db) throw new Error('Firebase Firestore not initialized')
  return db
}

export async function getPromociones(): Promise<Promocion[]> {
  const firestore = assertDb()
  const q = query(collection(firestore, COLLECTION), orderBy('creadaEn', 'desc'))
  const snapshot = await getDocs(q)
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    vigenciaDesde: doc.data().vigenciaDesde?.toDate(),
    vigenciaHasta: doc.data().vigenciaHasta?.toDate(),
    creadaEn: doc.data().creadaEn?.toDate(),
  })) as Promocion[]
}

export async function getPromocionesActivas(): Promise<Promocion[]> {
  const firestore = assertDb()
  const q = query(
    collection(firestore, COLLECTION),
    where('estado', '==', 'activa'),
    orderBy('vigenciaHasta', 'desc')
  )
  const snapshot = await getDocs(q)
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    vigenciaDesde: doc.data().vigenciaDesde?.toDate(),
    vigenciaHasta: doc.data().vigenciaHasta?.toDate(),
    creadaEn: doc.data().creadaEn?.toDate(),
  })) as Promocion[]
}

export async function getPromocionById(id: string): Promise<Promocion | null> {
  const firestore = assertDb()
  const docRef = doc(firestore, COLLECTION, id)
  const docSnap = await getDoc(docRef)
  if (!docSnap.exists()) return null
  return {
    id: docSnap.id,
    ...docSnap.data(),
    vigenciaDesde: docSnap.data().vigenciaDesde?.toDate(),
    vigenciaHasta: docSnap.data().vigenciaHasta?.toDate(),
    creadaEn: docSnap.data().creadaEn?.toDate(),
  } as Promocion
}

export async function createPromocion(
  data: Omit<Promocion, 'id' | 'creadaEn'>
): Promise<string> {
  const firestore = assertDb()
  const docRef = await addDoc(collection(firestore, COLLECTION), {
    ...data,
    vigenciaDesde: Timestamp.fromDate(data.vigenciaDesde),
    vigenciaHasta: Timestamp.fromDate(data.vigenciaHasta),
    creadaEn: Timestamp.now(),
  })
  return docRef.id
}

export async function updatePromocion(id: string, data: Partial<Promocion>): Promise<void> {
  const firestore = assertDb()
  const docRef = doc(firestore, COLLECTION, id)
  const updateData: Record<string, unknown> = { ...data }
  if (data.vigenciaDesde) {
    updateData.vigenciaDesde = Timestamp.fromDate(data.vigenciaDesde)
  }
  if (data.vigenciaHasta) {
    updateData.vigenciaHasta = Timestamp.fromDate(data.vigenciaHasta)
  }
  await updateDoc(docRef, updateData)
}

export async function deletePromocion(id: string): Promise<void> {
  const firestore = assertDb()
  const docRef = doc(firestore, COLLECTION, id)
  await deleteDoc(docRef)
}

export async function updateEstadoPromocion(id: string, estado: EstadoPromocion): Promise<void> {
  const firestore = assertDb()
  const docRef = doc(firestore, COLLECTION, id)
  await updateDoc(docRef, { estado })
}
