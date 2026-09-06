import { Link } from 'react-router-dom'
import StatusBadge from '../../components/StatusBadge'
import EmptyState from '../../components/EmptyState'
import {
  IconCalendar,
  IconChart,
  IconCheckCircle,
  IconClock,
  IconInbox,
  IconPlus,
  IconX,
} from '../../components/icons'

export function formatDateTime(value) {
  if (!value) return '-'
  return new Date(value).toLocaleString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function DashboardHeader({ title, subtitle, action }) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-xl font-bold text-slate-800">{title}</h1>
        <p className="text-sm text-slate-500">{subtitle}</p>
      </div>
      {action}
    </div>
  )
}

export function SectionCard({ title, icon: Icon, action, children }) {
  return (
    <div className="card">
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 sm:px-5 sm:py-4">
        <h2 className="text-sm font-bold text-slate-700">{title}</h2>
        <div className="flex items-center gap-2">
          {action}
          {Icon && <Icon className="h-4 w-4 text-slate-400" />}
        </div>
      </div>
      {children}
    </div>
  )
}

export function LabUsageChart({ labUsage = [] }) {
  const maxUsage = Math.max(...(labUsage?.map((l) => l.approved_count) || [1]), 1)

  return (
    <SectionCard title="Penggunaan Lab" icon={IconChart}>
      <div className="space-y-4 p-4 sm:p-5">
        {(!labUsage || labUsage.length === 0) && (
          <p className="text-sm text-slate-400">Belum ada data penggunaan.</p>
        )}
        {labUsage && labUsage.length > 0 && labUsage.map((lab) => (
          <div key={lab.id}>
            <div className="mb-1 flex items-center justify-between text-xs sm:mb-1.5 sm:text-sm">
              <span className="font-medium text-slate-600">{lab.name}</span>
              <span className="text-[11px] font-semibold text-slate-400 sm:text-xs">
                {lab.approved_count}×
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-slate-100 sm:h-2">
              <div
                className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-600 transition-all duration-700"
                style={{ width: `${Math.max((lab.approved_count / maxUsage) * 100, 4)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  )
}

const activityTone = {
  approved: 'bg-emerald-50 text-emerald-600',
  rejected: 'bg-rose-50 text-rose-600',
  pending: 'bg-amber-50 text-amber-600',
}

export function ActivityList({ bookings = [], seeAllTo, emptyAction }) {
  return (
    <SectionCard
      title="Aktivitas Terbaru"
      icon={IconCalendar}
      action={
        seeAllTo ? (
          <Link
            to={seeAllTo}
            className="text-xs font-semibold text-brand-600 hover:text-brand-700"
          >
            Lihat semua →
          </Link>
        ) : null
      }
    >
      {!bookings || bookings.length === 0 ? (
        <EmptyState
          icon={IconCalendar}
          title="Belum ada booking"
          description="Mulai buat booking lab untuk melihat aktivitas di sini."
          action={emptyAction}
        />
      ) : (
        <ul className="divide-y divide-slate-100">
          {bookings.map((b) => (
            <li key={b.id} className="flex items-center gap-3 px-4 py-3 sm:gap-4 sm:px-5 sm:py-3.5">
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full sm:h-10 sm:w-10 ${
                  activityTone[b.status] ?? 'bg-brand-50 text-brand-600'
                }`}
              >
                <IconClock className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-700">
                  {b.lab_name}
                  <span className="ml-2 hidden font-normal text-slate-500 sm:inline">
                    · {b.user_name}
                  </span>
                </p>
                <p className="text-xs text-slate-400">
                  {b.date} · {b.start_time}–{b.end_time}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <StatusBadge status={b.status} />
                <p className="mt-1 hidden text-[11px] text-slate-400 sm:block">
                  {formatDateTime(b.created_at)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </SectionCard>
  )
}

export function PendingQueue({ bookings = [], processing, onApprove, onReject, seeAllTo }) {
  return (
    <SectionCard
      title="Antrian Persetujuan"
      icon={IconInbox}
      action={
        seeAllTo ? (
          <Link
            to={seeAllTo}
            className="text-xs font-semibold text-brand-600 hover:text-brand-700"
          >
            Lihat semua →
          </Link>
        ) : null
      }
    >
      {!bookings || bookings.length === 0 ? (
        <EmptyState
          icon={IconInbox}
          title="Tidak ada antrian"
          description="Semua booking yang menunggu sudah diproses. Mantap!"
        />
      ) : (
        <ul className="divide-y divide-slate-100">
          {bookings.map((b) => (              <li
                key={b.id}
                className="flex flex-col gap-3 p-4 sm:px-5 sm:py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-md bg-brand-50 px-2 py-0.5 text-xs font-bold text-brand-700">
                      {b.lab_name}
                    </span>
                    <span className="text-xs text-slate-400">oleh {b.user_name}</span>
                  </div>
                  <p className="mt-1.5 text-sm text-slate-600">
                    {b.date} · {b.start_time}–{b.end_time}
                  </p>
                  {b.notes && (
                    <p className="mt-1 truncate text-xs text-slate-400">{b.notes}</p>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <button
                    onClick={() => onApprove(b)}
                    disabled={processing}
                    className="rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100 disabled:opacity-50"
                  >
                    <IconCheckCircle className="mr-1 inline h-3.5 w-3.5" />
                    Setujui
                  </button>
                  <button
                    onClick={() => onReject(b)}
                    disabled={processing}
                    className="rounded-lg bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-100 disabled:opacity-50"
                  >
                    <IconX className="mr-1 inline h-3.5 w-3.5" />
                    Tolak
                  </button>
                </div>
              </li>
          ))}
        </ul>
      )}
    </SectionCard>
  )
}

export function BookNowButton({ className = 'btn-primary' } = {}) {
  return (
    <Link to="/booking/new" className={className}>
      <IconPlus className="h-4 w-4" />
      Booking Lab
    </Link>
  )
}
