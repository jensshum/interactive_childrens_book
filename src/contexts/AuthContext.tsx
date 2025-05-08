import { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../utils/supabase'; // Import Supabase client

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    // Check active session with Supabase
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const response = await fetch('/api/auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'signIn',
        email,
        password,
      }),
    });

    if (!response.ok) {
      const { error } = await response.json();
      console.error('Sign in error:', { error, email, status: response.status });
      throw new Error(error || 'Failed to sign in');
    }

    const { user } = await response.json();
    setUser(user);
  };

  const signUp = async (email: string, password: string) => {
    const response = await fetch('/api/auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'signUp',
        email,
        password,
      }),
    });

    if (!response.ok) {
      const { error } = await response.json();
      console.error('Sign up error:', { error, email, status: response.status });
      throw new Error(error || 'Failed to sign up');
    }

    const { user } = await response.json();
    setUser(user);
  };

  const signOut = async () => {
    const response = await fetch('/api/auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'signOut',
      }),
    });

    if (!response.ok) {
      const { error } = await response.json();
      console.error('Sign out error:', { error, status: response.status });
      throw new Error(error || 'Failed to sign out');
    }

    setUser(null);
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}