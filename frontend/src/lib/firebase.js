import { initializeApp } from 'firebase/app'
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  GithubAuthProvider,
  signOut,
} from 'firebase/auth'

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
}

const app  = initializeApp(firebaseConfig)
export const auth = getAuth(app)

const googleProvider = new GoogleAuthProvider()
const githubProvider = new GithubAuthProvider()

export async function loginWithGoogle() {
  const result = await signInWithPopup(auth, googleProvider)
  const u = result.user
  return {
    uid:      u.uid,
    username: u.displayName ?? u.email?.split('@')[0] ?? 'User',
    email:    u.email,
    photo:    u.photoURL,
    provider: 'google',
  }
}

export async function loginWithGitHub() {
  const result = await signInWithPopup(auth, githubProvider)
  const u = result.user
  return {
    uid:      u.uid,
    username: u.displayName ?? u.email?.split('@')[0] ?? 'User',
    email:    u.email,
    photo:    u.photoURL,
    provider: 'github',
  }
}

export async function logout() {
  await signOut(auth)
}