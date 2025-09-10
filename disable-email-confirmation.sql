-- Отключаем подтверждение email для новых пользователей
-- Выполните этот SQL в Supabase Dashboard > SQL Editor

-- 1. Отключаем подтверждение email в настройках аутентификации
UPDATE auth.config 
SET 
  enable_signup = true,
  enable_confirmations = false,
  enable_email_change = true,
  enable_phone_change = true
WHERE id = 1;

-- 2. Подтверждаем всех существующих пользователей
UPDATE auth.users 
SET email_confirmed_at = NOW() 
WHERE email_confirmed_at IS NULL;

-- 3. Проверяем результат
SELECT 
  email,
  email_confirmed_at,
  created_at
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 10;