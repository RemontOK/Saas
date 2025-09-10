-- ОКОНЧАТЕЛЬНОЕ РЕШЕНИЕ ПРОБЛЕМЫ С EMAIL
-- Выполните этот SQL в Supabase Dashboard → SQL Editor

-- 1. Подтверждаем всех существующих пользователей
UPDATE auth.users 
SET email_confirmed_at = NOW() 
WHERE email_confirmed_at IS NULL;

-- 2. Проверяем результат
SELECT 
  id,
  email,
  email_confirmed_at,
  created_at,
  CASE 
    WHEN email_confirmed_at IS NOT NULL THEN '✅ Подтвержден'
    ELSE '❌ Не подтвержден'
  END as status
FROM auth.users 
ORDER BY created_at DESC;

-- 3. Статистика
SELECT 
  COUNT(*) as total_users,
  COUNT(email_confirmed_at) as confirmed_users,
  COUNT(*) - COUNT(email_confirmed_at) as unconfirmed_users
FROM auth.users;

-- 4. Отключаем подтверждение email для новых пользователей
-- (Это нужно сделать в Dashboard → Authentication → Settings)
-- Или выполните этот SQL (если поддерживается):
UPDATE auth.config 
SET 
  enable_email_confirmations = false,
  enable_email_change_confirmations = false
WHERE id = 1;

-- 5. Альтернативный способ отключения подтверждения
-- Создаем политику, которая автоматически подтверждает новых пользователей
CREATE OR REPLACE FUNCTION auto_confirm_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Автоматически подтверждаем email при создании пользователя
  NEW.email_confirmed_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Создаем триггер для автоматического подтверждения
DROP TRIGGER IF EXISTS auto_confirm_user_trigger ON auth.users;
CREATE TRIGGER auto_confirm_user_trigger
  BEFORE INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION auto_confirm_user();

-- 6. Финальная проверка
SELECT 
  '🎉 РЕЗУЛЬТАТ:' as message,
  COUNT(*) as total_users,
  COUNT(email_confirmed_at) as confirmed_users,
  CASE 
    WHEN COUNT(*) = COUNT(email_confirmed_at) THEN '✅ ВСЕ ПОЛЬЗОВАТЕЛИ ПОДТВЕРЖДЕНЫ!'
    ELSE '❌ ЕСТЬ НЕПОДТВЕРЖДЕННЫЕ ПОЛЬЗОВАТЕЛИ'
  END as status
FROM auth.users;
