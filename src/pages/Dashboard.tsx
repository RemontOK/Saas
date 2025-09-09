import { useState } from 'react';

interface DashboardProps {
  user: {name: string, email: string, plan: string};
  onLogout: () => void;
}

export default function Dashboard({ user, onLogout }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'leads' | 'analytics' | 'settings'>('overview');
  const [searchData, setSearchData] = useState({
    niche: '',
    location: '',
    limit: 50,
    filters: {
      hasEmail: true,
      hasPhone: false,
      hasWebsite: true,
      minRating: 0
    }
  });

  // Расширенные данные пользователя
  const userData = {
    name: user.name,
    email: user.email,
    company: 'Digital Agency Pro',
    plan: user.plan,
    creditsLeft: 150,
    totalCredits: 500,
    searches: 23,
    leadsFound: 1247,
    conversionRate: 12.3,
    monthlySpent: 2340,
    joinDate: '2024-01-15'
  };

  // Статистика
  const stats = [
    { label: 'Осталось кредитов', value: userData.creditsLeft, total: userData.totalCredits, color: '#0ea5e9' },
    { label: 'Найдено лидов', value: userData.leadsFound, color: '#22c55e' },
    { label: 'Конверсия', value: `${userData.conversionRate}%`, color: '#f59e0b' },
    { label: 'Поисков за месяц', value: userData.searches, color: '#8b5cf6' }
  ];

  // История поисков
  const searchHistory = [
    { 
      id: 1,
      date: '2024-01-15 14:30', 
      query: 'Кофейни в Москве', 
      results: 45, 
      credits: 45,
      status: 'completed',
      exportFormat: 'CSV'
    },
    { 
      id: 2,
      date: '2024-01-14 09:15', 
      query: 'Стоматологии в СПб', 
      results: 32, 
      credits: 32,
      status: 'completed',
      exportFormat: 'Excel'
    },
    { 
      id: 3,
      date: '2024-01-13 16:45', 
      query: 'Автосервисы в Казани', 
      results: 28, 
      credits: 28,
      status: 'processing',
      exportFormat: 'CSV'
    },
    { 
      id: 4,
      date: '2024-01-12 11:20', 
      query: 'Салоны красоты в Екатеринбурге', 
      results: 19, 
      credits: 19,
      status: 'completed',
      exportFormat: 'JSON'
    }
  ];

  // Популярные ниши
  const popularNiches = [
    'Кофейни и кафе', 'Стоматологии', 'Автосервисы', 'Салоны красоты',
    'Фитнес-клубы', 'Рестораны', 'Юридические услуги', 'Медицинские центры'
  ];

  const StatCard = ({ label, value, total, color }: { label: string, value: number | string, total?: number, color: string }) => (
    <div style={{
      background: 'white',
      borderRadius: '12px',
      padding: '1.5rem',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      border: '1px solid #e5e7eb',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
        <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#64748b', margin: 0 }}>
          {label}
        </h3>
        <div style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          background: color
        }} />
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
        <span style={{ fontSize: '2rem', fontWeight: 800, color: '#1f2937' }}>
          {typeof value === 'number' ? value.toLocaleString() : value}
        </span>
        {total && (
          <span style={{ fontSize: '0.875rem', color: '#64748b' }}>
            / {total.toLocaleString()}
          </span>
        )}
      </div>
      {total && (
        <div style={{
          background: '#f3f4f6',
          borderRadius: '4px',
          height: '4px',
          marginTop: '0.75rem',
          overflow: 'hidden'
        }}>
          <div style={{
            background: color,
            height: '100%',
            width: `${(value as number / total) * 100}%`,
            transition: 'width 0.3s ease'
          }} />
        </div>
      )}
    </div>
  );

  const TabButton = ({ tab, label, icon }: { tab: string, label: string, icon: string }) => (
    <button
      onClick={() => setActiveTab(tab as any)}
      style={{
        background: activeTab === tab ? '#0f172a' : 'transparent',
        color: activeTab === tab ? 'white' : '#64748b',
        border: 'none',
        padding: '0.75rem 1rem',
        borderRadius: '8px',
        fontSize: '0.875rem',
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        width: '100%',
        textAlign: 'left'
      }}
      onMouseEnter={(e) => {
        if (activeTab !== tab) {
          e.currentTarget.style.background = '#f8fafc';
          e.currentTarget.style.color = '#0f172a';
        }
      }}
      onMouseLeave={(e) => {
        if (activeTab !== tab) {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.color = '#64748b';
        }
      }}
    >
      <span style={{ fontSize: '1.1rem' }}>{icon}</span>
      {label}
    </button>
  );

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#f8fafc',
      display: 'flex'
    }}>
      {/* Sidebar */}
      <aside style={{
        width: '280px',
        background: 'white',
        borderRight: '1px solid #e5e7eb',
        padding: '2rem 0',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        height: '100vh',
        overflowY: 'auto'
      }}>
        {/* Logo */}
        <div style={{ padding: '0 2rem', marginBottom: '2rem' }}>
          <h1 style={{ 
            fontSize: '1.5rem', 
            fontWeight: 800,
            background: 'linear-gradient(135deg, #0ea5e9, #6366f1)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
            margin: 0
          }}>
            Contacto
          </h1>
        </div>

        {/* Navigation */}
        <nav style={{ padding: '0 1rem', flex: 1 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <TabButton tab="overview" label="Обзор" icon="📊" />
            <TabButton tab="leads" label="Поиск лидов" icon="🔍" />
            <TabButton tab="analytics" label="Аналитика" icon="📈" />
            <TabButton tab="settings" label="Настройки" icon="⚙️" />
          </div>
        </nav>

        {/* User Info */}
        <div style={{ 
          padding: '1rem 2rem', 
          borderTop: '1px solid #e5e7eb',
          background: '#f8fafc'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #0ea5e9, #6366f1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 700,
              fontSize: '0.875rem'
            }}>
              {userData.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1f2937' }}>
                {userData.name}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                {userData.plan} Plan
              </div>
            </div>
          </div>
          <button 
            onClick={onLogout}
            style={{
              background: 'transparent',
              color: '#ef4444',
              border: '1px solid #ef4444',
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
              width: '100%',
              transition: 'all 0.2s ease'
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
      </aside>

      {/* Main Content */}
      <main style={{ 
        flex: 1, 
        marginLeft: '280px',
        padding: '2rem',
        maxWidth: 'calc(100vw - 280px)'
      }}>
        {/* Header */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '2rem'
        }}>
          <div>
            <h2 style={{ 
              fontSize: '2rem', 
              fontWeight: 800, 
              color: '#1f2937',
              margin: '0 0 0.5rem 0'
            }}>
              {activeTab === 'overview' && 'Обзор'}
              {activeTab === 'leads' && 'Поиск лидов'}
              {activeTab === 'analytics' && 'Аналитика'}
              {activeTab === 'settings' && 'Настройки'}
            </h2>
            <p style={{ color: '#64748b', margin: 0 }}>
              {activeTab === 'overview' && 'Общая статистика и активность'}
              {activeTab === 'leads' && 'Найдите новых клиентов для вашего бизнеса'}
              {activeTab === 'analytics' && 'Детальная аналитика и отчеты'}
              {activeTab === 'settings' && 'Управление аккаунтом и настройки'}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button style={{
              background: 'white',
              color: '#374151',
              border: '1px solid #d1d5db',
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              📥 Экспорт данных
            </button>
            <button style={{
              background: 'linear-gradient(135deg, #0ea5e9, #6366f1)',
              color: 'white',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              💳 Пополнить
            </button>
          </div>
        </div>

        {/* Content based on active tab */}
        {activeTab === 'overview' && (
          <div>
            {/* Stats Grid */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
              gap: '1.5rem',
              marginBottom: '2rem'
            }}>
              {stats.map((stat, index) => (
                <StatCard key={index} {...stat} />
              ))}
            </div>

            {/* Recent Activity */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '2fr 1fr', 
              gap: '1.5rem'
            }}>
              <div style={{
                background: 'white',
                borderRadius: '12px',
                padding: '1.5rem',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                border: '1px solid #e5e7eb'
              }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1rem', color: '#1f2937' }}>
                  Последние поиски
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {searchHistory.slice(0, 4).map((search) => (
                    <div key={search.id} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '0.75rem',
                      background: '#f8fafc',
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb'
                    }}>
                      <div>
                        <div style={{ fontWeight: 600, color: '#1f2937', marginBottom: '0.25rem' }}>
                          {search.query}
                        </div>
                        <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                          {search.date}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 600, color: '#1f2937' }}>
                          {search.results} лидов
                        </div>
                        <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                          {search.credits} кредитов
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{
                background: 'white',
                borderRadius: '12px',
                padding: '1.5rem',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                border: '1px solid #e5e7eb'
              }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1rem', color: '#1f2937' }}>
                  Популярные ниши
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {popularNiches.slice(0, 6).map((niche, index) => (
                    <div key={index} style={{
                      padding: '0.5rem 0.75rem',
                      background: '#f8fafc',
                      borderRadius: '6px',
                      fontSize: '0.875rem',
                      color: '#374151',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#e5e7eb';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#f8fafc';
                    }}
                    >
                      {niche}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'leads' && (
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '2rem',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e5e7eb'
          }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem', color: '#1f2937' }}>
              Настройка поиска лидов
            </h3>
            
            <form style={{ display: 'grid', gap: '1.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '0.875rem', 
                    fontWeight: 600, 
                    color: '#374151', 
                    marginBottom: '0.5rem' 
                  }}>
                    Ниша бизнеса
                  </label>
                  <input
                    type="text"
                    value={searchData.niche}
                    onChange={(e) => setSearchData({...searchData, niche: e.target.value})}
                    placeholder="Например: кофейни, стоматологии"
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '0.875rem',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                <div>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '0.875rem', 
                    fontWeight: 600, 
                    color: '#374151', 
                    marginBottom: '0.5rem' 
                  }}>
                    Город/Регион
                  </label>
                  <input
                    type="text"
                    value={searchData.location}
                    onChange={(e) => setSearchData({...searchData, location: e.target.value})}
                    placeholder="Например: Москва, СПб"
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '0.875rem',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: '0.875rem', 
                  fontWeight: 600, 
                  color: '#374151', 
                  marginBottom: '0.5rem' 
                }}>
                  Количество лидов
                </label>
                <input
                  type="number"
                  value={searchData.limit}
                  onChange={(e) => setSearchData({...searchData, limit: parseInt(e.target.value)})}
                  min="1"
                  max="1000"
                  style={{
                    width: '200px',
                    padding: '0.75rem 1rem',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', color: '#374151' }}>
                  Дополнительные фильтры
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={searchData.filters.hasEmail}
                      onChange={(e) => setSearchData({
                        ...searchData, 
                        filters: {...searchData.filters, hasEmail: e.target.checked}
                      })}
                    />
                    <span style={{ fontSize: '0.875rem', color: '#374151' }}>Только с email</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={searchData.filters.hasPhone}
                      onChange={(e) => setSearchData({
                        ...searchData, 
                        filters: {...searchData.filters, hasPhone: e.target.checked}
                      })}
                    />
                    <span style={{ fontSize: '0.875rem', color: '#374151' }}>Только с телефоном</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={searchData.filters.hasWebsite}
                      onChange={(e) => setSearchData({
                        ...searchData, 
                        filters: {...searchData.filters, hasWebsite: e.target.checked}
                      })}
                    />
                    <span style={{ fontSize: '0.875rem', color: '#374151' }}>Только с сайтом</span>
                  </label>
                </div>
              </div>

              <button style={{
                background: 'linear-gradient(135deg, #0ea5e9, #6366f1)',
                color: 'white',
                border: 'none',
                padding: '1rem 2rem',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: 600,
                cursor: 'pointer',
                width: 'fit-content',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                🔍 Начать поиск
              </button>
            </form>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
              gap: '1.5rem',
              marginBottom: '2rem'
            }}>
              <div style={{
                background: 'white',
                borderRadius: '12px',
                padding: '1.5rem',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                border: '1px solid #e5e7eb'
              }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1rem', color: '#1f2937' }}>
                  Эффективность поиска
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>Средняя конверсия</span>
                    <span style={{ fontWeight: 600, color: '#1f2937' }}>12.3%</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>Лучшая ниша</span>
                    <span style={{ fontWeight: 600, color: '#1f2937' }}>Кофейни</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>ROI</span>
                    <span style={{ fontWeight: 600, color: '#22c55e' }}>+340%</span>
                  </div>
                </div>
              </div>

              <div style={{
                background: 'white',
                borderRadius: '12px',
                padding: '1.5rem',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                border: '1px solid #e5e7eb'
              }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1rem', color: '#1f2937' }}>
                  Использование кредитов
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span style={{ color: '#64748b' }}>Использовано</span>
                      <span style={{ fontWeight: 600, color: '#1f2937' }}>350/500</span>
                    </div>
                    <div style={{
                      background: '#f3f4f6',
                      borderRadius: '4px',
                      height: '8px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        background: 'linear-gradient(135deg, #0ea5e9, #6366f1)',
                        height: '100%',
                        width: '70%'
                      }} />
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>Средняя стоимость лида</span>
                    <span style={{ fontWeight: 600, color: '#1f2937' }}>₽2.1</span>
                  </div>
                </div>
              </div>
            </div>

            <div style={{
              background: 'white',
              borderRadius: '12px',
              padding: '1.5rem',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              border: '1px solid #e5e7eb'
            }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1rem', color: '#1f2937' }}>
                История поисков
              </h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <th style={{ textAlign: 'left', padding: '0.75rem', fontSize: '0.875rem', fontWeight: 600, color: '#374151' }}>Дата</th>
                      <th style={{ textAlign: 'left', padding: '0.75rem', fontSize: '0.875rem', fontWeight: 600, color: '#374151' }}>Запрос</th>
                      <th style={{ textAlign: 'left', padding: '0.75rem', fontSize: '0.875rem', fontWeight: 600, color: '#374151' }}>Результаты</th>
                      <th style={{ textAlign: 'left', padding: '0.75rem', fontSize: '0.875rem', fontWeight: 600, color: '#374151' }}>Кредиты</th>
                      <th style={{ textAlign: 'left', padding: '0.75rem', fontSize: '0.875rem', fontWeight: 600, color: '#374151' }}>Статус</th>
                    </tr>
                  </thead>
                  <tbody>
                    {searchHistory.map((search) => (
                      <tr key={search.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                        <td style={{ padding: '0.75rem', fontSize: '0.875rem', color: '#64748b' }}>{search.date}</td>
                        <td style={{ padding: '0.75rem', fontSize: '0.875rem', color: '#1f2937', fontWeight: 500 }}>{search.query}</td>
                        <td style={{ padding: '0.75rem', fontSize: '0.875rem', color: '#1f2937' }}>{search.results}</td>
                        <td style={{ padding: '0.75rem', fontSize: '0.875rem', color: '#1f2937' }}>{search.credits}</td>
                        <td style={{ padding: '0.75rem' }}>
                          <span style={{
                            padding: '0.25rem 0.5rem',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            background: search.status === 'completed' ? '#dcfce7' : '#fef3c7',
                            color: search.status === 'completed' ? '#166534' : '#92400e'
                          }}>
                            {search.status === 'completed' ? 'Завершено' : 'Обработка'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '2rem',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e5e7eb'
          }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '2rem', color: '#1f2937' }}>
              Настройки аккаунта
            </h3>
            
            <div style={{ display: 'grid', gap: '2rem' }}>
              <div>
                <h4 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem', color: '#374151' }}>
                  Личная информация
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ 
                      display: 'block', 
                      fontSize: '0.875rem', 
                      fontWeight: 600, 
                      color: '#374151', 
                      marginBottom: '0.5rem' 
                    }}>
                      Имя
                    </label>
                    <input
                      type="text"
                      defaultValue={userData.name}
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        border: '2px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '0.875rem',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ 
                      display: 'block', 
                      fontSize: '0.875rem', 
                      fontWeight: 600, 
                      color: '#374151', 
                      marginBottom: '0.5rem' 
                    }}>
                      Email
                    </label>
                    <input
                      type="email"
                      defaultValue={userData.email}
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        border: '2px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '0.875rem',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>
              </div>

              <div>
                <h4 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem', color: '#374151' }}>
                  Ваш тариф
                </h4>
                <div style={{
                  background: 'linear-gradient(135deg, #f0f9ff, #e0f2fe)',
                  border: '2px solid #0ea5e9',
                  borderRadius: '12px',
                  padding: '1.5rem'
                }}>
                  <div style={{ 
                    fontSize: '1.25rem', 
                    fontWeight: 700, 
                    color: '#0ea5e9',
                    marginBottom: '0.5rem'
                  }}>
                    {userData.plan} Plan
                  </div>
                  <div style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1rem' }}>
                    {userData.creditsLeft} из {userData.totalCredits} кредитов осталось
                  </div>
                  <button style={{
                    background: 'linear-gradient(135deg, #0ea5e9, #6366f1)',
                    color: 'white',
                    border: 'none',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}>
                    💳 Управление подпиской
                  </button>
                </div>
              </div>

              <div>
                <h4 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem', color: '#374151' }}>
                  Безопасность
                </h4>
                <button style={{
                  background: 'transparent',
                  color: '#ef4444',
                  border: '2px solid #ef4444',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
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
                  🚪 Выйти из аккаунта
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}