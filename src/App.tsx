import { useMemo, useState } from 'react'
import './App.css'

// helper fade css
const fadeStyles: React.CSSProperties = { animation: 'fadeUp .6s ease both' }

// @ts-ignore add global keyframes via style tag
const FadeKeyframes = () => (
  <style>{`
  @keyframes fadeUp { from { opacity:0; transform: translateY(8px) } to { opacity:1; transform: translateY(0) } }
  .hover-lift:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(2,132,199,.12) }
  .glow { box-shadow: 0 0 0 6px rgba(14,165,233,.08) }
  `}</style>
)


function MockCard3D() {
  return (
    <div className="mock-card">
      <div className="chrome"><span className="dot" /></div>
      <div className="mock-ui">
        <div className="mock-row"></div>
        <div className="mock-row"></div>
        <div className="mock-row"></div>
        <div className="mock-row" style={{ width: '70%' }}></div>
        <div className="kpi">
          <div className="kpi-card"><div className="kpi-title">Ответы</div><div className="kpi-value">+34%</div></div>
          <div className="kpi-card"><div className="kpi-title">Доставляемость</div><div className="kpi-value">98.2%</div></div>
          <div className="kpi-card"><div className="kpi-title">Встречи</div><div className="kpi-value">x2.1</div></div>
        </div>
        <div className="chart">
          <div className="chart-bars">
            <div className="chart-bar" style={{ height: 28 }}></div>
            <div className="chart-bar" style={{ height: 42 }}></div>
            <div className="chart-bar" style={{ height: 36 }}></div>
            <div className="chart-bar" style={{ height: 64 }}></div>
            <div className="chart-bar" style={{ height: 72 }}></div>
            <div className="chart-bar" style={{ height: 58 }}></div>
            <div className="chart-bar" style={{ height: 90 }}></div>
            <div className="chart-bar" style={{ height: 76 }}></div>
          </div>
        </div>
      </div>
      <div className="edge-glow"></div>
      <div className="spark"></div>
    </div>
  )
}

type Lead = {
  id: number;
  company: string;
  location: string;
  website: string;
  email?: string;
  phone?: string;
  source?: string;
  rating?: number;
  reviews?: number;
  instagram?: string;
  openedAt?: number;
  emailQuality?: 'verified' | 'guessed' | 'unknown';
}

function Tag({ label, tone = 'default' }: { label: string; tone?: 'default' | 'success' | 'warn' | 'muted' }) {
  const colors = {
    default: { bg: '#eef2f7', fg: '#0f172a' },
    success: { bg: '#ecfdf5', fg: '#065f46' },
    warn: { bg: '#fff7ed', fg: '#9a3412' },
    muted: { bg: '#f1f5f9', fg: '#475569' },
  }[tone]
  return <span style={{ background: colors.bg, color: colors.fg, padding: '2px 8px', borderRadius: 999, fontSize: 12 }}>{label}</span>
}

