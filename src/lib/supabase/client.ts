import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

export const getSupabaseConfig = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  return { url, anonKey };
};

export const isSupabaseConfigured = () => {
  const { url, anonKey } = getSupabaseConfig();
  return Boolean(
    url &&
    anonKey &&
    !url.includes('your-project') &&
    !anonKey.includes('dummy_key') &&
    url.startsWith('https://')
  );
};

let browserClient: SupabaseClient | null = null;

export const createClient = () => {
  const { url, anonKey } = getSupabaseConfig();
  const safeUrl = url || 'https://placeholder.supabase.co';
  const safeKey = anonKey || 'placeholder';

  if (typeof window === 'undefined') {
    return createBrowserClient(safeUrl, safeKey);
  }

  if (!browserClient) {
    browserClient = createBrowserClient(safeUrl, safeKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  }

  return browserClient;
};
