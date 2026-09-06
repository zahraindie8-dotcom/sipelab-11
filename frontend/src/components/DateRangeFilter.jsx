import { IconFilter } from './icons'

const presets = [
  { label: 'Hari ini', getRange: () => ({ date_from: today(), date_to: today() }) },
  { label: 'Minggu ini', getRange: () => ({ date_from: startOfWeek(), date_to: today() }) },
  { label: 'Bulan ini', getRange: () => ({ date_from: startOfMonth(), date_to: today() }) },
  { label: '3 Bulan', getRange: () => ({ date_from: monthsAgo(3), date_to: today() }) },
  { label: '6 Bulan', getRange: () => ({ date_from: monthsAgo(6), date_to: today() }) },
  { label: '1 Tahun', getRange: () => ({ date_from: monthsAgo(12), date_to: today() }) },
]

function today() {
  return new Date().toISOString().split('T')[0]
}

function startOfWeek() {
  const d = new Date()
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1) // Monday
  d.setDate(diff)
  return d.toISOString().split('T')[0]
}

function startOfMonth() {
  const d = new Date()
  d.setDate(1)
  return d.toISOString().split('T')[0]
}

function monthsAgo(n) {
  const d = new Date()
  d.setMonth(d.getMonth() - n)
  return d.toISOString().split('T')[0]
}

/**
 * DateRangeFilter — Komponen filter tanggal dengan preset cepat.
 *
 * Props:
 * - filters: { date_from, date_to }
 * - onChange: (filters) => void
 * - open: boolean (show/hide)
 * - onToggle: () => void
 */
export default function DateRangeFilter({ filters, onChange, open, onToggle }) {
  const isActive = filters.date_from || filters.date_to

  return (
    <>
      <button
        onClick={onToggle}
        className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold transition ${
          open || isActive
            ? 'bg-brand-100 text-brand-700 ring-1 ring-inset ring-brand-200'
            : 'bg-white text-slate-500 ring-1 ring-inset ring-slate-200 hover:bg-slate-50'
        }`}
      >
        <IconFilter className="h-3.5 w-3.5" />
        Filter
        {isActive && (
          <span className="ml-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand-600 text-[10px] text-white">
            1
          </span>
        )}
      </button>

      {open && (
        <div className="card p-4">
          {/* Quick Presets */}
          <div className="mb-4">
            <label className="label">Preset Cepat</label>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {presets.map((preset) => {
                const range = preset.getRange()
                const isCurrentPreset =
                  filters.date_from === range.date_from && filters.date_to === range.date_to
                return (
                  <button
                    key={preset.label}
                    onClick={() => onChange(range)}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                      isCurrentPreset
                        ? 'bg-brand-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {preset.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Manual Date Inputs */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Dari Tanggal</label>
              <input
                type="date"
                className="input"
                value={filters.date_from}
                onChange={(e) => onChange({ ...filters, date_from: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Sampai Tanggal</label>
              <input
                type="date"
                className="input"
                value={filters.date_to}
                onChange={(e) => onChange({ ...filters, date_to: e.target.value })}
              />
            </div>
          </div>

          <div className="mt-3 flex justify-end">
            <button
              onClick={() => onChange({ date_from: '', date_to: '' })}
              className="text-sm font-medium text-slate-500 hover:text-slate-700"
            >
              Reset Filter
            </button>
          </div>
        </div>
      )}
    </>
  )
}
