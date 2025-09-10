#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const envContent = `# Supabase Configuration
VITE_SUPABASE_URL=https://nvidqslpfgvqonrpfdzh.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Note: В Vite переменные окружения должны начинаться с VITE_ для доступа в клиентском коде
`;

const envPath = path.join(__dirname, '.env.local');

if (fs.existsSync(envPath)) {
  console.log('✅ Файл .env.local уже существует');
  console.log('📝 Отредактируйте его, добавив ваши ключи Supabase');
} else {
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Создан файл .env.local');
  console.log('📝 Отредактируйте его, добавив ваши ключи Supabase');
  console.log('🔄 Перезапустите сервер разработки после настройки');
}

console.log('\n📋 Инструкции:');
console.log('1. Получите ключи на https://supabase.com');
console.log('2. Замените your_supabase_anon_key_here на ваш реальный ключ');
console.log('3. При необходимости обновите URL проекта');
console.log('4. Запустите npm run dev');
