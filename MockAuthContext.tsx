'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';

// Mock User type to match Firebase User structure
interface MockUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

type MockAuthContextType = {
  user: MockUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
};

// Store user data in localStorage to persist across page refreshes
const STORAGE_KEY = 'STOREIT_MOCK_USER';
const MOCK_USERS_KEY = 'STOREIT_MOCK_USERS';

const MockAuthContext = createContext<MockAuthContextType>({
  user: null,
  loading: true,
  signIn: async () => {},
  signUp: async () => {},
  signInWithGoogle: async () => {},
  signOut: async () => {},
});

export const MockAuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<MockUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize mock system
  useEffect(() => {
    // Check if we have a stored user
    const storedUser = localStorage.getItem(STORAGE_KEY);
    
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    
    // Initialize mock users if they don't exist
    if (!localStorage.getItem(MOCK_USERS_KEY)) {
      localStorage.setItem(MOCK_USERS_KEY, JSON.stringify([]));
    }
    
    setLoading(false);
  }, []);

  // Mock sign up function
  const signUp = async (email: string, password: string) => {
    setLoading(true);
    
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Get current mock users
      const mockUsers = JSON.parse(localStorage.getItem(MOCK_USERS_KEY) || '[]');
      
      // Check if user already exists
      if (mockUsers.some((u: any) => u.email === email)) {
        throw new Error('auth/email-already-in-use');
      }
      
      // Create new mock user
      const newUser: MockUser = {
        uid: `mock-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        email: email,
        displayName: email.split('@')[0],
        photoURL: null,
      };
      
      // Save to mock users
      mockUsers.push({ password, ...newUser });
      localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(mockUsers));
      
      // Set as current user
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
      setUser(newUser);
      
      toast.success('Account created successfully!');
      
    } catch (error: any) {
      console.error('Mock sign up error:', error);
      if (error.message === 'auth/email-already-in-use') {
        toast.error('This email is already registered. Try signing in instead.');
      } else {
        toast.error('Failed to create account. Please try again.');
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  // Mock sign in function
  const signIn = async (email: string, password: string) => {
    setLoading(true);
    
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Get mock users
      const mockUsers = JSON.parse(localStorage.getItem(MOCK_USERS_KEY) || '[]');
      
      // Find user
      const mockUser = mockUsers.find((u: any) => u.email === email);
      
      if (!mockUser) {
        throw new Error('auth/user-not-found');
      }
      
      if (mockUser.password !== password) {
        throw new Error('auth/wrong-password');
      }
      
      // Create user object without password
      const { password: _, ...userWithoutPassword } = mockUser;
      
      // Set as current user
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userWithoutPassword));
      setUser(userWithoutPassword);
      
      toast.success('Logged in successfully!');
      
    } catch (error: any) {
      console.error('Mock sign in error:', error);
      if (error.message === 'auth/user-not-found') {
        toast.error('No account found with this email. Try signing up.');
      } else if (error.message === 'auth/wrong-password') {
        toast.error('Incorrect password. Please try again.');
      } else {
        toast.error('Failed to sign in. Please try again.');
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  // Mock Google sign in
  const signInWithGoogle = async () => {
    setLoading(true);
    
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create a mock Google user
      const googleUser: MockUser = {
        uid: `google-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        email: `user${Math.floor(Math.random() * 1000)}@gmail.com`,
        displayName: `Google User ${Math.floor(Math.random() * 100)}`,
        photoURL: 'https://via.placeholder.com/150',
      };
      
      // Save to mock users (without password for Google users)
      const mockUsers = JSON.parse(localStorage.getItem(MOCK_USERS_KEY) || '[]');
      mockUsers.push(googleUser);
      localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(mockUsers));
      
      // Set as current user
      localStorage.setItem(STORAGE_KEY, JSON.stringify(googleUser));
      setUser(googleUser);
      
      toast.success('Logged in with Google successfully!');
      
    } catch (error) {
      console.error('Mock Google sign in error:', error);
      toast.error('Failed to sign in with Google. Please try again.');
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  // Mock sign out
  const signOut = async () => {
    setLoading(true);
    
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Remove user from storage
      localStorage.removeItem(STORAGE_KEY);
      setUser(null);
      
      toast.success('Signed out successfully');
      
    } catch (error) {
      console.error('Mock sign out error:', error);
      toast.error('Failed to sign out. Please try again.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <MockAuthContext.Provider value={{ user, loading, signIn, signUp, signInWithGoogle, signOut }}>
      {children}
    </MockAuthContext.Provider>
  );
};

export const useMockAuth = () => useContext(MockAuthContext); 