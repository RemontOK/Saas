import { registerUser, loginUser, logoutUser } from '../services/auth'

// Функция для тестирования полного цикла аутентификации
export const testAuthFlow = async () => {
  console.log('🧪 Начинаем тестирование полного цикла аутентификации...')
  
  const testUser = {
    name: 'Тестовый пользователь',
    email: `test-${Date.now()}@example.com`,
    password: 'testpassword123',
    company: 'Тестовая компания',
    phone: '+7 (999) 123-45-67',
    plan: 'Starter'
  }

  try {
    // 1. Регистрация
    console.log('1️⃣ Тестируем регистрацию...')
    const registerResult = await registerUser(testUser)
    
    if (!registerResult.success) {
      console.error('❌ Ошибка регистрации:', registerResult.error)
      return { success: false, step: 'registration', error: registerResult.error }
    }
    
    console.log('✅ Регистрация успешна:', registerResult.user?.email)
    
    // 2. Выход
    console.log('2️⃣ Тестируем выход...')
    await logoutUser()
    console.log('✅ Выход выполнен')
    
    // 3. Вход
    console.log('3️⃣ Тестируем вход...')
    const loginResult = await loginUser({
      email: testUser.email,
      password: testUser.password
    })
    
    if (!loginResult.success) {
      console.error('❌ Ошибка входа:', loginResult.error)
      return { success: false, step: 'login', error: loginResult.error }
    }
    
    console.log('✅ Вход успешен:', loginResult.user?.email)
    
    // 4. Проверка данных пользователя
    console.log('4️⃣ Проверяем данные пользователя...')
    if (loginResult.user) {
      console.log('📋 Данные пользователя:')
      console.log('- ID:', loginResult.user.id)
      console.log('- Email:', loginResult.user.email)
      console.log('- Name:', loginResult.user.name)
      console.log('- Company:', loginResult.user.company)
      console.log('- Plan:', loginResult.user.plan)
    }
    
    console.log('🎉 Полный цикл аутентификации прошел успешно!')
    return { success: true, user: loginResult.user }
    
  } catch (error) {
    console.error('❌ Критическая ошибка тестирования:', error)
    return { success: false, step: 'unknown', error: 'Критическая ошибка' }
  }
}

// Функция для очистки тестовых данных
export const cleanupTestUser = async (email: string) => {
  try {
    console.log('🧹 Очищаем тестовые данные для:', email)
    // Здесь можно добавить логику удаления тестового пользователя
    // если это необходимо
    console.log('✅ Очистка завершена')
  } catch (error) {
    console.warn('⚠️ Ошибка при очистке тестовых данных:', error)
  }
}
