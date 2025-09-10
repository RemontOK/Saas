import { createClient } from '@supabase/supabase-js'

// Используем переменные окружения с fallback на рабочий URL
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://nvidqslpfgvqonrpfdzh.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52aWRxc2xwZmd2cW9ucnBmZHpoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0Mzg2ODMsImV4cCI6MjA3MzAxNDY4M30.4l4F_wEqapQ10JFEbMFP7P1KfS79Q3cd55PL6-S73ns'

// Диагностика конфигурации
console.log('🔧 Supabase конфигурация:', {
  url: supabaseUrl,
  hasAnonKey: !!supabaseAnonKey,
  anonKeyLength: supabaseAnonKey?.length,
  envUrl: import.meta.env.VITE_SUPABASE_URL,
  envKey: import.meta.env.VITE_SUPABASE_ANON_KEY
})

// Создаем клиент Supabase (проверяем, что не создаем множественные экземпляры)
let supabaseInstance: any = null

if (typeof window !== 'undefined' && (window as any).__supabase) {
  console.log('♻️ Используем существующий экземпляр Supabase')
  supabaseInstance = (window as any).__supabase
} else {
  console.log('🆕 Создаем новый экземпляр Supabase')
  supabaseInstance = createClient(supabaseUrl, supabaseAnonKey)
  if (typeof window !== 'undefined') {
    (window as any).__supabase = supabaseInstance
  }
}

export const supabase = supabaseInstance

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