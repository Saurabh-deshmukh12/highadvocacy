import http from 'http'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { v4 as uuidv4 } from 'uuid'
import Busboy from 'busboy'
import db from './db.js'
import { analyzeSentiment } from './sentiment.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const UPLOADS_DIR = path.join(__dirname, '..', 'uploads')
const PORT = process.env.PORT || 3099

// --- Helpers ---

// Simple Jaccard similarity on word bigrams (0-1 scale)
function textSimilarity(a, b) {
  const bigrams = (s) => {
    const words = s.toLowerCase().split(/\s+/).filter(Boolean)
    const set = new Set()
    for (let i = 0; i < words.length - 1; i++) {
      set.add(words[i] + ' ' + words[i + 1])
    }
    // Also include single words for short texts
    for (const w of words) set.add(w)
    return set
  }
  const setA = bigrams(a)
  const setB = bigrams(b)
  if (setA.size === 0 && setB.size === 0) return 1
  const intersection = new Set([...setA].filter(x => setB.has(x)))
  const union = new Set([...setA, ...setB])
  return intersection.size / union.size
}

function sendJSON(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' })
  res.end(JSON.stringify(data))
}

function parseJSON(req) {
  return new Promise((resolve, reject) => {
    let body = ''
    req.on('data', (chunk) => (body += chunk))
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {})
      } catch (e) {
        reject(new Error('Invalid JSON'))
      }
    })
    req.on('error', reject)
  })
}

function parseMultipart(req) {
  return new Promise((resolve, reject) => {
    const busboy = Busboy({ headers: req.headers, limits: { fileSize: 5 * 1024 * 1024 } })
    const fields = {}
    let photoFile = null

    busboy.on('field', (name, val) => {
      fields[name] = val
    })

    busboy.on('file', (name, file, info) => {
      const { filename, mimeType } = info
      const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
      if (!allowed.includes(mimeType)) {
        file.resume()
        return
      }
      const ext = path.extname(filename) || '.jpg'
      const savedName = `${uuidv4()}${ext}`
      const savePath = path.join(UPLOADS_DIR, savedName)
      const writeStream = fs.createWriteStream(savePath)
      file.pipe(writeStream)
      photoFile = `/uploads/${savedName}`

      writeStream.on('error', (e) => {
        file.resume()
        reject(e)
      })
    })

    busboy.on('finish', () => resolve({ fields, photoFile }))
    busboy.on('error', reject)

    req.pipe(busboy)
  })
}

function serveStatic(req, res, urlPath, baseDir) {
  const filePath = path.join(baseDir, path.basename(urlPath))
  // Security: ensure the resolved path stays within baseDir
  if (!filePath.startsWith(baseDir)) {
    res.writeHead(403)
    res.end('Forbidden')
    return
  }
  const ext = path.extname(filePath).toLowerCase()
  const mimeTypes = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
  }
  const contentType = mimeTypes[ext] || 'application/octet-stream'

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404)
      res.end('Not found')
      return
    }
    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=86400',
      'Access-Control-Allow-Origin': '*',
    })
    res.end(data)
  })
}

// --- Route handlers ---

async function handleCreateTestimonial(req, res) {
  try {
    const { fields, photoFile } = await parseMultipart(req)
    const { name, email, company, text, rating } = fields

    if (!name || !email || !text || !rating) {
      return sendJSON(res, 400, { error: 'name, email, text, and rating are required' })
    }

    const ratingNum = parseInt(rating, 10)
    if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return sendJSON(res, 400, { error: 'rating must be between 1 and 5' })
    }

    const trimmedText = text.trim()
    const trimmedEmail = email.trim()

    // Duplicate detection: same email + similar text within the last 24 hours
    const recent = db.prepare(`
      SELECT id, text FROM testimonials
      WHERE email = ? AND created_at > datetime('now', '-1 day')
    `).all(trimmedEmail)

    for (const row of recent) {
      const similarity = textSimilarity(trimmedText, row.text)
      if (similarity > 0.5) {
        return sendJSON(res, 409, { error: 'A similar testimonial from this email was already submitted recently.' })
      }
    }

    const id = uuidv4()
    db.prepare(
      'INSERT INTO testimonials (id, name, email, company, text, rating, photo_url) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).run(id, name.trim(), trimmedEmail, (company || '').trim(), trimmedText, ratingNum, photoFile)

    const testimonial = db.prepare('SELECT * FROM testimonials WHERE id = ?').get(id)
    sendJSON(res, 201, testimonial)

    // Fire-and-forget sentiment analysis (non-blocking)
    analyzeSentiment(trimmedText).then(sentiment => {
      if (sentiment) {
        db.prepare('UPDATE testimonials SET sentiment = ? WHERE id = ?').run(sentiment, id)
      }
    }).catch(() => {})
  } catch (err) {
    console.error('Error creating testimonial:', err)
    sendJSON(res, 500, { error: 'Failed to submit testimonial' })
  }
}

