export default function Pagination({ meta, onChange }) {
  if (!meta || meta.last_page <= 1) return null

  const { current_page: current, last_page: last } = meta

  return (
    <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3">
      <p className="text-xs text-slate-500">
        Menampilkan {meta.from ?? 0}–{meta.to ?? 0} dari {meta.total} data
      </p>
      <div className="flex items-center gap-1.5">
        <button
          className="btn-secondary !px-3 !py-1.5 text-xs disabled:opacity-40"
          disabled={current <= 1}
          onClick={() => onChange(current - 1)}
        >
          Sebelumnya
        </button>
        <span className="px-2 text-xs font-semibold text-slate-600">
          {current} / {last}
        </span>
        <button
          className="btn-secondary !px-3 !py-1.5 text-xs disabled:opacity-40"
          disabled={current >= last}
          onClick={() => onChange(current + 1)}
        >
          Berikutnya
        </button>
      </div>
    </div>
  )
}
