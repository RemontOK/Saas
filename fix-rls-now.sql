-- НЕМЕДЛЕННОЕ ИСПРАВЛЕНИЕ RLS
-- Выполните этот SQL в Supabase Dashboard

-- 1. Отключаем RLS для таблицы users
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- 2. Проверяем, что RLS отключен
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'users';

-- 3. Если таблица не существует, создаем её
CREATE TABLE IF NOT EXISTS users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  company TEXT,
  phone TEXT,
  plan TEXT DEFAULT 'Starter',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Убеждаемся, что RLS отключен
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
