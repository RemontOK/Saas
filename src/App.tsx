import { useMemo, useState, useEffect } from 'react'
import './App.css'
import Register from './pages/Register'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import { getCurrentUser, logoutUser, onAuthStateChange } from './services/auth'
import { testSupabaseConnection } from './utils/test-supabase'

// Популярные ниши для автокомплита
const POPULAR_NICHES = [
  'Кофейни и кафе', 'Стоматологии', 'Автосервисы', 'Салоны красоты', 'Фитнес-клубы',
  'Рестораны', 'Парикмахерские', 'Юридические услуги', 'Медицинские центры', 'Автомойки',
  'Строительные компании', 'Интернет-магазины', 'Агентства недвижимости', 'Турагентства', 'Банки',
  'Страховые компании', 'IT-компании', 'Рекламные агентства', 'Детские сады', 'Школы',
  'Ветеринарные клиники', 'Аптеки', 'Мебельные магазины', 'Автосалоны', 'Клининговые услуги'
];

// Популярные города России
const POPULAR_CITIES = [
  'Москва', 'Санкт-Петербург', 'Новосибирск', 'Екатеринбург', 'Казань',
  'Нижний Новгород', 'Челябинск', 'Самара', 'Омск', 'Ростов-на-Дону',
  'Уфа', 'Красноярск', 'Воронеж', 'Пермь', 'Волгоград',
  'Краснодар', 'Саратов', 'Тюмень', 'Тольятти', 'Ижевск',
  'Барнаул', 'Ульяновск', 'Иркутск', 'Владивосток', 'Ярославль',
  'Хабаровск', 'Махачкала', 'Томск', 'Оренбург', 'Кемерово'
];

// Реалистичные названия компаний по нишам
const COMPANY_TEMPLATES = {
  'кофейни': ['Кофейня "Утро"', 'Coffee Point', 'Зерно & Молоко', 'Эспрессо Бар', 'Кофе Хауз', 'Бодрое утро', 'Кофейная станция', 'Арабика', 'Робуста кофе', 'Кафе "Зёрнышко"'],
  'стоматологии': ['Стоматология "Белоснежка"', 'Дент Престиж', 'Семейная стоматология', 'Клиника "Улыбка"', 'Дентал Центр', 'Стома Плюс', 'Здоровые зубы', 'Дент Лайф', 'Стоматология "Жемчуг"', 'Дент Мастер'],
  'автосервисы': ['АвтоТехЦентр', 'Мастер Моторс', 'СТО "Профи"', 'АвтоДоктор', 'Техцентр "Движение"', 'АвтоЭксперт', 'Сервис Авто', 'АвтоМастерская', 'Техстанция', 'АвтоРемонт Плюс'],
  'салоны красоты': ['Салон "Шарм"', 'Beauty Studio', 'Стиль & Красота', 'Салон "Элегант"', 'Бьюти Центр', 'Салон "Афродита"', 'Красота & SPA', 'Студия красоты', 'Салон "Грация"', 'Beauty Point'],
  'рестораны': ['Ресторан "Тройка"', 'Бистро "Вкус"', 'Ресторан "Усадьба"', 'Кафе "Домашний"', 'Ресторан "Московский"', 'Бистро "Европа"', 'Кафе "Уютный дворик"', 'Ресторан "Традиция"', 'Гастробар', 'Кафе "Встреча"']
};

// Реалистичные домены
const DOMAIN_ENDINGS = ['.ru', '.moscow', '.spb.ru', '.com', '.рф'];
const DOMAIN_PREFIXES = ['', 'www.', 'clinic-', 'salon-', 'auto-', 'cafe-', 'restaurant-'];

// Российские телефонные коды
const PHONE_CODES = ['495', '812', '383', '343', '843', '831', '351', '846', '3812', '863'];

// Телеграм каналы по нишам  
const TELEGRAM_TEMPLATES = {
  'кофейни': ['@coffee_morning', '@espresso_bar', '@kofeyna_utro'],
  'стоматологии': ['@dent_prestige', '@smile_clinic', '@dental_center'],
  'автосервисы': ['@auto_master', '@sto_profi', '@avto_doctor'],
  'салоны красоты': ['@salon_charm', '@beauty_studio', '@salon_elegant'],
  'рестораны': ['@restaurant_troyka', '@bistro_vkus', '@cafe_home']
};

// Множественные отзывы клиентов
const TESTIMONIALS = [
  { text: "Первые встречи на 2‑й день, окупили подписку одной сделкой. Качество лидов намного выше, чем у конкурентов.", author: "Андрей Козлов", role: "Директор агентства рекламы", avatar: "А", color: "#0ea5e9" },
  { text: "Качество email‑ов выше, чем в таблицах, что покупали раньше. Доставляемость 95%+, отвечают реальные люди.", author: "Наталья Смирнова", role: "CEO SaaS‑стартапа", avatar: "Н", color: "#22c55e" },
  { text: "Лиды в нише HVAC нашли быстро, CSV выгрузили — пошли заявки. За месяц закрыли 8 сделок на ₽2.4М.", author: "Олег Петров", role: "Основатель локального сервиса", avatar: "О", color: "#f59e0b" },
  { text: "Сэкономили 20 часов в неделю на поиск клиентов. Теперь фокусируемся на продажах, а не на рутине.", author: "Мария Иванова", role: "Менеджер по продажам", avatar: "М", color: "#8b5cf6" },
  { text: "Конверсия в лиды выросла в 3 раза. Contacto помог найти именно тех, кто готов покупать прямо сейчас.", author: "Дмитрий Соколов", role: "Маркетинг директор", avatar: "Д", color: "#ef4444" },
  { text: "Больше не покупаем дорогие базы сомнительного качества. Здесь всё честно и работает.", author: "Елена Волкова", role: "Руководитель отдела продаж", avatar: "Е", color: "#06b6d4" },
  { text: "Запустили новый продукт и за неделю нашли 200 потенциальных клиентов. Скорость впечатляет!", author: "Александр Морозов", role: "Product Manager", avatar: "А", color: "#84cc16" },
  { text: "Автоматизировали процесс поиска лидов. ROI вырос на 180% за первый квартал использования.", author: "Ирина Кузнецова", role: "Директор по развитию", avatar: "И", color: "#f97316" },
  { text: "Contacto стал незаменимым инструментом нашей команды. Рекомендуем всем B2B компаниям.", author: "Владимир Попов", role: "Коммерческий директор", avatar: "В", color: "#a855f7" },
  { text: "Нашли клиентов в нише, где раньше не знали с чего начать. База действительно обширная.", author: "Светлана Федорова", role: "Бизнес-аналитик", avatar: "С", color: "#ec4899" },
  { text: "Увеличили конверсию холодных звонков на 250%. Теперь каждый третий звонок приводит к встрече.", author: "Максим Лебедев", role: "Руководитель отдела продаж", avatar: "М", color: "#10b981" },
  { text: "Contacto помог масштабировать бизнес в 5 регионах. Качество данных превзошло все ожидания.", author: "Татьяна Новикова", role: "Региональный директор", avatar: "Т", color: "#3b82f6" },
  { text: "За 3 месяца использования окупили годовую подписку. Лучшая инвестиция в развитие продаж.", author: "Сергей Васильев", role: "Основатель IT-компании", avatar: "С", color: "#8b5cf6" },
  { text: "Нашли ключевых партнеров в B2B сегменте за 2 недели. Раньше на это уходили месяцы.", author: "Анна Михайлова", role: "Директор по партнерству", avatar: "А", color: "#f59e0b" },
  { text: "Качество лидов в строительной нише просто космос! 70% отвечают в первый день.", author: "Игорь Романов", role: "Владелец строительной компании", avatar: "И", color: "#ef4444" },
  { text: "Contacto заменил нам целый отдел по поиску клиентов. Экономия бюджета колоссальная.", author: "Юлия Павлова", role: "Финансовый директор", avatar: "Ю", color: "#06b6d4" }
];

