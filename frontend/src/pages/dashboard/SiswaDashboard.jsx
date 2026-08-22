import { Link } from 'react-router-dom'
import StatCard from '../../components/StatCard'
import StatusBadge from '../../components/StatusBadge'
import EmptyState from '../../components/EmptyState'
import {
  IconCalendar,
  IconCheckCircle,
  IconClock,
  IconFlask,
  IconPlus,
  IconX,
} from '../../components/icons'
import { ActivityList, BookNowButton } from './parts'

/**
 * Dashboard Siswa — fokus personal:
 * banner sambutan, statistik booking miliknya, jadwal lab yang akan
 * datang, dan aktivitas terbaru.
 */
export default function SiswaDashboard({ data, user }) {
  const { stats, recent_bookings: recentBookings, upcoming_bookings: upcomingBookings } = data
  const firstName = user?.name?.split(' ')[0] ?? 'Siswa'

  return (
    <div className="space-y-6">
      {/* Banner sambutan */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-600 via-brand-700 to-slate-900 p-6 text-white shadow-lift sm:p-8">
        <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-16 right-24 h-40 w-40 rounded-full bg-brand-400/20 blur-2xl" />
        <div className="relative">
          <p className="text-sm font-medium text-brand-200">Dashboard Siswa</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight">
            Halo, {firstName}! 👋
          </h1>
          <p className="mt-2 max-w-xl text-sm text-brand-100">
            Siap praktikum hari ini? Booking lab sekarang dan pantau status
            persetujuannya langsung dari sini.
          </p>
          <Link
            to="/booking/new"
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-brand-700 shadow-sm transition hover:bg-brand-50 hover:shadow-md active:scale-[.98]"
          >
            <IconPlus className="h-4 w-4" />
            Booking Lab Sekarang
          </Link>
        </div>
      </div>

      {/* Kartu statistik pribadi */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={IconCalendar}
          label="Booking Saya"
          value={stats.total_bookings}
          accent="brand"
          sub="Total booking Anda"
        />
        <StatCard
          icon={IconCheckCircle}
          label="Disetujui"
          value={stats.approved}
          accent="emerald"
          sub="Siap dipakai"
        />
        <StatCard
          icon={IconClock}
          label="Menunggu"
          value={stats.pending}
          accent="amber"
          sub="Menunggu persetujuan"
        />
        <StatCard
          icon={IconX}
          label="Ditolak"
          value={stats.rejected}
          accent="rose"
          sub="Perlu dijadwalkan ulang"
        />
      </div>

      {/* Jadwal lab saya */}
      <div className="card">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h2 className="text-sm font-bold text-slate-700">Jadwal Lab Saya</h2>
          <IconCalendar className="h-4 w-4 text-slate-400" />
        </div>
        {upcomingBookings.length === 0 ? (
          <EmptyState
            icon={IconCalendar}
            title="Belum ada jadwal"
            description="Booking lab yang disetujui akan tampil di sini sebagai jadwal mendatang."
            action={<BookNowButton />}
          />
        ) : (
          <ul className="divide-y divide-slate-100">
            {upcomingBookings.map((b) => (
              <li
                key={b.id}
                className="flex items-center gap-4 px-5 py-4 transition hover:bg-slate-50/70"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <IconFlask className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-700">{b.lab_name}</p>
                  <p className="text-xs text-slate-400">
                    {b.date
                      ? new Date(`${b.date}T00:00`).toLocaleDateString('id-ID', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })
                      : '-'}{' '}
                    · {b.start_time}–{b.end_time}
                  </p>
                </div>
                <StatusBadge status={b.status} />
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Aktivitas terbaru */}
      <ActivityList
        bookings={recentBookings}
        seeAllTo="/bookings"
        emptyAction={<BookNowButton />}
      />
    </div>
  )
}
