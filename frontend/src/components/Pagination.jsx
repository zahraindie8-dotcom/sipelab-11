export default function Pagination({ meta, onChange }) {
  if (!meta || meta.last_page <= 1) return null

  const { current_page: current, last_page: last } = meta

  return (
    <div className="flex flex-col gap-3 border-t border-slate-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-xs text-slate-500">
        Menampilkan {meta.from ?? 0}–{meta.to ?? 0} dari {meta.total} data
      </p>
      <div className="flex items-center gap-1.5">
        <button
          className="btn-secondary !px-3 !py-1.5 text-xs disabled:opacity-40"
          disabled={current <= 1}
          onClick={() => onChange(current - 1)}
        >
          <span className="hidden sm:inline">Sebelumnya</span>
          <span className="sm:hidden">← Prev</span>
        </button>
        <span className="px-2 text-xs font-semibold text-slate-600">
          {current} / {last}
        </span>
        <button
          className="btn-secondary !px-3 !py-1.5 text-xs disabled:opacity-40"
          disabled={current >= last}
          onClick={() => onChange(current + 1)}
        >
          <span className="hidden sm:inline">Berikutnya</span>
          <span className="sm:hidden">Next →</span>
        </button>
      </div>
    </div>
  )
}
