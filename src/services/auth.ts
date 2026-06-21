import { Platform } from 'react-native';
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
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



import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';

WebBrowser.maybeCompleteAuthSession();

export const GOOGLE_ANDROID_CLIENT_ID = '466137327410-g71gocl25l4e0rkd808oh9vfh8j7loa5.apps.googleusercontent.com';
export const GOOGLE_WEB_CLIENT_ID = '466137327410-u48pcmv8m8h5bfpjjv7atn08if93tjtr.apps.googleusercontent.com';

export async function signInWithGoogleCredential(idToken: string): Promise<User> {
  const credential = GoogleAuthProvider.credential(idToken);
  const result = await signInWithCredential(auth, credential);

  // Crear documento de usuario si no existe (primer login con Google)
  const userRef = doc(db, 'users', result.user.uid);
  const userSnap = await getDoc(userRef);
  if (!userSnap.exists()) {
    const username = result.user.displayName || result.user.email?.split('@')[0] || 'GolzairFan';
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Bogota';
    await setDoc(userRef, {
      userId: result.user.uid, username, country: 'CO', language: 'es', timezone,
      plan: 'free', planExpiry: null, totalPoints: 0, reputationPoints: 0,
      currentStreak: 0, maxStreak: 0,
      referralCode: `GOLZ-${username.toUpperCase().slice(0, 6)}`,
      referredBy: null, fcmToken: null,
      signupSource: detectSignupSource(),
      signupPlatform: 'google_signin',
      createdAt: serverTimestamp(), lastActive: serverTimestamp(),
    });
  }
  await updateFCMToken(result.user.uid);
  return result.user;
}

function detectSignupSource(): string {
  if (typeof window === 'undefined') return 'app_native';
  try {
    const params = new URLSearchParams(window.location.search || '');
    const ref = params.get('ref');
    if (ref === 'landing') return 'web_landing';
    if (ref === 'planes') return 'web_planes';
    if (ref === 'mundial') return 'web_landing';
    const path = window.location.pathname || '';
    if (path.includes('/liga/')) return 'web_invite_liga';
    if (path.includes('/client/')) return 'web_whitelabel';
    return 'web_direct';
  } catch (e) {
    return 'app_native';
  }
}

export async function registerWithEmail(
  email: string, password: string, username: string, country: string
): Promise<User> {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(cred.user, { displayName: username });
  try {
    await sendEmailVerification(cred.user);
  } catch (e) {
    console.log('Error enviando verificación de email:', e);
  }
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Bogota';
  await setDoc(doc(db, 'users', cred.user.uid), {
    userId: cred.user.uid, username, country, language: 'es', timezone,
    plan: 'free', planExpiry: null, totalPoints: 0, reputationPoints: 0,
    currentStreak: 0, maxStreak: 0,
    referralCode: `GOLZ-${username.toUpperCase().slice(0, 6)}`,
    referredBy: null, fcmToken: null,
    signupSource: detectSignupSource(),
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