function Demo() {
  const [niche, setNiche] = useState('')
  const [location, setLocation] = useState('')
  const [limit, setLimit] = useState<number>(50)
  const [minReviews, setMinReviews] = useState<number>(50)
  const [recentOnly, setRecentOnly] = useState<boolean>(false)
  const [hasInstagram, setHasInstagram] = useState<boolean>(true)

  const [stage, setStage] = useState<'idle' | 'search' | 'enrich' | 'done'>('idle')
  const [leads, setLeads] = useState<Lead[]>([])
  const [error, setError] = useState<string>('')

  const canSearch = useMemo(() => niche.trim().length > 1 && stage !== 'search', [niche, stage])

  const onSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setStage('search')
    try {
      // Проверяем, работает ли API сервер
      const isProduction = window.location.hostname.includes('github.io')
      
      if (isProduction) {
        // Mock данные для GitHub Pages
        await new Promise(resolve => setTimeout(resolve, 1000)) // имитация задержки
        const max = Math.min(Number(limit) || 20, 100)
        const now = Date.now()
        
        const items = Array.from({ length: max }).map((_, i) => {
          const reviews = Math.floor(Math.random() * 500)
          const rating = (Math.random() * 2 + 3).toFixed(1) // 3.0 - 5.0
          const ig = Math.random() > 0.5 ? `https://instagram.com/example_${i + 1}` : ''
          const openedAt = now - Math.floor(Math.random() * 400) * 24 * 3600 * 1000 // дни назад
          const domain = `example-${i + 1}.com`
          const quality = Math.random()
          const tag = quality > 0.7 ? 'verified' : quality > 0.35 ? 'guessed' : 'unknown'
          
          return {
            id: i + 1,
            company: `${niche} Company ${i + 1}`,
            location: location || 'Москва',
            website: `https://${domain}`,
            email: (tag === 'unknown') ? '' : `info@${domain}`,
            phone: '+1-555-0100',
            rating: Number(rating),
            reviews,
            instagram: ig,
            openedAt,
            source: 'demo',
            emailQuality: tag as 'verified' | 'guessed' | 'unknown'
          }
        }).filter(r => r.reviews >= Number(minReviews))
          .filter(r => !hasInstagram || !!r.instagram)
          .filter(r => !recentOnly || (now - r.openedAt) < 365 * 24 * 3600 * 1000)
        
        setLeads(items)
        setStage('done')
      } else {
        // Обычная логика для локального сервера
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ niche, location, limit, minReviews, recentOnly, hasInstagram })
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      const items: Lead[] = data.items || []
      setLeads(items)
      setStage('enrich')
      // быстрый проход обогащения первых N
      const upto = Math.min(items.length, 20)
      for (let i = 0; i < upto; i++) {
        const it = items[i]
        const r = await fetch('/api/enrich', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ website: it.website })
        })
        if (r.ok) {
          const d = await r.json()
          setLeads(prev => {
            const copy = [...prev]
            const idx = copy.findIndex(x => x.id === it.id)
            if (idx >= 0) copy[idx] = { ...copy[idx], email: d.email, phone: d.phone, emailQuality: d.emailQuality }
            return copy
          })
        }
      }
      setStage('done')
      }
    } catch (err: any) {
      setError(err?.message || 'Ошибка запроса')
      setStage('idle')
    }
  }

  const exportCsv = () => {
    const header = ['company','location','website','email','phone','emailQuality','rating','reviews','instagram']
    const rows = leads.map(l => [
      l.company, l.location, l.website, l.email || '', l.phone || '', l.emailQuality || '', l.rating || '', l.reviews || '', l.instagram || ''
    ])
    const csv = [header, ...rows].map(r => r.map(String).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'leads.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <section id="demo" className="demo-section" style={{ margin: '4rem 1rem' }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h3 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem', color: '#0f172a' }}>
            🎯 Демо: Парсер лидов
          </h3>
          <p style={{ fontSize: '1.25rem', color: '#64748b', maxWidth: '600px', margin: '0 auto' }}>
            Попробуйте прямо сейчас! Введите нишу и локацию, чтобы увидеть как работает поиск лидов.
          </p>
        </div>
        <form onSubmit={onSearch} className="demo-form">
        <input placeholder="Ниша (напр. кофейни)" value={niche} onChange={e => setNiche(e.target.value)} className="demo-input" />
        <input placeholder="Локация (напр. Москва)" value={location} onChange={e => setLocation(e.target.value)} className="demo-input" />
        <input type="number" min={10} max={500} value={limit} onChange={e => setLimit(Number(e.target.value))} className="demo-input" placeholder="Лимит" />
        <input type="number" min={0} max={5000} value={minReviews} onChange={e => setMinReviews(Number(e.target.value))} placeholder="Мин. отзывов" className="demo-input" />
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
          <input type="checkbox" checked={recentOnly} onChange={e => setRecentOnly(e.target.checked)} /> 
          Новые (≤1 год)
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
          <input type="checkbox" checked={hasInstagram} onChange={e => setHasInstagram(e.target.checked)} /> 
          Есть Instagram
        </label>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <button 
            type="submit" 
            disabled={!canSearch} 
            className="primary-button"
            style={{ padding: '0.75rem 2rem', fontSize: '1rem' }}
          >
            {stage === 'search' ? '🔍 Ищем...' : '🚀 Искать лиды'}
          </button>
          <button 
            type="button" 
            onClick={exportCsv} 
            disabled={!leads.length} 
            className="primary-button"
            style={{ padding: '0.75rem 2rem', fontSize: '1rem', background: '#22c55e', borderColor: '#22c55e' }}
          >
            📊 Экспорт CSV
          </button>
          {stage !== 'idle' && (
            <div style={{ 
              padding: '0.5rem 1rem', 
              background: '#f0f9ff', 
              border: '1px solid #0ea5e9', 
              borderRadius: '8px',
              color: '#0ea5e9',
              fontSize: '0.875rem'
            }}>
              Статус: {stage === 'search' ? '🔍 Сбор данных' : stage === 'enrich' ? '✨ Обогащение' : '✅ Готово'}
            </div>
          )}
          {error && (
            <span style={{ color: '#ef4444', fontSize: '0.875rem', padding: '0.5rem' }}>
              ❌ {error}
            </span>
          )}
        </div>
      </form>
      <div className="demo-table">
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th className="text-left border-b border-gray-200">Company</th>
              <th className="text-left border-b border-gray-200">Location</th>
              <th className="text-left border-b border-gray-200">Website</th>
              <th className="text-left border-b border-gray-200">Instagram</th>
              <th className="text-left border-b border-gray-200">Rating</th>
              <th className="text-left border-b border-gray-200">Reviews</th>
              <th className="text-left border-b border-gray-200">Email</th>
              <th className="text-left border-b border-gray-200">Phone</th>
              <th className="text-left border-b border-gray-200">Quality</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((l) => (
              <tr key={l.id}>
                <td className="border-b border-gray-100">{l.company}</td>
                <td className="border-b border-gray-100">{l.location}</td>
                <td className="border-b border-gray-100">
                  <a href={l.website} target="_blank" rel="noreferrer">{l.website}</a>
                </td>
                <td className="border-b border-gray-100">
                  {l.instagram ? <a href={l.instagram} target="_blank" rel="noreferrer">Instagram</a> : <span className="text-gray-500">—</span>}
                </td>
                <td className="border-b border-gray-100">{l.rating ?? '—'}</td>
                <td className="border-b border-gray-100">{l.reviews ?? '—'}</td>
                <td className="border-b border-gray-100">{l.email || '-'}</td>
                <td className="border-b border-gray-100">{l.phone || '-'}</td>
                <td className="border-b border-gray-100">
                  {l.emailQuality === 'verified' && <Tag label="verified" tone="success" />}
                  {l.emailQuality === 'guessed' && <Tag label="guessed" tone="warn" />}
                  {!l.emailQuality && <Tag label="unknown" tone="muted" />}
                </td>
              </tr>
            ))}
            {!leads.length && (
              <tr>
                <td colSpan={9} className="p-4 text-gray-400">Нет данных — задайте параметры и нажмите «Искать».</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      </div>
    </section>
  )
}


