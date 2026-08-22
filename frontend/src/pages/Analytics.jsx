import { useCallback, useEffect, useState } from 'react'
import client, { extractError } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import BarChart from '../components/BarChart'
import DateRangeFilter from '../components/DateRangeFilter'
import StatCard from '../components/StatCard'
import {
  IconCalendar,
  IconChart,
  IconCheckCircle,
  IconClock,
  IconDownload,
  IconFlask,
  IconTrending,
  IconUsers,
  IconX,
} from '../components/icons'

const statusColors = {
  pending: 'bg-amber-400',
  approved: 'bg-emerald-400',
  rejected: 'bg-rose-400',
}

const statusLabels = {
  pending: 'Menunggu',
  approved: 'Disetujui',
  rejected: 'Ditolak',
}

const dayLabels = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']

export default function Analytics() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    date_from: '',
    date_to: '',
  })

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const params = {
        date_from: filters.date_from || undefined,
        date_to: filters.date_to || undefined,
      }
      const res = await client.get('/analytics', { params })
      setData(res.data)
    } catch (err) {
      toast(extractError(err), 'error')
    } finally {
      setLoading(false)
    }
  }, [toast, filters])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600" />
      </div>
    )
  }

  if (!data) return null

  const {
    summary = {},
    monthly_bookings: monthly = [],
    lab_usage: labUsage = [],
    status_breakdown: statusBreakdown = {},
    weekly_bookings: weekly = {},
    peak_hours: peakHours = [],
    trends = null,
  } = data

  // Format data untuk chart booking per bulan
  const monthlyChartData = (monthly || []).map((m) => ({
    label: (m?.label || '').split(' ')[0], // Ambil bulan saja
    value: m?.total || 0,
    color: 'bg-brand-500',
  }))

  // Format data untuk chart status breakdown (horizontal)
  const statusChartData = Object.entries(statusBreakdown || {}).map(([status, count]) => ({
    label: statusLabels[status] ?? status,
    value: count,
    color: statusColors[status] ?? 'bg-slate-400',
  }))

  // Format data untuk chart penggunaan lab (horizontal)
  const labChartData = (labUsage || []).map((lab) => ({
    label: lab?.name || '?',
    value: lab?.approved_count || 0,
    color: 'bg-brand-500',
  }))

  // Format data untuk chart mingguan
  const weeklyChartData = dayLabels.map((label, i) => ({
    label,
    value: (weekly && weekly[i + 1]) || 0, // DAYOFWEEK: 1=Min, 2=Sen, ...
    color: i === 0 ? 'bg-slate-300' : 'bg-sky-500',
  }))

  // Format data untuk jam tersibuk
  const peakChartData = (peakHours || []).map((p) => ({
    label: p?.hour || '?',
    value: p?.total || 0,
    color: 'bg-amber-500',
  }))

  // Role-aware labels
  const pageLabels = {
    admin: { title: 'Statistik & Analitik', subtitle: 'Insight penggunaan lab sekolah berdasarkan data booking' },
    guru: { title: 'Statistik & Analitik', subtitle: 'Insight penggunaan lab berdasarkan data booking' },
    siswa: { title: 'Statistik Saya', subtitle: 'Ringkasan aktivitas booking pribadi Anda' },
  }
  const labels = pageLabels[user?.role] ?? pageLabels.siswa

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">{labels.title}</h1>
          <p className="text-sm text-slate-500">{labels.subtitle}</p>
        </div>
        <div className="flex items-center gap-2">
          <DateRangeFilter
            filters={filters}
            onChange={setFilters}
            open={showFilters}
            onToggle={() => setShowFilters(!showFilters)}
          />
          <a
            href={`/api/export/bookings${filters.date_from ? `?date_from=${filters.date_from}` : ''}${filters.date_to ? `${filters.date_from ? '&' : '?'}date_to=${filters.date_to}` : ''}`}
            target="_blank"
            rel="noreferrer"
            className="btn-secondary"
          >
            <IconDownload className="h-4 w-4" />
            Export CSV
          </a>
        </div>
      </div>

      {/* Ringkasan */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={IconCalendar}
          label="Total Booking"
          value={summary.total_bookings}
          accent="brand"
          sub="Semua status"
        />
        <StatCard
          icon={IconCheckCircle}
          label="Terkonfirmasi"
          value={summary.total_approved}
          accent="emerald"
          sub={`${summary.approval_rate}% tingkat persetujuan`}
        />
        <StatCard
          icon={IconFlask}
          label="Total Lab"
          value={summary.total_labs}
          accent="sky"
          sub="Lab terdaftar"
        />
        <StatCard
          icon={IconTrending}
          label="Tingkat Persetujuan"
          value={`${summary.approval_rate}%`}
          accent="amber"
          sub="Approval rate"
        />
      </div>

      {/* Month-over-Month Trends */}
      {trends && (
        <div className="card p-5">
          <div className="mb-4 flex items-center gap-2">
            <IconTrending className="h-4 w-4 text-slate-400" />
            <h2 className="text-sm font-bold text-slate-700">Tren Bulanan</h2>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* This Month */}
            <div className="rounded-xl bg-gradient-to-br from-brand-50 to-brand-100/50 p-4">
              <p className="text-xs font-medium text-brand-600">Bulan Ini</p>
              <p className="mt-1 text-xs text-brand-500">{trends.this_month.label}</p>
              <p className="mt-2 text-2xl font-bold text-brand-700">{trends.this_month.total}</p>
              <p className="text-xs text-brand-600">total booking</p>
            </div>
            {/* Last Month */}
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs font-medium text-slate-500">Bulan Lalu</p>
              <p className="mt-1 text-xs text-slate-400">{trends.last_month.label}</p>
              <p className="mt-2 text-2xl font-bold text-slate-700">{trends.last_month.total}</p>
              <p className="text-xs text-slate-500">total booking</p>
            </div>
            {/* Total Change */}
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs font-medium text-slate-500">Perubahan Total</p>
              <p className={`mt-2 text-2xl font-bold ${
                trends.total_change > 0 ? 'text-emerald-600' : trends.total_change < 0 ? 'text-rose-600' : 'text-slate-600'
              }`}>
                {trends.total_change > 0 ? '+' : ''}{trends.total_change}%
              </p>
              <p className="text-xs text-slate-500">vs bulan lalu</p>
            </div>
            {/* Approved Change */}
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs font-medium text-slate-500">Perubahan Disetujui</p>
              <p className={`mt-2 text-2xl font-bold ${
                trends.approved_change > 0 ? 'text-emerald-600' : trends.approved_change < 0 ? 'text-rose-600' : 'text-slate-600'
              }`}>
                {trends.approved_change > 0 ? '+' : ''}{trends.approved_change}%
              </p>
              <p className="text-xs text-slate-500">vs bulan lalu</p>
            </div>
          </div>
        </div>
      )}

      {/* Grafik Booking per Bulan */}
      <div className="card p-5">
        <div className="mb-4 flex items-center gap-2">
          <IconChart className="h-4 w-4 text-slate-400" />
          <h2 className="text-sm font-bold text-slate-700">Booking per Bulan (12 Bulan Terakhir)</h2>
        </div>
        <BarChart data={monthlyChartData} height={180} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Status Breakdown */}
        <div className="card p-5">
          <div className="mb-4 flex items-center gap-2">
            <IconClock className="h-4 w-4 text-slate-400" />
            <h2 className="text-sm font-bold text-slate-700">Status Booking</h2>
          </div>
          <BarChart
            data={statusChartData}
            orientation="horizontal"
            showValues
            height={120}
          />
          {/* Legend */}
          <div className="mt-4 flex flex-wrap gap-3">
            {statusChartData.map((s) => (
              <div key={s.label} className="flex items-center gap-1.5">
                <span className={`h-2.5 w-2.5 rounded-full ${s.color}`} />
                <span className="text-xs text-slate-500">
                  {s.label} ({s.value})
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Booking per Hari (Minggu Ini) */}
        <div className="card p-5">
          <div className="mb-4 flex items-center gap-2">
            <IconCalendar className="h-4 w-4 text-slate-400" />
            <h2 className="text-sm font-bold text-slate-700">Booking Minggu Ini</h2>
          </div>
          <BarChart data={weeklyChartData} height={160} barColor="bg-sky-500" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Penggunaan Lab */}
        <div className="card p-5">
          <div className="mb-4 flex items-center gap-2">
            <IconFlask className="h-4 w-4 text-slate-400" />
            <h2 className="text-sm font-bold text-slate-700">Penggunaan Lab (Booking Disetujui)</h2>
          </div>
          <BarChart
            data={labChartData}
            orientation="horizontal"
            showValues
            height={Math.max(labUsage.length * 40, 80)}
          />
        </div>

        {/* Jam Tersibuk */}
        <div className="card p-5">
          <div className="mb-4 flex items-center gap-2">
            <IconClock className="h-4 w-4 text-slate-400" />
            <h2 className="text-sm font-bold text-slate-700">Jam Tersibuk</h2>
          </div>
          {peakChartData.length > 0 ? (
            <BarChart
              data={peakChartData}
              height={160}
              barColor="bg-amber-500"
            />
          ) : (
            <p className="py-8 text-center text-sm text-slate-400">Belum ada data jam tersibuk.</p>
          )}
        </div>
      </div>
    </div>
  )
}
