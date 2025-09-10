-- ПРОВЕРКА И ИСПРАВЛЕНИЕ ТАБЛИЦЫ USERS
-- Выполните этот SQL в Supabase Dashboard → SQL Editor

-- 1. Проверяем, существует ли таблица users
SELECT 
  table_name, 
  table_schema 
FROM information_schema.tables 
WHERE table_name = 'users';

-- 2. Проверяем структуру таблицы users (если существует)
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

-- 3. Проверяем количество записей в таблице users
SELECT COUNT(*) as users_count FROM users;

-- 4. Проверяем количество пользователей в auth.users
SELECT COUNT(*) as auth_users_count FROM auth.users;

-- 5. Создаем таблицу users, если она не существует
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  company TEXT,
  phone TEXT,
  plan TEXT DEFAULT 'Starter',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Включаем RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 7. Создаем политики безопасности
DROP POLICY IF EXISTS "Users can view own profile" ON users;
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON users;
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON users;
CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 8. Создаем записи для всех существующих пользователей
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

-- 9. Проверяем результат
SELECT 
  'РЕЗУЛЬТАТ:' as status,
  (SELECT COUNT(*) FROM users) as users_in_table,
  (SELECT COUNT(*) FROM auth.users) as users_in_auth,
  CASE 
    WHEN (SELECT COUNT(*) FROM users) = (SELECT COUNT(*) FROM auth.users) 
    THEN '✅ ВСЕ ПОЛЬЗОВАТЕЛИ ПЕРЕСЕЛЕНЫ В ТАБЛИЦУ USERS!'
    ELSE '❌ НЕ ВСЕ ПОЛЬЗОВАТЕЛИ ПЕРЕСЕЛЕНЫ'
  END as migration_status;

-- 10. Показываем созданные записи
SELECT 
  id,
  email,
  name,
  plan,
  created_at
FROM users
ORDER BY created_at DESC
LIMIT 10;
