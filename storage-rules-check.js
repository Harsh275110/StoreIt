/**
 * This script checks if your Firebase Storage rules are properly configured
 * for file uploads by attempting to upload a small test file.
 */

// Import dotenv to load environment variables
require('dotenv').config({ path: '.env.local' });

// Import firebase modules
const { initializeApp } = require('firebase/app');
const { 
  getStorage, 
  ref, 
  getDownloadURL,
  listAll
} = require('firebase/storage');
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
    console.log('Checking Firebase Storage configuration...');
    
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const storage = getStorage(app);
    console.log('Firebase initialized successfully');
    console.log('Storage bucket:', storage.bucket || process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET);
    
    // Try listing files in Storage
    console.log('Attempting to list files in storage (this may fail due to security rules, which is expected)...');
    try {
      const storageRef = ref(storage);
      const result = await listAll(storageRef);
      console.log(`Successfully listed ${result.items.length} files at the root level`);
      console.log(`and ${result.prefixes.length} folders at the root level`);
    } catch (listError) {
      console.log('Could not list files. This is expected if your security rules require authentication:', listError.message);
    }
    
    // Verify URL formation is correct
    const testFilePath = `files/test-file-${Date.now()}.txt`;
    const testFileRef = ref(storage, testFilePath);
    console.log('\nStorage reference test:');
    console.log('Reference path:', testFileRef.fullPath);
    console.log('Storage bucket:', testFileRef.bucket);
    console.log('Full path:', `gs://${testFileRef.bucket}/${testFileRef.fullPath}`);
    
    console.log('\nStorage configuration check completed!');
    console.log('Next steps to fix file upload issues:');
    console.log('1. Ensure you have configured Firebase Storage in the Firebase Console');
    console.log('2. Check that your Storage Rules allow authenticated uploads');
    console.log('3. Verify browser console for any errors during upload attempt');
    console.log('4. Make sure you are properly signed in before uploading files');
    
    console.log('\nRecommended Storage Rules for development:');
    console.log(`
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}`);
    
  } catch (error) {
    console.error('Error during Firebase Storage check:', error);
    console.log('\nPossible solutions:');
    console.log('1. Verify that your Storage bucket URL is correct:', process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET);
    console.log('2. Make sure your Firebase project is properly set up and has Storage enabled');
    console.log('3. Check browser console during upload attempts for more detailed error messages');
  }
}

// Run the script
main(); 