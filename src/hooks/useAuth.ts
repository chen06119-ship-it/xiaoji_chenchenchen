import { useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";

export type AuthProfile = {
  avatarUrl: string;
  username: string;
};

function getProfile(user: User | null): AuthProfile | null {
  if (!user) {
    return null;
  }

  return {
    avatarUrl:
      typeof user.user_metadata.avatar_url === "string"
        ? user.user_metadata.avatar_url
        : "",
    username:
      typeof user.user_metadata.username === "string"
        ? user.user_metadata.username
        : user.email?.split("@")[0] ?? "小鸡朋友",
  };
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(supabase));

  useEffect(() => {
    if (!supabase) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!isMounted) {
        return;
      }

      setUser(data.session?.user ?? null);
      setIsLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return useMemo(
    () => ({
      isLoading,
      profile: getProfile(user),
      user,
    }),
    [isLoading, user],
  );
}
