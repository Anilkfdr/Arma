import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL?.trim();
const key = (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY)?.trim();

export const isSupabaseConfigured = Boolean(url && key && !url.includes('<proje-ref>'));

let client: SupabaseClient | null = null;

/**
 * Tek Supabase istemcisi. Oturum tarayıcı deposunda tutulur ve süresi dolmadan yenilenir.
 * Ayarlar eksikse hata fırlatır; arayüz bunu "kurulum eksik" ekranıyla gösterir.
 */
export function getSupabase(): SupabaseClient {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase bağlantı ayarları eksik (VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY).');
  }
  if (!client) {
    client = createClient(url!, key!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
        storageKey: 'arma-oturum',
      },
    });
  }
  return client;
}
