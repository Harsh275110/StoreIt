'use client';

import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';

const AuthToggle = () => {
  const [useMockAuth, setUseMockAuth] = useState(false);
  
  useEffect(() => {
    // Initialize state from localStorage
    const savedValue = localStorage.getItem('use_mock_auth');
    setUseMockAuth(savedValue === 'true');
  }, []);
  
  const toggleAuthMode = () => {
    const newValue = !useMockAuth;
    localStorage.setItem('use_mock_auth', String(newValue));
    setUseMockAuth(newValue);
    
    toast.success(
      newValue 
        ? 'Switched to Mock Authentication' 
        : 'Switched to Firebase Authentication'
    );
    
    // Reload the page to apply the change
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };
  
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={toggleAuthMode}
        className="px-3 py-2 bg-gray-800 text-white text-xs rounded-md shadow-lg hover:bg-gray-700 transition-colors"
      >
        {useMockAuth ? 'Using Mock Auth' : 'Using Firebase Auth'}
      </button>
    </div>
  );
};

export default AuthToggle; 