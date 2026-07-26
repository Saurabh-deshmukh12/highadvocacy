import { useState } from 'react'
import StarInput from '../components/StarInput.jsx'
import { submitTestimonial } from '../lib/api.js'

const INITIAL = { name: '', email: '', company: '', text: '', rating: 0, photo: null }

export default function SubmissionForm() {
  const [form, setForm] = useState(INITIAL)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (error) setError('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!form.name.trim() || !form.email.trim() || !form.text.trim() || form.rating === 0) {
      setError('Please fill in all required fields and select a rating.')
      return
    }

    setSubmitting(true)
    try {
      const fd = new FormData()
      fd.append('name', form.name.trim())
      fd.append('email', form.email.trim())
      fd.append('company', form.company.trim())
      fd.append('text', form.text.trim())
      fd.append('rating', form.rating)
      if (form.photo) fd.append('photo', form.photo)

      await submitTestimonial(fd)
      setSuccess(true)
      setForm(INITIAL)
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  // Success state
  if (success) {
    return (
      <div className="max-w-md mx-auto text-center py-12 sm:py-16">
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <svg className="w-8 h-8 sm:w-10 sm:h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-navy-900 mb-2 tracking-tight">
          Thank you for sharing!
        </h2>
        <p className="text-sm sm:text-[15px] text-slate-500 mb-8 leading-relaxed">
          Your testimonial has been submitted and is pending review. It will appear on our wall once approved.
        </p>
        <button
          onClick={() => setSuccess(false)}
          className="inline-flex items-center px-5 py-2.5 bg-purple-600 text-white text-sm font-medium rounded-md
            hover:bg-purple-700 transition-colors duration-150
            shadow-[0_1px_2px_rgba(50,50,93,0.08)]"
        >
          Submit another
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto">
      {/* Hero */}
      <div className="text-center mb-8 sm:mb-10">
        <h1 className="text-xl sm:text-2xl font-bold text-navy-900 tracking-tight">
          Share Your Experience
        </h1>
        <p className="text-sm sm:text-[15px] text-slate-500 mt-1.5">
          We'd love to hear what you think
        </p>
      </div>

      {/* Form Card */}
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-lg border border-slate-100 p-5 sm:p-8
          shadow-[0_1px_2px_rgba(50,50,93,0.08),0_2px_8px_rgba(50,50,93,0.06)]"
      >
        {/* Error Banner */}
        {error && (
          <div className="mb-5 bg-red-50 border border-red-100 text-red-500 px-4 py-3 rounded-md text-sm">
            {error}
          </div>
        )}

        <div className="space-y-5">
          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-[13px] sm:text-sm font-medium text-navy-900 mb-1.5">
              Full name <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              type="text"
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
              className="w-full px-3 py-2 sm:py-2.5 text-sm border border-slate-200 rounded-md
                placeholder:text-slate-400 text-navy-900
                focus:border-purple-400 focus:ring-0
                transition-colors duration-150"
              placeholder="Jane Smith"
              maxLength={100}
              required
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-[13px] sm:text-sm font-medium text-navy-900 mb-1.5">
              Email address <span className="text-red-500">*</span>
            </label>
            <input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => update('email', e.target.value)}
              className="w-full px-3 py-2 sm:py-2.5 text-sm border border-slate-200 rounded-md
                placeholder:text-slate-400 text-navy-900
                focus:border-purple-400 focus:ring-0
                transition-colors duration-150"
              placeholder="jane@example.com"
              maxLength={200}
              required
            />
          </div>

          {/* Company */}
          <div>
            <label htmlFor="company" className="block text-[13px] sm:text-sm font-medium text-navy-900 mb-1.5">
              Company <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <input
              id="company"
              type="text"
              value={form.company}
              onChange={(e) => update('company', e.target.value)}
              className="w-full px-3 py-2 sm:py-2.5 text-sm border border-slate-200 rounded-md
                placeholder:text-slate-400 text-navy-900
                focus:border-purple-400 focus:ring-0
                transition-colors duration-150"
              placeholder="Acme Inc."
              maxLength={200}
            />
          </div>

          {/* Rating */}
          <div>
            <label className="block text-[13px] sm:text-sm font-medium text-navy-900 mb-2">
              Your rating <span className="text-red-500">*</span>
            </label>
            <StarInput value={form.rating} onChange={(v) => update('rating', v)} />
          </div>

          {/* Text */}
          <div>
            <label htmlFor="text" className="block text-[13px] sm:text-sm font-medium text-navy-900 mb-1.5">
              Your testimonial <span className="text-red-500">*</span>
            </label>
            <textarea
              id="text"
              rows={4}
              value={form.text}
              onChange={(e) => update('text', e.target.value)}
              className="w-full px-3 py-2 sm:py-2.5 text-sm border border-slate-200 rounded-md
                placeholder:text-slate-400 text-navy-900 resize-y
                focus:border-purple-400 focus:ring-0
                transition-colors duration-150"
              placeholder="Tell us about your experience..."
              maxLength={2000}
              required
            />
            <p className="text-[11px] sm:text-xs text-slate-400 mt-1.5 tabular-nums">
              {form.text.length}/2,000 characters
            </p>
          </div>

          {/* Photo */}
          <div>
            <label htmlFor="photo" className="block text-[13px] sm:text-sm font-medium text-navy-900 mb-1.5">
              Photo <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <input
              id="photo"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={(e) => update('photo', e.target.files?.[0] || null)}
              className="w-full text-sm text-slate-500
                file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0
                file:text-sm file:font-medium file:bg-purple-50 file:text-purple-600
                hover:file:bg-purple-100 file:cursor-pointer file:transition-colors"
            />
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full mt-7 py-2.5 sm:py-3 bg-purple-600 text-white text-sm font-medium rounded-md
            hover:bg-purple-700 active:bg-purple-800
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-colors duration-150
            shadow-[0_1px_2px_rgba(50,50,93,0.08)]"
        >
          {submitting ? (
            <span className="inline-flex items-center gap-2">
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Submitting...
            </span>
          ) : (
            'Submit Testimonial'
          )}
        </button>
      </form>
    </div>
  )
}
