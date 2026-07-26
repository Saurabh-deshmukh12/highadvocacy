export default function Spinner({ size = 'md' }) {
  const sizeMap = { sm: 'w-4 h-4 border-2', md: 'w-8 h-8 border-[3px]', lg: 'w-12 h-12 border-4' }
  return (
    <div className="flex items-center justify-center py-16">
      <div
        className={`${sizeMap[size]} border-slate-200 border-t-purple-600 rounded-full animate-spin`}
      />
    </div>
  )
}
