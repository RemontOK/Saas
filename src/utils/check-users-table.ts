// Функции для проверки и исправления таблицы users
import { supabase } from '../lib/supabase'

// Проверяем, существует ли таблица users и есть ли в ней записи
export const checkUsersTableStatus = async () => {
  try {
    console.log('🔍 Проверяем статус таблицы users...')
    
    // Пробуем получить записи из таблицы users
    const { data: usersData, error: usersError } = await supabase
      .from('users')
      .select('id, email, name, plan, created_at')
      .limit(5)
    
    if (usersError) {
      console.error('❌ Ошибка доступа к таблице users:', usersError)
      return {
        success: false,
        error: usersError.message,
        message: '❌ Таблица users недоступна или не существует',
        tableExists: false
      }
    }
    
    console.log('✅ Таблица users доступна')
    
    // Получаем текущего пользователя
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return {
        success: true,
        tableExists: true,
        usersCount: usersData?.length || 0,
        message: '✅ Таблица users существует, но пользователь не авторизован',
        currentUser: null
      }
    }
    
    // Проверяем, есть ли запись текущего пользователя в таблице users
    const currentUserInTable = usersData?.find((u: any) => u.id === user.id)
    
    return {
      success: true,
      tableExists: true,
      usersCount: usersData?.length || 0,
      currentUser: {
        id: user.id,
        email: user.email,
        inTable: !!currentUserInTable,
        tableData: currentUserInTable
      },
      message: currentUserInTable 
        ? '✅ Таблица users существует, ваша запись найдена'
        : '⚠️ Таблица users существует, но вашей записи нет'
    }
  } catch (error: any) {
    console.error('💥 Критическая ошибка проверки таблицы:', error)
    return {
      success: false,
      error: error.message,
      message: '💥 Критическая ошибка при проверке таблицы users',
      tableExists: false
    }
  }
}

// Создаем запись пользователя в таблице users
export const createUserInTable = async () => {
  try {
    console.log('🔧 Создаем запись пользователя в таблице users...')
    
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return {
        success: false,
        error: 'Пользователь не авторизован',
        message: '❌ Пользователь не авторизован'
      }
    }
    
    // Создаем запись пользователя
    const { data, error } = await supabase
      .from('users')
      .insert([{
        id: user.id,
        email: user.email,
        name: user.user_metadata?.name || '',
        company: user.user_metadata?.company || '',
        phone: user.user_metadata?.phone || '',
        plan: user.user_metadata?.plan || 'Starter'
      }])
      .select()
      .single()
    
    if (error) {
      if (error.code === '23505' || error.message.includes('duplicate key')) {
        return {
          success: true,
          message: 'ℹ️ Запись пользователя уже существует в таблице users'
        }
      }
      
      console.error('❌ Ошибка создания записи:', error)
      return {
        success: false,
        error: error.message,
        message: '❌ Не удалось создать запись пользователя'
      }
    }
    
    console.log('✅ Запись пользователя создана:', data)
    return {
      success: true,
      data,
      message: '✅ Запись пользователя успешно создана в таблице users'
    }
  } catch (error: any) {
    console.error('💥 Критическая ошибка создания записи:', error)
    return {
      success: false,
      error: error.message,
      message: '💥 Критическая ошибка при создании записи пользователя'
    }
  }
}

// Получаем инструкции по исправлению
export const getTableFixInstructions = () => {
  return {
    success: true,
    message: `🔧 ИНСТРУКЦИИ ПО ИСПРАВЛЕНИЮ ТАБЛИЦЫ USERS:

1. 📊 ПРОВЕРЬТЕ СТАТУС:
   - Нажмите "🔍 Проверить таблицу users"
   - Узнайте, существует ли таблица и есть ли ваша запись

2. 🚀 БЫСТРОЕ ИСПРАВЛЕНИЕ (SQL):
   - Откройте Supabase Dashboard
   - Перейдите в SQL Editor
   - Выполните SQL из файла check-users-table.sql
   - Это создаст таблицу и перенесет всех пользователей

3. 🔧 СОЗДАТЬ ЗАПИСЬ ВРУЧНУЮ:
   - Нажмите "🔧 Создать запись пользователя"
   - Система попытается создать вашу запись

4. ✅ ПРОВЕРЬТЕ РЕЗУЛЬТАТ:
   - Попробуйте войти в систему
   - Проверьте, что данные сохраняются

5. 📋 АЛЬТЕРНАТИВА:
   - Если ничего не помогает, выполните полное пересоздание таблицы
   - Используйте SQL из файла fix-users-table.sql

🎉 После выполнения этих шагов таблица users будет работать!`
  }
}
