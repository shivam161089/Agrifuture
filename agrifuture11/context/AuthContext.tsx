
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { authService } from '../services/authService';
import type { User } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isGuest: boolean;
  signInWithGoogle: () => Promise<void>;
  signInAsGuest: () => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const GUEST_KEY = 'agriFutureGuest';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isGuest, setIsGuest] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const sessionUser = authService.checkSession();
    if (sessionUser) {
      setUser(sessionUser);
    } else {
        const guestStatus = sessionStorage.getItem(GUEST_KEY);
        if (guestStatus === 'true') {
            setIsGuest(true);
        }
    }
    setLoading(false);
  }, []);

  const signInWithGoogle = async () => {
    setLoading(true);
    const loggedInUser = await authService.signInWithGoogle();
    setUser(loggedInUser);
    setIsGuest(false);
    sessionStorage.removeItem(GUEST_KEY);
    setLoading(false);
  };

  const signInAsGuest = () => {
    setIsGuest(true);
    sessionStorage.setItem(GUEST_KEY, 'true');
  };

  const signOut = async () => {
    await authService.signOut();
    setUser(null);
    setIsGuest(false);
    sessionStorage.removeItem(GUEST_KEY);
  };

  // This function is needed by the AuthPage to set the user after mobile auth
  const handleMobileAuthSuccess = (loggedInUser: User) => {
    setUser(loggedInUser);
    setIsGuest(false);
    sessionStorage.removeItem(GUEST_KEY);
  };

  const contextValue = {
    user,
    loading,
    isGuest,
    signInWithGoogle,
    signInAsGuest,
    signOut,
    // We pass this down so AuthPage can use it, but don't expose it in the type
    // to prevent other components from misusing it.
    handleMobileAuthSuccess: handleMobileAuthSuccess as (user: User) => void
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType & { handleMobileAuthSuccess?: (user: User) => void } => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
