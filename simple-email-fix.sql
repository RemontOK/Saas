-- Простое решение для отключения подтверждения email
-- Выполните этот SQL в Supabase Dashboard

-- 1. Отключаем подтверждение email для всех новых пользователей
UPDATE auth.config 
SET 
  enable_email_confirmations = false,
  enable_email_change_confirmations = false
WHERE id = 1;

-- 2. Если таблица config не существует, используйте Dashboard:
-- Authentication → Settings → Email → Disable "Enable email confirmations"

-- 3. Подтверждаем всех существующих пользователей
UPDATE auth.users 
SET email_confirmed_at = NOW() 
WHERE email_confirmed_at IS NULL;

-- 4. Проверяем результат
SELECT 
  id,
  email,
  email_confirmed_at,
  created_at
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 10;
