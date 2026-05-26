import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, initializeAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

const extra = Constants.expoConfig?.extra ?? {};

const firebaseConfig = {
  apiKey:            extra.firebaseApiKey            ?? process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain:        extra.firebaseAuthDomain        ?? process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId:         extra.firebaseProjectId         ?? process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket:     extra.firebaseStorageBucket     ?? process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: extra.firebaseMessagingSenderId ?? process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId:             extra.firebaseAppId             ?? process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

let auth: any;

if (Platform.OS === 'web') {
  auth = getAuth(app);
} else {
  const { getReactNativePersistence } = require('firebase/auth');
  const AsyncStorage = require('@react-native-async-storage/async-storage').default;
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
}

export { auth };
export const db        = getFirestore(app);
export const storage   = getStorage(app);
export const functions = getFunctions(app, 'us-central1');
export default app;