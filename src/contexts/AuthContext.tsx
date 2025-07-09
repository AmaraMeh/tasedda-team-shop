
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate, useLocation } from 'react-router-dom';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      
      // Auto-redirect after login if not on excluded paths
      if (session?.user && !isExcludedPath(location.pathname)) {
        await handleAutoRedirect(session.user.id);
      }
      
      setLoading(false);
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (event === 'SIGNED_IN' && session?.user) {
        // Auto-redirect after sign in
        await handleAutoRedirect(session.user.id);
      }
      
      if (event === 'SIGNED_OUT') {
        navigate('/');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, location.pathname]);

  const isExcludedPath = (path: string) => {
    const excludedPaths = [
      '/', '/auth', '/products', '/wholesalers', '/local-sellers', 
      '/team', '/seller', '/contact', '/help', '/shipping', '/returns'
    ];
    return excludedPaths.includes(path) || path.startsWith('/product/') || path.startsWith('/boutique/');
  };

  const handleAutoRedirect = async (userId: string) => {
    try {
      // Check if user is admin
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', userId)
        .maybeSingle();

      if (profile?.is_admin) {
        navigate('/admin');
        return;
      }

      // Check if user is a seller
      const { data: seller } = await supabase
        .from('sellers')
        .select('id')
        .eq('user_id', userId)
        .eq('is_active', true)
        .maybeSingle();

      if (seller) {
        navigate('/seller-space');
        return;
      }

      // Check if user is a team member
      const { data: teamMember } = await supabase
        .from('team_members')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      if (teamMember) {
        navigate('/team-space');
        return;
      }

      // Default redirect to profile if no specific role
      navigate('/profile');
    } catch (error) {
      console.error('Error during auto-redirect:', error);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const value = {
    user,
    session,
    loading,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
