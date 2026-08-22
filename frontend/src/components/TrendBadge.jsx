/**
 * TrendBadge — Badge untuk menampilkan tren perubahan (naik/turun).
 *
 * Props:
 * - value: number (persentase perubahan, bisa negatif)
 * - suffix: string (opsional, default '%')
 */

export default function TrendBadge({ value, suffix = '%' }) {
  if (value === 0 || value === null || value === undefined) return null

  const isPositive = value > 0
  const isNegative = value < 0

  return (
    <span
      className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-semibold ${
        isPositive
          ? 'bg-emerald-50 text-emerald-600'
          : isNegative
            ? 'bg-rose-50 text-rose-600'
            : 'bg-slate-50 text-slate-500'
      }`}
    >
      {isPositive && (
        <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M18 15l-6-6-6 6" />
        </svg>
      )}
      {isNegative && (
        <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M6 9l6 6 6-6" />
        </svg>
      )}
      {Math.abs(value)}{suffix}
    </span>
  )
}