// helper fade css
const fadeStyles: React.CSSProperties = { animation: 'fadeUp .6s ease both' }

// @ts-ignore add global keyframes via style tag
const FadeKeyframes = () => (
  <style>{`
  @keyframes fadeUp { from { opacity:0; transform: translateY(8px) } to { opacity:1; transform: translateY(0) } }
  .hover-lift:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(2,132,199,.12) }
  .glow { box-shadow: 0 0 0 6px rgba(14,165,233,.08) }
  
  @keyframes slide-left {
    0% { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }
  
  @keyframes slide-right {
    0% { transform: translateX(-50%); }
    100% { transform: translateX(0); }
  }
  
  
  `}</style>
)

// Простые красивые отзывы без заморочек
function FlowingTestimonials() {
  const shuffledTestimonials = useMemo(() => {
    return [...TESTIMONIALS].sort(() => Math.random() - 0.5);
  }, []);

  return (
    <div style={{ padding: '0 1rem' }}>
      {/* Простая адаптивная сетка отзывов */}
      <div style={{ 
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
        gap: '2rem',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {shuffledTestimonials.slice(0, 6).map((testimonial, index) => (
          <div
            key={`testimonial-${index}`}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '16px',
              padding: '2rem',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
              transition: 'all 0.3s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 12px 24px rgba(0, 0, 0, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.3)';
            }}
          >
            <div style={{ 
              fontStyle: 'italic',
              marginBottom: '1.5rem',
              fontSize: '1.1rem',
              lineHeight: 1.6,
              color: '#e2e8f0'
            }}>
              "{testimonial.text}"
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ 
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: testimonial.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 700,
                fontSize: '1.3rem',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
              }}>
                {testimonial.avatar}
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '1.1rem', color: 'white', marginBottom: '0.25rem' }}>
                  {testimonial.author}
                </div>
                <div style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                  {testimonial.role}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


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
  telegram?: string;
  whatsapp?: string;
  openedAt?: number;
  emailQuality?: 'verified' | 'guessed' | 'unknown';
}


