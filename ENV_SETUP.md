# Настройка переменных окружения

## Создание файла .env.local

Создайте файл `.env.local` в корне проекта со следующим содержимым:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://nvidqslpfgvqonrpfdzh.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

## Получение ключей Supabase

1. Перейдите на [supabase.com](https://supabase.com)
2. Войдите в свой аккаунт или создайте новый
3. Создайте новый проект
4. В настройках проекта найдите:
   - **Project URL** → используйте как `VITE_SUPABASE_URL`
   - **anon public key** → используйте как `VITE_SUPABASE_ANON_KEY`

## Важные замечания

- В Vite переменные окружения должны начинаться с `VITE_` для доступа в клиентском коде
- Файл `.env.local` не должен попадать в git (уже добавлен в .gitignore)
- При отсутствии переменных окружения используются значения по умолчанию

## Проверка настройки

После создания файла `.env.local`:
1. Перезапустите сервер разработки (`npm run dev`)
2. Откройте тестовую страницу БД
3. Убедитесь, что используется правильный URL Supabase
