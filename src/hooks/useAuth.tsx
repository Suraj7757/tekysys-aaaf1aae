import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';

type AppRole = 'admin' | 'staff';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  role: AppRole | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signOut: () => Promise<void>;
  sendOTP: (email: string, type: 'signup' | 'reset') => Promise<string>;
  verifyOTP: (email: string, code: string, type: 'signup' | 'reset') => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<AppRole | null>(null);

  const fetchRole = async (userId: string) => {
    const { data } = await supabase.from('user_roles').select('role').eq('user_id', userId).maybeSingle();
    setRole((data?.role as AppRole) || 'staff');
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        setTimeout(() => fetchRole(session.user.id), 0);
      } else {
        setRole(null);
      }
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) fetchRole(session.user.id);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signUp = async (email: string, password: string, displayName: string) => {
    const { data, error } = await supabase.auth.signUp({
      email, password,
      options: { data: { display_name: displayName } },
    });
    if (error) throw error;
    if (data.user) {
      await supabase.from('profiles').upsert({
        user_id: data.user.id,
        display_name: displayName,
      }, { onConflict: 'user_id' });
      // First user gets admin, rest get staff
      const { count } = await supabase.from('user_roles').select('*', { count: 'exact', head: true });
      await supabase.from('user_roles').insert({
        user_id: data.user.id,
        role: (count === 0 ? 'admin' : 'staff') as any,
      });
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setRole(null);
  };

  const sendOTP = async (email: string, type: 'signup' | 'reset'): Promise<string> => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // 5 min
    // Delete old OTPs for this email/type
    await supabase.from('otp_codes').delete().eq('email', email).eq('type', type);
    await supabase.from('otp_codes').insert({
      email, code, type, expires_at: expiresAt,
    } as any);
    return code;
  };

  const verifyOTP = async (email: string, code: string, type: 'signup' | 'reset'): Promise<boolean> => {
    const { data } = await supabase
      .from('otp_codes')
      .select('*')
      .eq('email', email)
      .eq('code', code)
      .eq('type', type)
      .eq('verified', false)
      .maybeSingle();
    
    if (!data) throw new Error('Invalid OTP code');
    if (new Date((data as any).expires_at) < new Date()) throw new Error('OTP expired. Please request a new one.');
    
    await supabase.from('otp_codes').update({ verified: true } as any).eq('id', (data as any).id);
    return true;
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, role, signIn, signUp, signOut, sendOTP, verifyOTP }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
