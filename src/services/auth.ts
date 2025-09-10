import { supabase } from '../lib/supabase'
import type { User } from '../lib/supabase'
import { createUserRecord, checkUserExists } from '../utils/create-user-record'

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
    // Если не получается, полагаемся на триггер handle_new_user
    try {
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
        console.warn('Не удалось создать запись в таблице users:', userError.message)
        console.log('Полагаемся на триггер handle_new_user для автоматического создания записи')
      } else {
        console.log('Запись пользователя успешно создана в таблице users')
      }
    } catch (error) {
      console.warn('Ошибка при создании записи пользователя:', error)
      console.log('Полагаемся на триггер handle_new_user для автоматического создания записи')
    }

    // Проверяем, создалась ли запись в таблице users через триггер
    setTimeout(async () => {
      try {
        const { exists } = await checkUserExists(authData.user.id)
        
        if (exists) {
          console.log('✅ Запись пользователя успешно создана через триггер handle_new_user')
        } else {
          console.log('⚠️ Запись пользователя не найдена в таблице users, создаем через fallback...')
          
          // Создаем запись через fallback функцию
          const result = await createUserRecord({
            id: authData.user.id,
            email: data.email,
            name: data.name,
            company: data.company,
            phone: data.phone,
            plan: data.plan
          })
          
          if (result.success) {
            console.log('✅ Запись пользователя создана через fallback функцию')
          } else if (result.retry) {
            console.log('⏳ Пользователь еще не создан в auth.users, ждем еще...')
            // Повторяем попытку через 3 секунды
            setTimeout(async () => {
              const retryResult = await createUserRecord({
                id: authData.user.id,
                email: data.email,
                name: data.name,
                company: data.company,
                phone: data.phone,
                plan: data.plan
              })
              
              if (retryResult.success) {
                console.log('✅ Запись пользователя создана при повторной попытке')
              } else {
                console.error('❌ Не удалось создать запись пользователя даже при повторной попытке:', retryResult.error)
              }
            }, 3000)
          } else {
            console.error('❌ Не удалось создать запись пользователя:', result.error)
          }
        }
      } catch (error) {
        console.log('⚠️ Не удалось проверить создание записи пользователя:', error)
      }
    }, 2000) // Проверяем через 2 секунды

    // Регистрация прошла успешно, возвращаем данные пользователя
    console.log('✅ Регистрация пользователя завершена успешно')
    
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
    console.log('🔑 Начинаем вход пользователя:', data.email)
    
    // Сначала тестируем подключение к Supabase
    console.log('🔍 Тестируем подключение к Supabase...')
    try {
      const { data: testData, error: testError } = await supabase.auth.getUser()
      console.log('📊 Тест подключения:', { hasData: !!testData, hasError: !!testError, error: testError?.message })
    } catch (testErr) {
      console.error('❌ Ошибка тестирования подключения:', testErr)
    }
    
    console.log('📤 Отправляем запрос входа в Supabase...')
    
    // Простой запрос входа без таймаута
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password
    })

    console.log('📊 Результат аутентификации:', { 
      hasUser: !!authData.user, 
      hasError: !!authError,
      errorMessage: authError?.message,
      userId: authData.user?.id,
      userEmail: authData.user?.email
    })

    if (authError) {
      console.error('❌ Ошибка входа:', authError)
      
      // Обрабатываем специфичные ошибки Supabase
      if (authError.message.includes('Invalid login credentials') ||
          authError.message.includes('Invalid email or password') ||
          authError.message.includes('Invalid credentials') ||
          authError.message.includes('Email not confirmed') ||
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
      console.error('❌ Пользователь не найден в ответе аутентификации')
      return { success: false, error: 'Ошибка входа' }
    }

    console.log('✅ Аутентификация прошла успешно, получаем данные пользователя')
    
    // Получаем данные пользователя из таблицы users
    let user: User | null = null
    
    try {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authData.user.id)
        .single()

      if (userData && !userError) {
        console.log('✅ Данные пользователя получены из таблицы users')
        user = userData
      } else {
        console.log('⚠️ Запись в таблице users не найдена, используем user_metadata')
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
      console.warn('Ошибка получения данных пользователя:', error)
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

    console.log('🎉 Вход пользователя завершен успешно:', user?.email)
    return { success: true, user: user || undefined }
  } catch (error: any) {
    console.error('💥 Критическая ошибка входа:', error)
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
    
    // Добавляем таймаут для signOut
    const signOutPromise = supabase.auth.signOut()
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Таймаут выхода из системы')), 5000)
    )
    
    const { error } = await Promise.race([signOutPromise, timeoutPromise]) as any
    
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
    
    // Если таймаут - все равно считаем успешным, так как состояние очистится
    if (error.message === 'Таймаут выхода из системы') {
      console.log('⏰ Таймаут выхода, но продолжаем очистку состояния')
      return { success: true, error: 'Таймаут, но состояние будет очищено' }
    }
    
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