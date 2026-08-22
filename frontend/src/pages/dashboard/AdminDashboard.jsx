import StatCard from '../../components/StatCard'
import {
  IconCalendar,
  IconCheckCircle,
  IconClock,
  IconFlask,
} from '../../components/icons'
import {
  ActivityList,
  BookNowButton,
  DashboardHeader,
  LabUsageChart,
} from './parts'

/**
 * Dashboard Admin — fokus kontrol & manajemen sekolah:
 * statistik seluruh sekolah, penggunaan lab, dan aktivitas terbaru.
 */
export default function AdminDashboard({ data }) {
  const { stats, lab_usage: labUsage, recent_bookings: recentBookings } = data

  return (
    <div className="space-y-6">
      <DashboardHeader
        title="Dashboard Admin"
        subtitle="Ringkasan pengelolaan lab sekolah"
        action={<BookNowButton />}
      />

      {/* Kartu statistik */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={IconFlask}
          label="Total Lab"
          value={stats.total_labs}
          accent="brand"
          sub="Lab terdaftar"
        />
        <StatCard
          icon={IconCalendar}
          label="Total Booking"
          value={stats.total_bookings}
          accent="sky"
          sub="Semua status"
        />
        <StatCard
          icon={IconCheckCircle}
          label="Disetujui"
          value={stats.approved}
          accent="emerald"
          sub="Jadwal terkonfirmasi"
        />
        <StatCard
          icon={IconClock}
          label="Menunggu"
          value={stats.pending}
          accent="amber"
          sub="Perlu persetujuan"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* Penggunaan lab */}
        <div className="lg:col-span-2">
          <LabUsageChart labUsage={labUsage} />
        </div>

        {/* Aktivitas terbaru */}
        <div className="lg:col-span-3">
          <ActivityList
            bookings={recentBookings}
            seeAllTo="/bookings"
            emptyAction={<BookNowButton />}
          />
        </div>
      </div>
    </div>
  )
}
