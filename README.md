# HighAdvocacy — Testimonial Platform

A testimonial collection and display platform. Customers submit testimonials via a public form, business owners moderate them through a dashboard, and approved testimonials appear on a public wall and an embeddable widget.

## Quick Start

### Prerequisites
- Node.js 18+

### Install & Run

```bash
# Terminal 1 — Backend
cd server
npm install
npm run dev          # Starts on http://localhost:3099

# Terminal 2 — Frontend
cd client
npm install
npm run dev          # Starts on http://localhost:5173
```

Open http://localhost:5173 in your browser.

## What's Built

### P0 — Core Loop (complete)
- **Submission form** (`/`) — Public form: name, email, company, text, star rating, optional photo
- **Backend + storage** — Node.js API + SQLite, 5 endpoints
- **Moderation dashboard** (`/dashboard`) — List submissions, approve/reject, sentiment analysis
- **Public wall** (`/wall`) — Grid of approved testimonials with pagination

### P1 — Widget & Polish (complete)
- **Embeddable widget** — `<script>` tag that renders testimonials on any site
- **Widget demo** (`/public/widget-demo.html`) — Third-party site proving the embed works
- **Widget customization** — accent color via `data-accent`, grid/carousel via `data-layout`
- **Duplicate detection** — Jaccard similarity on same-email submissions within 24h
- **Pagination** — Both dashboard and wall
- **Empty, loading, and error states** — Across all pages

### P2 — AI & Deploy (complete)
- **AI sentiment tagging** — Keyword-based (free), auto-upgrades to OpenRouter AI if key is set
- **Deploy config** — render.yaml for backend, vercel.json for frontend

## API Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/testimonials` | Submit testimonial (multipart/form-data) |
| GET | `/api/testimonials` | List all (query: `?status=pending&page=1&limit=20`) |
| GET | `/api/testimonials/approved` | Public approved list (`?page=1&limit=12`) |
| PATCH | `/api/testimonials/:id` | Approve/reject (`{ "status": "approved" }`) |
| POST | `/api/testimonials/:id/analyze` | Trigger sentiment analysis |

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + Vite + Tailwind CSS v4 + React Router v7 |
| Backend | Node.js (pure `http`) + better-sqlite3 + busboy |
| Database | SQLite |
| Widget | Vanilla JS (no dependencies) |
| AI | OpenRouter (free tier, optional) or keyword fallback |

## Deployment

### Frontend (Vercel)

1. Push to GitHub
2. Import repo in Vercel dashboard
3. Set root directory to `client`
4. Set environment variable: `VITE_API_URL=https://your-backend.onrender.com/api`
5. Deploy

### Backend (Render)

1. Push to GitHub
2. Create new Web Service on Render
3. Point to the repo, root directory: `server`
4. Build command: `npm install`, Start command: `node src/index.js`
5. Optional: set `OPENROUTER_API_KEY` for AI-powered sentiment

### Widget Embed

Add to any website:
```html
<div id="highadvocacy-widget"
     data-api="https://your-backend.onrender.com"
     data-accent="#4f46e5"
     data-limit="6"
     data-layout="grid">
</div>
<script src="https://your-backend.onrender.com/public/widget.js"></script>
```

## Project Structure

```
HighAdvocacy/
├── client/                  # React frontend
│   ├── src/
│   │   ├── components/      # Layout, StarRating, StarInput, TestimonialCard, Spinner
│   │   ├── pages/           # SubmissionForm, Dashboard, Wall
│   │   └── lib/api.js       # API client
│   └── public/              # Widget JS and demo page
├── server/                  # Node.js backend
│   ├── src/
│   │   ├── index.js         # HTTP server + all routes
│   │   ├── db.js            # SQLite schema + migrations
│   │   └── sentiment.js     # AI/keyword sentiment analysis
│   └── public/              # Widget served as static file
├── AGENTS.md                # Agent steering file
├── JOURNAL.md               # Decision journal
├── render.yaml              # Render deployment config
└── README.md                # This file
```

## Design Decisions

- **No auth** — Dashboard is unprotected per assignment requirements
- **SQLite** — Zero-config, file-based, no cloud dependency
- **Pure Node.js http** — Avoided Express compatibility issues with Node 22
- **Sentiment fallback** — Works without any API key (keyword analysis), upgrades to AI if `OPENROUTER_API_KEY` is set
- **Rejected testimonials** — Stored but excluded from all public endpoints
- **Widget is vanilla JS** — No framework dependency, works on any website