// Компонент автокомплита
function AutocompleteInput({ 
  value, 
  onChange, 
  placeholder, 
  options, 
  label 
}: { 
  value: string; 
  onChange: (value: string) => void; 
  placeholder: string; 
  options: string[]; 
  label: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [filteredOptions, setFilteredOptions] = useState(options);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    onChange(inputValue);
    
    const filtered = options.filter(option => 
      option.toLowerCase().includes(inputValue.toLowerCase())
    );
    setFilteredOptions(filtered);
    setIsOpen(inputValue.length > 0 && filtered.length > 0);
  };

  const handleOptionClick = (option: string) => {
    onChange(option);
    setIsOpen(false);
  };

  return (
    <div style={{ position: 'relative' }}>
      <label style={{ 
        display: 'block', 
        fontSize: '0.875rem', 
        fontWeight: 600, 
        color: '#374151', 
        marginBottom: '0.5rem' 
      }}>
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={handleInputChange}
        placeholder={placeholder}
        className="demo-input"
        onFocus={() => {
          const filtered = options.filter(option => 
            option.toLowerCase().includes(value.toLowerCase())
          );
          setFilteredOptions(filtered);
          setIsOpen(value.length === 0 || filtered.length > 0);
        }}
        onBlur={() => setTimeout(() => setIsOpen(false), 150)}
      />
      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          background: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          maxHeight: '200px',
          overflowY: 'auto',
          zIndex: 1000
        }}>
          {filteredOptions.slice(0, 8).map((option, index) => (
            <div
              key={index}
              onClick={() => handleOptionClick(option)}
              style={{
                padding: '0.75rem 1rem',
                cursor: 'pointer',
                borderBottom: index < filteredOptions.length - 1 ? '1px solid #f3f4f6' : 'none',
                transition: 'background 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#f9fafb'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
            >
              {option}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Demo() {
  const [niche, setNiche] = useState('')
  const [location, setLocation] = useState('')
  const [limit, setLimit] = useState<number>(20)
  const [minReviews] = useState<number>(50)
  const [recentOnly, setRecentOnly] = useState<boolean>(false)
  const [hasTelegram, setHasTelegram] = useState<boolean>(false)
  const [hasWhatsApp, setHasWhatsApp] = useState<boolean>(false)
  const [hasWebsite, setHasWebsite] = useState<boolean>(true)
  const [hasEmail, setHasEmail] = useState<boolean>(true)
  const [sortBy, setSortBy] = useState<'none' | 'reviews_desc' | 'reviews_asc' | 'rating_desc' | 'rating_asc' | 'company_asc' | 'recent'>('none')

  const [stage, setStage] = useState<'idle' | 'search' | 'enrich' | 'done'>('idle')
  const [leads, setLeads] = useState<Lead[]>([])
  const [error, setError] = useState<string>('')

  const canSearch = useMemo(() => niche.trim().length > 1 && stage !== 'search', [niche, location, limit, sortBy, hasEmail, hasWebsite, hasTelegram, hasWhatsApp, recentOnly, stage])

  const onSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setStage('search')
    try {
      // Используем mock данные для демо (и локально, и на GitHub Pages)
      const useMockData = true; // Всегда используем mock данные для демо
      
      if (useMockData) {
        // Mock данные для GitHub Pages
        await new Promise(resolve => setTimeout(resolve, 1000)) // имитация задержки
        const requestedCount = Math.min(Number(limit) || 20, 200)
        const now = Date.now()
        
        // Генерируем больше данных, чем нужно, чтобы после фильтрации получить точное количество
        const items = []
        let attempts = 0
        const maxAttempts = requestedCount * 3 // Генерируем в 3 раза больше для фильтрации
        
        while (items.length < requestedCount && attempts < maxAttempts) {
          const reviews = Math.floor(Math.random() * 500)
          const rating = (Math.random() * 2 + 3).toFixed(1) // 3.0 - 5.0
          const openedAt = now - Math.floor(Math.random() * 400) * 24 * 3600 * 1000 // дни назад
          
          // Определяем нишу для реалистичных названий
          const nicheKey = niche.toLowerCase().includes('кофе') ? 'кофейни' :
                          niche.toLowerCase().includes('стомат') ? 'стоматологии' :
                          niche.toLowerCase().includes('авто') ? 'автосервисы' :
                          niche.toLowerCase().includes('красот') ? 'салоны красоты' :
                          niche.toLowerCase().includes('ресторан') ? 'рестораны' : 'кофейни';
          
          // Реалистичные названия компаний
          const companyTemplates = COMPANY_TEMPLATES[nicheKey] || COMPANY_TEMPLATES['кофейни'];
          const companyName = companyTemplates[attempts % companyTemplates.length] || `${niche} "${['Премиум', 'Элит', 'Профи', 'Мастер', 'Эксперт'][attempts % 5]}"`;
          
          // Реалистичные домены
          const domainBase = companyName.toLowerCase()
            .replace(/[^а-яё\w\s]/g, '')
            .replace(/\s+/g, '-')
            .replace(/[ёъьйю]/g, (m) => ({'ё':'e','ъ':'','ь':'','й':'y','ю':'yu'}[m] || m));
          const domainEnding = DOMAIN_ENDINGS[Math.floor(Math.random() * DOMAIN_ENDINGS.length)];
          const domainPrefix = DOMAIN_PREFIXES[Math.floor(Math.random() * DOMAIN_PREFIXES.length)];
          const domain = `${domainPrefix}${domainBase}${domainEnding}`;
          
          // Российские телефоны
          const phoneCode = PHONE_CODES[Math.floor(Math.random() * PHONE_CODES.length)];
          const phoneNum = `${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 90) + 10}-${Math.floor(Math.random() * 90) + 10}`;
          const phone = `+7 (${phoneCode}) ${phoneNum}`;
          
          // WhatsApp (российские номера)
          const whatsapp = Math.random() > 0.6 ? `+7-999-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 90) + 10}-${Math.floor(Math.random() * 90) + 10}` : '';
          
          // Телеграм каналы
          const telegramTemplates = TELEGRAM_TEMPLATES[nicheKey] || TELEGRAM_TEMPLATES['кофейни'];
          const telegram = Math.random() > 0.5 ? telegramTemplates[Math.floor(Math.random() * telegramTemplates.length)] : '';
          
          // Email качество
          const quality = Math.random()
          const tag = quality > 0.7 ? 'verified' : quality > 0.35 ? 'guessed' : 'unknown'
          
          const candidate = {
            id: attempts + 1,
            company: companyName,
            location: location || 'Москва',
            website: `https://${domain}`,
            email: (tag === 'unknown') ? '' : `info@${domain.replace(/^www\./, '')}`,
            phone: phone,
            rating: Number(rating),
            reviews,
            telegram: telegram,
            whatsapp: whatsapp,
            openedAt,
            source: 'demo',
            emailQuality: tag as 'verified' | 'guessed' | 'unknown'
          }
          
          // Проверяем, подходит ли кандидат под фильтры
          const passesFilters = 
            candidate.reviews >= Number(minReviews) &&
            (!hasEmail || !!candidate.email) &&
            (!hasWebsite || !!candidate.website) &&
            (!hasTelegram || !!candidate.telegram) &&
            (!hasWhatsApp || !!candidate.whatsapp) &&
            (!recentOnly || (now - candidate.openedAt) < 365 * 24 * 3600 * 1000)
          
          if (passesFilters) {
            candidate.id = items.length + 1 // Правильный ID
            items.push(candidate)
          }
          
          attempts++
        }
        
        // Применяем сортировку
        switch (sortBy) {
          case 'reviews_desc':
            items.sort((a, b) => (b.reviews || 0) - (a.reviews || 0));
            break;
          case 'reviews_asc':
            items.sort((a, b) => (a.reviews || 0) - (b.reviews || 0));
            break;
          case 'rating_desc':
            items.sort((a, b) => (b.rating || 0) - (a.rating || 0));
            break;
          case 'rating_asc':
            items.sort((a, b) => (a.rating || 0) - (b.rating || 0));
            break;
          case 'company_asc':
            items.sort((a, b) => a.company.localeCompare(b.company));
            break;
          case 'recent':
            items.sort((a, b) => (b.openedAt || 0) - (a.openedAt || 0));
            break;
          default:
            // Без сортировки
            break;
        }
        
        setLeads(items)
        setStage('done')
      } else {
        // Обычная логика для локального сервера
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ niche, location, limit, minReviews, recentOnly, hasEmail, hasWebsite, hasTelegram, hasWhatsApp, sortBy })
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
    const header = ['company','location','website','email','phone','telegram','whatsapp','rating','reviews','emailQuality']
    const rows = leads.map(l => [
      l.company, l.location, l.website, l.email || '', l.phone || '', l.telegram || '', l.whatsapp || '', l.rating || '', l.reviews || '', l.emailQuality || ''
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
        <form onSubmit={onSearch} style={{ 
          background: 'white',
          padding: '2rem',
          borderRadius: '16px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
          border: '1px solid #e5e7eb'
        }}>
          {/* Основные поля */}
          <div className="demo-form" style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
            gap: '1.5rem',
            marginBottom: '1.5rem'
          }}>
            <AutocompleteInput
              value={niche}
              onChange={setNiche}
              placeholder="Например: кофейни, стоматологии, автосервисы..."
              options={POPULAR_NICHES}
              label="🎯 Ниша или тип бизнеса"
            />
            
            <AutocompleteInput
              value={location}
              onChange={setLocation}
              placeholder="Например: Москва, Санкт-Петербург..."
              options={POPULAR_CITIES}
              label="📍 Город или регион"
            />
          </div>

          {/* Дополнительные параметры */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
            gap: '2rem',
            marginBottom: '1.5rem'
          }}>
            {/* Ползунок для количества лидов */}
            <div>
              <label style={{ 
                display: 'block', 
                fontSize: '0.875rem', 
                fontWeight: 600, 
                color: '#374151', 
                marginBottom: '0.5rem' 
              }}>
                📊 Количество лидов: <span style={{ color: '#0ea5e9', fontWeight: 800 }}>{limit}</span>
              </label>
              <input 
                type="range" 
                min={10} 
                max={200} 
                value={limit} 
                onChange={e => setLimit(Number(e.target.value))} 
                style={{
                  width: '100%',
                  height: '6px',
                  borderRadius: '3px',
                  background: `linear-gradient(to right, #0ea5e9 0%, #0ea5e9 ${((limit - 10) / (200 - 10)) * 100}%, #e5e7eb ${((limit - 10) / (200 - 10)) * 100}%, #e5e7eb 100%)`,
                  outline: 'none',
                  appearance: 'none',
                  cursor: 'pointer'
                }}
              />
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                fontSize: '0.75rem', 
                color: '#6b7280', 
                marginTop: '0.5rem' 
              }}>
                <span>10</span>
                <span>200</span>
              </div>
            </div>

            {/* Сортировка */}
            <div>
              <label style={{ 
                display: 'block', 
                fontSize: '0.875rem', 
                fontWeight: 600, 
                color: '#374151', 
                marginBottom: '0.5rem' 
              }}>
                📋 Сортировка результатов
              </label>
              <select 
                value={sortBy} 
                onChange={e => setSortBy(e.target.value as any)}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  border: '2px solid #e5e7eb',
                  borderRadius: '12px',
                  fontSize: '1rem',
                  background: 'white',
                  cursor: 'pointer',
                  outline: 'none'
                }}
                onFocus={(e) => e.target.style.borderColor = '#0ea5e9'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              >
                <option value="none">🎯 Без сортировки (как найдено)</option>
                <option value="reviews_desc">⭐ Больше отзывов → меньше</option>
                <option value="reviews_asc">⭐ Меньше отзывов → больше</option>
                <option value="rating_desc">🏆 Лучший рейтинг → худший</option>
                <option value="rating_asc">🏆 Худший рейтинг → лучший</option>
                <option value="company_asc">🔤 По алфавиту (А → Я)</option>
                <option value="recent">🆕 Сначала новые компании</option>
              </select>
              <div style={{ 
                fontSize: '0.75rem', 
                color: '#6b7280', 
                marginTop: '0.25rem' 
              }}>
                Выберите порядок отображения лидов
              </div>
            </div>
          </div>

          {/* Фильтры каналов связи */}
          <div style={{ marginBottom: '2rem' }}>
            <label style={{ 
              display: 'block', 
              fontSize: '0.875rem', 
              fontWeight: 600, 
              color: '#374151', 
              marginBottom: '1rem' 
            }}>
              📱 Каналы связи (выберите нужные)
            </label>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', 
              gap: '1rem'
            }}>
              <label style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem', 
                fontSize: '0.875rem',
                cursor: 'pointer',
                padding: '0.75rem',
                borderRadius: '12px',
                border: '1px solid #e5e7eb',
                transition: 'all 0.2s ease',
                background: hasEmail ? '#f0f9ff' : 'white'
              }}>
                <input 
                  type="checkbox" 
                  checked={hasEmail} 
                  onChange={e => setHasEmail(e.target.checked)}
                /> 
                📧 Email
              </label>
              
              <label style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem', 
                fontSize: '0.875rem',
                cursor: 'pointer',
                padding: '0.75rem',
                borderRadius: '12px',
                border: '1px solid #e5e7eb',
                transition: 'all 0.2s ease',
                background: hasWebsite ? '#f0f9ff' : 'white'
              }}>
                <input 
                  type="checkbox" 
                  checked={hasWebsite} 
                  onChange={e => setHasWebsite(e.target.checked)}
                /> 
                🌐 Сайт
              </label>
              
              <label style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem', 
                fontSize: '0.875rem',
                cursor: 'pointer',
                padding: '0.75rem',
                borderRadius: '12px',
                border: '1px solid #e5e7eb',
                transition: 'all 0.2s ease',
                background: hasTelegram ? '#f0f9ff' : 'white'
              }}>
                <input 
                  type="checkbox" 
                  checked={hasTelegram} 
                  onChange={e => setHasTelegram(e.target.checked)}
                /> 
                💬 Телеграм
              </label>
              
              <label style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem', 
                fontSize: '0.875rem',
                cursor: 'pointer',
                padding: '0.75rem',
                borderRadius: '12px',
                border: '1px solid #e5e7eb',
                transition: 'all 0.2s ease',
                background: hasWhatsApp ? '#f0f9ff' : 'white'
              }}>
                <input 
                  type="checkbox" 
                  checked={hasWhatsApp} 
                  onChange={e => setHasWhatsApp(e.target.checked)}
                /> 
                📲 WhatsApp
              </label>
              
              <label style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem', 
                fontSize: '0.875rem',
                cursor: 'pointer',
                padding: '0.75rem',
                borderRadius: '12px',
                border: '1px solid #e5e7eb',
                transition: 'all 0.2s ease',
                background: recentOnly ? '#f0f9ff' : 'white'
              }}>
                <input 
                  type="checkbox" 
                  checked={recentOnly} 
                  onChange={e => setRecentOnly(e.target.checked)}
                /> 
                🆕 Новые компании (≤1 год)
              </label>
            </div>
          </div>

          {/* Кнопки и статус */}
          <div style={{ 
            display: 'flex', 
            gap: '1rem', 
            alignItems: 'center', 
            flexWrap: 'wrap',
            justifyContent: 'center'
          }}>
            <button 
              type="submit" 
              disabled={!canSearch} 
              className="primary-button"
              style={{ 
                padding: '0.875rem 2.5rem', 
                fontSize: '1rem',
                minWidth: '160px',
                borderRadius: '12px',
                background: stage === 'done' ? '#22c55e' : '#0ea5e9',
                borderColor: stage === 'done' ? '#22c55e' : '#0ea5e9'
              }}
            >
              {stage === 'search' ? '🔍 Ищем...' : 
               stage === 'done' ? '🔄 Искать заново' : 
               '🚀 Искать лиды'}
            </button>
            
            <button 
              type="button" 
              onClick={exportCsv} 
              disabled={!leads.length} 
              className="primary-button"
              style={{ 
                padding: '0.875rem 2.5rem', 
                fontSize: '1rem', 
                background: '#22c55e', 
                borderColor: '#22c55e',
                minWidth: '160px',
                borderRadius: '12px'
              }}
            >
              📊 Экспорт CSV
            </button>
          </div>

          {/* Статус и ошибки */}
          <div style={{ 
            marginTop: '1.5rem',
            textAlign: 'center'
          }}>
            {stage !== 'idle' && (
              <div style={{ 
                display: 'inline-block',
                padding: '0.75rem 1.5rem', 
                background: 'linear-gradient(135deg, #f0f9ff, #e0f2fe)', 
                border: '1px solid #0ea5e9', 
                borderRadius: '12px',
                color: '#0ea5e9',
                fontSize: '0.875rem',
                fontWeight: 600,
                marginBottom: '1rem'
              }}>
                Статус: {stage === 'search' ? '🔍 Сбор данных' : stage === 'enrich' ? '✨ Обогащение' : '✅ Готово'}
              </div>
            )}
            
            {error && (
              <div style={{ 
                color: '#ef4444', 
                fontSize: '0.875rem', 
                padding: '0.75rem 1.5rem',
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '12px',
                fontWeight: 600
              }}>
                ❌ {error}
              </div>
            )}
        </div>
      </form>
      <div className="demo-table" style={{ marginTop: '2rem', overflowX: 'auto' }}>
        <table style={{ 
          width: '100%', 
          borderCollapse: 'separate', 
          borderSpacing: '0',
          minWidth: '800px'
        }}>
          <thead>
            <tr style={{ background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)' }}>
              <th style={{ 
                padding: '0.75rem', 
                textAlign: 'left', 
                fontWeight: 700, 
                color: '#374151',
                borderBottom: '2px solid #e5e7eb',
                fontSize: '0.8rem',
                whiteSpace: 'nowrap'
              }}>
                🏢 Компания
              </th>
              <th style={{ 
                padding: '0.75rem', 
                textAlign: 'left', 
                fontWeight: 700, 
                color: '#374151',
                borderBottom: '2px solid #e5e7eb',
                fontSize: '0.8rem',
                whiteSpace: 'nowrap'
              }}>
                📍 Город
              </th>
              {hasWebsite && (
                <th style={{ 
                  padding: '0.75rem', 
                  textAlign: 'left', 
                  fontWeight: 700, 
                  color: '#374151',
                  borderBottom: '2px solid #e5e7eb',
                  fontSize: '0.8rem',
                  whiteSpace: 'nowrap'
                }}>
                  🌐 Сайт
                </th>
              )}
              {hasEmail && (
                <th style={{ 
                  padding: '0.75rem', 
                  textAlign: 'left', 
                  fontWeight: 700, 
                  color: '#374151',
                  borderBottom: '2px solid #e5e7eb',
                  fontSize: '0.8rem',
                  whiteSpace: 'nowrap'
                }}>
                  📧 Email
                </th>
              )}
              <th style={{ 
                padding: '0.75rem', 
                textAlign: 'left', 
                fontWeight: 700, 
                color: '#374151',
                borderBottom: '2px solid #e5e7eb',
                fontSize: '0.8rem',
                whiteSpace: 'nowrap'
              }}>
                📞 Телефон
              </th>
              {hasTelegram && (
                <th style={{ 
                  padding: '0.75rem', 
                  textAlign: 'left', 
                  fontWeight: 700, 
                  color: '#374151',
                  borderBottom: '2px solid #e5e7eb',
                  fontSize: '0.8rem',
                  whiteSpace: 'nowrap'
                }}>
                  💬 TG
                </th>
              )}
              {hasWhatsApp && (
                <th style={{ 
                  padding: '0.75rem', 
                  textAlign: 'left', 
                  fontWeight: 700, 
                  color: '#374151',
                  borderBottom: '2px solid #e5e7eb',
                  fontSize: '0.8rem',
                  whiteSpace: 'nowrap'
                }}>
                  📲 WA
                </th>
              )}
              <th style={{ 
                padding: '0.75rem', 
                textAlign: 'left', 
                fontWeight: 700, 
                color: '#374151',
                borderBottom: '2px solid #e5e7eb',
                fontSize: '0.8rem',
                whiteSpace: 'nowrap'
              }}>
                ⭐ Рейтинг
              </th>
              <th style={{ 
                padding: '0.75rem', 
                textAlign: 'left', 
                fontWeight: 700, 
                color: '#374151',
                borderBottom: '2px solid #e5e7eb',
                fontSize: '0.8rem',
                whiteSpace: 'nowrap'
              }}>
                💬 Отзывы
              </th>
            </tr>
          </thead>
          <tbody>
            {leads.map((l, index) => (
              <tr 
                key={l.id}
                style={{ 
                  background: index % 2 === 0 ? 'white' : '#f9fafb',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#f0f9ff';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(14, 165, 233, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = index % 2 === 0 ? 'white' : '#f9fafb';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <td style={{ 
                  padding: '0.75rem', 
                  fontWeight: 600, 
                  color: '#0f172a',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '120px'
                }}>
                  <span title={l.company}>{l.company}</span>
                </td>
                <td style={{ 
                  padding: '0.75rem', 
                  color: '#6b7280',
                  whiteSpace: 'nowrap'
                }}>
                  {l.location}
                </td>
                {hasWebsite && (
                  <td style={{ padding: '0.75rem', whiteSpace: 'nowrap' }}>
                    <a href={l.website} target="_blank" rel="noreferrer" style={{ 
                      color: '#0ea5e9', 
                      textDecoration: 'none',
                      fontWeight: 500,
                      transition: 'color 0.2s ease'
                    }}>
                      🌐 Сайт
                    </a>
                  </td>
                )}
                {hasEmail && (
                  <td style={{ 
                    padding: '0.75rem', 
                    fontSize: '0.8rem', 
                    color: '#374151',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: '140px'
                  }}>
                    <span title={l.email}>{l.email || <span style={{ color: '#9ca3af' }}>—</span>}</span>
                  </td>
                )}
                <td style={{ 
                  padding: '0.75rem', 
                  fontSize: '0.8rem', 
                  fontWeight: 500, 
                  color: '#374151',
                  whiteSpace: 'nowrap'
                }}>
                  {l.phone || <span style={{ color: '#9ca3af' }}>—</span>}
                </td>
                {hasTelegram && (
                  <td style={{ padding: '0.75rem', whiteSpace: 'nowrap' }}>
                    {l.telegram ? (
                      <span style={{ 
                        color: '#0088cc', 
                        fontWeight: 500,
                        fontSize: '0.8rem',
                        background: '#f0f9ff',
                        padding: '0.2rem 0.4rem',
                        borderRadius: '4px'
                      }}>
                        💬 {l.telegram}
                      </span>
                    ) : (
                      <span style={{ color: '#9ca3af' }}>—</span>
                    )}
                  </td>
                )}
                {hasWhatsApp && (
                  <td style={{ padding: '0.75rem', whiteSpace: 'nowrap' }}>
                    {l.whatsapp ? (
                      <span style={{ 
                        color: '#25d366', 
                        fontWeight: 500,
                        fontSize: '0.8rem',
                        background: '#f0fdf4',
                        padding: '0.2rem 0.4rem',
                        borderRadius: '4px'
                      }}>
                        📲 WA
                      </span>
                    ) : (
                      <span style={{ color: '#9ca3af' }}>—</span>
                    )}
                  </td>
                )}
                <td style={{ padding: '0.75rem', whiteSpace: 'nowrap' }}>
                  <span style={{ 
                    color: '#f59e0b', 
                    fontWeight: 700,
                    background: '#fffbeb',
                    padding: '0.2rem 0.4rem',
                    borderRadius: '4px',
                    fontSize: '0.8rem'
                  }}>
                    ⭐ {l.rating ?? '—'}
                  </span>
                </td>
                <td style={{ padding: '0.75rem', whiteSpace: 'nowrap' }}>
                  <span style={{ 
                    color: '#6b7280',
                    fontWeight: 600,
                    background: '#f9fafb',
                    padding: '0.2rem 0.4rem',
                    borderRadius: '4px',
                    fontSize: '0.8rem'
                  }}>
                    {l.reviews ?? '—'}
                  </span>
                </td>
              </tr>
            ))}
            {!leads.length && (
              <tr>
                <td colSpan={5 + (hasWebsite ? 1 : 0) + (hasEmail ? 1 : 0) + (hasTelegram ? 1 : 0) + (hasWhatsApp ? 1 : 0)} style={{ 
                  padding: '3rem', 
                  textAlign: 'center', 
                  color: '#9ca3af',
                  fontSize: '1.1rem'
                }}>
                  🔍 Нет данных — задайте параметры и нажмите «Искать лиды»
                </td>
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
  const [showRegister, setShowRegister] = useState(false)
  const [showLogin, setShowLogin] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    // Проверяем localStorage при загрузке
    const savedUser = localStorage.getItem('user')
    return !!savedUser
  })
  const [user, setUser] = useState<{name: string, email: string, plan: string} | null>(() => {
    // Загружаем данные пользователя из localStorage
    const savedUser = localStorage.getItem('user')
    return savedUser ? JSON.parse(savedUser) : null
  })
  const [plan, setPlan] = useState<string>('Starter')
  const [email, setEmail] = useState('')
  const [notes, setNotes] = useState('')
  const [sending, setSending] = useState(false)
  const [done, setDone] = useState<string>('')
  const [err, setErr] = useState<string>('')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Инициализация аутентификации
  useEffect(() => {
    // Тестируем подключение к Supabase
    const testConnection = async () => {
      const result = await testSupabaseConnection()
      if (!result.success) {
        console.error('Проблема с подключением к Supabase:', result.error)
        alert('Ошибка подключения к базе данных. Проверьте консоль для подробностей.')
      }
    }

    testConnection()

    // Проверяем текущего пользователя при загрузке
    const initAuth = async () => {
      const currentUser = await getCurrentUser()
      if (currentUser) {
        setUser({
          name: currentUser.name,
          email: currentUser.email,
          plan: currentUser.plan
        })
        setIsLoggedIn(true)
      }
    }

    initAuth()

    // Подписываемся на изменения аутентификации
    const { data: { subscription } } = onAuthStateChange((user) => {
      if (user) {
        setUser({
          name: user.name,
          email: user.email,
          plan: user.plan
        })
        setIsLoggedIn(true)
      } else {
        setUser(null)
        setIsLoggedIn(false)
        localStorage.removeItem('user')
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const openCheckout = (p: string) => { 
    setPlan(p); 
    setShowRegister(true) 
  }
  
  const openLogin = () => {
    setShowLogin(true);
  }
  
  const switchToLogin = () => {
    setShowRegister(false);
    setShowLogin(true);
  }
  
  const switchToRegister = () => {
    setShowLogin(false);
    setShowRegister(true);
  }
  
  const handleAuthSuccess = (userData: {name: string, email: string, plan: string}) => {
    setUser(userData)
    setIsLoggedIn(true)
    setShowRegister(false)
    setShowLogin(false)
    // Сохраняем данные в localStorage
    localStorage.setItem('user', JSON.stringify(userData))
  }
  
  const handleLogout = async () => {
    try {
      await logoutUser()
      setIsLoggedIn(false)
      setUser(null)
      localStorage.removeItem('user')
    } catch (error) {
      console.error('Ошибка выхода:', error)
      // В любом случае очищаем локальное состояние
      setIsLoggedIn(false)
      setUser(null)
      localStorage.removeItem('user')
    }
  }
  

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

  // Если пользователь авторизован, показываем Dashboard
  if (isLoggedIn && user) {
    return (
      <div className="App">
        <Dashboard user={user} onLogout={handleLogout} />
      </div>
    )
  }

  return (
    <div>
      {/* Adaptive Header */}
      <header style={{ 
        position: 'sticky', 
        top: 0, 
        zIndex: 50,
        background: 'linear-gradient(90deg, rgba(9, 9, 11, 0.95), rgba(2, 6, 23, 0.95))',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(148,163,184,.08)'
      }}>
        <div className="header-container" style={{ 
          maxWidth: '1100px', 
          margin: '0 auto', 
          padding: '0 16px',
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          minHeight: '60px'
        }}>
          {/* Logo */}
          <a href="#" className="header-logo" style={{ 
            fontWeight: 800, 
            fontSize: '1.25rem', 
            textDecoration: 'none',
            background: 'linear-gradient(135deg, #0ea5e9, #6366f1)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent'
          }}>
            Contacto
          </a>

          {/* Desktop Navigation */}
          <nav className="desktop-nav" style={{ 
            display: 'flex',
            gap: '2rem'
          }}>
            <a href="#how" style={{ 
              color: '#e5e7eb', 
              textDecoration: 'none',
              transition: 'color 0.3s ease',
              fontSize: '0.95rem'
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#0ea5e9'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#e5e7eb'}>
              Как работает
            </a>
            <a href="#pricing" style={{ 
              color: '#e5e7eb', 
              textDecoration: 'none',
              transition: 'color 0.3s ease',
              fontSize: '0.95rem'
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#0ea5e9'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#e5e7eb'}>
              Тарифы
            </a>
            <a href="#demo" style={{ 
              color: '#e5e7eb', 
              textDecoration: 'none',
              transition: 'color 0.3s ease',
              fontSize: '0.95rem'
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#0ea5e9'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#e5e7eb'}>
              Демо
            </a>
          </nav>

          {/* Desktop CTA Buttons */}
          <div className="desktop-cta" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            {isLoggedIn ? (
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '1rem',
                color: '#e5e7eb'
              }}>
                <span style={{ fontSize: '0.9rem' }}>
                  👋 Привет, {user?.name}!
                </span>
                <button 
                  onClick={handleLogout}
                  style={{
                    background: 'transparent',
                    color: '#ef4444',
                    border: '2px solid #ef4444',
                    padding: '0.5rem 1rem',
                    borderRadius: '6px',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#ef4444';
                    e.currentTarget.style.color = 'white';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = '#ef4444';
                  }}
                >
                  Выйти
                </button>
              </div>
            ) : (
              <button 
                onClick={openLogin}
                style={{
                  background: 'transparent',
                  color: '#e5e7eb',
                  border: '2px solid #e5e7eb',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#e5e7eb';
                  e.currentTarget.style.color = '#0f172a';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = '#e5e7eb';
                }}
              >
                Войти
              </button>
            )}
            <a href="#pricing">
              <button style={{
                background: 'linear-gradient(135deg, #0ea5e9, #6366f1)',
                color: 'white',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '12px',
                fontSize: '0.9rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(14, 165, 233, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}>
                Начать зарабатывать
              </button>
            </a>
        </div>

          {/* Mobile Menu Button */}
          <button
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              width: '44px',
              height: '44px',
              background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.2), rgba(99, 102, 241, 0.2))',
              border: '1px solid rgba(14, 165, 233, 0.3)',
              borderRadius: '8px',
              color: '#0ea5e9',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, #0ea5e9, #6366f1)';
              e.currentTarget.style.color = 'white';
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, rgba(14, 165, 233, 0.2), rgba(99, 102, 241, 0.2))';
              e.currentTarget.style.color = '#0ea5e9';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {mobileMenuOpen ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <>
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </>
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div style={{
            background: 'rgba(9, 9, 11, 0.98)',
            backdropFilter: 'blur(10px)',
            borderTop: '1px solid rgba(148,163,184,.08)',
            padding: '1rem'
          }}>
            <nav style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '1rem'
            }}>
              <a 
                href="#how" 
                onClick={() => setMobileMenuOpen(false)}
                style={{ 
                  color: '#e5e7eb', 
                  textDecoration: 'none',
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  transition: 'all 0.3s ease',
                  fontSize: '1rem'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(14, 165, 233, 0.1)';
                  e.currentTarget.style.color = '#0ea5e9';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = '#e5e7eb';
                }}
              >
                🚀 Как работает
              </a>
              <a 
                href="#pricing" 
                onClick={() => setMobileMenuOpen(false)}
                style={{ 
                  color: '#e5e7eb', 
                  textDecoration: 'none',
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  transition: 'all 0.3s ease',
                  fontSize: '1rem'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(14, 165, 233, 0.1)';
                  e.currentTarget.style.color = '#0ea5e9';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = '#e5e7eb';
                }}
              >
                💰 Тарифы
              </a>
              <a 
                href="#demo" 
                onClick={() => setMobileMenuOpen(false)}
                style={{ 
                  color: '#e5e7eb', 
                  textDecoration: 'none',
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  transition: 'all 0.3s ease',
                  fontSize: '1rem'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(14, 165, 233, 0.1)';
                  e.currentTarget.style.color = '#0ea5e9';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = '#e5e7eb';
                }}
              >
                🎯 Демо
              </a>
              
              {/* Mobile Auth Buttons */}
              {isLoggedIn ? (
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '0.75rem',
                  marginTop: '1rem',
                  padding: '1rem',
                  background: 'rgba(14, 165, 233, 0.1)',
                  borderRadius: '12px',
                  border: '1px solid rgba(14, 165, 233, 0.2)'
                }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.5rem',
                    color: '#e5e7eb',
                    fontSize: '0.9rem',
                    marginBottom: '0.5rem'
                  }}>
                    <span>👋</span>
                    <span>Привет, {user?.name}!</span>
                  </div>
                  <button 
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    style={{
                      width: '100%',
                      background: 'transparent',
                      color: '#ef4444',
                      border: '2px solid #ef4444',
                      padding: '0.75rem',
                      borderRadius: '8px',
                      fontSize: '0.9rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#ef4444';
                      e.currentTarget.style.color = 'white';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = '#ef4444';
                    }}
                  >
                    Выйти из аккаунта
                  </button>
                </div>
              ) : (
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '0.75rem',
                  marginTop: '1rem'
                }}>
                  <button 
                    onClick={() => {
                      openLogin();
                      setMobileMenuOpen(false);
                    }}
                    style={{
                      width: '100%',
                      background: 'transparent',
                      color: '#e5e7eb',
                      border: '2px solid #e5e7eb',
                      padding: '0.75rem',
                      borderRadius: '8px',
                      fontSize: '0.9rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#e5e7eb';
                      e.currentTarget.style.color = '#0f172a';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = '#e5e7eb';
                    }}
                  >
                    🔑 Войти
                  </button>
                  <button 
                    onClick={() => {
                      openCheckout('Starter');
                      setMobileMenuOpen(false);
                    }}
                    style={{
                      width: '100%',
                      background: 'linear-gradient(135deg, #0ea5e9, #6366f1)',
                      color: 'white',
                      border: 'none',
                      padding: '0.75rem',
                      borderRadius: '8px',
                      fontSize: '0.9rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-1px)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(14, 165, 233, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    🚀 Регистрация
                  </button>
                </div>
              )}
            </nav>
          </div>
        )}
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
                24ч
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
                -60%
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
            
            <div className="feature-card" style={{ background: 'white', border: '1px solid #e5e7eb' }}>
              <div className="feature-icon" style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}>
                🔥
              </div>
              <div style={{ fontWeight: 700, fontSize: '1.25rem', marginBottom: '1rem' }}>Актуальные данные</div>
              <div style={{ color: '#475569', lineHeight: 1.6 }}>
                Обновляем базы ежедневно. Никаких устаревших контактов — только свежие лиды.
              </div>
            </div>
            
            <div className="feature-card" style={{ background: 'white', border: '1px solid #e5e7eb' }}>
              <div className="feature-icon" style={{ background: 'linear-gradient(135deg, #06b6d4, #0891b2)' }}>
                🛡️
              </div>
              <div style={{ fontWeight: 700, fontSize: '1.25rem', marginBottom: '1rem' }}>Полная конфиденциальность</div>
              <div style={{ color: '#475569', lineHeight: 1.6 }}>
                Ваши поиски и данные защищены. Соблюдаем все требования GDPR и 152-ФЗ.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works - Dark theme */}
      <section id="how" style={{ 
        padding: '4rem 1rem', 
        background: 'linear-gradient(135deg, #0f172a, #1e293b)',
        color: '#e2e8f0'
      }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem', color: 'white' }}>
              Как это работает — 3 простых шага
            </h2>
            <p style={{ fontSize: '1.25rem', color: '#cbd5e1', maxWidth: '600px', margin: '0 auto' }}>
              От поиска до первых звонков — всего несколько минут
            </p>
            </div>
          <div style={{ 
            display: 'grid', 
            gap: '2rem', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))'
          }}>
            <div style={{ 
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '16px', 
              padding: '2rem',
              textAlign: 'center',
              transition: 'all 0.3s ease'
            }} className="step-card">
              <div style={{ 
                fontSize: '3rem', 
                marginBottom: '1rem',
                background: 'linear-gradient(135deg, #0ea5e9, #6366f1)',
                width: '60px',
                height: '60px',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.5rem'
              }}>
                🎯
            </div>
              <div style={{ fontWeight: 700, fontSize: '1.25rem', marginBottom: '1rem', color: 'white' }}>
                1. Укажите нишу и локацию
              </div>
              <div style={{ color: '#cbd5e1', lineHeight: 1.6 }}>
                Мы находим релевантные компании и сайты по вашим критериям в любом городе России.
              </div>
            </div>
            
            <div style={{ 
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '16px', 
              padding: '2rem',
              textAlign: 'center',
              transition: 'all 0.3s ease'
            }} className="step-card">
              <div style={{ 
                fontSize: '3rem', 
                marginBottom: '1rem',
                background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                width: '60px',
                height: '60px',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.5rem'
              }}>
                ✨
              </div>
              <div style={{ fontWeight: 700, fontSize: '1.25rem', marginBottom: '1rem', color: 'white' }}>
                2. Обогащаем контакты
              </div>
              <div style={{ color: '#cbd5e1', lineHeight: 1.6 }}>
                Добавляем email, телефон и проверяем валидность. Только работающие контакты.
              </div>
            </div>
            
            <div style={{ 
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '16px', 
              padding: '2rem',
              textAlign: 'center',
              transition: 'all 0.3s ease'
            }} className="step-card">
              <div style={{ 
                fontSize: '3rem', 
                marginBottom: '1rem',
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                width: '60px',
                height: '60px',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.5rem'
              }}>
                🚀
              </div>
              <div style={{ fontWeight: 700, fontSize: '1.25rem', marginBottom: '1rem', color: 'white' }}>
                3. Экспорт и продажи
              </div>
              <div style={{ color: '#cbd5e1', lineHeight: 1.6 }}>
                Выгружайте CSV и запускайте кампании. Первые звонки в тот же день.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" style={{ padding: '4rem 1rem', background: 'white' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem' }}>
              Честные тарифы — платите только за результат
            </h2>
            <p style={{ fontSize: '1.25rem', color: '#64748b', maxWidth: '600px', margin: '0 auto' }}>
              Базовая подписка + доплата только за дополнительные лиды. Никаких скрытых комиссий.
            </p>
          </div>
          <div className="pricing-grid">
            <div className="pricing-card">
              <div style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Starter</div>
              <div style={{ fontSize: '3rem', fontWeight: 800, color: '#0ea5e9', marginBottom: '0.5rem' }}>
                ₽990<span style={{ fontSize: '1rem', color: '#64748b' }}>/мес</span>
              </div>
              <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '1.5rem' }}>
                + 2₽ за лид сверх лимита
              </div>
              <ul style={{ listStyle: 'none', padding: 0, marginBottom: '2rem' }}>
                <li style={{ padding: '0.5rem 0', display: 'flex', alignItems: 'center' }}>
                  <span style={{ color: '#22c55e', marginRight: '0.5rem' }}>✓</span> 200 лидов включено
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
                Начать за ₽990
              </button>
              <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.875rem', color: '#64748b' }}>
                Идеально для старта
              </div>
            </div>

            <div className="pricing-card popular">
              <div style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Pro</div>
              <div style={{ fontSize: '3rem', fontWeight: 800, color: '#0ea5e9', marginBottom: '0.5rem' }}>
                ₽2,490<span style={{ fontSize: '1rem', color: '#64748b' }}>/мес</span>
              </div>
              <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '1.5rem' }}>
                + 1.5₽ за лид сверх лимита
              </div>
              <ul style={{ listStyle: 'none', padding: 0, marginBottom: '2rem' }}>
                <li style={{ padding: '0.5rem 0', display: 'flex', alignItems: 'center' }}>
                  <span style={{ color: '#22c55e', marginRight: '0.5rem' }}>✓</span> 500 лидов включено
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
                <li style={{ padding: '0.5rem 0', display: 'flex', alignItems: 'center' }}>
                  <span style={{ color: '#22c55e', marginRight: '0.5rem' }}>✓</span> API доступ
                </li>
              </ul>
              <button onClick={() => openCheckout('Pro')} className="primary-button" style={{ width: '100%', padding: '1rem' }}>
                Выбрать Pro
              </button>
              <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.875rem', color: '#64748b' }}>
                🔥 Самый популярный выбор
              </div>
            </div>

            <div className="pricing-card">
              <div style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Enterprise</div>
              <div style={{ fontSize: '3rem', fontWeight: 800, color: '#0ea5e9', marginBottom: '0.5rem' }}>
                ₽7,990<span style={{ fontSize: '1rem', color: '#64748b' }}>/мес</span>
              </div>
              <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '1.5rem' }}>
                + 1₽ за лид сверх лимита
              </div>
              <ul style={{ listStyle: 'none', padding: 0, marginBottom: '2rem' }}>
                <li style={{ padding: '0.5rem 0', display: 'flex', alignItems: 'center' }}>
                  <span style={{ color: '#22c55e', marginRight: '0.5rem' }}>✓</span> 2,000 лидов включено
                </li>
                <li style={{ padding: '0.5rem 0', display: 'flex', alignItems: 'center' }}>
                  <span style={{ color: '#22c55e', marginRight: '0.5rem' }}>✓</span> Полное API
                </li>
                <li style={{ padding: '0.5rem 0', display: 'flex', alignItems: 'center' }}>
                  <span style={{ color: '#22c55e', marginRight: '0.5rem' }}>✓</span> Персональный менеджер
                </li>
                <li style={{ padding: '0.5rem 0', display: 'flex', alignItems: 'center' }}>
                  <span style={{ color: '#22c55e', marginRight: '0.5rem' }}>✓</span> Белый лейбл
                </li>
                <li style={{ padding: '0.5rem 0', display: 'flex', alignItems: 'center' }}>
                  <span style={{ color: '#22c55e', marginRight: '0.5rem' }}>✓</span> SLA 99.9%
                </li>
              </ul>
              <button onClick={() => openCheckout('Enterprise')} className="primary-button" style={{ width: '100%', padding: '1rem' }}>
                Связаться с нами
              </button>
              <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.875rem', color: '#64748b' }}>
                Для агентств и корпораций
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Demo */}
      <Demo />

      {/* Testimonials - Dark theme with flowing animation */}
      <section style={{ 
        padding: '4rem 0', 
        background: 'linear-gradient(135deg, #1e293b, #0f172a)',
        color: '#e2e8f0',
        overflow: 'hidden'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem', padding: '0 1rem' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem', color: 'white' }}>
            Что говорят клиенты
          </h2>
          <p style={{ fontSize: '1.25rem', color: '#cbd5e1', maxWidth: '600px', margin: '0 auto' }}>
            Реальные отзывы от предпринимателей, которые уже зарабатывают с Contacto
          </p>
        </div>
        <FlowingTestimonials />
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
      <footer style={{ 
        background: 'linear-gradient(135deg, #0f172a, #1e293b)', 
        color: '#e2e8f0', 
        padding: '4rem 1rem 2rem',
        marginTop: '4rem'
      }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          {/* Main Footer Content */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
            gap: '3rem', 
            marginBottom: '3rem' 
          }}>
            
            {/* Company Info */}
            <div>
              <h3 style={{ 
                fontSize: '1.5rem', 
                fontWeight: '800', 
                marginBottom: '1rem',
                background: 'linear-gradient(135deg, #0ea5e9, #6366f1)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                color: 'transparent'
              }}>
                Contacto
              </h3>
              <p style={{ 
                color: '#94a3b8', 
                marginBottom: '1.5rem', 
                lineHeight: '1.6' 
              }}>
                Находим контакты лиц, принимающих решения. Больше встреч, меньше холостых звонков.
              </p>
              
              {/* Social Links */}
              <div style={{ display: 'flex', gap: '1rem' }}>
                {[
                  { icon: '📧', href: 'mailto:hello@contacto.ru', label: 'Email' },
                  { icon: '💬', href: 'https://t.me/contacto_support', label: 'Telegram' },
                  { icon: '🐦', href: 'https://twitter.com/contacto', label: 'Twitter' },
                  { icon: '💼', href: 'https://linkedin.com/company/contacto', label: 'LinkedIn' }
                ].map((social, index) => (
                  <a 
                    key={index}
                    href={social.href} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ 
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '40px',
                      height: '40px',
                      background: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: '50%',
                      color: '#e2e8f0',
                      textDecoration: 'none',
                      fontSize: '1.2rem',
                      transition: 'all 0.3s ease',
                      border: '1px solid rgba(255, 255, 255, 0.2)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'linear-gradient(135deg, #0ea5e9, #6366f1)';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                    title={social.label}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 style={{ 
                fontSize: '1.1rem', 
                fontWeight: '600', 
                marginBottom: '1.5rem',
                color: '#f1f5f9'
              }}>
                Быстрые ссылки
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {[
                  { text: 'Как работает', href: '#how' },
                  { text: 'Тарифы', href: '#pricing' },
                  { text: 'Демо', href: '#demo' },
                  { text: 'API документация', href: '#api' },
                  { text: 'Поддержка', href: '#support' }
                ].map((link, index) => (
                  <a 
                    key={index}
                    href={link.href} 
                    style={{ 
                      color: '#94a3b8', 
                      textDecoration: 'none',
                      transition: 'color 0.3s ease',
                      fontSize: '0.95rem'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#0ea5e9'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#94a3b8'}
                  >
                    {link.text}
                  </a>
                ))}
              </div>
            </div>

            {/* Contact Info */}
            <div>
              <h4 style={{ 
                fontSize: '1.1rem', 
                fontWeight: '600', 
                marginBottom: '1.5rem',
                color: '#f1f5f9'
              }}>
                Контакты
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontSize: '1.2rem' }}>📍</span>
                  <span style={{ color: '#94a3b8', fontSize: '0.95rem' }}>
                    Москва, Россия
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontSize: '1.2rem' }}>📧</span>
                  <a 
                    href="mailto:hello@contacto.ru" 
                    style={{ 
                      color: '#94a3b8', 
                      textDecoration: 'none',
                      fontSize: '0.95rem'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#0ea5e9'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#94a3b8'}
                  >
                    hello@contacto.ru
                  </a>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontSize: '1.2rem' }}>⏰</span>
                  <span style={{ color: '#94a3b8', fontSize: '0.95rem' }}>
                    Пн-Пт 9:00-18:00 МСК
                  </span>
                </div>
              </div>
            </div>

            {/* Newsletter */}
            <div>
              <h4 style={{ 
                fontSize: '1.1rem', 
                fontWeight: '600', 
                marginBottom: '1.5rem',
                color: '#f1f5f9'
              }}>
                Будьте в курсе
              </h4>
              <p style={{ 
                color: '#94a3b8', 
                marginBottom: '1rem', 
                fontSize: '0.9rem',
                lineHeight: '1.5'
              }}>
                Подпишитесь на обновления и получайте советы по поиску клиентов
              </p>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input 
                  type="email" 
                  placeholder="Ваш email"
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    color: '#e2e8f0',
                    fontSize: '0.9rem'
                  }}
                />
                <button
                  style={{
                    padding: '0.75rem 1rem',
                    background: 'linear-gradient(135deg, #0ea5e9, #6366f1)',
                    border: 'none',
                    borderRadius: '8px',
                    color: 'white',
                    fontWeight: '600',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(14, 165, 233, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  📧
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div style={{ 
            borderTop: '1px solid rgba(255, 255, 255, 0.1)', 
            paddingTop: '2rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div style={{ 
              color: '#64748b', 
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <span>© {new Date().getFullYear()} Contacto.</span>
              <span>Сделано с ❤️ в России</span>
            </div>
            
            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
              {[
                'Политика конфиденциальности',
                'Условия использования', 
                'Cookies'
              ].map((link, index) => (
                <a 
                  key={index}
                  href={`#${link.toLowerCase().replace(/\s+/g, '-')}`}
                  style={{ 
                    color: '#64748b', 
                    textDecoration: 'none',
                    fontSize: '0.9rem',
                    transition: 'color 0.3s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#94a3b8'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#64748b'}
                >
                  {link}
                </a>
              ))}
            </div>
          </div>
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

      {/* Register Page */}
      {showRegister && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999 }}>
          <Register 
            selectedPlan={plan} 
            onSuccess={handleAuthSuccess}
            onSwitchToLogin={switchToLogin}
          />
          <button 
            onClick={() => setShowRegister(false)}
            style={{
              position: 'absolute',
              top: '2rem',
              right: '2rem',
              background: 'rgba(255, 255, 255, 0.9)',
              border: 'none',
              borderRadius: '50%',
              width: '3rem',
              height: '3rem',
              fontSize: '1.5rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              zIndex: 10000
            }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Login Page */}
      {showLogin && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999 }}>
          <Login 
            onSuccess={handleAuthSuccess}
            onSwitchToRegister={switchToRegister}
          />
          <button 
            onClick={() => setShowLogin(false)}
            style={{
              position: 'absolute',
              top: '2rem',
              right: '2rem',
              background: 'rgba(255, 255, 255, 0.9)',
              border: 'none',
              borderRadius: '50%',
              width: '3rem',
              height: '3rem',
              fontSize: '1.5rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              zIndex: 10000
            }}
          >
            ✕
          </button>
        </div>
      )}
    </div>
  )
}
