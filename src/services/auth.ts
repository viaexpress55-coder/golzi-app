import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInAnonymously,
  signOut,
  onAuthStateChanged,
  updateProfile,
  User,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase';

// ─── Registro con email ───────────────────────────────
export async function registerWithEmail(
  email: string,
  password: string,
  username: string,
  country: string
): Promise<User> {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(cred.user, { displayName: username });
  await setDoc(doc(db, 'users', cred.user.uid), {
    userId:           cred.user.uid,
    username,
    country,
    language:         'es',
    plan:             'free',
    planExpiry:       null,
    totalPoints:      0,
    reputationPoints: 0,
    referralCode:     `GOLZ-${username.toUpperCase().slice(0, 6)}`,
    referredBy:       null,
    fcmToken:         null,
    createdAt:        serverTimestamp(),
    lastActive:       serverTimestamp(),
  });
  return cred.user;
}

// ─── Login con email ──────────────────────────────────
export async function loginWithEmail(
  email: string,
  password: string
): Promise<User> {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

// ─── Login anónimo ────────────────────────────────────
export async function loginAnonymous(): Promise<User> {
  const cred = await signInAnonymously(auth);
  return cred.user;
}

// ─── Cerrar sesión ────────────────────────────────────
export async function logout(): Promise<void> {
  await signOut(auth);
}

// ─── Observer de estado de auth ───────────────────────
export function onAuthChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

// ─── Obtener perfil del usuario ───────────────────────
export async function getUserProfile(uid: string) {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? snap.data() : null;
}