// Seed script — clears DB and inserts realistic testimonials
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import { analyzeSentiment } from './src/sentiment.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const db = new Database(path.join(__dirname, 'data.db'));

// Clear all data
db.exec('DELETE FROM testimonials');
console.log('Cleared existing data.');

const seedData = [
  {
    name: 'Sarah Chen', email: 'sarah@techventures.com', company: 'TechVentures Inc',
    text: 'HighAdvocacy completely transformed how we collect customer feedback. The embeddable widget was a breeze to set up on our landing page, and our review conversion rate went up 3x within the first month.',
    rating: 5, status: 'approved',
  },
  {
    name: 'Marcus Rodriguez', email: 'marcus@buildlab.io', company: 'BuildLab',
    text: 'We evaluated five testimonial platforms before choosing HighAdvocacy. The moderation workflow is intuitive — our support team reviews and approves submissions in seconds. The sentiment tagging helps us spot trends we would have missed.',
    rating: 5, status: 'approved',
  },
  {
    name: 'Emily Park', email: 'emily@cloudstack.dev', company: 'CloudStack',
    text: 'Great platform overall. The widget loads fast and looks native on our site. Would love to see more customization options for the card layout, but the out-of-the-box design is clean and professional.',
    rating: 4, status: 'approved',
  },
  {
    name: 'James Okonkwo', email: 'james@afripay.co', company: 'AfriPay',
    text: 'Solid product. Setup took about 15 minutes from start to having testimonials live on our site. The documentation was clear and the API is well-designed.',
    rating: 4, status: 'approved',
  },
  {
    name: 'Lisa Watanabe', email: 'lisa@meridian.design', company: 'Meridian Design Co',
    text: 'As a design agency, we are picky about the tools we embed on client sites. HighAdvocacy passed our review with flying colors. The widget respects our design tokens and the animations feel polished, not tacky.',
    rating: 5, status: 'approved',
  },
  {
    name: 'David Thompson', email: 'david@launchpad.vc', company: 'Launchpad VC',
    text: 'We use HighAdvocacy across our portfolio companies. The consistency in moderation experience means our founders can focus on product while we handle testimonial quality.',
    rating: 5, status: 'approved',
  },
  {
    name: 'Priya Sharma', email: 'priya@zenflow.health', company: 'Zenflow Health',
    text: "The platform does what it says on the tin. No surprises, no hidden complexity. Our patients appreciate being able to share their experiences easily. One minor request: it would be helpful to have a character count indicator on the submission form.",
    rating: 4, status: 'approved',
  },
  {
    name: 'Alex Turner', email: 'alex@brightmetrics.com', company: 'BrightMetrics',
    text: "Honestly, it's fine. Gets the job done. Customer support was helpful when we had an issue with our custom domain setup. The analytics dashboard could use more depth — right now it is pretty basic.",
    rating: 3, status: 'approved',
  },
  {
    name: 'Rachel Kim', email: 'rachel@studiodrop.com', company: 'StudioDrop',
    text: 'Incredible value for the price point. We switched from a competitor that was charging 4x more and honestly got a better experience here. The moderation queue is fast, the embed is painless, and our clients love seeing their testimonials live instantly after approval.',
    rating: 5, status: 'approved',
  },
  {
    name: 'Tom Harrington', email: 'tom@horizon-logistics.com', company: 'Horizon Logistics',
    text: 'The platform met our basic requirements but we ran into some friction with the photo upload on mobile devices. Images occasionally fail to attach when the connection is slow. The team was responsive when we reported it.',
    rating: 3, status: 'approved',
  },
  // Pending (awaiting moderation)
  {
    name: 'Nina Petrova', email: 'nina@cyberforge.io', company: 'CyberForge',
    text: 'Just started using HighAdvocacy for our cybersecurity SaaS product. The implementation was smooth and our engineering team appreciated the clean API design. Looking forward to seeing the impact on our conversion rates!',
    rating: 4, status: 'pending',
  },
  {
    name: 'Carlos Mendez', email: 'carlos@lumina.art', company: 'Lumina Art Gallery',
    text: 'Love the aesthetic of the widget — it actually complements our gallery website instead of looking like a third-party add-on. The dark mode option would be a great addition for sites with darker themes.',
    rating: 4, status: 'pending',
  },
  // Rejected (inappropriate or spam)
  {
    name: 'SEO Expert', email: 'buy-links@spam.net', company: '',
    text: 'CHEAP BACKLINKS FOR YOUR WEBSITE! Get ranked #1 on Google today. Visit our website for the best deals on SEO services. Limited time offer!',
    rating: 1, status: 'rejected',
  },
  {
    name: 'Anonymous', email: 'anon@tempmail.com', company: '',
    text: 'bad',
    rating: 1, status: 'rejected',
  },
];

async function seed() {
  for (const item of seedData) {
    const id = uuidv4();
    const sentiment = await analyzeSentiment(item.text);

    db.prepare(`
      INSERT INTO testimonials (id, name, email, company, text, rating, sentiment, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, item.name, item.email, item.company, item.text, item.rating, sentiment, item.status);

    console.log(`  ${item.status.toUpperCase().padEnd(10)} ${sentiment.padEnd(10)} ${item.name} — "${item.text.slice(0, 60)}..."`);
  }

  const counts = db.prepare(`
    SELECT status, COUNT(*) as count FROM testimonials GROUP BY status
  `).all();

  console.log(`\nSeed complete:`);
  for (const row of counts) {
    console.log(`  ${row.status}: ${row.count}`);
  }
  console.log(`  Total: ${counts.reduce((s, r) => s + r.count, 0)}`);

  db.close();
}

seed().catch(e => { console.error(e); process.exit(1); });
