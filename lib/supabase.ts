import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { env } from "./env";

let cachedAdmin: SupabaseClient | null = null;

export const getAdminClient = () => {
  if (cachedAdmin) return cachedAdmin;
  cachedAdmin = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
  return cachedAdmin;
};
