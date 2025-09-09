import type { Lead, SearchParams, CheckoutData } from '../types';

const isProduction = () => window.location.hostname.includes('github.io');

// Mock данные для GitHub Pages
const generateMockLeads = (params: SearchParams): Lead[] => {
  const { niche, location, limit, minReviews, recentOnly, hasInstagram } = params;
  const max = Math.min(Number(limit) || 20, 100);
  const now = Date.now();

  const items = Array.from({ length: max }).map((_, i) => {
    const reviews = Math.floor(Math.random() * 500);
    const rating = (Math.random() * 2 + 3).toFixed(1);
    const ig = Math.random() > 0.5 ? `https://instagram.com/example_${i + 1}` : '';
    const openedAt = now - Math.floor(Math.random() * 400) * 24 * 3600 * 1000;
    const domain = `example-${i + 1}.com`;
    const quality = Math.random();
    const tag = quality > 0.7 ? 'verified' : quality > 0.35 ? 'guessed' : 'unknown';

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
    };
  });

  return items
    .filter(r => r.reviews >= Number(minReviews))
    .filter(r => !hasInstagram || !!r.instagram)
    .filter(r => !recentOnly || (now - r.openedAt) < 365 * 24 * 3600 * 1000);
};

export const searchLeads = async (params: SearchParams): Promise<Lead[]> => {
  if (isProduction()) {
    // Mock данные для GitHub Pages
    await new Promise(resolve => setTimeout(resolve, 1000));
    return generateMockLeads(params);
  } else {
    // Обычная логика для локального сервера
    const res = await fetch('/api/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data.items || [];
  }
};

export const enrichLead = async (website: string) => {
  if (isProduction()) {
    // Mock для GitHub Pages
    return {
      website,
      email: `info@${new URL(website).hostname}`,
      phone: '+1-555-0100',
      emailQuality: 'demo' as const
    };
  } else {
    const res = await fetch('/api/enrich', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ website })
    });
    
    if (res.ok) {
      return await res.json();
    }
    return null;
  }
};

export const submitCheckout = async (data: CheckoutData): Promise<string> => {
  if (isProduction()) {
    // Mock для GitHub Pages
    await new Promise(resolve => setTimeout(resolve, 1500));
    console.log('Demo checkout request:', data);
    return 'Демо режим: Заявка имитирована! В реальной версии мы свяжемся с вами по email.';
  } else {
    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    if (!res.ok) throw new Error('Ошибка оформления');
    return 'Заявка отправлена! Мы свяжемся с вами по email.';
  }
};
