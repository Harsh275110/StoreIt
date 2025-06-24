/**
 * This script tests Firebase Storage upload with a simple file
 */

// Import dotenv to load environment variables
require('dotenv').config({ path: '.env.local' });

// Import firebase modules
const { initializeApp } = require('firebase/app');
const { 
  getStorage, 
  ref, 
  uploadString,
  getDownloadURL
} = require('firebase/storage');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');
const fs = require('fs');

// Your Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Create a simple test
async function main() {
  // Get email and password from command line
  const email = process.argv[2];
  const password = process.argv[3];
  
  if (!email || !password) {
    console.log('Usage: node test-storage-upload.js YOUR_EMAIL YOUR_PASSWORD');
    process.exit(1);
  }

  try {
    console.log('Firebase Configuration:');
    console.log('API Key:', process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? '✅ Set' : '❌ Missing');
    console.log('Auth Domain:', process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN);
    console.log('Project ID:', process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
    console.log('Storage Bucket:', process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET);
    
    // Initialize Firebase
    console.log('\nInitializing Firebase...');
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const storage = getStorage(app);
    console.log('Firebase initialized successfully');
    
    // Sign in
    console.log(`\nAttempting to sign in with email: ${email}...`);
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log('Sign in successful!');
    console.log('User ID:', userCredential.user.uid);
    
    // Test file upload
    console.log('\nTesting file upload...');
    const testFilePath = `test/test-file-${Date.now()}.txt`;
    const testFileRef = ref(storage, testFilePath);
    console.log('Storage reference path:', testFileRef.fullPath);
    
    // Create test content
    const testContent = 'This is a test file to verify storage uploads are working.';
    
    console.log('Uploading test file...');
    const uploadResult = await uploadString(testFileRef, testContent);
    console.log('Upload successful!', uploadResult);
    
    // Get download URL
    console.log('Getting download URL...');
    const downloadURL = await getDownloadURL(testFileRef);
    console.log('Download URL:', downloadURL);
    
    console.log('\nTest SUCCESSFUL! Firebase Storage is working correctly.');
    
  } catch (error) {
    console.error('\nTest FAILED. Error:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    
    // Specific recommendations based on error type
    if (error.code === 'storage/unauthorized') {
      console.log('\nPermission denied. Check your Firebase Storage rules:');
      console.log(`
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}`);
    } else if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
      console.log('\nAuthentication failed. Make sure you provided the correct email and password.');
    } else if (error.code === 'storage/invalid-argument') {
      console.log('\nInvalid Storage bucket. Check your NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET value.');
    } else if (error.code === 'auth/invalid-credential') {
      console.log('\nInvalid Firebase credentials. Check your API key and other Firebase config values.');
    }
  }
}

// Execute the test
main(); 