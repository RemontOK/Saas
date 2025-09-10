import { supabase } from '../lib/supabase'

// Функция для проверки статуса подтверждения email текущего пользователя
export const checkEmailConfirmationStatus = async () => {
  try {
    console.log('🔍 Проверяем статус пользователя...')
    
    // Добавляем таймаут для быстрого ответа
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Таймаут проверки')), 5000)
    )
    
    const userPromise = supabase.auth.getUser()
    
    const { data: { user }, error } = await Promise.race([userPromise, timeoutPromise]) as any
    
    if (error) {
      console.log('❌ Ошибка получения пользователя:', error.message)
      return { confirmed: false, error: error.message }
    }
    
    const confirmed = !!user?.email_confirmed_at
    console.log(`✅ Статус проверен: ${confirmed ? 'подтвержден' : 'не подтвержден'}`)
    
    return { 
      confirmed,
      confirmedAt: user?.email_confirmed_at,
      user: user
    }
  } catch (error: any) {
    console.log('❌ Ошибка проверки статуса:', error.message)
    return { confirmed: false, error: error.message || 'Ошибка проверки статуса' }
  }
}

// Функция для отправки письма подтверждения email
export const sendEmailConfirmation = async (email: string) => {
  try {
    console.log('Отправляем письмо подтверждения для:', email)
    
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email
    })
    
    if (error) {
      console.error('Ошибка отправки письма подтверждения:', error)
      return { success: false, error: error.message }
    }
    
    console.log('✅ Письмо подтверждения отправлено')
    return { success: true }
  } catch (error) {
    console.error('Критическая ошибка отправки письма:', error)
    return { success: false, error: 'Не удалось отправить письмо подтверждения' }
  }
}

// Функция для проверки и отправки подтверждения (без admin прав)
export const handleEmailConfirmation = async () => {
  try {
    console.log('🚀 Начинаем проверку email...')
    
    const status = await checkEmailConfirmationStatus()
    
    if (status.error) {
      console.log('❌ Ошибка проверки:', status.error)
      return { 
        success: false, 
        error: status.error,
        message: 'Не удалось проверить статус подтверждения email'
      }
    }
    
    if (status.confirmed) {
      console.log('✅ Email уже подтвержден')
      return { 
        success: true, 
        message: '✅ Email уже подтвержден! Можете входить в систему.',
        confirmed: true
      }
    }
    
    // Если email не подтвержден, отправляем письмо
    if (status.user?.email) {
      console.log('📧 Отправляем письмо подтверждения...')
      const result = await sendEmailConfirmation(status.user.email)
      
      if (result.success) {
        console.log('✅ Письмо отправлено')
        return { 
          success: true, 
          message: '📧 Письмо подтверждения отправлено на ваш email. Проверьте почту и перейдите по ссылке.',
          confirmed: false
        }
      } else {
        console.log('❌ Ошибка отправки:', result.error)
        return { 
          success: false, 
          error: result.error,
          message: '❌ Не удалось отправить письмо подтверждения'
        }
      }
    }
    
    console.log('❌ Email пользователя не найден')
    return { 
      success: false, 
      error: 'Email пользователя не найден',
      message: '❌ Не удалось найти email пользователя'
    }
  } catch (error: any) {
    console.error('💥 Критическая ошибка:', error)
    return { 
      success: false, 
      error: error.message || 'Критическая ошибка',
      message: '💥 Произошла критическая ошибка при обработке подтверждения email'
    }
  }
}

// Быстрая проверка статуса без отправки писем
export const quickEmailCheck = async () => {
  try {
    console.log('⚡ Быстрая проверка email...')
    
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error) {
      return { 
        success: false, 
        error: error.message,
        message: '❌ Не удалось получить данные пользователя'
      }
    }
    
    if (!user) {
      return { 
        success: false, 
        error: 'Пользователь не найден',
        message: '❌ Пользователь не авторизован'
      }
    }
    
    const confirmed = !!user.email_confirmed_at
    
    if (confirmed) {
      return { 
        success: true, 
        message: '✅ Email подтвержден! Можете входить в систему.',
        confirmed: true,
        user: user
      }
    } else {
      return { 
        success: false, 
        message: '❌ Email не подтвержден. Нужно подтвердить email для входа.',
        confirmed: false,
        user: user
      }
    }
  } catch (error: any) {
    console.error('💥 Ошибка быстрой проверки:', error)
    return { 
      success: false, 
      error: error.message || 'Ошибка проверки',
      message: '💥 Ошибка при проверке статуса email'
    }
  }
}
