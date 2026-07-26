const API_BASE = import.meta.env.VITE_API_URL || '/api'

export async function submitTestimonial(formData) {
  const res = await fetch(`${API_BASE}/testimonials`, {
    method: 'POST',
    body: formData,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Submission failed' }))
    throw new Error(err.error || 'Submission failed')
  }
  return res.json()
}

export async function fetchTestimonials({ status, page = 1, limit = 20 } = {}) {
  const params = new URLSearchParams({ page, limit })
  if (status) params.set('status', status)
  const res = await fetch(`${API_BASE}/testimonials?${params}`)
  if (!res.ok) throw new Error('Failed to load testimonials')
  return res.json()
}

export async function fetchApprovedTestimonials({ page = 1, limit = 12 } = {}) {
  const params = new URLSearchParams({ page, limit })
  const res = await fetch(`${API_BASE}/testimonials/approved?${params}`)
  if (!res.ok) throw new Error('Failed to load testimonials')
  return res.json()
}

export async function updateTestimonialStatus(id, status) {
  const res = await fetch(`${API_BASE}/testimonials/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Update failed' }))
    throw new Error(err.error || 'Update failed')
  }
  return res.json()
}

export async function analyzeSentiment(id) {
  const res = await fetch(`${API_BASE}/testimonials/${id}/analyze`, {
    method: 'POST',
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Analysis failed' }))
    throw new Error(err.error || 'Analysis failed')
  }
  return res.json()
}
