/**
 * This utility provides guidance for setting up Firebase Storage correctly
 */

require('dotenv').config({ path: '.env.local' });

// Print headers
console.log('========================================================');
console.log('FIREBASE STORAGE SETUP GUIDE');
console.log('========================================================');

// Display current configuration
console.log('\n1. CURRENT CONFIGURATION');
console.log('------------------------');
console.log('Project ID:', process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
console.log('Storage Bucket:', process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET);

// Storage rules
console.log('\n2. RECOMMENDED STORAGE RULES');
console.log('---------------------------');
console.log(`
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      // For development - allows any authenticated user
      allow read, write: if request.auth != null;
      
      // For production - restrict to user's own files
      // match /files/{userId}/{fileName=**} {
      //   allow read, write: if request.auth != null && request.auth.uid == userId;
      // }
    }
  }
}
`);

// CORS configuration
console.log('\n3. RECOMMENDED CORS CONFIGURATION');
console.log('--------------------------------');
console.log(`
[
  {
    "origin": ["*"],
    "method": ["GET", "HEAD", "PUT", "POST", "DELETE"],
    "maxAgeSeconds": 3600
  }
]
`);

// Setup instructions
console.log('\n4. SETUP INSTRUCTIONS');
console.log('-------------------');
console.log('1. Go to Firebase Console: https://console.firebase.google.com/');
console.log(`2. Select your project: ${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}`);
console.log('3. Navigate to Storage in the left sidebar');
console.log('4. If you haven\'t set up Storage yet:');
console.log('   a. Click "Get started"');
console.log('   b. Choose "Start in test mode"');
console.log('   c. Select a location close to your users');
console.log('5. Once Storage is set up:');
console.log('   a. Click on the "Rules" tab');
console.log('   b. Replace the rules with the recommended rules above');
console.log('   c. Click "Publish"');
console.log('6. Set up CORS:');
console.log('   a. In the Firebase Console, go to Storage settings');
console.log('   b. Find the CORS configuration section');
console.log('   c. Add the recommended CORS configuration');

// File structure
console.log('\n5. CURRENT FILE STRUCTURE');
console.log('------------------------');
console.log('Your files should be stored in:');
console.log(`gs://${process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET}/files/{userId}/{filename}`);
console.log('\nYour app is configured to upload files to this path.');

// Additional tips
console.log('\n6. TROUBLESHOOTING TIPS');
console.log('---------------------');
console.log('• Check browser console for detailed error messages');
console.log('• Verify your user is properly authenticated before uploading');
console.log('• Ensure Firebase Storage is enabled in your project');
console.log('• Try uploading a small test file (<1MB) first');
console.log('• Make sure your Firebase project billing status is active if uploads are large');
console.log('• Try the test-storage-upload.js script with your credentials:');
console.log('  node test-storage-upload.js YOUR_EMAIL YOUR_PASSWORD');
console.log('\n========================================================\n');

// Node.js Firebase CLI commands
console.log('FIREBASE CLI COMMANDS (if installed):');
console.log('----------------------------------');
console.log(`firebase use ${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID} # Select project`);
console.log('firebase storage:rules # View current rules');
console.log('firebase deploy --only storage # Deploy new rules after editing');
console.log('\n========================================================\n'); 