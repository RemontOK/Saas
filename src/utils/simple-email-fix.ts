// Простое решение проблемы с email без admin API
import { supabase } from '../lib/supabase'

// Функция для проверки статуса текущего пользователя
export const checkCurrentUserStatus = async () => {
  try {
    console.log('🔍 Проверяем статус текущего пользователя...')
    
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
        error: 'Пользователь не авторизован',
        message: '❌ Пользователь не авторизован. Войдите в систему.'
      }
    }
    
    const confirmed = !!user.email_confirmed_at
    
    return {
      success: true,
      confirmed,
      user: {
        id: user.id,
        email: user.email,
        confirmed_at: user.email_confirmed_at
      },
      message: confirmed 
        ? '✅ Email подтвержден! Можете входить в систему.'
        : '❌ Email не подтвержден. Нужно подтвердить email для входа.'
    }
  } catch (error: any) {
    console.error('💥 Ошибка проверки:', error)
    return {
      success: false,
      error: error.message,
      message: '💥 Ошибка при проверке статуса пользователя'
    }
  }
}

// Функция для отправки письма подтверждения
export const sendConfirmationEmail = async () => {
  try {
    console.log('📧 Отправляем письмо подтверждения...')
    
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: '' // Будет использован email текущего пользователя
    })
    
    if (error) {
      return {
        success: false,
        error: error.message,
        message: '❌ Не удалось отправить письмо подтверждения'
      }
    }
    
    return {
      success: true,
      message: '📧 Письмо подтверждения отправлено! Проверьте почту.'
    }
  } catch (error: any) {
    console.error('💥 Ошибка отправки:', error)
    return {
      success: false,
      error: error.message,
      message: '💥 Ошибка при отправке письма подтверждения'
    }
  }
}

// Функция для получения инструкций по решению
export const getSolutionInstructions = () => {
  return {
    success: true,
    message: `🔧 ИНСТРУКЦИИ ПО РЕШЕНИЮ ПРОБЛЕМЫ:

1. 📊 ПРОВЕРЬТЕ СТАТУС:
   - Нажмите "⚡ Быстрая проверка"
   - Узнайте, подтвержден ли ваш email

2. 🚀 БЫСТРОЕ РЕШЕНИЕ (SQL):
   - Откройте Supabase Dashboard
   - Перейдите в SQL Editor
   - Выполните SQL из файла fix-email-confirmation.sql
   - Это подтвердит всех пользователей

3. 🔧 ОТКЛЮЧИТЕ ПОДТВЕРЖДЕНИЕ:
   - Supabase Dashboard → Authentication → Settings
   - Отключите "Enable email confirmations"
   - Save

4. 📧 АЛЬТЕРНАТИВА:
   - Нажмите "📧 Полная проверка"
   - Система отправит письмо подтверждения
   - Перейдите по ссылке в письме

5. ✅ ПРОВЕРЬТЕ РЕЗУЛЬТАТ:
   - Попробуйте войти в систему
   - Если не получается, повторите шаги

🎉 После выполнения этих шагов проблема будет решена!`
  }
}

// Функция для тестирования входа
export const testLogin = async (email: string, password: string) => {
  try {
    console.log('🧪 Тестируем вход в систему...')
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    
    if (error) {
      return {
        success: false,
        error: error.message,
        message: `❌ Ошибка входа: ${error.message}`
      }
    }
    
    return {
      success: true,
      user: data.user,
      message: '✅ Вход успешен! Проблема решена.'
    }
  } catch (error: any) {
    console.error('💥 Ошибка тестирования:', error)
    return {
      success: false,
      error: error.message,
      message: '💥 Ошибка при тестировании входа'
    }
  }
}
