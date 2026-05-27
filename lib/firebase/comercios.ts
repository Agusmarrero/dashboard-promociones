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
import type { Comercio } from '@/types'

const COLLECTION = 'comercios'

function assertDb() {
  if (!db) throw new Error('Firebase Firestore not initialized')
  return db
}

export async function getComercios(): Promise<Comercio[]> {
  const firestore = assertDb()
  const q = query(collection(firestore, COLLECTION), orderBy('creadoEn', 'desc'))
  const snapshot = await getDocs(q)
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    creadoEn: doc.data().creadoEn?.toDate(),
  })) as Comercio[]
}

export async function getComerciosActivos(): Promise<Comercio[]> {
  const firestore = assertDb()
  const q = query(
    collection(firestore, COLLECTION),
    where('activo', '==', true),
    orderBy('creadoEn', 'desc')
  )
  const snapshot = await getDocs(q)
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    creadoEn: doc.data().creadoEn?.toDate(),
  })) as Comercio[]
}

export async function getComercioById(id: string): Promise<Comercio | null> {
  const firestore = assertDb()
  const docRef = doc(firestore, COLLECTION, id)
  const docSnap = await getDoc(docRef)
  if (!docSnap.exists()) return null
  return {
    id: docSnap.id,
    ...docSnap.data(),
    creadoEn: docSnap.data().creadoEn?.toDate(),
  } as Comercio
}

export async function createComercio(data: Omit<Comercio, 'id' | 'creadoEn'>): Promise<string> {
  const firestore = assertDb()
  const docRef = await addDoc(collection(firestore, COLLECTION), {
    ...data,
    creadoEn: Timestamp.now(),
  })
  return docRef.id
}

export async function updateComercio(id: string, data: Partial<Comercio>): Promise<void> {
  const firestore = assertDb()
  const docRef = doc(firestore, COLLECTION, id)
  await updateDoc(docRef, data)
}

export async function deleteComercio(id: string): Promise<void> {
  const firestore = assertDb()
  const docRef = doc(firestore, COLLECTION, id)
  await deleteDoc(docRef)
}

export async function toggleComercioActivo(id: string, activo: boolean): Promise<void> {
  const firestore = assertDb()
  const docRef = doc(firestore, COLLECTION, id)
  await updateDoc(docRef, { activo })
}
