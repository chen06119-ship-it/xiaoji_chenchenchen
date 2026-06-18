import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : null;

export function usernameToEmail(username: string) {
  const normalizedUsername = username
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_\u4e00-\u9fa5-]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return `u-${normalizedUsername || "xiaoji-user"}@xiaoji.local`;
}
