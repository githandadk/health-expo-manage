// One client for the whole app. Do not re-create elsewhere.
import { createClient } from '@supabase/supabase-js'

const url  = import.meta.env.VITE_SUPABASE_URL!
const key  = import.meta.env.VITE_SUPABASE_ANON_KEY!

export const supabase = createClient(url, key, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'health-expo-auth' // stable key across routes
  }
})