export default function App() {
  const [showCheckout, setShowCheckout] = useState(false)
  const [plan, setPlan] = useState<string>('Starter')
  const [email, setEmail] = useState('')
  const [notes, setNotes] = useState('')
  const [sending, setSending] = useState(false)
  const [done, setDone] = useState<string>('')
  const [err, setErr] = useState<string>('')

  const openCheckout = (p: string) => { setPlan(p); setShowCheckout(true) }

  const submitOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    setSending(true); setErr(''); setDone('')
    try {
      const isProduction = window.location.hostname.includes('github.io')
      
      if (isProduction) {
        // Mock для GitHub Pages - имитация отправки заявки
        await new Promise(resolve => setTimeout(resolve, 1500))
        console.log('Demo checkout request:', { plan, email, notes })
        setDone('Демо режим: Заявка имитирована! В реальной версии мы свяжемся с вами по email.')
      } else {
        // Обычная логика для локального сервера
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, email, notes })
      })
      if (!res.ok) throw new Error('Ошибка оформления')
      setDone('Заявка отправлена! Мы свяжемся с вами по email.')
      }
    } catch (e: any) {
      setErr(e?.message || 'Ошибка сети')
    } finally {
      setSending(false)
    }
  }

  return (
    <div>
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 header-dark">
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '10px 0' }}>
          <a href="#" className="nav-link" style={{ fontWeight: 800, fontSize: 18, color: '#e5e7eb' }}>Contacto</a>
          <nav style={{ display: 'flex', gap: 8 }}>
            <a href="#how" className="nav-link" style={{ color: '#e5e7eb' }}>Как работает</a>
            <a href="#pricing" className="nav-link" style={{ color: '#e5e7eb' }}>Тарифы</a>
            <a href="#demo" className="nav-link" style={{ color: '#e5e7eb' }}>Демо</a>
          </nav>
          <a href="#pricing"><button className="btn-on-dark hover-lift">Начать зарабатывать</button></a>
        </div>
      </header>

      {/* Hero */}
      <section className="hero hero-dark">
        <FadeKeyframes />
        <div className="container hero-grid">
          <div style={fadeStyles}>
            <h1 className="hero-title">Найдите контакты для вашего бизнеса</h1>
            <p className="hero-subtitle">
              Получайте проверенные контакты лиц, принимающих решения. Больше встреч, меньше холостых звонков.
            </p>
            <div className="hero-cta">
              <a href="#pricing">
                <button className="btn-on-dark glow hover-lift" style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}>
                  🚀 Начать зарабатывать
                </button>
              </a>
              <a href="#demo">
                <button className="hover-lift" style={{ 
                  background: 'transparent', 
                  color: '#e2e8f0', 
                  borderColor: 'rgba(148,163,184,.3)',
                  padding: '1rem 2rem',
                  fontSize: '1.1rem'
                }}>
                  🎯 Попробовать демо
                </button>
              </a>
            </div>
            <div className="hero-sub">
              ⚡ Окупаемость с первой сделки • 🎯 Без сложных настроек • 📊 Проверенные контакты
            </div>
          </div>
          <div className="mock-3d">
            <MockCard3D />
          </div>
        </div>
      </section>

      {/* Results / Stats */}
      <section style={{ padding: '3rem 1rem', background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem', color: '#0f172a' }}>
              🚀 Результаты наших клиентов
            </h3>
            <p style={{ color: '#64748b', fontSize: '1rem' }}>
              Реальные цифры от предпринимателей, которые уже используют Contacto
            </p>
          </div>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
            gap: '2rem', 
            alignItems: 'stretch'
          }}>
            {/* Stat 1 */}
            <div style={{ 
              background: 'white',
              padding: '2rem',
              borderRadius: '16px',
              textAlign: 'center',
              border: '1px solid #e5e7eb',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
              transition: 'all 0.3s ease'
            }} className="stat-card">
              <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>📈</div>
              <div style={{ 
                fontSize: '2.5rem', 
                fontWeight: 800, 
                color: '#22c55e',
                marginBottom: '0.5rem'
              }}>
                +300%
              </div>
              <div style={{ fontWeight: 600, marginBottom: '0.5rem', color: '#0f172a' }}>
                Больше встреч
              </div>
              <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                за первый месяц использования
              </div>
            </div>

            {/* Stat 2 */}
            <div style={{ 
              background: 'white',
              padding: '2rem',
              borderRadius: '16px',
              textAlign: 'center',
              border: '1px solid #e5e7eb',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
              transition: 'all 0.3s ease'
            }} className="stat-card">
              <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>⏱️</div>
              <div style={{ 
                fontSize: '2.5rem', 
                fontWeight: 800, 
                color: '#0ea5e9',
                marginBottom: '0.5rem'
              }}>
                -60%
              </div>
              <div style={{ fontWeight: 600, marginBottom: '0.5rem', color: '#0f172a' }}>
                Время на поиск
              </div>
              <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                лидов сокращается в разы
              </div>
            </div>

            {/* Stat 3 */}
            <div style={{ 
              background: 'white',
              padding: '2rem',
              borderRadius: '16px',
              textAlign: 'center',
              border: '1px solid #e5e7eb',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
              transition: 'all 0.3s ease'
            }} className="stat-card">
              <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>💰</div>
              <div style={{ 
                fontSize: '2.5rem', 
                fontWeight: 800, 
                color: '#f59e0b',
                marginBottom: '0.5rem'
              }}>
                +150%
              </div>
              <div style={{ fontWeight: 600, marginBottom: '0.5rem', color: '#0f172a' }}>
                ROI от рекламы
              </div>
              <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                благодаря точному таргетингу
              </div>
            </div>

            {/* Stat 4 */}
            <div style={{ 
              background: 'white',
              padding: '2rem',
              borderRadius: '16px',
              textAlign: 'center',
              border: '1px solid #e5e7eb',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
              transition: 'all 0.3s ease'
            }} className="stat-card">
              <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🎯</div>
              <div style={{ 
                fontSize: '2.5rem', 
                fontWeight: 800, 
                color: '#8b5cf6',
                marginBottom: '0.5rem'
              }}>
                24ч
              </div>
              <div style={{ fontWeight: 600, marginBottom: '0.5rem', color: '#0f172a' }}>
                Окупаемость
              </div>
              <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                среднее время возврата вложений
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features (money-focused) */}
      <section style={{ padding: '4rem 1rem', background: 'white' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem' }}>
              Почему это приносит деньги
            </h2>
            <p style={{ fontSize: '1.25rem', color: '#64748b', maxWidth: '600px', margin: '0 auto' }}>
              Каждая функция создана для увеличения ваших продаж и снижения затрат на привлечение клиентов
            </p>
          </div>
          <div className="feature-grid">
            <div className="feature-card" style={{ background: 'white', border: '1px solid #e5e7eb' }}>
              <div className="feature-icon" style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)' }}>
                🎯
              </div>
              <div style={{ fontWeight: 700, fontSize: '1.25rem', marginBottom: '1rem' }}>Лиды «под сделку»</div>
              <div style={{ color: '#475569', lineHeight: 1.6 }}>
                Релевантные компании и лица, принимающие решения — меньше холостых звонков, больше встреч.
              </div>
            </div>
            <div className="feature-card" style={{ background: 'white', border: '1px solid #e5e7eb' }}>
              <div className="feature-icon" style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' }}>
                ✅
              </div>
              <div style={{ fontWeight: 700, fontSize: '1.25rem', marginBottom: '1rem' }}>Контакты, которые отвечают</div>
              <div style={{ color: '#475569', lineHeight: 1.6 }}>
                Email/телефон с верификацией — выше delivery и ответов. Реальные люди, а не боты.
              </div>
            </div>
            <div className="feature-card" style={{ background: 'white', border: '1px solid #e5e7eb' }}>
              <div className="feature-icon" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
                💰
              </div>
              <div style={{ fontWeight: 700, fontSize: '1.25rem', marginBottom: '1rem' }}>Экономия бюджета</div>
              <div style={{ color: '#475569', lineHeight: 1.6 }}>
                Снижаем CAC в 3-5 раз: больше качественных встреч за меньшие деньги.
              </div>
            </div>
            <div className="feature-card" style={{ background: 'white', border: '1px solid #e5e7eb' }}>
              <div className="feature-icon" style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' }}>
                ⚡
              </div>
              <div style={{ fontWeight: 700, fontSize: '1.25rem', marginBottom: '1rem' }}>Быстрый старт</div>
              <div style={{ color: '#475569', lineHeight: 1.6 }}>
                Запуститесь за 10 минут и получите первые лиды сегодня. Никаких сложных настроек.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" style={{ padding: '32px 16px', background: '#fcfcfd' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <h2>Как это работает — 3 шага</h2>
          <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))' }}>
            <div style={{ border: '1px dashed #cbd5e1', borderRadius: 12, padding: 16 }}>
              <div style={{ fontWeight: 600 }}>1. Укажите нишу и локацию</div>
              <div style={{ color: '#475569' }}>Мы находим релевантные компании и сайты.</div>
            </div>
            <div style={{ border: '1px dashed #cbd5e1', borderRadius: 12, padding: 16 }}>
              <div style={{ fontWeight: 600 }}>2. Обогащаем контакты</div>
              <div style={{ color: '#475569' }}>Добавляем email/телефон, проверяем валидность.</div>
            </div>
            <div style={{ border: '1px dashed #cbd5e1', borderRadius: 12, padding: 16 }}>
              <div style={{ fontWeight: 600 }}>3. Экспорт и аутрич</div>
              <div style={{ color: '#475569' }}>Выгрузите CSV и запускайте кампанию в тот же день.</div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" style={{ padding: '4rem 1rem', background: 'white' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem' }}>
              Тарифы — окупаются с 1 сделки
            </h2>
            <p style={{ fontSize: '1.25rem', color: '#64748b', maxWidth: '600px', margin: '0 auto' }}>
              Выберите план, который подходит для ваших целей. Все тарифы включают базовый функционал.
            </p>
          </div>
          <div className="pricing-grid">
            <div className="pricing-card">
              <div style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Starter</div>
              <div style={{ fontSize: '3rem', fontWeight: 800, color: '#0ea5e9', marginBottom: '1.5rem' }}>
                ₽1,990<span style={{ fontSize: '1rem', color: '#64748b' }}>/мес</span>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, marginBottom: '2rem' }}>
                <li style={{ padding: '0.5rem 0', display: 'flex', alignItems: 'center' }}>
                  <span style={{ color: '#22c55e', marginRight: '0.5rem' }}>✓</span> До 300 лидов
                </li>
                <li style={{ padding: '0.5rem 0', display: 'flex', alignItems: 'center' }}>
                  <span style={{ color: '#22c55e', marginRight: '0.5rem' }}>✓</span> Базовое обогащение
                </li>
                <li style={{ padding: '0.5rem 0', display: 'flex', alignItems: 'center' }}>
                  <span style={{ color: '#22c55e', marginRight: '0.5rem' }}>✓</span> CSV экспорт
                </li>
                <li style={{ padding: '0.5rem 0', display: 'flex', alignItems: 'center' }}>
                  <span style={{ color: '#22c55e', marginRight: '0.5rem' }}>✓</span> Email поддержка
                </li>
              </ul>
              <button onClick={() => openCheckout('Starter')} className="primary-button" style={{ width: '100%', padding: '1rem' }}>
                Начать зарабатывать
              </button>
              <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.875rem', color: '#64748b' }}>
                Окупаемость с 1–2 сделок
              </div>
            </div>

            <div className="pricing-card popular">
              <div style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Pro</div>
              <div style={{ fontSize: '3rem', fontWeight: 800, color: '#0ea5e9', marginBottom: '1.5rem' }}>
                ₽4,990<span style={{ fontSize: '1rem', color: '#64748b' }}>/мес</span>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, marginBottom: '2rem' }}>
                <li style={{ padding: '0.5rem 0', display: 'flex', alignItems: 'center' }}>
                  <span style={{ color: '#22c55e', marginRight: '0.5rem' }}>✓</span> До 1,500 лидов
                </li>
                <li style={{ padding: '0.5rem 0', display: 'flex', alignItems: 'center' }}>
                  <span style={{ color: '#22c55e', marginRight: '0.5rem' }}>✓</span> Верификация email
                </li>
                <li style={{ padding: '0.5rem 0', display: 'flex', alignItems: 'center' }}>
                  <span style={{ color: '#22c55e', marginRight: '0.5rem' }}>✓</span> Приоритетная поддержка
                </li>
                <li style={{ padding: '0.5rem 0', display: 'flex', alignItems: 'center' }}>
                  <span style={{ color: '#22c55e', marginRight: '0.5rem' }}>✓</span> Расширенные фильтры
                </li>
              </ul>
              <button onClick={() => openCheckout('Pro')} className="primary-button" style={{ width: '100%', padding: '1rem' }}>
                Начать зарабатывать
              </button>
              <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.875rem', color: '#64748b' }}>
                Самый популярный выбор
              </div>
            </div>

            <div className="pricing-card">
              <div style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Agency</div>
              <div style={{ fontSize: '3rem', fontWeight: 800, color: '#0ea5e9', marginBottom: '1.5rem' }}>
                ₽12,990<span style={{ fontSize: '1rem', color: '#64748b' }}>/мес</span>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, marginBottom: '2rem' }}>
                <li style={{ padding: '0.5rem 0', display: 'flex', alignItems: 'center' }}>
                  <span style={{ color: '#22c55e', marginRight: '0.5rem' }}>✓</span> До 6,000 лидов
                </li>
                <li style={{ padding: '0.5rem 0', display: 'flex', alignItems: 'center' }}>
                  <span style={{ color: '#22c55e', marginRight: '0.5rem' }}>✓</span> API и интеграции
                </li>
                <li style={{ padding: '0.5rem 0', display: 'flex', alignItems: 'center' }}>
                  <span style={{ color: '#22c55e', marginRight: '0.5rem' }}>✓</span> Персональное сопровождение
                </li>
                <li style={{ padding: '0.5rem 0', display: 'flex', alignItems: 'center' }}>
                  <span style={{ color: '#22c55e', marginRight: '0.5rem' }}>✓</span> Белый лейбл
                </li>
              </ul>
              <button onClick={() => openCheckout('Agency')} className="primary-button" style={{ width: '100%', padding: '1rem' }}>
                Начать зарабатывать
              </button>
              <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.875rem', color: '#64748b' }}>
                Для агентств и больших команд
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Demo */}
      <Demo />

      {/* Testimonials */}
      <section style={{ padding: '4rem 1rem', background: '#fcfcfd' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem' }}>
              Что говорят клиенты
            </h2>
            <p style={{ fontSize: '1.25rem', color: '#64748b', maxWidth: '600px', margin: '0 auto' }}>
              Реальные отзывы от предпринимателей, которые уже зарабатывают с нашим сервисом
            </p>
          </div>
          <div className="testimonial-grid">
            <div className="testimonial-card">
              <div className="testimonial-text">
                «Первые встречи на 2‑й день, окупили подписку одной сделкой. Качество лидов намного выше, чем у конкурентов.»
              </div>
              <div className="testimonial-author">
                <div className="author-avatar">А</div>
                <div className="author-info">
                  <div className="author-name">Андрей Козлов</div>
                  <div className="author-role">Директор агентства рекламы</div>
                </div>
              </div>
            </div>
            <div className="testimonial-card">
              <div className="testimonial-text">
                «Качество email‑ов выше, чем в таблицах, что покупали раньше. Доставляемость 95%+, отвечают реальные люди.»
              </div>
              <div className="testimonial-author">
                <div className="author-avatar">Н</div>
                <div className="author-info">
                  <div className="author-name">Наталья Смирнова</div>
                  <div className="author-role">CEO SaaS‑стартапа</div>
                </div>
              </div>
            </div>
            <div className="testimonial-card">
              <div className="testimonial-text">
                «Лиды в нише HVAC нашли быстро, CSV выгрузили — пошли заявки. За месяц закрыли 8 сделок на ₽2.4М.»
              </div>
              <div className="testimonial-author">
                <div className="author-avatar">О</div>
                <div className="author-info">
                  <div className="author-name">Олег Петров</div>
                  <div className="author-role">Основатель локального сервиса</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ padding: '32px 16px', background: '#fcfcfd' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gap: 12 }}>
          <h2>FAQ</h2>
          <details>
            <summary>Лимиты и скорость?</summary>
            <div>На старте — десятки запросов в минуту, результаты в течение 1–2 минут.</div>
          </details>
          <details>
            <summary>Откуда берутся контакты?</summary>
            <div>Публичные источники и партнёрские API, соблюдение правил площадок.</div>
          </details>
          <details>
            <summary>Можно ли кастомные выгрузки?</summary>
            <div>Да, по запросу сформируем нужные поля и фильтры.</div>
          </details>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '24px 16px', color: '#475569' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div>© {new Date().getFullYear()} Parcer</div>
          <a href="#pricing">Тарифы</a>
        </div>
      </footer>

      {/* Checkout Modal */}
      {showCheckout && (
        <div role="dialog" aria-modal="true" style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)', display: 'grid', placeItems: 'center', padding: 16 }} onClick={() => setShowCheckout(false)}>
          <div style={{ background: '#fff', borderRadius: 12, maxWidth: 520, width: '100%', padding: 20 }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: 20, fontWeight: 600 }}>Оформление — {plan}</div>
              <button onClick={() => setShowCheckout(false)}>✕</button>
            </div>
            <form onSubmit={submitOrder} style={{ display: 'grid', gap: 12, marginTop: 12 }}>
              <input placeholder="Email" type="email" required value={email} onChange={e => setEmail(e.target.value)} />
              <textarea placeholder="Комментарий (необязательно)" rows={4} value={notes} onChange={e => setNotes(e.target.value)} />
              <button disabled={sending} type="submit">{sending ? 'Отправляю...' : 'Отправить заявку'}</button>
              {done && <div style={{ color: 'green' }}>{done}</div>}
              {err && <div style={{ color: 'crimson' }}>{err}</div>}
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
