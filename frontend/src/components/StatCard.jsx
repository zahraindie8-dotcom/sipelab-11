export default function StatCard({ icon: Icon, label, value, accent = 'brand', sub, trend, miniChart }) {
  const accents = {
    brand: 'bg-brand-50 text-brand-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    sky: 'bg-sky-50 text-sky-600',
    rose: 'bg-rose-50 text-rose-600',
  }

  return (
    <div className="card group p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lift sm:p-5">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-medium text-slate-500 sm:text-sm">{label}</p>
          <div className="mt-1.5 flex items-center gap-2 sm:mt-2">
            <p className="text-2xl font-bold tracking-tight text-slate-800 sm:text-3xl">{value}</p>
            {trend}
          </div>
          {sub && <p className="mt-1 text-[11px] text-slate-400 sm:text-xs">{sub}</p>}
        </div>
        <div className={`rounded-xl p-2.5 transition-transform duration-200 group-hover:scale-110 sm:p-3 ${accents[accent]}`}>
          <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
        </div>
      </div>
      {miniChart && (
        <div className="mt-3">{miniChart}</div>
      )}
    </div>
  )
}
