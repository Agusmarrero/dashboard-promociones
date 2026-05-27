import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  query,
  where,
  orderBy,
  Timestamp,
} from 'firebase/firestore'
import { db } from './config'
import type { Envio } from '@/types'

const COLLECTION = 'envios'

function assertDb() {
  if (!db) throw new Error('Firebase Firestore not initialized')
  return db
}

export async function getEnvios(): Promise<Envio[]> {
  const firestore = assertDb()
  const q = query(collection(firestore, COLLECTION), orderBy('fecha', 'desc'))
  const snapshot = await getDocs(q)
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    fecha: doc.data().fecha?.toDate(),
  })) as Envio[]
}

export async function getEnvioById(id: string): Promise<Envio | null> {
  const firestore = assertDb()
  const docRef = doc(firestore, COLLECTION, id)
  const docSnap = await getDoc(docRef)
  if (!docSnap.exists()) return null
  return {
    id: docSnap.id,
    ...docSnap.data(),
    fecha: docSnap.data().fecha?.toDate(),
  } as Envio
}

export async function getEnviosByPromocionId(promocionId: string): Promise<Envio[]> {
  const firestore = assertDb()
  const q = query(
    collection(firestore, COLLECTION),
    where('promocionId', '==', promocionId),
    orderBy('fecha', 'desc')
  )
  const snapshot = await getDocs(q)
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    fecha: doc.data().fecha?.toDate(),
  })) as Envio[]
}

export async function getEnviosByClienteId(clienteId: string): Promise<Envio[]> {
  const firestore = assertDb()
  const snapshot = await getDocs(collection(firestore, COLLECTION))
  const allEnvios = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    fecha: doc.data().fecha?.toDate(),
  })) as Envio[]

  const envios = allEnvios.filter((envio) =>
    envio.destinatarios?.some((d) => d.clienteId === clienteId)
  )
  return envios.sort((a, b) => b.fecha.getTime() - a.fecha.getTime())
}

export async function createEnvio(
  data: Omit<Envio, 'id' | 'fecha'>
): Promise<string> {
  const firestore = assertDb()
  const docRef = await addDoc(collection(firestore, COLLECTION), {
    ...data,
    fecha: Timestamp.now(),
  })
  return docRef.id
}

export async function getUltimoEnvio(): Promise<Envio | null> {
  const firestore = assertDb()
  const q = query(collection(firestore, COLLECTION), orderBy('fecha', 'desc'))
  const snapshot = await getDocs(q)
  if (snapshot.empty) return null
  const docSnap = snapshot.docs[0]
  return {
    id: docSnap.id,
    ...docSnap.data(),
    fecha: docSnap.data().fecha?.toDate(),
  } as Envio
}
