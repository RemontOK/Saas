import express from 'express';
import axios from 'axios';

const app = express();
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ ok: true, ts: Date.now() });
});

app.post('/api/search', async (req, res) => {
  try {
    const { niche, location, limit = 20, minReviews = 0, recentOnly = false, hasInstagram = false } = req.body || {};
    if (!niche) return res.status(400).json({ error: 'niche is required' });

    const max = Math.min(Number(limit) || 20, 100);
    const now = Date.now();

    const items = Array.from({ length: max }).map((_, i) => {
      const reviews = Math.floor(Math.random() * 500);
      const rating = (Math.random() * 2 + 3).toFixed(1); // 3.0 - 5.0
      const ig = Math.random() > 0.5 ? `https://instagram.com/example_${i + 1}` : '';
      const openedAt = now - Math.floor(Math.random() * 400) * 24 * 3600 * 1000; // дни назад
      return {
        id: i + 1,
        company: `${niche} Company ${i + 1}`,
        location: location || 'Москва',
        website: `https://example-${i + 1}.com`,
        email: '',
        phone: '',
        rating: Number(rating),
        reviews,
        instagram: ig,
        openedAt,
        source: 'stub'
      };
    }).filter(r => r.reviews >= Number(minReviews))
      .filter(r => !hasInstagram || !!r.instagram)
      .filter(r => !recentOnly || (now - r.openedAt) < 365 * 24 * 3600 * 1000);

    res.json({ items });
  } catch (e) {
    res.status(500).json({ error: 'internal_error' });
  }
});

app.post('/api/enrich', async (req, res) => {
  try {
    const { website } = req.body || {};
    if (!website) return res.status(400).json({ error: 'website is required' });
    const domain = new URL(website).hostname;
    const quality = Math.random();
    const tag = quality > 0.7 ? 'verified' : quality > 0.35 ? 'guessed' : 'unknown';
    res.json({
      website,
      email: (tag === 'unknown') ? '' : `info@${domain}`,
      phone: '+1-555-0100',
      emailQuality: tag
    });
  } catch (e) {
    res.status(500).json({ error: 'internal_error' });
  }
});

app.post('/api/checkout', async (req, res) => {
  try {
    const { plan, email, notes } = req.body || {};
    if (!plan || !email) return res.status(400).json({ error: 'plan and email are required' });
    // Заглушка оформления заказа
    console.log('Checkout request:', { plan, email, notes });
    res.json({ ok: true, plan, email });
  } catch (e) {
    res.status(500).json({ error: 'internal_error' });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
}); 