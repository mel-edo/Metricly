import React, { createContext, useContext, useState, useEffect } from 'react';
import { login as loginApi, logout as logoutApi, isAuthenticated } from '../services/auth';

interface AuthContextType {
  isLoggedIn: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check if user is already logged in
    setIsLoggedIn(isAuthenticated());
    setLoading(false);

    // Listen for storage events to detect token removal
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'token' && e.newValue === null) {
        setIsLoggedIn(false);
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Create a custom event listener for token expiration
    const handleTokenExpired = () => {
      setIsLoggedIn(false);
    };

    window.addEventListener('token-expired', handleTokenExpired);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('token-expired', handleTokenExpired);
    };
  }, []);

  const login = async (username: string, password: string) => {
    setLoading(true);
    try {
      await loginApi({ username, password });
      setIsLoggedIn(true);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    logoutApi();
    setIsLoggedIn(false);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
