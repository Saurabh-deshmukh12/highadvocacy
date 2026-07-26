// Vercel Serverless API — serves seed data without needing a separate backend
// This makes the demo work immediately on Vercel without deploying to Render

const seedTestimonials = [
  {
    id: 'seed-1', name: 'Sarah Chen', email: 'sarah@techventures.com', company: 'TechVentures Inc',
    text: 'HighAdvocacy completely transformed how we collect customer feedback. The embeddable widget was a breeze to set up on our landing page, and our review conversion rate went up 3x within the first month.',
    rating: 5, status: 'approved', sentiment: 'positive', created_at: '2026-07-20T10:30:00Z', updated_at: '2026-07-20T10:30:00Z',
  },
  {
    id: 'seed-2', name: 'Marcus Rodriguez', email: 'marcus@buildlab.io', company: 'BuildLab',
    text: 'We evaluated five testimonial platforms before choosing HighAdvocacy. The moderation workflow is intuitive — our support team reviews and approves submissions in seconds.',
    rating: 5, status: 'approved', sentiment: 'positive', created_at: '2026-07-19T14:15:00Z', updated_at: '2026-07-19T14:15:00Z',
  },
  {
    id: 'seed-3', name: 'Emily Park', email: 'emily@cloudstack.dev', company: 'CloudStack',
    text: 'Great platform overall. The widget loads fast and looks native on our site. Would love to see more customization options for the card layout, but the out-of-the-box design is clean and professional.',
    rating: 4, status: 'approved', sentiment: 'positive', created_at: '2026-07-18T09:00:00Z', updated_at: '2026-07-18T09:00:00Z',
  },
  {
    id: 'seed-4', name: 'James Okonkwo', email: 'james@afripay.co', company: 'AfriPay',
    text: 'Solid product. Setup took about 15 minutes from start to having testimonials live on our site. The documentation was clear and the API is well-designed.',
    rating: 4, status: 'approved', sentiment: 'neutral', created_at: '2026-07-17T16:45:00Z', updated_at: '2026-07-17T16:45:00Z',
  },
  {
    id: 'seed-5', name: 'Lisa Watanabe', email: 'lisa@meridian.design', company: 'Meridian Design Co',
    text: 'As a design agency, we are picky about the tools we embed on client sites. HighAdvocacy passed our review with flying colors. The widget respects our design tokens and the animations feel polished.',
    rating: 5, status: 'approved', sentiment: 'positive', created_at: '2026-07-16T11:20:00Z', updated_at: '2026-07-16T11:20:00Z',
  },
  {
    id: 'seed-6', name: 'David Thompson', email: 'david@launchpad.vc', company: 'Launchpad VC',
    text: 'We use HighAdvocacy across our portfolio companies. The consistency in moderation experience means our founders can focus on product while we handle testimonial quality.',
    rating: 5, status: 'approved', sentiment: 'neutral', created_at: '2026-07-15T08:00:00Z', updated_at: '2026-07-15T08:00:00Z',
  },
  {
    id: 'seed-7', name: 'Priya Sharma', email: 'priya@zenflow.health', company: 'Zenflow Health',
    text: "The platform does what it says on the tin. No surprises, no hidden complexity. Our patients appreciate being able to share their experiences easily.",
    rating: 4, status: 'approved', sentiment: 'neutral', created_at: '2026-07-14T13:30:00Z', updated_at: '2026-07-14T13:30:00Z',
  },
  {
    id: 'seed-8', name: 'Rachel Kim', email: 'rachel@studiodrop.com', company: 'StudioDrop',
    text: 'Incredible value for the price point. We switched from a competitor that was charging 4x more and honestly got a better experience here. Our clients love seeing their testimonials live instantly after approval.',
    rating: 5, status: 'approved', sentiment: 'positive', created_at: '2026-07-13T17:00:00Z', updated_at: '2026-07-13T17:00:00Z',
  },
  {
    id: 'seed-9', name: 'Nina Petrova', email: 'nina@cyberforge.io', company: 'CyberForge',
    text: 'Just started using HighAdvocacy for our cybersecurity SaaS product. The implementation was smooth and our engineering team appreciated the clean API design.',
    rating: 4, status: 'pending', sentiment: 'neutral', created_at: '2026-07-21T07:00:00Z', updated_at: '2026-07-21T07:00:00Z',
  },
  {
    id: 'seed-10', name: 'Carlos Mendez', email: 'carlos@lumina.art', company: 'Lumina Art Gallery',
    text: 'Love the aesthetic of the widget — it actually complements our gallery website instead of looking like a third-party add-on.',
    rating: 4, status: 'pending', sentiment: 'positive', created_at: '2026-07-21T09:30:00Z', updated_at: '2026-07-21T09:30:00Z',
  },
  {
    id: 'seed-11', name: 'SEO Expert', email: 'spam@example.com', company: '',
    text: 'CHEAP BACKLINKS FOR YOUR WEBSITE! Get ranked #1 on Google today!',
    rating: 1, status: 'rejected', sentiment: 'neutral', created_at: '2026-07-21T12:00:00Z', updated_at: '2026-07-21T12:00:00Z',
  },
  {
    id: 'seed-12', name: 'Anonymous', email: 'anon@tempmail.com', company: '',
    text: 'bad',
    rating: 1, status: 'rejected', sentiment: 'negative', created_at: '2026-07-21T12:05:00Z', updated_at: '2026-07-21T12:05:00Z',
  },
];

