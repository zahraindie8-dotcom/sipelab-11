export default function StatCard({ icon: Icon, label, value, accent = 'brand', sub, trend, miniChart }) {
  const accents = {
    brand: 'bg-brand-50 text-brand-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    sky: 'bg-sky-50 text-sky-600',
    rose: 'bg-rose-50 text-rose-600',
  }

  return (
    <div className="card group p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lift">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <div className="mt-2 flex items-center gap-2">
            <p className="text-3xl font-bold tracking-tight text-slate-800">{value}</p>
            {trend}
          </div>
          {sub && <p className="mt-1 text-xs text-slate-400">{sub}</p>}
        </div>
        <div className={`rounded-xl p-3 transition-transform duration-200 group-hover:scale-110 ${accents[accent]}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
      {miniChart && (
        <div className="mt-3">{miniChart}</div>
      )}
    </div>
  )
}
