import { useState, useEffect, useCallback } from 'react'
import { fetchApprovedTestimonials } from '../lib/api.js'
import TestimonialCard from '../components/TestimonialCard.jsx'
import Spinner from '../components/Spinner.jsx'

export default function Wall() {
  const [data, setData] = useState({ testimonials: [], total: 0, page: 1 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async (page = 1) => {
    setLoading(true)
    setError('')
    try {
      const result = await fetchApprovedTestimonials({ page })
      setData(result)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  return (
    <div>
      {/* Hero */}
      <div className="text-center mb-8 sm:mb-12">
        <h1 className="text-xl sm:text-2xl font-bold text-navy-900 tracking-tight">
          What People Are Saying
        </h1>
        <p className="text-sm sm:text-[15px] text-slate-500 mt-1.5 max-w-md mx-auto leading-relaxed">
          Real feedback from real customers who use our platform every day
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-100 text-red-500 px-4 py-3 rounded-md text-sm">
          {error}
        </div>
      )}

      {/* Content */}
      {loading ? (
        <Spinner />
      ) : data.testimonials.length === 0 ? (
        <div className="text-center py-16 sm:py-20 bg-white rounded-lg border border-slate-100
          shadow-[0_1px_2px_rgba(50,50,93,0.08)]">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <p className="text-base sm:text-lg font-medium text-navy-900">No testimonials yet</p>
          <p className="text-sm text-slate-400 mt-1">Be the first to share your experience!</p>
        </div>
      ) : (
        <>
          {/* Grid */}
          <div className="grid gap-4 sm:gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {data.testimonials.map((t) => (
              <TestimonialCard key={t.id} testimonial={t} />
            ))}
          </div>

          {/* Pagination */}
          {data.total > data.limit && (
            <div className="flex items-center justify-center gap-4 mt-8 sm:mt-10">
              <button
                disabled={data.page <= 1}
                onClick={() => load(data.page - 1)}
                className="px-4 py-2 text-xs sm:text-sm font-medium border border-slate-200 rounded-md
                  hover:bg-slate-50 disabled:opacity-30 transition-colors duration-150
                  text-navy-900"
              >
                ← Previous
              </button>
              <span className="text-xs sm:text-sm text-slate-500 tabular-nums">
                Page {data.page} of {Math.ceil(data.total / data.limit)}
              </span>
              <button
                disabled={data.page >= Math.ceil(data.total / data.limit)}
                onClick={() => load(data.page + 1)}
                className="px-4 py-2 text-xs sm:text-sm font-medium border border-slate-200 rounded-md
                  hover:bg-slate-50 disabled:opacity-30 transition-colors duration-150
                  text-navy-900"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
