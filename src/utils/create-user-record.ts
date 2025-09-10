import { supabase } from '../lib/supabase'

// Функция для создания записи пользователя в таблице users
// Используется как fallback, если триггер не работает
export const createUserRecord = async (userData: {
  id: string
  email: string
  name: string
  company?: string
  phone?: string
  plan: string
}) => {
  try {
    console.log('Создаем запись пользователя через fallback функцию...')
    
    // Пробуем создать запись напрямую
    const { data, error } = await supabase
      .from('users')
      .insert([userData])
      .select()
      .single()

    if (error) {
      // Если ошибка 409 (Conflict) - запись уже существует, это не критично
      if (error.code === '23505' || 
          error.message.includes('duplicate key') ||
          error.message.includes('already exists') ||
          error.message.includes('unique constraint')) {
        console.log('ℹ️ Запись пользователя уже существует, это нормально')
        return { success: true, data: userData }
      }
      
      // Если ошибка foreign key constraint - пользователь еще не создан в auth.users
      if (error.code === '23503' || 
          error.message.includes('foreign key constraint') ||
          error.message.includes('is not present in table')) {
        console.log('ℹ️ Пользователь еще не создан в auth.users, ждем...')
        return { success: false, error: 'Пользователь еще не создан в auth.users', retry: true }
      }
      
      console.error('Ошибка создания записи пользователя:', error)
      return { success: false, error: error.message }
    }

    console.log('✅ Запись пользователя успешно создана:', data)
    return { success: true, data }
  } catch (error) {
    console.error('Критическая ошибка создания записи пользователя:', error)
    return { success: false, error: 'Не удалось создать запись пользователя' }
  }
}

// Функция для проверки существования пользователя в таблице users
export const checkUserExists = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, email, name')
      .eq('id', userId)
      .single()

    if (error) {
      return { exists: false, error: error.message }
    }

    return { exists: true, data }
  } catch (error) {
    return { exists: false, error: 'Ошибка проверки пользователя' }
  }
}
