import { useCallback, useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import type { Profile, ProfileDraft } from "../types/community";

type ProfileRow = {
  id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  created_at?: string;
  updated_at?: string;
};

function getFallbackProfile(user: User): Profile {
  const metadata = user.user_metadata;
  const username =
    typeof metadata.username === "string"
      ? metadata.username
      : user.email?.split("@")[0] ?? "xiaoji-user";

  return {
    id: user.id,
    username,
    displayName:
      typeof metadata.display_name === "string" ? metadata.display_name : username,
    avatarUrl: typeof metadata.avatar_url === "string" ? metadata.avatar_url : "",
    bio: "",
  };
}

function mapProfile(row: ProfileRow): Profile {
  const username = row.username || "xiaoji-user";

  return {
    id: row.id,
    username,
    displayName: row.display_name || username,
    avatarUrl: row.avatar_url || "",
    bio: row.bio || "",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function ensureProfile(user: User, draft?: Partial<ProfileDraft>) {
  if (!supabase) {
    return getFallbackProfile(user);
  }

  const fallback = getFallbackProfile(user);
  const payload = {
    id: user.id,
    username: draft?.username?.trim() || fallback.username,
    display_name:
      draft?.displayName?.trim() || fallback.displayName || fallback.username,
    avatar_url: draft?.avatarUrl?.trim() || fallback.avatarUrl,
    bio: draft?.bio?.trim() || fallback.bio,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("profiles")
    .upsert(payload, { onConflict: "id" })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return mapProfile(data as ProfileRow);
}

async function fetchProfile(user: User) {
  if (!supabase) {
    return getFallbackProfile(user);
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data ? mapProfile(data as ProfileRow) : ensureProfile(user);
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(supabase));

  const refreshProfile = useCallback(async (nextUser = user) => {
    if (!nextUser) {
      setProfile(null);
      return null;
    }

    const nextProfile = await fetchProfile(nextUser);
    setProfile(nextProfile);
    return nextProfile;
  }, [user]);

  useEffect(() => {
    if (!supabase) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    async function loadSession() {
      const { data } = await supabase!.auth.getSession();
      const sessionUser = data.session?.user ?? null;

      if (!isMounted) {
        return;
      }

      setUser(sessionUser);

      if (sessionUser) {
        try {
          const nextProfile = await fetchProfile(sessionUser);
          if (isMounted) {
            setProfile(nextProfile);
          }
        } finally {
          if (isMounted) {
            setIsLoading(false);
          }
        }
      } else {
        setProfile(null);
        setIsLoading(false);
      }
    }

    loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const sessionUser = session?.user ?? null;
      setUser(sessionUser);
      setIsLoading(false);

      if (sessionUser) {
        fetchProfile(sessionUser)
          .then((nextProfile) => {
            if (isMounted) {
              setProfile(nextProfile);
            }
          })
          .catch(() => {
            if (isMounted) {
              setProfile(getFallbackProfile(sessionUser));
            }
          });
      } else {
        setProfile(null);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return useMemo(
    () => ({
      isLoading,
      profile,
      refreshProfile,
      user,
    }),
    [isLoading, profile, refreshProfile, user],
  );
}
