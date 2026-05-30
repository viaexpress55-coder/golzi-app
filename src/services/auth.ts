import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInAnonymously,
  signOut,
  onAuthStateChanged,
  updateProfile,
  User,
} from 'firebase/auth';
import {
  doc, setDoc, getDoc, addDoc, updateDoc,
  collection, serverTimestamp,
} from 'firebase/firestore';
import { auth, db } from './firebase';
import { registerForPushNotifications } from './notifications';

async function updateFCMToken(userId: string): Promise<void> {
  try {
    const token = await registerForPushNotifications(userId);
    if (token) {
      await updateDoc(doc(db, 'users', userId), {
        fcmToken:        token,
        fcmTokenUpdated: serverTimestamp(),
        lastActive:      serverTimestamp(),
      });
    }
  } catch (e) {
    console.log('FCM token update skipped:', e);
  }
}

export async function registerWithEmail(
  email: string, password: string, username: string, country: string
): Promise<User> {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(cred.user, { displayName: username });
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Bogota';
  await setDoc(doc(db, 'users', cred.user.uid), {
    userId: cred.user.uid, username, country, language: 'es', timezone,
    plan: 'free', planExpiry: null, totalPoints: 0, reputationPoints: 0,
    currentStreak: 0, maxStreak: 0,
    referralCode: `GOLZ-${username.toUpperCase().slice(0, 6)}`,
    referredBy: null, fcmToken: null,
    createdAt: serverTimestamp(), lastActive: serverTimestamp(),
  });
  await updateFCMToken(cred.user.uid);
  return cred.user;
}

export async function loginWithEmail(email: string, password: string): Promise<User> {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  await updateFCMToken(cred.user.uid);
  return cred.user;
}

export async function loginAnonymous(): Promise<User> {
  const cred = await signInAnonymously(auth);
  const userRef = doc(db, 'users', cred.user.uid);
  const userSnap = await getDoc(userRef);
  if (!userSnap.exists()) {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Bogota';
    await setDoc(userRef, {
      userId: cred.user.uid, username: 'Golzair', country: '🌍',
      language: 'es', timezone, plan: 'free', planExpiry: null,
      totalPoints: 0, currentStreak: 0, maxStreak: 0,
      fcmToken: null, isAnonymous: true,
      createdAt: serverTimestamp(), lastActive: serverTimestamp(),
    });
  }
  return cred.user;
}

export async function logout(): Promise<void> {
  try {
    const user = auth.currentUser;
    if (user) {
      await updateDoc(doc(db, 'users', user.uid), {
        fcmToken: null, lastActive: serverTimestamp(),
      });
    }
  } catch {}
  await signOut(auth);
}

export function onAuthChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

export async function getUserProfile(uid: string) {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? snap.data() : null;
}

export async function savePrediction(
  userId: string, matchId: string, homeScore: number, awayScore: number,
) {
  await addDoc(collection(db, 'predictions'), {
    userId, matchId, tournamentId: 'FIFA_WC_2026',
    homeScore, awayScore, pointsEarned: 0, status: 'pending',
    createdAt: serverTimestamp(), lockedAt: serverTimestamp(),
  });
}