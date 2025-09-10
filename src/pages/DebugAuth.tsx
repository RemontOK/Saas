import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function DebugAuth() {
  const [logs, setLogs] = useState<string[]>([])
  const [testEmail] = useState('test@example.com')
  const [testPassword] = useState('testpassword123')

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  const testSupabaseConnection = async () => {
    addLog('🔍 Тестируем подключение к Supabase...')
    
    try {
      // Тест 1: Проверяем URL
      const url = supabase.supabaseUrl
      addLog(`📡 URL: ${url}`)
      
      // Тест 2: Проверяем ключ
      const key = supabase.supabaseKey
      addLog(`🔑 Ключ: ${key ? 'Есть' : 'Нет'} (длина: ${key?.length || 0})`)
      
      // Тест 3: Проверяем базовое подключение
      const { data, error } = await supabase.auth.getUser()
      if (error) {
        addLog(`❌ Ошибка подключения: ${error.message}`)
      } else {
        addLog(`✅ Подключение работает. Пользователь: ${data.user?.email || 'Нет'}`)
      }
      
    } catch (error: any) {
      addLog(`💥 Критическая ошибка: ${error.message}`)
    }
  }

  const testRegistration = async () => {
    addLog('📝 Тестируем регистрацию...')
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
        options: {
          data: {
            name: 'Тестовый пользователь',
            company: 'Тестовая компания',
            phone: '+1234567890',
            plan: 'Starter'
          }
        }
      })
      
      if (error) {
        addLog(`❌ Ошибка регистрации: ${error.message}`)
      } else {
        addLog(`✅ Регистрация успешна! Пользователь: ${data.user?.email}`)
        addLog(`📧 Подтверждение email: ${data.user?.email_confirmed_at ? 'Да' : 'Нет'}`)
      }
      
    } catch (error: any) {
      addLog(`💥 Критическая ошибка регистрации: ${error.message}`)
    }
  }

  const testLogin = async () => {
    addLog('🔑 Тестируем вход...')
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: testPassword
      })
      
      if (error) {
        addLog(`❌ Ошибка входа: ${error.message}`)
      } else {
        addLog(`✅ Вход успешен! Пользователь: ${data.user?.email}`)
      }
      
    } catch (error: any) {
      addLog(`💥 Критическая ошибка входа: ${error.message}`)
    }
  }

  const clearLogs = () => {
    setLogs([])
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.9)',
      color: 'white',
      padding: '2rem',
      zIndex: 10000,
      overflow: 'auto'
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ color: '#10b981', marginBottom: '2rem' }}>
          🔧 Диагностика аутентификации
        </h1>
        
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
          <button 
            onClick={testSupabaseConnection}
            style={{
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: '600'
            }}
          >
            🔍 Проверить подключение
          </button>
          
          <button 
            onClick={testRegistration}
            style={{
              background: '#10b981',
              color: 'white',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: '600'
            }}
          >
            📝 Тест регистрации
          </button>
          
          <button 
            onClick={testLogin}
            style={{
              background: '#f59e0b',
              color: 'white',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: '600'
            }}
          >
            🔑 Тест входа
          </button>
          
          <button 
            onClick={clearLogs}
            style={{
              background: '#ef4444',
              color: 'white',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: '600'
            }}
          >
            🗑️ Очистить логи
          </button>
        </div>
        
        <div style={{
          background: '#1f2937',
          padding: '1rem',
          borderRadius: '8px',
          fontFamily: 'monospace',
          fontSize: '0.85rem',
          maxHeight: '400px',
          overflow: 'auto'
        }}>
          {logs.length === 0 ? (
            <div style={{ color: '#9ca3af' }}>Нажмите кнопки выше для диагностики...</div>
          ) : (
            logs.map((log, index) => (
              <div key={index} style={{ marginBottom: '0.5rem' }}>
                {log}
              </div>
            ))
          )}
        </div>
        
        <div style={{ marginTop: '2rem', fontSize: '0.9rem', color: '#9ca3af' }}>
          <p><strong>Тестовые данные:</strong></p>
          <p>Email: {testEmail}</p>
          <p>Пароль: {testPassword}</p>
        </div>
      </div>
    </div>
  )
}
