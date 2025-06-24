# Firebase Authentication Setup for StoreIt

This guide outlines the steps needed to set up real Firebase authentication for your StoreIt application.

## What Has Been Implemented

1. **Firebase Configuration** - The application now uses real Firebase authentication with the following features:
   - Email/password sign-up and sign-in
   - Google Sign-in
   - Secure authentication state management
   - Automatic user document creation in Firestore
   - Toast notifications for authentication events

2. **Authentication Context** - The AuthContext has been updated to include:
   - `signIn(email, password)` - Email/password sign-in
   - `signUp(email, password)` - Email/password sign-up
   - `signInWithGoogle()` - Google authentication
   - `signOut()` - Securely log out users
   - Real-time auth state tracking with `onAuthStateChanged`

3. **Login Page** - The login page now uses the AuthContext for all authentication operations:
   - Form validation for sign-up and sign-in
   - Toggle between sign-in and sign-up modes
   - Google authentication button
   - Error handling and user feedback

4. **Dashboard Component** - The Dashboard component has been updated to use Firebase:
   - Real Firestore for file and folder storage
   - Firebase Storage for file uploads
   - Secure access with authenticated user context

## Setup Instructions

### 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" and follow the setup steps
3. Once your project is created, click on the web icon (</>) to add a web app
4. Register your app with a nickname (e.g., "StoreIt Web")
5. Copy the Firebase configuration values for the next step

### 2. Configure Firebase Authentication

1. In the Firebase Console, navigate to "Authentication"
2. Click "Get started"
3. Enable the following sign-in methods:
   - Email/Password
   - Google

For Google Sign-In:
1. Configure the OAuth consent screen if prompted
2. Add your domain to the authorized domains list
3. For local development, add `localhost` to the authorized domains

### 3. Set Up Firestore Database

1. In the Firebase Console, go to "Firestore Database"
2. Click "Create database"
3. Start in test mode for development (you'll update security rules later)
4. Choose a location close to your users

### 4. Configure Firebase Storage

1. In the Firebase Console, go to "Storage"
2. Click "Get started"
3. Start in test mode for development
4. Choose a location close to your users

### 5. Configure Environment Variables

1. Copy `.env.local.example` to `.env.local`
2. Fill in your Firebase configuration values:

```
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

### 6. Update Security Rules for Production

Before deploying to production, update your Firestore and Storage security rules.

#### Firestore Security Rules:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Lock down access to authenticated users
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /files/{fileId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
    
    match /folders/{folderId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
  }
}
```

#### Storage Security Rules:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /files/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Testing Your Authentication

1. Start your development server:
```bash
npm run dev
```

2. Visit http://localhost:3001 in your browser
3. Try signing up with email/password
4. Try signing in with Google
5. Try uploading files and creating folders in your dashboard
6. Test the sign-out functionality

## Troubleshooting

### Common Issues

1. **Firebase Configuration**: Ensure all Firebase configuration values are correctly set in your `.env.local` file.

2. **CORS Issues**: If you encounter CORS errors with Storage, ensure your Firebase Storage CORS configuration is set up correctly.

3. **Authentication Errors**: Check Firebase Authentication logs in the Firebase Console for specific error details.

4. **Google Authentication**: Make sure your OAuth consent screen is properly configured and your localhost or domain is added to the authorized domains.

### Debugging

1. Check browser console for errors
2. Verify Firebase Authentication state in the Firebase Console
3. Inspect Firestore collections to ensure data is being saved correctly
4. Review Firebase Storage uploads in the Firebase Console

## Next Steps

1. **User Profile Management**: Implement functionality to update user profiles
2. **Email Verification**: Add email verification for new sign-ups
3. **Password Reset**: Implement password reset functionality
4. **Session Management**: Add session timeout and renewal
5. **Multi-factor Authentication**: Consider adding MFA for enhanced security 