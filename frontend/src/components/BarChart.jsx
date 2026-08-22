/**
 * BarChart — Komponen grafik batang berbasis CSS murni (tanpa library).
 *
 * Props:
 * - data: array of { label, value, color? }
 * - maxValue: number (opsional, default: max dari data)
 * - height: number (tinggi container dalam px, default: 200)
 * - showValues: boolean (tampilkan angka di atas bar, default: true)
 * - barColor: string (warna default bar, default: 'bg-brand-500')
 * - orientation: 'vertical' | 'horizontal' (default: 'vertical')
 */

export default function BarChart({
  data = [],
  maxValue,
  height = 200,
  showValues = true,
  barColor = 'bg-brand-500',
  orientation = 'vertical',
}) {
  if (!data.length) {
    return (
      <div className="flex h-32 items-center justify-center text-sm text-slate-400">
        Tidak ada data untuk ditampilkan.
      </div>
    )
  }

  const max = maxValue || Math.max(...data.map((d) => d.value), 1)

  if (orientation === 'horizontal') {
    return (
      <div className="space-y-2">
        {data.map((item, i) => (
          <div key={i} className="flex items-center gap-3">
            <span className="w-24 shrink-0 truncate text-right text-xs font-medium text-slate-600">
              {item.label}
            </span>
            <div className="relative h-6 flex-1 overflow-hidden rounded-full bg-slate-100">
              <div
                className={`absolute inset-y-0 left-0 rounded-full transition-all duration-700 ease-out ${item.color || barColor}`}
                style={{ width: `${Math.max((item.value / max) * 100, 2)}%` }}
              />
            </div>
            {showValues && (
              <span className="w-8 shrink-0 text-xs font-bold text-slate-600">{item.value}</span>
            )}
          </div>
        ))}
      </div>
    )
  }

  // Vertical orientation
  return (
    <div className="flex items-end gap-1.5" style={{ height }}>
      {data.map((item, i) => (
        <div key={i} className="group flex flex-1 flex-col items-center gap-1">
          {/* Value label */}
          {showValues && (
            <span className="text-[10px] font-bold text-slate-500 opacity-0 transition-opacity group-hover:opacity-100">
              {item.value}
            </span>
          )}
          {/* Bar */}
          <div
            className={`w-full rounded-t-sm transition-all duration-500 ease-out hover:opacity-80 ${item.color || barColor}`}
            style={{
              height: `${Math.max((item.value / max) * 100, item.value > 0 ? 4 : 0)}%`,
              minHeight: item.value > 0 ? '4px' : '0',
            }}
          />
          {/* Label */}
          <span className="w-full truncate text-center text-[10px] text-slate-400">
            {item.label}
          </span>
        </div>
      ))}
    </div>
  )
}
