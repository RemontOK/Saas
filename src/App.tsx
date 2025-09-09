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
    <section id="demo" className="max-w-7xl mx-auto px-4 py-6">
      <h3>Демо: Парсер лидов</h3>
      <form onSubmit={onSearch} className="grid gap-4 grid-cols-6">
        <input placeholder="Ниша (напр. кофейни)" value={niche} onChange={e => setNiche(e.target.value)} className="col-span-2" />
        <input placeholder="Локация (напр. Москва)" value={location} onChange={e => setLocation(e.target.value)} className="col-span-2" />
        <input type="number" min={10} max={500} value={limit} onChange={e => setLimit(Number(e.target.value))} className="col-span-1" />
        <input type="number" min={0} max={5000} value={minReviews} onChange={e => setMinReviews(Number(e.target.value))} placeholder=">= отзывов" className="col-span-1" />
        <label className="col-span-1 flex items-center"><input type="checkbox" checked={recentOnly} onChange={e => setRecentOnly(e.target.checked)} /> Новые (≤1 год)</label>
        <label className="col-span-1 flex items-center"><input type="checkbox" checked={hasInstagram} onChange={e => setHasInstagram(e.target.checked)} /> Есть Instagram</label>
        <div className="col-span-6 flex gap-4">
          <button type="submit" disabled={!canSearch} className="primary-button">{stage === 'search' ? 'Ищем...' : 'Искать'}</button>
          <button type="button" onClick={exportCsv} disabled={!leads.length} className="primary-button">Экспорт CSV</button>
          {stage !== 'idle' && <div className="text-gray-600">Статус: {stage === 'search' ? 'Сбор' : stage === 'enrich' ? 'Обогащение' : 'Готово'}</div>}
          <span className="text-red-500">{error}</span>
        </div>
      </form>
      <div className="overflow-x-auto">
        <table className="w-full mt-4 border-collapse">
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
    </section>
  )
}

function PricingCard({ name, price, features, onSelect, popular }: { name: string; price: string; features: string[]; onSelect: () => void; popular?: boolean }) {
  return (
    <div className={`border-2 ${popular ? 'border-blue-500' : 'border-gray-200'} rounded-lg p-5 grid gap-3 relative ${popular ? 'bg-blue-50' : 'bg-white'}`}>
      {popular && <div className="absolute top-[-10px] right-4 bg-blue-500 text-white px-4 py-1 rounded-full text-xs font-semibold">Популярный</div>}
      <div className="text-2xl font-semibold">{name}</div>
      <div className="text-3xl font-bold">{price}</div>
      <ul className="m-0 pl-6">
        {features.map((f, i) => <li key={i} className="mb-3">{f}</li>)}
      </ul>
      <button onClick={onSelect} className="primary-button">Начать зарабатывать</button>
      <div className="text-sm text-gray-600">Окупаемость с 1–2 сделок</div>
    </div>
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
          <a href="#" className="nav-link" style={{ fontWeight: 800, fontSize: 18, color: '#e5e7eb' }}>Parcer</a>
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
            <h1 style={{ fontSize: 48, lineHeight: 1.1, margin: 0 }}>Превратите поиски клиентов в деньги</h1>
            <p style={{ fontSize: 18, color: '#cbd5e1', margin: '14px 0 0' }}>Готовые списки компаний по вашей нише + проверенные контакты — чтобы закрывать сделки быстрее и дешевле.</p>
            <div className="hero-cta">
              <a href="#pricing"><button className="btn-on-dark glow hover-lift">Выбрать тариф</button></a>
              <a href="#how"><button className="hover-lift" style={{ background: 'transparent', color: '#e2e8f0', borderColor: 'rgba(148,163,184,.3)' }}>Как это работает</button></a>
            </div>
            <div className="hero-sub">Окупаемость чаще всего с первой сделки. Никаких сложных настроек.</div>
          </div>
          <div className="mock-3d">
            {/* Parallax */}
            <MockCard3D />
          </div>
        </div>
      </section>

      {/* Trust / Logos */}
      <section style={{ padding: '12px 16px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', opacity: 0.85 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 12, alignItems: 'center' }}>
            <div style={{ textAlign: 'center', color: '#94a3b8' }}>As seen in</div>
            <div style={{ height: 24, background: '#f1f5f9', borderRadius: 6 }} />
            <div style={{ height: 24, background: '#f1f5f9', borderRadius: 6 }} />
            <div style={{ height: 24, background: '#f1f5f9', borderRadius: 6 }} />
            <div style={{ height: 24, background: '#f1f5f9', borderRadius: 6 }} />
          </div>
        </div>
      </section>

      {/* Features (money-focused) */}
      <section style={{ padding: '32px 16px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <h2>Почему это приносит деньги</h2>
          <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))' }}>
            <div style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 16 }}>
              <div style={{ fontWeight: 600 }}>Лиды «под сделку»</div>
              <div style={{ color: '#475569' }}>Релевантные компании и лица, принимающие решения — меньше холостых звонков.</div>
            </div>
            <div style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 16 }}>
              <div style={{ fontWeight: 600 }}>Контакты, которые отвечают</div>
              <div style={{ color: '#475569' }}>Email/телефон с верификацией — выше delivery и ответов.</div>
            </div>
            <div style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 16 }}>
              <div style={{ fontWeight: 600 }}>Экономия бюджета</div>
              <div style={{ color: '#475569' }}>Снижаем CAC: больше встреч за меньшие деньги.</div>
            </div>
            <div style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 16 }}>
              <div style={{ fontWeight: 600 }}>Быстрый старт</div>
              <div style={{ color: '#475569' }}>Запуститесь за 10 минут и получите первые лиды сегодня.</div>
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
      <section id="pricing" style={{ padding: '32px 16px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <h2>Тарифы — окупаются с 1 сделки</h2>
          <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))' }}>
            <PricingCard name="Starter" price="$19/мес" features={["До 300 лидов","Базовое обогащение","CSV экспорт"]} onSelect={() => openCheckout('Starter')} />
            <PricingCard popular name="Pro" price="$49/мес" features={["До 1500 лидов","Верификация email","Приоритет"]} onSelect={() => openCheckout('Pro')} />
            <PricingCard name="Agency" price="$149/мес" features={["До 6000 лидов","API и интеграции","Сопровождение"]} onSelect={() => openCheckout('Agency')} />
          </div>
        </div>
      </section>

      {/* Demo */}
      <Demo />

      {/* Testimonials */}
      <section style={{ padding: '32px 16px', background: '#fcfcfd' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <h2>Что говорят клиенты</h2>
          <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))' }}>
            <blockquote style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 16, background: '#fff' }}>
              «Первые встречи на 2‑й день, окупили подписку одной сделкой». <div style={{ color: '#64748b', marginTop: 6 }}>— Андрей, агентство рекламы</div>
            </blockquote>
            <blockquote style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 16, background: '#fff' }}>
              «Качество email‑ов выше, чем в таблицах, что покупали раньше». <div style={{ color: '#64748b', marginTop: 6 }}>— Наталья, SaaS‑стартап</div>
            </blockquote>
            <blockquote style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 16, background: '#fff' }}>
              «Лиды в нише HVAC нашли быстро, CSV выгрузили — пошли заявки». <div style={{ color: '#64748b', marginTop: 6 }}>— Олег, локальный сервис</div>
            </blockquote>
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
