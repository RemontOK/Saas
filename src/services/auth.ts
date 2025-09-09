import { supabase } from '../lib/supabase'
import type { User } from '../lib/supabase'

export interface RegisterData {
  name: string
  email: string
  password: string
  company?: string
  phone?: string
  plan: string
}

export interface LoginData {
  email: string
  password: string
}

export interface AuthResponse {
  success: boolean
  user?: User
  error?: string
}

// Регистрация пользователя
export const registerUser = async (data: RegisterData): Promise<AuthResponse> => {
  try {
    console.log('Начинаем регистрацию пользователя:', data.email)
    
    // Регистрируем пользователя в Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          name: data.name,
          company: data.company,
          phone: data.phone,
          plan: data.plan
        }
      }
    })

    console.log('Результат регистрации:', { authData, authError })

    if (authError) {
      console.error('Ошибка регистрации:', authError)
      return { success: false, error: authError.message }
    }

    if (!authData.user) {
      return { success: false, error: 'Ошибка создания пользователя' }
    }

    // Создаем запись в таблице users
    const { error: userError } = await supabase
      .from('users')
      .insert([
        {
          id: authData.user.id,
          email: data.email,
          name: data.name,
          company: data.company,
          phone: data.phone,
          plan: data.plan
        }
      ])

    if (userError) {
      console.error('Ошибка создания записи пользователя:', userError)
      // Пользователь создан в Auth, но не в таблице users
      // Это не критично, данные есть в user_metadata
    }

    const user: User = {
      id: authData.user.id,
      email: data.email,
      name: data.name,
      company: data.company,
      phone: data.phone,
      plan: data.plan,
      created_at: new Date().toISOString()
    }

    return { success: true, user }
  } catch (error) {
    console.error('Ошибка регистрации:', error)
    return { success: false, error: 'Произошла ошибка при регистрации' }
  }
}

// Вход пользователя
export const loginUser = async (data: LoginData): Promise<AuthResponse> => {
  try {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password
    })

    if (authError) {
      return { success: false, error: authError.message }
    }

    if (!authData.user) {
      return { success: false, error: 'Ошибка входа' }
    }

    // Получаем данные пользователя из таблицы users
    let user: User | null = null
    
    const { data: userData } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single()

    if (userData) {
      user = userData
    } else {
      // Если нет записи в таблице users, создаем из user_metadata
      const metadata = authData.user.user_metadata
      user = {
        id: authData.user.id,
        email: authData.user.email || '',
        name: metadata.name || '',
        company: metadata.company,
        phone: metadata.phone,
        plan: metadata.plan || 'Starter',
        created_at: authData.user.created_at || new Date().toISOString()
      }
    }

    return { success: true, user: user || undefined }
  } catch (error) {
    console.error('Ошибка входа:', error)
    return { success: false, error: 'Произошла ошибка при входе' }
  }
}

// Выход пользователя
export const logoutUser = async (): Promise<void> => {
  try {
    await supabase.auth.signOut()
  } catch (error) {
    console.error('Ошибка выхода:', error)
  }
}

// Получение текущего пользователя
export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const { data: { user: authUser } } = await supabase.auth.getUser()
    
    if (!authUser) {
      return null
    }

    // Получаем данные из таблицы users
    const { data: userData } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .single()

    if (userData) {
      return userData
    }

    // Если нет записи в таблице, создаем из user_metadata
    const metadata = authUser.user_metadata
    return {
      id: authUser.id,
      email: authUser.email || '',
      name: metadata.name || '',
      company: metadata.company,
      phone: metadata.phone,
      plan: metadata.plan || 'Starter',
      created_at: authUser.created_at || new Date().toISOString()
    }
  } catch (error) {
    console.error('Ошибка получения пользователя:', error)
    return null
  }
}

// Подписка на изменения аутентификации
export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return supabase.auth.onAuthStateChange(async (_event, session) => {
    if (session?.user) {
      const user = await getCurrentUser()
      callback(user)
    } else {
      callback(null)
    }
  })
}