function handleListTestimonials(_req, res, query) {
  try {
    const status = query.get('status')
    const page = parseInt(query.get('page') || '1', 10)
    const limit = parseInt(query.get('limit') || '20', 10)
    const offset = (page - 1) * limit

    let rows, total

    if (status && ['pending', 'approved', 'rejected'].includes(status)) {
      rows = db.prepare(
        'SELECT * FROM testimonials WHERE status = ? ORDER BY created_at DESC LIMIT ? OFFSET ?'
      ).all(status, limit, offset)
      total = db.prepare('SELECT COUNT(*) as total FROM testimonials WHERE status = ?').get(status).total
    } else {
      rows = db.prepare(
        'SELECT * FROM testimonials ORDER BY created_at DESC LIMIT ? OFFSET ?'
      ).all(limit, offset)
      total = db.prepare('SELECT COUNT(*) as total FROM testimonials').get().total
    }

    sendJSON(res, 200, { testimonials: rows, total, page, limit })
  } catch (err) {
    console.error('Error fetching testimonials:', err)
    sendJSON(res, 500, { error: 'Failed to fetch testimonials' })
  }
}

function handleListApproved(_req, res, query) {
  try {
    const page = parseInt(query.get('page') || '1', 10)
    const limit = parseInt(query.get('limit') || '12', 10)
    const offset = (page - 1) * limit

    const rows = db.prepare(
      "SELECT * FROM testimonials WHERE status = 'approved' ORDER BY created_at DESC LIMIT ? OFFSET ?"
    ).all(limit, offset)

    const total = db.prepare(
      "SELECT COUNT(*) as total FROM testimonials WHERE status = 'approved'"
    ).get().total

    sendJSON(res, 200, { testimonials: rows, total, page, limit })
  } catch (err) {
    console.error('Error fetching approved testimonials:', err)
    sendJSON(res, 500, { error: 'Failed to fetch testimonials' })
  }
}

async function handleUpdateTestimonial(req, res, id) {
  try {
    const body = await parseJSON(req)
    const { status } = body

    if (!status || !['approved', 'rejected'].includes(status)) {
      return sendJSON(res, 400, { error: "status must be 'approved' or 'rejected'" })
    }

    const existing = db.prepare('SELECT * FROM testimonials WHERE id = ?').get(id)
    if (!existing) {
      return sendJSON(res, 404, { error: 'Testimonial not found' })
    }

    db.prepare("UPDATE testimonials SET status = ?, updated_at = datetime('now') WHERE id = ?").run(status, id)
    const updated = db.prepare('SELECT * FROM testimonials WHERE id = ?').get(id)
    sendJSON(res, 200, updated)
  } catch (err) {
    console.error('Error updating testimonial:', err)
    sendJSON(res, 500, { error: 'Failed to update testimonial' })
  }
}

async function handleAnalyzeSentiment(_req, res, id) {
  try {
    const existing = db.prepare('SELECT * FROM testimonials WHERE id = ?').get(id)
    if (!existing) {
      return sendJSON(res, 404, { error: 'Testimonial not found' })
    }

    const sentiment = await analyzeSentiment(existing.text)
    if (sentiment) {
      db.prepare('UPDATE testimonials SET sentiment = ? WHERE id = ?').run(sentiment, id)
    }

    const updated = db.prepare('SELECT * FROM testimonials WHERE id = ?').get(id)
    sendJSON(res, 200, updated)
  } catch (err) {
    console.error('Error analyzing sentiment:', err)
    sendJSON(res, 500, { error: 'Failed to analyze sentiment' })
  }
}

// --- Router ---

const server = http.createServer((req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    res.writeHead(204)
    res.end()
    return
  }

  const url = new URL(req.url, `http://localhost:${PORT}`)
  const pathname = url.pathname

  const uploadsDir = path.join(__dirname, '..', 'uploads')
  const publicDir = path.join(__dirname, '..', 'public')

  // Static files: /uploads/*
  if (pathname.startsWith('/uploads/')) {
    return serveStatic(req, res, pathname, uploadsDir)
  }

  // Static files: /public/*
  if (pathname.startsWith('/public/')) {
    return serveStatic(req, res, pathname, publicDir)
  }

  // Health check
  if (req.method === 'GET' && pathname === '/api/health') {
    return sendJSON(res, 200, { status: 'ok' })
  }

  // POST /api/testimonials
  if (req.method === 'POST' && pathname === '/api/testimonials') {
    return handleCreateTestimonial(req, res)
  }

  // GET /api/testimonials/approved (must be before /api/testimonials/:id)
  if (req.method === 'GET' && pathname === '/api/testimonials/approved') {
    return handleListApproved(req, res, url.searchParams)
  }

  // GET /api/testimonials
  if (req.method === 'GET' && pathname === '/api/testimonials') {
    return handleListTestimonials(req, res, url.searchParams)
  }

  // PATCH /api/testimonials/:id
  const patchMatch = pathname.match(/^\/api\/testimonials\/([a-f0-9-]+)$/)
  if (req.method === 'PATCH' && patchMatch) {
    return handleUpdateTestimonial(req, res, patchMatch[1])
  }

  // POST /api/testimonials/:id/analyze
  const analyzeMatch = pathname.match(/^\/api\/testimonials\/([a-f0-9-]+)\/analyze$/)
  if (req.method === 'POST' && analyzeMatch) {
    return handleAnalyzeSentiment(req, res, analyzeMatch[1])
  }

  // 404
  sendJSON(res, 404, { error: 'Not found' })
})

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
