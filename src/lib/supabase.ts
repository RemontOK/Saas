
import { createClient } from '@supabase/supabase-js'

// Берем конфиг из .env (Vite)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Диагностика конфигурации (без вывода ключа)
console.log('🔧 Supabase конфигурация:', {
  url: supabaseUrl,
  hasAnonKey: !!supabaseAnonKey,
  anonKeyLength: supabaseAnonKey?.length
})

// Единственная инициализация клиента
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Типы для TypeScript
export interface User {
  id: string
  email: string
  name: string
  company?: string
  phone?: string
  plan: string
  created_at: string
}

export interface AuthUser {
  id: string
  email: string
  user_metadata: {
    name: string
    company?: string
    phone?: string
    plan: string
  }
}