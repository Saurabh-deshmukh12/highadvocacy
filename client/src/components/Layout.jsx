import { Outlet, Link, useLocation } from 'react-router-dom'

export default function Layout() {
  const location = useLocation()

  const tabs = [
    { path: '/', label: 'Submit' },
    { path: '/wall', label: 'Wall' },
    { path: '/dashboard', label: 'Dashboard' },
  ]

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header — Stripe-inspired sticky nav */}
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-xl border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 group"
          >
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-md bg-purple-600 flex items-center justify-center">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <span className="text-[15px] sm:text-base font-semibold text-navy-900 tracking-tight">
              HighAdvocacy
            </span>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-0.5">
            {tabs.map((tab) => {
              const isActive = location.pathname === tab.path
              return (
                <Link
                  key={tab.path}
                  to={tab.path}
                  className={`relative px-3 py-2 text-[13px] sm:text-sm font-medium rounded-md transition-colors duration-150 ${
                    isActive
                      ? 'text-purple-600 bg-purple-50'
                      : 'text-slate-500 hover:text-navy-900 hover:bg-slate-50'
                  }`}
                >
                  {tab.label}
                </Link>
              )
            })}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <p className="text-center text-xs sm:text-sm text-slate-400">
            Powered by <span className="font-semibold text-purple-600">HighAdvocacy</span>
          </p>
        </div>
      </footer>
    </div>
  )
}