// Simple keyword-based sentiment analysis
function analyzeSentiment(text) {
  const lower = text.toLowerCase();
  const pos = ['amazing', 'excellent', 'great', 'love', 'awesome', 'fantastic', 'wonderful', 'outstanding', 'best', 'perfect', 'transformed', 'impressed', 'recommend', 'helpful', 'brilliant', 'incredible', 'superb', 'happy', 'pleased'];
  const neg = ['terrible', 'awful', 'horrible', 'bad', 'worst', 'poor', 'disappointed', 'frustrated', 'waste', 'broken', 'useless', 'never', 'avoid', 'hate', 'garbage', 'scam'];
  let p = 0, n = 0;
  for (const w of pos) if (lower.includes(w)) p++;
  for (const w of neg) if (lower.includes(w)) n++;
  if (p > n) return 'positive';
  if (n > p) return 'negative';
  return 'neutral';
}

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();

  const url = new URL(req.url, 'http://localhost');
  const path = url.pathname.replace(/^\/api/, '');
  const searchParams = url.searchParams;

  // GET /api/health
  if (req.method === 'GET' && path === '/health') {
    return res.json({ status: 'ok', mode: 'serverless-seed' });
  }

  // POST /api/testimonials — "submit" a testimonial (just returns success with mock data)
  if (req.method === 'POST' && path === '/testimonials') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
      const { name = 'Anonymous', email = '', company = '', text = '', rating = 5 } = body;
      const id = 'mock-' + Date.now();
      const sentiment = analyzeSentiment(String(text));
      return res.status(201).json({
        id, name, email, company, text, rating: parseInt(rating) || 5,
        photo_url: null, sentiment, status: 'pending',
        created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
      });
    } catch {
      return res.status(400).json({ error: 'Invalid request' });
    }
  }

  // GET /api/testimonials/approved
  if (req.method === 'GET' && path === '/testimonials/approved') {
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const filtered = seedTestimonials.filter(t => t.status === 'approved');
    const offset = (page - 1) * limit;
    return res.json({
      testimonials: filtered.slice(offset, offset + limit),
      total: filtered.length, page, limit,
    });
  }

  // GET /api/testimonials
  if (req.method === 'GET' && path === '/testimonials') {
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    let filtered = seedTestimonials;
    if (status && ['pending', 'approved', 'rejected'].includes(status)) {
      filtered = seedTestimonials.filter(t => t.status === status);
    }
    const offset = (page - 1) * limit;
    return res.json({
      testimonials: filtered.slice(offset, offset + limit),
      total: filtered.length, page, limit,
    });
  }

  // PATCH /api/testimonials/:id
  const patchMatch = path.match(/^\/testimonials\/(.+)$/);
  if (req.method === 'PATCH' && patchMatch) {
    const id = patchMatch[1];
    const { status } = req.body || {};
    if (!status || !['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: "status must be 'approved' or 'rejected'" });
    }
    const item = seedTestimonials.find(t => t.id === id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    item.status = status;
    return res.json(item);
  }

  // POST /api/testimonials/:id/analyze
  const analyzeMatch = path.match(/^\/testimonials\/(.+)\/analyze$/);
  if (req.method === 'POST' && analyzeMatch) {
    const id = analyzeMatch[1];
    const item = seedTestimonials.find(t => t.id === id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    item.sentiment = analyzeSentiment(item.text);
    return res.json(item);
  }

  return res.status(404).json({ error: 'Not found' });
}
