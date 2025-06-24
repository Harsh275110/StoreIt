// Import the necessary Firebase modules
import { initializeApp, getApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { getStorage, FirebaseStorage } from 'firebase/storage';

// Your web app's Firebase configuration
// You'll need to replace these with your actual Firebase config values
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Initialize variables
let app: FirebaseApp;
let db: Firestore;
let auth: Auth;
let storage: FirebaseStorage;

try {
  // Check if all required Firebase config values are provided
  const isConfigValid = Object.values(firebaseConfig).every(value => 
    value !== undefined && value !== null && value !== '');
  
  if (!isConfigValid) {
    throw new Error('Firebase configuration is missing or incomplete');
  }
  
  // Initialize Firebase
  app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  db = getFirestore(app);
  auth = getAuth(app);
  storage = getStorage(app);
  
  console.log('Firebase initialized successfully');
} catch (error) {
  console.error('Error initializing Firebase:', error);
  console.warn('Using mock Firebase instance - AUTHENTICATION WILL NOT WORK CORRECTLY');
  
  // Create a temporary Firebase app with minimal config
  try {
    // Try to create a minimal app if possible
    app = !getApps().length ? initializeApp({
      apiKey: 'demo-api-key',
      authDomain: 'demo-project.firebaseapp.com',
      projectId: 'demo-project',
    }) : getApp();
    
    db = getFirestore(app);
    auth = getAuth(app);
    storage = getStorage(app);
  } catch (e) {
    // If that also fails, use dummy objects
    console.error('Failed to create even a minimal Firebase app:', e);
    app = {} as FirebaseApp;
    db = {} as Firestore;
    auth = {} as Auth;
    storage = {} as FirebaseStorage;
  }
}

export { app, db, auth, storage }; 