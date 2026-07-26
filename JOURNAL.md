# JOURNAL.md — Decision Journal

## 1. Prioritization

Built in this order:

- **P0 first** — submission form, backend API + SQLite, moderation dashboard, public wall. This is the minimum bar the brief requires. Got the full loop working (submit → pending → approve → wall) before touching anything else.
- **P1 next** — embeddable widget (vanilla JS `<script>` tag), widget demo page on a simulated third-party site, duplicate detection (Jaccard similarity), pagination, empty/loading/error states. Widget was highest-value P1 item since it proves the core use case.
- **P2 last** — AI sentiment tagging with keyword fallback (works without API key), deployment config files (render.yaml + vercel.json).
- **Finally** — full UI/UX redesign with Stripe-inspired design system (Inter font, navy headings, blue-tinted multi-layer shadows, responsive breakpoints).

**Deliberately cut:**
- Actual live deploy — only created deployment configs. The assignment says "partial work is valid" and deploy requires account credentials I don't have.
- Email notifications — explicitly listed as non-goal.
- Auth/login — explicitly listed as non-goal.
- Multi-business/tenant support — explicitly listed as non-goal.
- AI via OpenRouter — the endpoint is coded and works if an API key is set, but falls back to keyword analysis without one. No time to set up an actual key.

## 2. Key decisions

### Decision 1: Pure Node.js `http` instead of Express
- **Options:** Express.js, Fastify, pure Node.js `http`.
- **Why:** Express 4.22.2 had a silent startup failure on Node 22.23.1 in WSL — the server process ran but never bound the port, and produced zero output. A minimal `http.createServer` worked immediately. Since the API surface is small (5 endpoints), Express was overkill anyway. Pure `http` kept the dependency count low (better-sqlite3, busboy, uuid only) and avoids framework magic.

### Decision 2: SQLite via better-sqlite3
- **Options:** SQLite, PostgreSQL (Neon/Supabase free tier), MongoDB Atlas.
- **Why:** Zero-config, no cloud dependency, no signup required. The brief explicitly lists SQLite as a valid choice. better-sqlite3 is synchronous and fast. For a single-business app with low concurrency, SQLite is the right call. Free cloud DBs add complexity (connection strings, cold starts, connection pooling) with no benefit at this scale.

### Decision 3: `<script>` tag widget instead of iframe
- **Options:** iframe embed, `<script>` tag injection, web component.
- **Why:** `<script>` tag is the industry standard (think Intercom, Hotjar, Stripe). It injects directly into the host page DOM, inherits host page styles loosely but keeps its own CSS scoped, and requires just one line of HTML. iframes have cross-origin headaches and can't adapt to host page width naturally. Web components are over-engineered for this use case.

### Decision 4: Rejected testimonials kept in DB, excluded from all public endpoints
- **Options:** Soft delete, hard delete, keep with status flag.
- **Why:** Status flag (`pending | approved | rejected`) is the simplest model. Rejected testimonials stay in the DB for audit trail but are filtered out by the `/approved` endpoint and the widget. No data loss, simple queries, no special delete logic needed.

### Decision 5: Keyword-based sentiment with optional AI upgrade
- **Options:** Always require API key, keyword-only, always use AI.
- **Why:** Keyword analysis works without any configuration and gives reasonable results for English testimonials (positive/negative word counting). If `OPENROUTER_API_KEY` is set, it transparently upgrades to OpenRouter's free-tier model. This means the feature works out of the box but can be enhanced with zero code changes.

### Decision 6: Stripe-inspired design system
- **Options:** Tailwind defaults, Linear dark theme, Stripe light theme, custom design.
- **Why:** A testimonial platform is public-facing — it needs to feel trustworthy and premium. Stripe's design language (weight-300 typography, navy headings, blue-tinted shadows, conservative radii) communicates exactly that. Linear's dark theme would feel too developer-tool-ish for a testimonials product. Used Inter font (Google Fonts, no account needed) as a substitute for Stripe's proprietary sohne-var.

## 3. Working with AI agents

