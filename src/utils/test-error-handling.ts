import { registerUser, loginUser } from '../services/auth'

// Функция для тестирования обработки ошибок
export const testErrorHandling = async () => {
  console.log('🧪 Тестируем обработку ошибок аутентификации...')
  
  const results = []

  // 1. Тест регистрации с существующим email
  console.log('1️⃣ Тестируем регистрацию с существующим email...')
  try {
    const existingUser = {
      name: 'Существующий пользователь',
      email: 'test@example.com', // Используем email, который уже существует
      password: 'password123',
      company: 'Тестовая компания',
      phone: '+7 (999) 123-45-67',
      plan: 'Starter'
    }
    
    const result = await registerUser(existingUser)
    results.push({
      test: 'Регистрация с существующим email',
      success: !result.success,
      message: result.error,
      expected: 'Такой аккаунт уже существует'
    })
    
    console.log('Результат:', result.success ? '❌ Ошибка не обработана' : '✅ Ошибка обработана:', result.error)
  } catch (error) {
    console.error('Ошибка теста:', error)
  }

  // 2. Тест входа с неверными данными
  console.log('2️⃣ Тестируем вход с неверными данными...')
  try {
    const result = await loginUser({
      email: 'nonexistent@example.com',
      password: 'wrongpassword'
    })
    
    results.push({
      test: 'Вход с неверными данными',
      success: !result.success,
      message: result.error,
      expected: 'Неверный логин или пароль'
    })
    
    console.log('Результат:', result.success ? '❌ Ошибка не обработана' : '✅ Ошибка обработана:', result.error)
  } catch (error) {
    console.error('Ошибка теста:', error)
  }

  // 3. Тест входа с неверным форматом email
  console.log('3️⃣ Тестируем вход с неверным форматом email...')
  try {
    const result = await loginUser({
      email: 'invalid-email',
      password: 'password123'
    })
    
    results.push({
      test: 'Вход с неверным форматом email',
      success: !result.success,
      message: result.error,
      expected: 'Неверный логин или пароль'
    })
    
    console.log('Результат:', result.success ? '❌ Ошибка не обработана' : '✅ Ошибка обработана:', result.error)
  } catch (error) {
    console.error('Ошибка теста:', error)
  }

  // 4. Тест регистрации с коротким паролем
  console.log('4️⃣ Тестируем регистрацию с коротким паролем...')
  try {
    const result = await registerUser({
      name: 'Тест пользователь',
      email: `short-password-${Date.now()}@example.com`,
      password: '123', // Короткий пароль
      company: 'Тестовая компания',
      phone: '+7 (999) 123-45-67',
      plan: 'Starter'
    })
    
    results.push({
      test: 'Регистрация с коротким паролем',
      success: !result.success,
      message: result.error,
      expected: 'Пароль должен содержать минимум 6 символов'
    })
    
    console.log('Результат:', result.success ? '❌ Ошибка не обработана' : '✅ Ошибка обработана:', result.error)
  } catch (error) {
    console.error('Ошибка теста:', error)
  }

  // Выводим итоговый отчет
  console.log('\n📊 ИТОГОВЫЙ ОТЧЕТ:')
  console.log('==================')
  
  results.forEach((result, index) => {
    const status = result.success ? '✅' : '❌'
    console.log(`${index + 1}. ${status} ${result.test}`)
    console.log(`   Получено: "${result.message}"`)
    console.log(`   Ожидалось: "${result.expected}"`)
    console.log('')
  })

  const successCount = results.filter(r => r.success).length
  const totalCount = results.length
  
  console.log(`🎯 Результат: ${successCount}/${totalCount} тестов прошли успешно`)
  
  return {
    success: successCount === totalCount,
    results,
    summary: `${successCount}/${totalCount} тестов прошли успешно`
  }
}
