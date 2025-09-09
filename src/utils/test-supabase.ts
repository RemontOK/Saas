import { supabase } from '../lib/supabase'

// Функция для тестирования подключения к Supabase
export const testSupabaseConnection = async () => {
  try {
    console.log('Тестируем подключение к Supabase...')
    
    // Проверяем подключение
    const { error } = await supabase
      .from('users')
      .select('count')
      .limit(1)
    
    if (error) {
      console.error('Ошибка подключения к Supabase:', error)
      return { success: false, error: error.message }
    }
    
    console.log('Подключение к Supabase успешно!')
    return { success: true }
  } catch (error) {
    console.error('Ошибка тестирования Supabase:', error)
    return { success: false, error: 'Ошибка подключения' }
  }
}

// Функция для создания таблицы users (если её нет)
export const createUsersTable = async () => {
  try {
    console.log('Пытаемся создать таблицу users...')
    
    // Пробуем вставить тестовую запись
    const { error } = await supabase
      .from('users')
      .insert([
        {
          id: '00000000-0000-0000-0000-000000000000',
          email: 'test@example.com',
          name: 'Test User',
          plan: 'Starter'
        }
      ])
    
    if (error) {
      console.error('Ошибка создания таблицы:', error)
      return { success: false, error: error.message }
    }
    
    console.log('Таблица users создана успешно!')
    return { success: true }
  } catch (error) {
    console.error('Ошибка создания таблицы:', error)
    return { success: false, error: 'Ошибка создания таблицы' }
  }
}