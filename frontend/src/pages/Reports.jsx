import { useCallback, useEffect, useRef, useState } from 'react'
import client, { extractError } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import Modal from '../components/Modal'
import Pagination from '../components/Pagination'
import StatusBadge from '../components/StatusBadge'
import EmptyState from '../components/EmptyState'
import ReportPrintView from '../components/ReportPrintView'
import StatCard from '../components/StatCard'
import BarChart from '../components/BarChart'
import DateRangeFilter from '../components/DateRangeFilter'
import TrendBadge from '../components/TrendBadge'
import {
  IconCamera,
  IconChart,
  IconDownload,
  IconFlask,
  IconPlus,
  IconPrinter,
  IconTrending,
  IconTrash,
  IconUsers,
} from '../components/icons'

function formatDateTime(value) {
  if (!value) return '-'
  return new Date(value).toLocaleString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function Reports() {
  const { user } = useAuth()
  const { toast } = useToast()

  // Reports list
  const [reports, setReports] = useState([])
  const [meta, setMeta] = useState(null)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)

  // Analytics
  const [analytics, setAnalytics] = useState(null)
  const [analyticsLoading, setAnalyticsLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    date_from: '',
    date_to: '',
  })

  // Upload modal
  const [uploadOpen, setUploadOpen] = useState(false)
  const [approvedBookings, setApprovedBookings] = useState([])
  const [form, setForm] = useState({ booking_id: '', description: '' })
  const [photo, setPhoto] = useState(null)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState(null)

  // Print
  const [printReports, setPrintReports] = useState(null)
  const [printing, setPrinting] = useState(false)

  //Private report photos
  const [photoUrls, setPhotoUrls] = useState({})

  const fetchReports = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await client.get('/reports', { params: { page, per_page: 10 } })
      setReports(data.data)
      setMeta(data.meta)
    } catch (err) {
      toast(extractError(err), 'error')
    } finally {
      setLoading(false)
    }
  }, [page, toast])

  const fetchAnalytics = useCallback(async () => {
    setAnalyticsLoading(true)
    try {
      const params = {
        date_from: filters.date_from || undefined,
        date_to: filters.date_to || undefined,
      }
      const { data } = await client.get('/reports/analytics', { params })
      setAnalytics(data)
    } catch (err) {
      // Silent fail for analytics
    } finally {
      setAnalyticsLoading(false)
    }
  }, [filters])

  useEffect(() => {
    fetchReports()
  }, [fetchReports])

  useEffect(() => {
    fetchAnalytics()
  }, [fetchAnalytics])

  const openUpload = async () => {
    setFormError(null)
    setForm({ booking_id: '', description: '' })
    setPhoto(null)
    setUploadOpen(true)
    try {
      const { data } = await client.get('/bookings', {
        params: { status: 'approved', per_page: 50 },
      })
      // Hanya booking yang belum punya laporan.
      setApprovedBookings(data.data.filter((b) => !b.has_report))
    } catch (err) {
      toast(extractError(err), 'error')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!photo) {
      setFormError('Foto bukti penggunaan wajib diunggah.')
      return
    }
    setSaving(true)
    setFormError(null)
    try {
      const fd = new FormData()
      fd.append('booking_id', form.booking_id)
      fd.append('description', form.description)
      fd.append('photo', photo)
      await client.post('/reports', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      toast('Laporan penggunaan lab berhasil diunggah.')
      setUploadOpen(false)
      fetchReports()
      fetchAnalytics()
    } catch (err) {
      setFormError(extractError(err))
    } finally {
      setSaving(false)
    }
  }

const loadReportPhoto = useCallback(async (report) => {
      if (!report?.id) return null

      // Jika sudah pernah dimuat, gunakan URL yang sudah ada.
      if (photoUrls[report.id]) {
        return photoUrls[report.id]
      }

      try {
        const response = await client.get(`/reports/${report.id}/photo`, {
          responseType: 'blob',
        })

        const url = URL.createObjectURL(response.data)

        setPhotoUrls((prev) => ({
          ...prev,
          [report.id]: url,
        }))

        return url
      } catch (err) {
        toast(extractError(err), 'error')
        return null
      }
}, [photoUrls, toast])

  const removeReport = async (r) => {
    if (!window.confirm('Hapus laporan ini?')) return
    try {
      await client.delete(`/reports/${r.id}`)
      toast('Laporan dihapus.')
      fetchReports()
      fetchAnalytics()
    } catch (err) {
      toast(extractError(err), 'error')
    }
  }

  // Buka halaman cetak
  const handlePrint = async () => {
    setPrinting(true)
    try {
      const { data } = await client.get('/reports/all')
      setPrintReports(data.data)
      // Tunggu render lalu cetak.
      setTimeout(() => {
        window.print()
      }, 300)
    } catch (err) {
      toast(extractError(err), 'error')
    } finally {
      setPrinting(false)
    }
  }

  // Format analytics data
  const monthlyChartData = analytics?.monthly_reports?.map((m) => ({
    label: m.label.split(' ')[0],
    value: m.total,
    color: 'bg-brand-500',
  })) || []

  const labChartData = analytics?.lab_reports
    ?.filter((l) => l.reports_count > 0)
    .map((l) => ({
      label: l.name,
      value: l.reports_count,
      color: 'bg-sky-500',
    })) || []

  const topReportersData = analytics?.top_reporters?.map((r) => ({
    label: r.name,
    value: r.total,
    color: 'bg-emerald-500',
  })) || []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Laporan Penggunaan Lab</h1>
          <p className="text-sm text-slate-500">
            Bukti foto & deskripsi aktivitas penggunaan lab
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <DateRangeFilter
            filters={filters}
            onChange={setFilters}
            open={showFilters}
            onToggle={() => setShowFilters(!showFilters)}
          />
          <a
            href={`/api/export/reports${filters.date_from ? `?date_from=${filters.date_from}` : ''}${filters.date_to ? `${filters.date_from ? '&' : '?'}date_to=${filters.date_to}` : ''}`}
            target="_blank"
            rel="noreferrer"
            className="btn-secondary"
          >
            <IconDownload className="h-4 w-4" />
            <span className="hidden sm:inline">Export CSV</span>
            <span className="sm:hidden">Export</span>
          </a>
          <button onClick={handlePrint} disabled={printing} className="btn-secondary">
            <IconPrinter className="h-4 w-4" />
            <span className="hidden sm:inline">{printing ? 'Memuat...' : 'Cetak Laporan'}</span>
            <span className="sm:hidden">Cetak</span>
          </button>
          <button onClick={openUpload} className="btn-primary">
            <IconPlus className="h-4 w-4" />
            <span className="hidden sm:inline">Upload Laporan</span>
            <span className="sm:hidden">Upload</span>
          </button>
        </div>
      </div>

      {/* Analytics Section */}
      {analyticsLoading ? (
        <div className="flex h-32 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600" />
        </div>
      ) : analytics && (
        <>
          {/* Stat Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              icon={IconCamera}
              label="Total Laporan"
              value={analytics.summary.total_reports}
              accent="brand"
              sub="Laporan terunggah"
              trend={<TrendBadge value={analytics.trends.change} />}
            />
            <StatCard
              icon={IconFlask}
              label="Booking Disetujui"
              value={analytics.summary.total_approved}
              accent="emerald"
              sub="Siap dilaporkan"
            />
            <StatCard
              icon={IconTrending}
              label="Tingkat Pelaporan"
              value={`${analytics.summary.report_rate}%`}
              accent="sky"
              sub={`${analytics.summary.total_reports} dari ${analytics.summary.total_approved} booking`}
            />
            <StatCard
              icon={IconUsers}
              label="Top Pelapor"
              value={analytics.top_reporters?.[0]?.name ?? '-'}
              accent="amber"
              sub={analytics.top_reporters?.[0] ? `${analytics.top_reporters[0].total} laporan` : 'Belum ada data'}
            />
          </div>

          {/* Month-over-Month Trends */}
          <div className="card p-5">
            <div className="mb-4 flex items-center gap-2">
              <IconTrending className="h-4 w-4 text-slate-400" />
              <h2 className="text-sm font-bold text-slate-700">Tren Bulanan Laporan</h2>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-xl bg-gradient-to-br from-brand-50 to-brand-100/50 p-4">
                <p className="text-xs font-medium text-brand-600">Bulan Ini</p>
                <p className="mt-1 text-xs text-brand-500">{analytics.trends.this_month.label}</p>
                <p className="mt-2 text-2xl font-bold text-brand-700">{analytics.trends.this_month.total}</p>
                <p className="text-xs text-brand-600">laporan</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-medium text-slate-500">Bulan Lalu</p>
                <p className="mt-1 text-xs text-slate-400">{analytics.trends.last_month.label}</p>
                <p className="mt-2 text-2xl font-bold text-slate-700">{analytics.trends.last_month.total}</p>
                <p className="text-xs text-slate-500">laporan</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-medium text-slate-500">Perubahan</p>
                <p className={`mt-2 text-2xl font-bold ${
                  analytics.trends.change > 0 ? 'text-emerald-600' : analytics.trends.change < 0 ? 'text-rose-600' : 'text-slate-600'
                }`}>
                  {analytics.trends.change > 0 ? '+' : ''}{analytics.trends.change}%
                </p>
                <p className="text-xs text-slate-500">vs bulan lalu</p>
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Laporan per Bulan */}
            <div className="card p-5">
              <div className="mb-4 flex items-center gap-2">
                <IconChart className="h-4 w-4 text-slate-400" />
                <h2 className="text-sm font-bold text-slate-700">Laporan per Bulan</h2>
              </div>
              {monthlyChartData.length > 0 ? (
                <BarChart data={monthlyChartData} height={180} />
              ) : (
                <p className="py-8 text-center text-sm text-slate-400">Belum ada data laporan.</p>
              )}
            </div>

            {/* Laporan per Lab */}
            <div className="card p-5">
              <div className="mb-4 flex items-center gap-2">
                <IconFlask className="h-4 w-4 text-slate-400" />
                <h2 className="text-sm font-bold text-slate-700">Laporan per Lab</h2>
              </div>
              {labChartData.length > 0 ? (
                <BarChart
                  data={labChartData}
                  orientation="horizontal"
                  showValues
                  height={Math.max(labChartData.length * 40, 80)}
                />
              ) : (
                <p className="py-8 text-center text-sm text-slate-400">Belum ada data laporan.</p>
              )}
            </div>
          </div>

          {/* Top Reporters */}
          {topReportersData.length > 0 && (
            <div className="card p-5">
              <div className="mb-4 flex items-center gap-2">
                <IconUsers className="h-4 w-4 text-slate-400" />
                <h2 className="text-sm font-bold text-slate-700">Top Pelapor</h2>
              </div>
              <BarChart
                data={topReportersData}
                orientation="horizontal"
                showValues
                height={Math.max(topReportersData.length * 40, 80)}
              />
            </div>
          )}
        </>
      )}

      {/* Reports List */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600" />
          </div>
        ) : reports.length === 0 ? (
          <EmptyState
            icon={IconCamera}
            title="Belum ada laporan"
            description="Unggah foto bukti penggunaan lab untuk booking yang sudah disetujui."
            action={
              <button onClick={openUpload} className="btn-primary">
                <IconPlus className="h-4 w-4" />
                Upload Laporan
              </button>
            }
          />
        ) : (
          <>
            <ul className="divide-y divide-slate-100">
              {reports.map((r) => (
                <li key={r.id} className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:gap-4 sm:p-4">
                  {r.photo_url ? (
                    <button
                        type="button"
                        onClick={async () => {
                          const url = await loadReportPhoto(r)
                          if (url) {
                            window.open(url, '_blank', 'noopener,noreferrer')
                          }
                        }}
                        className="block shrink-0 overflow-hidden rounded-xl ring-1 ring-slate-200 transition hover:ring-brand-400"
                        title="Lihat foto asli"
                      >
                        {photoUrls[r.id] ? (
                          <img
                            src={photoUrls[r.id]}
                            alt="Bukti penggunaan lab"
                            className="h-20 w-28 object-cover sm:h-24 sm:w-36"
                          />
                        ) : (
                          <div className="flex h-20 w-28 items-center justify-center bg-slate-100 text-xs text-slate-400 sm:h-24 sm:w-36">
                            Memuat...
                          </div>
                        )}
                      </button>
                  ) : (
                    <div className="flex h-20 w-28 items-center justify-center rounded-xl bg-slate-100 text-slate-400 sm:h-24 sm:w-36">
                      <IconCamera className="h-6 w-6 sm:h-8 sm:w-8" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-slate-700">
                        {r.booking?.lab_name ?? `Booking #${r.booking_id}`}
                      </span>
                      <StatusBadge status={r.booking?.status ?? 'approved'} />
                    </div>
                    <p className="mt-1 text-xs text-slate-400">
                      {r.booking?.date} · {r.booking?.start_time}–{r.booking?.end_time} · oleh{' '}
                      {r.user?.name}
                    </p>
                    {r.description && (
                      <p className="mt-2 text-sm text-slate-600">{r.description}</p>
                    )}
                    <p className="mt-2 text-xs text-slate-400">
                      Dilaporkan {formatDateTime(r.created_at)}
                    </p>
                  </div>
                  <button
                    onClick={() => removeReport(r)}
                    className="shrink-0 rounded-lg p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
                    title="Hapus laporan"
                  >
                    <IconTrash className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
            <Pagination meta={meta} onChange={setPage} />
          </>
        )}
      </div>

      {/* Area cetak — hidden di layar, muncul saat print */}
      {printReports && (
        <div className="print-only">
          <ReportPrintView
            reports={printReports}
            printDate={new Date().toLocaleString('id-ID', {
              day: 'numeric', month: 'long', year: 'numeric',
              hour: '2-digit', minute: '2-digit',
            })}
          />
        </div>
      )}

      {/* Modal upload */}
      <Modal open={uploadOpen} onClose={() => setUploadOpen(false)} title="Upload Laporan" size="md">
        {formError && (
          <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
            {formError}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label" htmlFor="rep-booking">
              Booking (disetujui)
            </label>
            <select
              id="rep-booking"
              className="input"
              value={form.booking_id}
              onChange={(e) => setForm({ ...form, booking_id: e.target.value })}
              required
            >
              <option value="">— Pilih booking —</option>
              {approvedBookings.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.lab_name} · {b.date} ({b.start_time})
                </option>
              ))}
            </select>
            {approvedBookings.length === 0 && (
              <p className="mt-2 text-xs text-slate-400">
                Tidak ada booking disetujui yang belum dilaporkan.
              </p>
            )}
          </div>

          <div>
            <label className="label" htmlFor="rep-photo">
              Foto Bukti
            </label>
            <label
              className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-8 text-center transition ${
                photo
                  ? 'border-emerald-300 bg-emerald-50'
                  : 'border-slate-300 bg-slate-50 hover:border-brand-400 hover:bg-brand-50/50'
              }`}
            >
              <IconCamera className="mb-2 h-8 w-8 text-slate-400" />
              {photo ? (
                <span className="text-sm font-semibold text-emerald-600">
                  ✓ {photo.name}
                </span>
              ) : (
                <>
                  <span className="text-sm font-semibold text-slate-600">
                    Klik untuk pilih foto
                  </span>
                  <span className="mt-1 text-xs text-slate-400">
                    JPG/PNG, maksimal 5 MB
                  </span>
                </>
              )}
              <input
                id="rep-photo"
                type="file"
                accept="image/jpeg,image/png"
                className="hidden"
                onChange={(e) => setPhoto(e.target.files?.[0] ?? null)}
              />
            </label>
          </div>

          <div>
            <label className="label" htmlFor="rep-desc">
              Deskripsi Aktivitas
            </label>
            <textarea
              id="rep-desc"
              rows="3"
              className="input"
              placeholder="cth: Praktikum jaringan komputer, materi routing dasar..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setUploadOpen(false)} className="btn-secondary">
              Batal
            </button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'Mengunggah...' : 'Simpan Laporan'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
