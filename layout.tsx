import React from 'react';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '../context/AuthContext';
import { MockAuthProvider } from '../context/MockAuthContext';
import { Toaster } from 'react-hot-toast';
import dynamic from 'next/dynamic';

// Dynamically import AuthToggle with no SSR since it uses client-side localStorage
const AuthToggle = dynamic(() => import('../components/AuthToggle'), { ssr: false });

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'StoreIt - Cloud Storage System',
  description: 'Upload, store, and manage your files with a modern, intuitive interface',
};

// Check if Firebase API key is configured
const isFirebaseConfigured = () => {
  if (typeof window === 'undefined') {
    // Server-side rendering
    return process.env.NEXT_PUBLIC_FIREBASE_API_KEY && 
           process.env.NEXT_PUBLIC_FIREBASE_API_KEY.length > 10;
  } else {
    // Client-side rendering
    return window.localStorage.getItem('use_mock_auth') !== 'true';
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const useRealFirebase = isFirebaseConfigured();
  
  return (
    <html lang="en">
      <body className={inter.className}>
        {useRealFirebase ? (
          <AuthProvider>
            <Toaster position="top-center" />
            {children}
            <AuthToggle />
          </AuthProvider>
        ) : (
          <MockAuthProvider>
            <Toaster position="top-center" />
            {children}
            <AuthToggle />
          </MockAuthProvider>
        )}
      </body>
    </html>
  );
} 