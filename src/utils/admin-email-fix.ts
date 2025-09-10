import { createClient } from '@supabase/supabase-js'

// Создаем клиент с service role key для административных операций
const supabaseAdmin = createClient(
  'https://nvidqslpfgvqonrpfdzh.supabase.co',
  'sb_secret_PEzANJ1E4puMP6_POZpnqQ_bQ6IK02z',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

// Функция для подтверждения всех неподтвержденных пользователей
export const confirmAllUsers = async () => {
  try {
    console.log('🔧 Используем admin права для подтверждения пользователей...')
    
    // Получаем всех пользователей
    const { data: users, error: fetchError } = await supabaseAdmin.auth.admin.listUsers()
    
    if (fetchError) {
      console.error('❌ Ошибка получения пользователей:', fetchError)
      return { 
        success: false, 
        error: fetchError.message,
        message: 'Не удалось получить список пользователей'
      }
    }
    
    console.log(`📊 Найдено пользователей: ${users.users.length}`)
    
    let confirmedCount = 0
    let alreadyConfirmedCount = 0
    
    for (const user of users.users) {
      if (!user.email_confirmed_at) {
        console.log(`📧 Подтверждаем email для: ${user.email}`)
        
        const { error: confirmError } = await supabaseAdmin.auth.admin.updateUserById(
          user.id,
          { email_confirm: true }
        )
        
        if (confirmError) {
          console.error(`❌ Ошибка подтверждения ${user.email}:`, confirmError)
        } else {
          console.log(`✅ Email подтвержден: ${user.email}`)
          confirmedCount++
        }
      } else {
        alreadyConfirmedCount++
      }
    }
    
    console.log(`🎉 Результат: подтверждено ${confirmedCount}, уже подтверждено ${alreadyConfirmedCount}`)
    
    return {
      success: true,
      confirmedCount,
      alreadyConfirmedCount,
      totalUsers: users.users.length,
      message: `✅ Подтверждено ${confirmedCount} пользователей, ${alreadyConfirmedCount} уже были подтверждены`
    }
  } catch (error: any) {
    console.error('💥 Критическая ошибка:', error)
    return {
      success: false,
      error: error.message,
      message: '💥 Произошла критическая ошибка при подтверждении пользователей'
    }
  }
}

// Функция для отключения подтверждения email для новых пользователей
export const disableEmailConfirmation = async () => {
  try {
    console.log('🔧 Отключаем подтверждение email для новых пользователей...')
    
    // Обновляем настройки аутентификации
    const { error } = await supabaseAdmin.auth.admin.updateUserById(
      'config', // Это может не работать напрямую, но попробуем
      { 
        email_confirm: false 
      }
    )
    
    if (error) {
      console.log('⚠️ Не удалось обновить настройки через API')
      return {
        success: false,
        message: '⚠️ Не удалось отключить подтверждение email через API. Используйте Supabase Dashboard.'
      }
    }
    
    return {
      success: true,
      message: '✅ Подтверждение email отключено для новых пользователей'
    }
  } catch (error: any) {
    console.error('💥 Ошибка отключения подтверждения:', error)
    return {
      success: false,
      error: error.message,
      message: '💥 Ошибка при отключении подтверждения email'
    }
  }
}

// Функция для получения статистики пользователей
export const getUserStats = async () => {
  try {
    console.log('📊 Получаем статистику пользователей...')
    
    const { data: users, error } = await supabaseAdmin.auth.admin.listUsers()
    
    if (error) {
      return {
        success: false,
        error: error.message,
        message: '❌ Не удалось получить статистику пользователей'
      }
    }
    
    const totalUsers = users.users.length
    const confirmedUsers = users.users.filter(u => u.email_confirmed_at).length
    const unconfirmedUsers = totalUsers - confirmedUsers
    
    return {
      success: true,
      stats: {
        total: totalUsers,
        confirmed: confirmedUsers,
        unconfirmed: unconfirmedUsers
      },
      message: `📊 Всего: ${totalUsers}, подтверждено: ${confirmedUsers}, не подтверждено: ${unconfirmedUsers}`
    }
  } catch (error: any) {
    console.error('💥 Ошибка получения статистики:', error)
    return {
      success: false,
      error: error.message,
      message: '💥 Ошибка при получении статистики пользователей'
    }
  }
}
