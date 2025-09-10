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

    if (authError) {
      // Обрабатываем специфичные ошибки Supabase
      if (authError.message.includes('already registered') || 
          authError.message.includes('User already registered') ||
          authError.message.includes('duplicate key') ||
          authError.message.includes('already exists')) {
        return { success: false, error: 'Такой аккаунт уже существует' }
      }
      
      if (authError.message.includes('Invalid email')) {
        return { success: false, error: 'Неверный формат email' }
      }
      
      if (authError.message.includes('Password should be at least')) {
        return { success: false, error: 'Пароль должен содержать минимум 6 символов' }
      }
      
      // Возвращаем оригинальное сообщение для других ошибок
      return { success: false, error: authError.message }
    }

    if (!authData.user) {
      return { success: false, error: 'Ошибка создания пользователя' }
    }

    // Пытаемся создать запись в таблице users
    try {
      await supabase
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
    } catch (error) {
      // Игнорируем ошибки - полагаемся на триггер
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
    console.log('🔑 auth.ts: Начинаем вход для:', data.email);
    
    console.log('📤 auth.ts: Отправляем запрос в Supabase...');
    
    // Прямой запрос без таймаута
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password
    });
    
    console.log('📊 auth.ts: Результат от Supabase:', { 
      hasUser: !!authData?.user, 
      hasError: !!authError,
      errorMessage: authError?.message 
    });

    if (authError) {
      // Обрабатываем специфичные ошибки Supabase
      if (authError.message.includes('Invalid login credentials') ||
          authError.message.includes('Invalid email or password') ||
          authError.message.includes('Invalid credentials') ||
          authError.message.includes('User not found')) {
        return { success: false, error: 'Неверный логин или пароль' }
      }
      
      if (authError.message.includes('Too many requests')) {
        return { success: false, error: 'Слишком много попыток входа. Попробуйте позже' }
      }
      
      if (authError.message.includes('Email not confirmed')) {
        return { success: false, error: 'Email не подтвержден. Проверьте почту или обратитесь к администратору' }
      }
      
      // Возвращаем оригинальное сообщение для других ошибок
      return { success: false, error: authError.message }
    }

    if (!authData.user) {
      return { success: false, error: 'Ошибка входа' }
    }

    // Получаем данные пользователя из таблицы users
    let user: User | null = null
    
    try {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authData.user.id)
        .single()

      if (userData && !userError) {
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
    } catch (error) {
      // Fallback на user_metadata
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

    console.log('✅ auth.ts: Вход завершен успешно, возвращаем пользователя:', user?.email);
    return { success: true, user: user || undefined }
  } catch (error: any) {
    console.error('💥 auth.ts: Критическая ошибка входа:', error);

    return { success: false, error: 'Произошла ошибка при входе' }
  }
}

// Выход пользователя
export const logoutUser = async (): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log('🚪 Начинаем выход из системы...')
    
    // Проверяем текущее состояние аутентификации
    const { data: { user } } = await supabase.auth.getUser()
    console.log('👤 Текущий пользователь перед выходом:', user ? user.email : 'Нет пользователя')
    
    // Прямой выход без таймаута
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      console.error('❌ Ошибка выхода:', error)
      return { success: false, error: error.message }
    }
    
    // Проверяем состояние после выхода
    const { data: { user: userAfterLogout } } = await supabase.auth.getUser()
    console.log('👤 Пользователь после выхода:', userAfterLogout ? userAfterLogout.email : 'Нет пользователя')
    
    console.log('✅ Выход из системы выполнен успешно')
    return { success: true }
  } catch (error: any) {
    console.error('💥 Критическая ошибка выхода:', error)

    return { success: false, error: error.message || 'Неизвестная ошибка выхода' }
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
  return supabase.auth.onAuthStateChange(async (_event: any, session: any) => {
    if (session?.user) {
      const user = await getCurrentUser()
      callback(user)
    } else {
      callback(null)
    }
  })
}