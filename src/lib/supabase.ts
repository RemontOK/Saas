import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://nvidqslpfgvqonrpfdzho.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52aWRxc2xwZmd2cW9ucnBmZHpoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0Mzg2ODMsImV4cCI6MjA3MzAxNDY4M30.4l4F_wEqapQ10JFEbMFP7P1KfS79Q3cd55PL6-S73ns'

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