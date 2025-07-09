
import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import type { User } from '@supabase/supabase-js';

// Type du contexte
export type AuthContextType = {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({ 
  user: null, 
  loading: true, 
  isAdmin: false,
  signOut: async () => {} 
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Récupère la session au chargement
    supabase.auth.getSession().then(({ data }) => {
      const currentUser = data?.session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        checkAdminStatus(currentUser.id);
        handleUserRedirection(currentUser.id);
      }
      setLoading(false);
    });

    // Écoute les changements d'auth
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        checkAdminStatus(currentUser.id);
        handleUserRedirection(currentUser.id);
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, [navigate]);

  const checkAdminStatus = async (userId: string) => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', userId)
        .single();
      
      setIsAdmin(data?.is_admin || false);
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
    }
  };

  const handleUserRedirection = async (userId: string) => {
    try {
      // Vérifier si l'utilisateur est membre de l'équipe
      const { data: teamMember } = await supabase
        .from('team_members')
        .select('id')
        .eq('user_id', userId)
        .eq('is_active', true)
        .single();

      if (teamMember) {
        // Rediriger vers l'espace équipe
        setTimeout(() => navigate('/team-space'), 100);
        return;
      }

      // Vérifier si l'utilisateur est vendeur
      const { data: seller } = await supabase
        .from('sellers')
        .select('status')
        .eq('user_id', userId)
        .single();

      if (seller && seller.status === 'active') {
        // Rediriger vers l'espace vendeur
        setTimeout(() => navigate('/seller-space'), 100);
        return;
      }

    } catch (error) {
      // Ignorer les erreurs - l'utilisateur restera sur la page actuelle
      console.log('No special redirection needed:', error);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setIsAdmin(false);
    navigate('/');
  };

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
