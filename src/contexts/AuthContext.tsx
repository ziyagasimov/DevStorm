/**
 * AuthContext — Global authentication state management.
 * 
 * Provides user session, role information, and sign-out functionality.
 * Role is fetched from the `user_roles` table using a SECURITY DEFINER
 * function to bypass RLS restrictions safely.
 */
import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type AppRole = Database["public"]["Enums"]["app_role"];

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  role: AppRole | null;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  loading: true,
  role: null,
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<AppRole | null>(null);

  /** Fetch user role via RPC to avoid RLS issues on user_roles table */
  const fetchRole = useCallback(async (userId: string) => {
    const { data } = await supabase.rpc("get_user_role", { _user_id: userId });
    setRole((data as AppRole) || "user");
  }, []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        if (session?.user) {
          // Defer to avoid Supabase auth deadlock
          setTimeout(() => fetchRole(session.user.id), 0);
        } else {
          setRole(null);
          setLoading(false);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        fetchRole(session.user.id).then(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchRole]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setRole(null);
  }, []);

  return (
    <AuthContext.Provider value={{ session, user: session?.user ?? null, loading, role, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
