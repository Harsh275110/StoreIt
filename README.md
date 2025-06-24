# File Storage Application

A modern file storage web application built with Next.js and Firebase. This application allows users to:

- Sign up and log in with email/password
- Upload files to Firebase Storage
- View and manage their uploaded files
- Download files when needed
- Delete files they no longer need

## Features

- **Authentication**: Secure user authentication using Firebase Auth
- **File Storage**: Upload and manage files using Firebase Storage
- **Responsive UI**: Modern interface that works on desktop and mobile
- **Real-time Updates**: Changes to files are reflected immediately

## Technologies Used

- **Next.js**: React framework for server-rendered applications
- **Firebase**: Backend-as-a-Service for authentication, database, and storage
- **Tailwind CSS**: Utility-first CSS framework for styling
- **React Dropzone**: Easy file uploads with drag-and-drop capability
- **React Hot Toast**: Beautiful notifications for user feedback

## Getting Started

### Prerequisites

- Node.js 16.8 or later
- npm or yarn
- A Firebase account (free tier works perfectly!)

### Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/yourusername/file-storage.git
   cd file-storage
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Create a Firebase project:
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Click "Add project" and follow the setup steps
   - Make sure to select the free "Spark" plan

4. Set up Firebase services:
   - Enable Authentication (Email/Password method)
   - Create Firestore Database (start in test mode)
   - Set up Firebase Storage (start in test mode)

5. Get your Firebase configuration:
   - In your Firebase project, click on the web icon (</>) to add a web app
   - Register your app with a nickname
   - Copy the Firebase configuration values

6. Create a `.env.local` file in the project root with your Firebase config:
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
   NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
   ```

7. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

8. Open [http://localhost:3000](http://localhost:3000) in your browser

## Deployment

This application can be easily deployed to Vercel:

1. Push your code to a GitHub repository
2. Connect your repository to Vercel
3. Set your Firebase environment variables in the Vercel dashboard
4. Deploy!

## Firebase Storage Rules

For production, consider updating your Firebase Storage rules to better secure your application:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /files/{userId}/{fileName=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Next.js Documentation](https://nextjs.org/docs)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs) 