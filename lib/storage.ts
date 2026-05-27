import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage'
import { storage } from './firebase/config'

function assertStorage() {
  if (!storage) throw new Error('Firebase Storage not initialized')
  return storage
}

export async function uploadFlyer(
  promocionId: string,
  file: File
): Promise<{ url: string; path: string }> {
  const store = assertStorage()
  const timestamp = Date.now()
  const path = `flyers/${promocionId}/${timestamp}_${file.name}`
  const storageRef = ref(store, path)

  await uploadBytes(storageRef, file)
  const url = await getDownloadURL(storageRef)

  return { url, path }
}

export async function deleteFlyer(path: string): Promise<void> {
  const store = assertStorage()
  const storageRef = ref(store, path)
  await deleteObject(storageRef)
}

export async function getFlyerUrl(path: string): Promise<string> {
  const store = assertStorage()
  const storageRef = ref(store, path)
  return getDownloadURL(storageRef)
}
