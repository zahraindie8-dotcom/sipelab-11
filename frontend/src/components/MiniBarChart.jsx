/**
 * MiniBarChart — Komponen grafik mini untuk widget dashboard.
 * Menampilkan trend data dalam bentuk bar kecil.
 *
 * Props:
 * - data: array of number (values, max 7 items)
 * - color: string (Tailwind class, default: 'bg-brand-500')
 * - height: number (default: 32)
 */

export default function MiniBarChart({ data = [], color = 'bg-brand-500', height = 32 }) {
  if (!data.length) return null

  const max = Math.max(...data, 1)

  return (
    <div className="flex items-end gap-0.5" style={{ height }}>
      {data.slice(-7).map((value, i) => (
        <div
          key={i}
          className={`flex-1 rounded-t-sm transition-all duration-300 ${color}`}
          style={{
            height: `${Math.max((value / max) * 100, value > 0 ? 10 : 0)}%`,
            minHeight: value > 0 ? '2px' : '0',
          }}
        />
      ))}
    </div>
  )
}
