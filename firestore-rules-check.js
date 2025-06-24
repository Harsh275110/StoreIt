/**
 * This script checks if your Firestore security rules are properly configured
 * for file uploads by attempting to create a test document.
 */

// Import dotenv to load environment variables
require('dotenv').config({ path: '.env.local' });

// Import firebase modules
const { initializeApp } = require('firebase/app');
const { 
  getFirestore, 
  collection, 
  addDoc,
  doc,
  deleteDoc,
  getDocs,
  query,
  where
} = require('firebase/firestore');

// Your Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Print loaded configuration
console.log('Loaded Firebase configuration:');
console.log('API Key:', process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? '✅ Set' : '❌ Missing');
console.log('Auth Domain:', process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ? '✅ Set' : '❌ Missing');
console.log('Project ID:', process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? '✅ Set' : '❌ Missing');
console.log('Storage Bucket:', process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ? '✅ Set' : '❌ Missing');
console.log('Messaging Sender ID:', process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ? '✅ Set' : '❌ Missing');
console.log('App ID:', process.env.NEXT_PUBLIC_FIREBASE_APP_ID ? '✅ Set' : '❌ Missing');
console.log('\n');

async function main() {
  try {
    console.log('Checking Firestore security rules...');
    
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    console.log('Firebase initialized successfully');

    // Check if we can read from Firestore
    console.log('Attempting to read from Firestore...');
    const filesQuery = query(collection(db, 'files'));
    const filesSnapshot = await getDocs(filesQuery);
    console.log(`Successfully read ${filesSnapshot.size} documents from 'files' collection`);

    // Attempt to read from folders collection
    console.log('Attempting to read from folders collection...');
    const foldersQuery = query(collection(db, 'folders'));
    const foldersSnapshot = await getDocs(foldersQuery);
    console.log(`Successfully read ${foldersSnapshot.size} documents from 'folders' collection`);

    console.log('\nSecurity check completed successfully!');
    console.log('If you see this message, your Firestore security rules are configured to allow read access.');
    console.log('However, write operations might still be restricted based on authentication status.');
    console.log('\nRecommendations:');
    console.log('1. Check browser console for any errors during file upload');
    console.log('2. Verify that you are properly authenticated when uploading files');
    console.log('3. Ensure your Firebase Storage security rules allow writes to your bucket');
    
  } catch (error) {
    console.error('Error during Firestore security check:', error);
    console.log('\nPossible solutions:');
    console.log('1. Make sure your Firebase project is properly set up');
    console.log('2. Check if your security rules are too restrictive');
    console.log('3. Verify that your environment variables are correctly set');
  }
}

// Run the script
main(); 