import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { supabase } from '@/services/supabase';
import type { User, Session } from '@supabase/supabase-js';

type AppRole = 'admin' | 'staff';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  role: AppRole | null;
  isBanned: boolean;
  isMaintenance: boolean;
  isPlanExpired: boolean;
  loading: boolean;
  signUp: (email: string, password: string, displayName: string, mobile: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<{ error: string | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [isBanned, setIsBanned] = useState(false);
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [isPlanExpired, setIsPlanExpired] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchRole = useCallback(async (userId: string, email?: string) => {
    const [rolesRes, profileRes, configRes] = await Promise.all([
      supabase.from('user_roles').select('role').eq('user_id', userId).maybeSingle(),
      supabase.from('profiles').select('is_banned, plan_expires_at').eq('user_id', userId).maybeSingle() as any,
      supabase.from('system_config').select('value').eq('id', 'maintenance').maybeSingle() as any
    ]);
    
    const isMaint = configRes.data?.value?.enabled === true;
    setIsMaintenance(isMaint);

    if (isMaint && email !== 'krs715665@gmail.com') {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      setRole(null);
      return;
    }

    if (profileRes.data?.plan_expires_at && new Date(profileRes.data.plan_expires_at) < new Date() && email !== 'krs715665@gmail.com') {
      setIsPlanExpired(true);
    } else {
      setIsPlanExpired(false);
    }

    if (profileRes.data?.is_banned) {
      setIsBanned(true);
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      setRole(null);
    } else {
      setIsBanned(false);
      setRole((rolesRes.data?.role as AppRole) || 'staff');
    }
  }, []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        setTimeout(() => fetchRole(session.user.id, session.user.email), 0);
      } else {
        setRole(null);
      }
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) fetchRole(session.user.id, session.user.email);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [fetchRole]);

  const signUp = async (email: string, password: string, displayName: string, mobile: string) => {
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { 
        data: { 
          display_name: displayName,
          mobile: mobile
        } 
      }
    });

    let errorMessage = error?.message || null;
    if (errorMessage && errorMessage.toLowerCase().includes('rate limit')) {
      errorMessage = "Security: Too many signup attempts (Supabase Rate Limit). To test freely, please go to your Supabase Dashboard -> Authentication -> Providers -> Email and disable 'Confirm Email', or increase your Rate Limits in Auth -> Rate Limits.";
    }

    return { error: errorMessage };
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    
    if (data?.user) {
      const [profileRes, configRes] = await Promise.all([
        supabase.from('profiles').select('is_banned, plan_expires_at').eq('user_id', data.user.id).maybeSingle() as any,
        supabase.from('system_config').select('value').eq('id', 'maintenance').maybeSingle() as any
      ]);

      if (configRes.data?.value?.enabled && data.user.email !== 'krs715665@gmail.com') {
        await supabase.auth.signOut();
        setIsMaintenance(true);
        return { error: 'System is currently under maintenance. Try again later.' };
      }

      if (profileRes.data?.is_banned) {
        await supabase.auth.signOut();
        setIsBanned(true);
        return { error: 'Your account has been suspended by the administrator.' };
      }
    }
    
    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setRole(null);
  };

  const sendPasswordReset = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return { error: error?.message || null };
  };

  return (
    <AuthContext.Provider value={{ user, session, role, isBanned, isMaintenance, isPlanExpired, loading, signUp, signIn, signOut, sendPasswordReset }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
