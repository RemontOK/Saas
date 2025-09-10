-- Отключение подтверждения email для разработки
-- Выполните этот SQL в Supabase Dashboard

-- 1. Отключаем подтверждение email для новых пользователей
UPDATE auth.config 
SET 
  enable_signup = true,
  enable_email_confirmations = false,
  enable_email_change_confirmations = false
WHERE id = 1;

-- 2. Если таблица config не существует, создаем настройки через SQL
-- Альтернативный способ - через Dashboard:
-- Authentication → Settings → Email → Disable "Enable email confirmations"

-- 3. Проверяем текущие настройки
SELECT 
  enable_signup,
  enable_email_confirmations,
  enable_email_change_confirmations
FROM auth.config 
WHERE id = 1;

-- 4. Если нужно подтвердить существующих пользователей вручную
-- (раскомментируйте, если нужно)
-- UPDATE auth.users 
-- SET email_confirmed_at = NOW() 
-- WHERE email_confirmed_at IS NULL;
