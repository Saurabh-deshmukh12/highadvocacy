import StarRating from './StarRating'

const SENTIMENT_CONFIG = {
  positive: { bg: 'bg-green-100', text: 'text-green-500', label: 'Positive', dot: 'bg-green-500' },
  negative: { bg: 'bg-red-50', text: 'text-red-500', label: 'Negative', dot: 'bg-red-500' },
  neutral: { bg: 'bg-slate-100', text: 'text-slate-500', label: 'Neutral', dot: 'bg-slate-400' },
}

export default function TestimonialCard({ testimonial, showSentiment = true }) {
  const { name, company, text, rating, photo_url, created_at, sentiment } = testimonial
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const sentCfg = SENTIMENT_CONFIG[sentiment]

  return (
    <article className="group bg-white rounded-lg border border-slate-100 p-5 sm:p-6
      shadow-[0_1px_2px_rgba(50,50,93,0.08),0_2px_8px_rgba(50,50,93,0.06)]
      hover:shadow-[rgba(50,50,93,0.25)_0px_30px_45px_-30px,rgba(0,0,0,0.1)_0px_18px_36px_-18px]
      transition-shadow duration-300 ease-out">

      {/* Header */}
      <div className="flex items-start gap-3 sm:gap-4 mb-4">
        {/* Avatar */}
        {photo_url ? (
          <img
            src={photo_url}
            alt={name}
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover shrink-0 ring-2 ring-slate-100"
            loading="lazy"
          />
        ) : (
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-purple-600 text-white flex items-center justify-center text-sm sm:text-base font-semibold shrink-0">
            {initials}
          </div>
        )}

        {/* Name + Company + Stars */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center flex-wrap gap-x-2 gap-y-0.5">
            <h3 className="font-semibold text-navy-900 text-sm sm:text-base truncate">{name}</h3>
            {showSentiment && sentCfg && (
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] sm:text-xs font-medium ${sentCfg.bg} ${sentCfg.text}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${sentCfg.dot}`} />
                {sentCfg.label}
              </span>
            )}
          </div>
          {company && (
            <p className="text-xs sm:text-sm text-slate-500 truncate mt-0.5">{company}</p>
          )}
          <div className="mt-1">
            <StarRating rating={rating} size="sm" />
          </div>
        </div>

        {/* Date */}
        <time className="text-[11px] sm:text-xs text-slate-400 shrink-0 mt-0.5 tabular-nums">
          {new Date(created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </time>
      </div>

      {/* Body */}
      <p className="text-sm sm:text-[15px] text-slate-500 leading-relaxed whitespace-pre-wrap">
        {text}
      </p>
    </article>
  )
}
