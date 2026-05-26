export default ({ config }) => ({
  ...config,

  plugins: [
    ...(config.plugins || []),
    "expo-iap",
  ],

  extra: {
    ...config.extra,
    eas: {
      projectId: 'f7350587-b45a-4b28-bb33-c0a6a732daa8',
    },
    firebaseApiKey:            process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    firebaseAuthDomain:        process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    firebaseProjectId:         process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    firebaseStorageBucket:     process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
    firebaseMessagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    firebaseAppId:             process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
    footballApiKey:            process.env.EXPO_PUBLIC_FOOTBALL_API_KEY,
  },
});