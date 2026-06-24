"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/types/user";

export interface UseAuthResult {
  userId: string | null;
  email: string | null;
  profile: Profile | null;
  loading: boolean;
  isOwner: boolean;
  signOut: () => Promise<void>;
}

/**
 * Hook de cliente: expone el usuario autenticado y su profile
 * (incluyendo el role) y se mantiene sincronizado con los cambios
 * de sesión (login/logout en otra pestaña, expiración, etc).
 */
export function useAuth(): UseAuthResult {
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    let active = true;

    async function loadSession() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!active) return;

      if (!user) {
        setUserId(null);
        setEmail(null);
        setProfile(null);
        setLoading(false);
        return;
      }

      setUserId(user.id);
      setEmail(user.email ?? null);

      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (active) {
        setProfile(profileData ?? null);
        setLoading(false);
      }
    }

    loadSession();

    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      loadSession();
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUserId(null);
    setEmail(null);
    setProfile(null);
  }

  return {
    userId,
    email,
    profile,
    loading,
    isOwner: profile?.role === "owner",
    signOut,
  };
}
