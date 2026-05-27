import {
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  User,
} from 'firebase/auth'
import { auth } from './config'

const googleProvider = new GoogleAuthProvider()

export async function signInWithGoogle() {
  if (!auth) throw new Error('Firebase Auth not initialized')
  return signInWithPopup(auth, googleProvider)
}

export async function signIn(email: string, password: string) {
  if (!auth) throw new Error('Firebase Auth not initialized')
  return signInWithEmailAndPassword(auth, email, password)
}

export async function signOut() {
  if (!auth) throw new Error('Firebase Auth not initialized')
  return firebaseSignOut(auth)
}

export function onAuthChange(callback: (user: User | null) => void) {
  if (!auth) {
    callback(null)
    return () => {}
  }
  return onAuthStateChanged(auth, callback)
}

export function getCurrentUser(): User | null {
  if (!auth) return null
  return auth.currentUser
}
