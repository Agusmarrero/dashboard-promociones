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

const ALLOWED_EMAILS = [
  'paola.alvarez.suarez@gmail.com',
  'agustina.marrero99@gmail.com',
]

export function isEmailAllowed(email: string | null | undefined): boolean {
  if (!email) return false
  return ALLOWED_EMAILS.includes(email.toLowerCase())
}

export async function signInWithGoogle() {
  if (!auth) throw new Error('Firebase Auth not initialized')
  const result = await signInWithPopup(auth, googleProvider)
  if (!isEmailAllowed(result.user.email)) {
    await firebaseSignOut(auth)
    throw new Error('NO_ACCESS')
  }
  return result
}

export async function signIn(email: string, password: string) {
  if (!auth) throw new Error('Firebase Auth not initialized')
  if (!isEmailAllowed(email)) throw new Error('NO_ACCESS')
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
