import { useState, useEffect, useCallback } from 'react'
import { fetchTestimonials, updateTestimonialStatus, analyzeSentiment } from '../lib/api.js'
import StarRating from '../components/StarRating.jsx'
import Spinner from '../components/Spinner.jsx'

const SENTIMENT_PILL = {
  positive: 'bg-green-100 text-green-500 border-green-200',
  negative: 'bg-red-50 text-red-500 border-red-100',
  neutral: 'bg-slate-100 text-slate-500 border-slate-200',
}

export default function Dashboard() {
  const [filter, setFilter] = useState('pending')
  const [data, setData] = useState({ testimonials: [], total: 0, page: 1 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updating, setUpdating] = useState(null)

  const load = useCallback(async (status, page = 1) => {
    setLoading(true)
    setError('')
    try {
      const result = await fetchTestimonials({ status, page })
      setData(result)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load(filter) }, [filter, load])

  async function handleAction(id, status) {
    setUpdating(id + ':action')
    try {
      await updateTestimonialStatus(id, status)
      setData((prev) => ({
        ...prev,
        testimonials: prev.testimonials.map((t) =>
          t.id === id ? { ...t, status, updated_at: new Date().toISOString() } : t
        ),
      }))
    } catch (err) {
      setError(err.message)
    } finally {
      setUpdating(null)
    }
  }

  async function handleAnalyze(id) {
    setUpdating(id + ':analyze')
    try {
      const updated = await analyzeSentiment(id)
      setData((prev) => ({
        ...prev,
        testimonials: prev.testimonials.map((t) => (t.id === id ? updated : t)),
      }))
    } catch (err) {
      setError(err.message)
    } finally {
      setUpdating(null)
    }
  }

  const tabs = [
    { key: 'pending', label: 'Pending', count: null },
    { key: 'approved', label: 'Approved', count: null },
    { key: 'rejected', label: 'Rejected', count: null },
  ]

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-navy-900 tracking-tight">Moderation</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">Review and manage testimonial submissions</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex border-b border-slate-200 mb-6 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`relative px-4 py-3 text-[13px] sm:text-sm font-medium whitespace-nowrap transition-colors duration-150
              ${filter === tab.key
                ? 'text-purple-600'
                : 'text-slate-500 hover:text-navy-900'
              }`}
          >
            {tab.label}
            {filter === tab.key && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600 rounded-full" />
            )}
          </button>
        ))}
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
        <div className="text-center py-16 bg-white rounded-lg border border-slate-100
          shadow-[0_1px_2px_rgba(50,50,93,0.08)]">
          <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
          <p className="text-sm font-medium text-navy-900">No {filter} testimonials</p>
          <p className="text-xs text-slate-400 mt-1">Submissions will appear here for review.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {data.testimonials.map((t) => (
            <div
              key={t.id}
              className="bg-white rounded-lg border border-slate-100 p-4 sm:p-5
                shadow-[0_1px_2px_rgba(50,50,93,0.08)]
                hover:border-slate-200 transition-colors duration-150"
            >
              <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                {/* Info */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center flex-wrap gap-x-2 gap-y-1 mb-1">
                    <span className="font-semibold text-navy-900 text-sm sm:text-base">{t.name}</span>
                    {t.company && <span className="text-xs sm:text-sm text-slate-400">· {t.company}</span>}
                    <StarRating rating={t.rating} size="sm" />
                    {t.sentiment && (
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border ${SENTIMENT_PILL[t.sentiment]}`}>
                        {t.sentiment}
                      </span>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-slate-500 mb-2">{t.email}</p>
                  <p className="text-sm text-slate-600 leading-relaxed line-clamp-3">{t.text}</p>
                  {t.photo_url && (
                    <img src={t.photo_url} alt="" className="mt-2 w-12 h-12 rounded object-cover ring-1 ring-slate-100" loading="lazy" />
                  )}
                  <p className="text-[11px] sm:text-xs text-slate-400 mt-2 tabular-nums">
                    {new Date(t.created_at).toLocaleString()}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex sm:flex-col gap-2 shrink-0 sm:items-end">
                  {/* Analyze button */}
                  {!t.sentiment && (
                    <button
                      onClick={() => handleAnalyze(t.id)}
                      disabled={updating === t.id + ':analyze'}
                      className="px-3 py-1.5 text-xs font-medium text-purple-600 bg-purple-50 border border-purple-200
                        rounded-md hover:bg-purple-100 disabled:opacity-50 transition-colors duration-150"
                    >
                      {updating === t.id + ':analyze' ? '...' : 'Analyze'}
                    </button>
                  )}

                  {/* Approve / Reject */}
                  {t.status === 'pending' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAction(t.id, 'approved')}
                        disabled={updating === t.id + ':action'}
                        className="px-3 py-1.5 bg-green-500 text-white text-xs font-medium rounded-md
                          hover:bg-green-600 disabled:opacity-50 transition-colors duration-150
                          shadow-[0_1px_2px_rgba(50,50,93,0.08)]"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleAction(t.id, 'rejected')}
                        disabled={updating === t.id + ':action'}
                        className="px-3 py-1.5 text-xs font-medium text-red-500 bg-white border border-red-200 rounded-md
                          hover:bg-red-50 disabled:opacity-50 transition-colors duration-150"
                      >
                        Reject
                      </button>
                    </div>
                  )}

                  {/* Status badge for non-pending */}
                  {t.status !== 'pending' && (
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium ${
                      t.status === 'approved'
                        ? 'bg-green-100 text-green-500'
                        : 'bg-red-50 text-red-500'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        t.status === 'approved' ? 'bg-green-500' : 'bg-red-500'
                      }`} />
                      {t.status}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {data.total > data.limit && (
        <div className="flex items-center justify-between mt-6 pt-5 border-t border-slate-200">
          <p className="text-xs sm:text-sm text-slate-500 tabular-nums">
            Showing {(data.page - 1) * data.limit + 1}–{Math.min(data.page * data.limit, data.total)} of {data.total}
          </p>
          <div className="flex gap-2">
            <button
              disabled={data.page <= 1}
              onClick={() => load(filter, data.page - 1)}
              className="px-3 py-1.5 text-xs sm:text-sm font-medium border border-slate-200 rounded-md
                hover:bg-slate-50 disabled:opacity-30 transition-colors duration-150"
            >
              Previous
            </button>
            <button
              disabled={data.page >= Math.ceil(data.total / data.limit)}
              onClick={() => load(filter, data.page + 1)}
              className="px-3 py-1.5 text-xs sm:text-sm font-medium border border-slate-200 rounded-md
                hover:bg-slate-50 disabled:opacity-30 transition-colors duration-150"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
