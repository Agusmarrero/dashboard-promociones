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
import type { Cliente } from '@/types'

const COLLECTION = 'clientes'

function assertDb() {
  if (!db) throw new Error('Firebase Firestore not initialized')
  return db
}

export async function getClientes(): Promise<Cliente[]> {
  const firestore = assertDb()
  const q = query(collection(firestore, COLLECTION), orderBy('creadoEn', 'desc'))
  const snapshot = await getDocs(q)
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    creadoEn: doc.data().creadoEn?.toDate(),
  })) as Cliente[]
}

export async function getClientesActivos(): Promise<Cliente[]> {
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
  })) as Cliente[]
}

export async function getClienteById(id: string): Promise<Cliente | null> {
  const firestore = assertDb()
  const docRef = doc(firestore, COLLECTION, id)
  const docSnap = await getDoc(docRef)
  if (!docSnap.exists()) return null
  return {
    id: docSnap.id,
    ...docSnap.data(),
    creadoEn: docSnap.data().creadoEn?.toDate(),
  } as Cliente
}

export async function getClienteByEstacionId(estacionId: string): Promise<Cliente | null> {
  const firestore = assertDb()
  const q = query(collection(firestore, COLLECTION), where('estacionId', '==', estacionId))
  const snapshot = await getDocs(q)
  if (snapshot.empty) return null
  const docSnap = snapshot.docs[0]
  return {
    id: docSnap.id,
    ...docSnap.data(),
    creadoEn: docSnap.data().creadoEn?.toDate(),
  } as Cliente
}

export async function createCliente(data: Omit<Cliente, 'id' | 'creadoEn'>): Promise<string> {
  const firestore = assertDb()
  const docRef = await addDoc(collection(firestore, COLLECTION), {
    ...data,
    creadoEn: Timestamp.now(),
  })
  return docRef.id
}

export async function updateCliente(id: string, data: Partial<Cliente>): Promise<void> {
  const firestore = assertDb()
  const docRef = doc(firestore, COLLECTION, id)
  await updateDoc(docRef, data)
}

export async function deleteCliente(id: string): Promise<void> {
  const firestore = assertDb()
  const docRef = doc(firestore, COLLECTION, id)
  await deleteDoc(docRef)
}

export async function toggleClienteActivo(id: string, activo: boolean): Promise<void> {
  const firestore = assertDb()
  const docRef = doc(firestore, COLLECTION, id)
  await updateDoc(docRef, { activo })
}
