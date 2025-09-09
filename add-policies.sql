-- Включаем Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Создаем политики безопасности
-- Пользователи могут видеть только свои данные
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

-- Пользователи могут обновлять только свои данные
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Пользователи могут вставлять только свои данные
CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);