-- БЫСТРОЕ ИСПРАВЛЕНИЕ ТАБЛИЦЫ USERS
-- Выполните этот SQL в Supabase Dashboard → SQL Editor

-- 1. Временно отключаем RLS для исправления
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- 2. Удаляем foreign key constraint (если есть)
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_id_fkey;

-- 3. Проверяем структуру таблицы
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

-- 4. Создаем записи для существующих пользователей
INSERT INTO users (id, email, name, company, phone, plan)
SELECT 
  id,
  email,
  COALESCE(raw_user_meta_data->>'name', ''),
  raw_user_meta_data->>'company',
  raw_user_meta_data->>'phone',
  COALESCE(raw_user_meta_data->>'plan', 'Starter')
FROM auth.users
WHERE id NOT IN (SELECT id FROM users)
ON CONFLICT (id) DO NOTHING;

-- 5. Включаем RLS обратно
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 6. Проверяем результат
SELECT 
  COUNT(*) as total_users,
  COUNT(email) as users_with_email
FROM users;

-- 7. Показываем созданные записи
SELECT 
  id,
  email,
  name,
  plan,
  created_at
FROM users
ORDER BY created_at DESC
LIMIT 10;
