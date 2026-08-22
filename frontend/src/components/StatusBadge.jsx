const styles = {
  pending: 'bg-amber-50 text-amber-700 ring-amber-200',
  approved: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  rejected: 'bg-rose-50 text-rose-700 ring-rose-200',
}

const labels = {
  pending: 'Menunggu',
  approved: 'Disetujui',
  rejected: 'Ditolak',
}

export default function StatusBadge({ status, className = '' }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${
        styles[status] ?? styles.pending
      } ${className}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {labels[status] ?? status}
    </span>
  )
}
