// Тест подключения к Supabase
export const testSupabaseConnection = async () => {
  try {
    console.log('🔍 Тестируем подключение к Supabase...')
    
    // Импортируем supabase динамически, чтобы избежать циклических зависимостей
    const { supabase } = await import('../lib/supabase')
    
    // Тест 1: Проверяем базовое подключение
    console.log('📡 Тест 1: Базовое подключение...')
    const { error: healthError } = await supabase
      .from('_health')
      .select('*')
      .limit(1)
    
    if (healthError) {
      console.log('⚠️ Тест 1: Ошибка health check:', healthError.message)
    } else {
      console.log('✅ Тест 1: Health check прошел успешно')
    }
    
    // Тест 2: Проверяем аутентификацию
    console.log('🔐 Тест 2: Проверка аутентификации...')
    const { error: authError } = await supabase.auth.getUser()
    
    if (authError) {
      console.log('⚠️ Тест 2: Ошибка аутентификации:', authError.message)
    } else {
      console.log('✅ Тест 2: Аутентификация работает')
    }
    
    // Тест 3: Проверяем таблицу users
    console.log('👥 Тест 3: Проверка таблицы users...')
    const { error: usersError } = await supabase
      .from('users')
      .select('id')
      .limit(1)
    
    if (usersError) {
      console.log('⚠️ Тест 3: Ошибка таблицы users:', usersError.message)
    } else {
      console.log('✅ Тест 3: Таблица users доступна')
    }
    
    // Общий результат
    const hasHealthError = !!healthError
    const hasAuthError = !!authError
    const hasUsersError = !!usersError
    
    if (hasHealthError && hasAuthError && hasUsersError) {
      console.error('❌ Все тесты не прошли - Supabase недоступен')
      return { success: false, error: 'Supabase недоступен' }
    } else if (hasHealthError || hasAuthError || hasUsersError) {
      console.warn('⚠️ Некоторые тесты не прошли, но Supabase частично доступен')
      return { success: true, warning: 'Supabase частично доступен' }
    } else {
      console.log('✅ Все тесты прошли успешно - Supabase работает')
      return { success: true }
    }
    
  } catch (error: any) {
    console.error('💥 Критическая ошибка тестирования Supabase:', error)
    return { success: false, error: error.message }
  }
}

// Тест доступности URL
export const testSupabaseUrl = async () => {
  try {
    console.log('🌐 Тестируем доступность URL Supabase...')
    
    const { supabase } = await import('../lib/supabase')
    const url = supabase.supabaseUrl
    
    console.log('📡 URL Supabase:', url)
    
    // Простой fetch тест
    const response = await fetch(`${url}/rest/v1/`, {
      method: 'GET',
      headers: {
        'apikey': supabase.supabaseKey,
        'Authorization': `Bearer ${supabase.supabaseKey}`
      }
    })
    
    console.log('📊 Статус ответа:', response.status)
    
    if (response.ok) {
      console.log('✅ URL Supabase доступен')
      return { success: true }
    } else {
      console.error('❌ URL Supabase недоступен:', response.status, response.statusText)
      return { success: false, error: `HTTP ${response.status}: ${response.statusText}` }
    }
    
  } catch (error: any) {
    console.error('💥 Ошибка тестирования URL:', error)
    return { success: false, error: error.message }
  }
}
