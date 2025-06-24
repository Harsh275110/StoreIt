'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../lib/firebase/firebase';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  User 
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import toast from 'react-hot-toast';

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signIn: async () => {},
  signUp: async () => {},
  signInWithGoogle: async () => {},
  signOut: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Sign up with email and password
  const signUp = async (email: string, password: string) => {
    setLoading(true);
    
    try {
      // Create user with Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Create a user document in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        displayName: user.displayName || email.split('@')[0],
        photoURL: user.photoURL,
        createdAt: serverTimestamp(),
      });
      
      // Create root folder for the user
      await setDoc(doc(db, 'folders', `${user.uid}_root`), {
        name: 'root',
        userId: user.uid,
        parentId: null,
        path: '/',
        createdAt: serverTimestamp(),
      });
      
      toast.success('Account created successfully!');
    } catch (error: any) {
      console.error('Sign up error:', error);
      
      if (error.code === 'auth/email-already-in-use') {
        toast.error('This email is already registered. Try signing in instead.');
      } else if (error.code === 'auth/weak-password') {
        toast.error('Password is too weak. Please use a stronger password.');
      } else {
        toast.error('Failed to create account. Please try again.');
      }
      
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    setLoading(true);
    
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success('Logged in successfully!');
    } catch (error: any) {
      console.error('Sign in error:', error);
      
      if (error.code === 'auth/user-not-found') {
        toast.error('No account found with this email. Try signing up.');
      } else if (error.code === 'auth/wrong-password') {
        toast.error('Incorrect password. Please try again.');
      } else if (error.code === 'auth/too-many-requests') {
        toast.error('Too many failed login attempts. Please try again later.');
      } else {
        toast.error('Failed to sign in. Please try again.');
      }
      
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  // Sign in with Google
  const signInWithGoogle = async () => {
    setLoading(true);
    
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const user = userCredential.user;
      
      // Instead of using additionalUserInfo, we'll check if the user document exists
      try {
        // Try to create user document, if it fails because it already exists, that's fine
        await setDoc(doc(db, 'users', user.uid), {
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          createdAt: serverTimestamp(),
        }, { merge: true }); // merge: true ensures we don't overwrite existing data
        
        // Check if root folder exists, create if not
        const rootFolderId = `${user.uid}_root`;
        await setDoc(doc(db, 'folders', rootFolderId), {
          name: 'root',
          userId: user.uid,
          parentId: null,
          path: '/',
          createdAt: serverTimestamp(),
        }, { merge: true });
      } catch (error) {
        console.log('User document already exists');
      }
      
      toast.success('Logged in with Google successfully!');
    } catch (error: any) {
      console.error('Google sign in error:', error);
      if (error.code === 'auth/popup-closed-by-user') {
        toast.error('Sign-in popup was closed before completing the process.');
      } else {
        toast.error('Failed to sign in with Google. Please try again.');
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  // Sign out
  const signOut = async () => {
    setLoading(true);
    
    try {
      await firebaseSignOut(auth);
      toast.success('Signed out successfully');
    } catch (error) {
      console.error('Sign out error:', error);
      toast.error('Failed to sign out. Please try again.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext); 