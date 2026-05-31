import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

// En dev: Vite proxy redirige /api → localhost:8001 (sin CORS)
// En producción: configurar VITE_BACKEND_URL o servir desde el mismo origen
export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || ''