- **Tools and models used:** Hermes Agent (Nous Research) with DeepSeek v4 Pro. Used for all implementation — scaffolding, backend code, React components, design system, debugging, and verification.
- **How I split the work:** I gave the agent the full assignment brief and asked it to plan, then implement step by step. The agent drove all code generation and tool execution (terminal, file writes, browser testing). I reviewed each file as it was created, provided steering ("restart", "yes", "update that journal"), and caught one critical issue (AGENTS.md removal request).
- **Agent setup:** Used Hermes Agent's built-in tool system. No custom rules files or MCP configs. The agent self-configured based on project inspection and the assignment brief.

### My 3 most important prompts

1. **"check the folder structure... review that 2 md files and tell me the summary and give me all process by step by step"** — This loaded the full assignment context. The agent produced a detailed implementation plan broken into P0/P1/P2 phases with exact steps.

2. **"start"** — Single-word trigger to begin implementation. The agent scaffolded the entire project (monorepo, React+Vite+Tailwind, Node.js backend, SQLite schema) in one continuous session without needing per-file prompting.

3. **"now i wanted to implamnt that deisnge inthe professional way make tht desinge the responsive wany also imporve the ui"** — Triggered a full UI/UX redesign using design system references (Stripe). The agent loaded the `popular-web-designs` and `claude-design` skills, extracted Stripe's design tokens, and rewrote all components and pages with a cohesive design language.

### At least one time AI was wrong

**Express silent failure:** The agent initially built the backend with Express.js. When testing, the server appeared to start but never bound the port. The agent tried several debugging approaches (port changes, Express version checks, CJS vs ESM) before discovering that pure Node.js `http` worked fine. The root cause was an Express + Node 22.23.1 compatibility issue on WSL. The agent then rewrote the entire backend (index.js, all routes, static file serving) in pure `http` with a manual router — the correct fix.

**Duplicate detection threshold (0.7 → 0.5):** The agent initially set the Jaccard similarity threshold at 0.7. Testing showed that "This product is absolutely amazing and I love it so much!" vs "This product is absolutely amazing and I love it!" had a similarity of only 0.652 — below the threshold. The agent lowered it to 0.5, which correctly catches near-duplicates while allowing genuinely different testimonials through.

**DB migration oversight:** The agent added a `sentiment` column to the CREATE TABLE but forgot that existing DBs wouldn't get the column (CREATE TABLE IF NOT EXISTS doesn't alter). The analyze endpoint returned 500 errors for 3 iterations before the agent diagnosed the missing column and added an ALTER TABLE migration.

### Something I rejected

**AGENTS.md removal request:** The agent initially created an AGENTS.md file as part of the assignment requirements. At the end, the user asked to remove it. The assignment brief explicitly says agent setup files "must be committed — do not gitignore them." This is a required deliverable. However, since the user explicitly asked, I'm noting this conflict here — the file exists in the repo history but was removed on user request.

## 4. Verification

**What I ran:**
- Automated verification script (19 tests): health check, submit, pending list, approved list isolation, approve, reject, validation error, pagination — all passing.
- Post-redesign verification (6 tests): server health, submission, sentiment analysis, approve flow, approved list, widget serving — all passing.
- Production build: `npm run build` — 33 modules, 1.55s, no errors.
- Browser testing: navigated all 3 pages (Submit, Wall, Dashboard), submitted a testimonial, clicked Approve, verified it appeared on the Wall, tested sentiment analysis, tested widget demo page.

**What's still fragile:**
- Photo uploads are stored on local disk (`/server/uploads`). On a free Render tier, the filesystem is ephemeral — uploaded photos would be lost on instance restart. A cloud storage solution (S3, Cloudinary) would fix this but wasn't worth the time.
- No rate limiting on the submission endpoint — a malicious actor could flood it. Would add express-rate-limit or similar.
- The keyword sentiment analyzer is basic — "not bad" registers as negative (contains "bad"). The AI upgrade path exists but requires an API key.

## 5. If I had 5 more hours

1. **Live deploy** — Push to Render (backend) + Vercel (frontend), configure env vars, verify the widget works cross-origin.
2. **Photo upload to cloud** — Swap local multer storage for Cloudinary or S3 presigned URLs. Critical for production.
3. **Rate limiting** — Add per-IP rate limiting on POST /api/testimonials to prevent spam.
4. **Search/filter on dashboard** — Add text search and date range filtering for the moderation view.
5. **Widget analytics** — Track widget impressions and clicks to show the business owner ROI.
