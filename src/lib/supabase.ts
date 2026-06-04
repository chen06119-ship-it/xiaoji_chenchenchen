import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : null;

export function usernameToEmail(username: string) {
  const trimmedUsername = username.trim();
  const normalizedUsername = Array.from(trimmedUsername)
    .map((character) => character.codePointAt(0)?.toString(36) ?? "")
    .filter(Boolean)
    .join("-");

  return `u-${normalizedUsername || "xiaoji-user"}@xiaoji.local`;
}
