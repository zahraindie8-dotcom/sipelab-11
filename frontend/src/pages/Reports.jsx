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
  const [completedBookings, setCompletedBookings] = useState([])
  const [form, setForm] = useState({ booking_id: '', description: '' })
  const [beforeFiles, setBeforeFiles] = useState([])
  const [afterFiles, setAfterFiles] = useState([])
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState(null)

  // Print
  const [printReports, setPrintReports] = useState(null)
  const [printing, setPrinting] = useState(false)

  //Private report photos/files
  const [photoUrls, setPhotoUrls] = useState({})
  const [fileUrls, setFileUrls] = useState({})

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
    setBeforeFiles([])
    setAfterFiles([])
    setUploadOpen(true)

    try {
      const { data } = await client.get('/bookings', {
        params: { status: 'completed', per_page: 50 },
      })

      // Hanya borrowing yang sudah selesai dan belum memiliki laporan.
      setCompletedBookings(data.data.filter((b) => !b.has_report))
    } catch (err) {
      toast(extractError(err), 'error')
    }
  }

const handleSubmit = async (e) => {
  e.preventDefault()

  if (!form.booking_id) {
    setFormError('Borrowing wajib dipilih.')
    return
  }

  if (beforeFiles.length === 0) {
    setFormError('Minimal 1 file Before wajib diunggah.')
    return
  }

  if (afterFiles.length === 0) {
    setFormError('Minimal 1 file After wajib diunggah.')
    return
  }

  if (beforeFiles.length > 25) {
    setFormError('Maksimal 25 file Before dapat diunggah.')
    return
  }

  if (afterFiles.length > 25) {
    setFormError('Maksimal 25 file After dapat diunggah.')
    return
  }

  if (!form.description.trim()) {
    setFormError('Deskripsi aktivitas wajib diisi.')
    return
  }

  setSaving(true)
  setFormError(null)

  try {
    const fd = new FormData()

    fd.append('booking_id', form.booking_id)
    fd.append('description', form.description)

    beforeFiles.forEach((file) => {
      fd.append('before[]', file)
    })

    afterFiles.forEach((file) => {
      fd.append('after[]', file)
    })

    await client.post('/reports', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })

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

  useEffect(() => {
    return () => {
      Object.values(photoUrls).forEach((url) => {
        URL.revokeObjectURL(url)
      })

      Object.values(fileUrls).forEach((url) => {
        URL.revokeObjectURL(url)
      })
    }
  }, [photoUrls, fileUrls])


  const loadReportFile = useCallback(async (report, file) => {
    if (!report?.id || !file?.id) return null

    const cacheKey = `${report.id}-${file.id}`

    if (fileUrls[cacheKey]) {
      return fileUrls[cacheKey]
    }

    try {
      const response = await client.get(
        `/reports/${report.id}/files/${file.id}`,
        {
          responseType: 'blob',
        }
      )

      const url = URL.createObjectURL(response.data)

      setFileUrls((prev) => ({
        ...prev,
        [cacheKey]: url,
      }))

      return url
    } catch (err) {
      toast(extractError(err), 'error')
      return null
    }
  }, [fileUrls, toast])

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
          {user.role !== 'siswa' && (
            <>
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
            </>
          )}

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
              label="Borrowing Disetujui"
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
            description="Unggah foto bukti penggunaan lab untuk borrowing yang sudah disetujui."
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
                  {r.files?.length > 0 ? (
                    <div className="w-full shrink-0 sm:w-52">
                      <div className="grid grid-cols-2 gap-2">
                        {r.files.map((file) => {
                          const cacheKey = `${r.id}-${file.id}`
                          const fileUrl = fileUrls[cacheKey]
                          const extension = file.file?.split('.').pop()?.toLowerCase() ?? ''
                          const isVideo = ['mp4', 'mov', 'webm'].includes(extension)

                          return (
                            <div
                              key={file.id}
                              className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50"
                            >
                              <div className="border-b border-slate-200 px-2 py-1">
                                <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
                                  {file.type === 'before' ? 'Before' : 'After'}
                                </p>
                              </div>

                              <button
                                type="button"
                                onClick={async () => {
                                  const url = await loadReportFile(r, file)

                                  if (url) {
                                    window.open(url, '_blank', 'noopener,noreferrer')
                                  }
                                }}
                                className="block w-full"
                                title={`Lihat ${file.type === 'before' ? 'Before' : 'After'}`}
                              >
                                {fileUrl ? (
                                  isVideo ? (
                                    <video
                                      src={fileUrl}
                                      className="h-24 w-full object-cover"
                                      muted
                                      preload="metadata"
                                    />
                                  ) : (
                                    <img
                                      src={fileUrl}
                                      alt={`${file.type === 'before' ? 'Before' : 'After'} laporan`}
                                      className="h-24 w-full object-cover"
                                    />
                                  )
                                ) : (
                                  <div className="flex h-24 items-center justify-center bg-slate-100 text-xs text-slate-400">
                                    Memuat...
                                  </div>
                                )}
                              </button>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ) : r.photo_url ? (
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
                    <div className="flex h-20 w-28 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-400 sm:h-24 sm:w-36">
                      <IconCamera className="h-6 w-6 sm:h-8 sm:w-8" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-slate-700">
                        {r.booking?.lab_name ?? `Borrowing #${r.booking_id}`}
                      </span>
                      <StatusBadge status={r.booking?.status ?? 'approved'} />
                    </div>
                    <p className="mt-1 text-xs text-slate-400">
                      {r.booking?.date} · {r.booking?.start_time}–{r.booking?.end_time} · oleh{' '}
                      {r.user?.name}
                    </p>

                    <div className="mt-2 flex flex-wrap gap-2">
                      <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
                        Kelas: {r.booking?.kelas ?? '—'}
                      </span>

                      <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
                        Jurusan: {r.booking?.jurusan ?? '—'}
                      </span>
                    </div>

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
              Borrowing (selesai)
            </label>

            <select
              id="rep-booking"
              className="input"
              value={form.booking_id}
              onChange={(e) => setForm({ ...form, booking_id: e.target.value })}
              required
            >
              <option value="">— Pilih borrowing —</option>

              {completedBookings.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.lab_name} · {b.date} ({b.start_time}–{b.end_time})
                </option>
              ))}
            </select>

            {completedBookings.length === 0 && (
              <p className="mt-2 text-xs text-slate-400">
                Tidak ada borrowing yang sudah selesai dan belum dilaporkan.
              </p>
            )}
          </div>

          {form.booking_id && (() => {
            const selectedBooking = completedBookings.find(
              (b) => String(b.id) === String(form.booking_id)
            )

            if (!selectedBooking) return null

            return (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                  <div>
                    <span className="text-xs text-slate-400">Nama</span>
                    <p className="font-medium text-slate-700">
                      {selectedBooking.user?.name ?? '—'}
                    </p>
                  </div>

                  <div>
                    <span className="text-xs text-slate-400">Kelas</span>
                    <p className="font-medium text-slate-700">
                      {selectedBooking.kelas ?? '—'}
                    </p>
                  </div>

                  <div>
                    <span className="text-xs text-slate-400">Jurusan</span>
                    <p className="font-medium text-slate-700">
                      {selectedBooking.jurusan ?? '—'}
                    </p>
                  </div>

                  <div>
                    <span className="text-xs text-slate-400">Lab</span>
                    <p className="font-medium text-slate-700">
                      {selectedBooking.lab_name ?? '—'}
                    </p>
                  </div>

                  <div>
                    <span className="text-xs text-slate-400">Tanggal</span>
                    <p className="font-medium text-slate-700">
                      {selectedBooking.date ?? '—'}
                    </p>
                  </div>

                  <div>
                    <span className="text-xs text-slate-400">Jam</span>
                    <p className="font-medium text-slate-700">
                      {selectedBooking.start_time ?? '—'} – {selectedBooking.end_time ?? '—'}
                    </p>
                  </div>
                </div>
              </div>
            )
          })()}

          <div>
            <label className="label" htmlFor="rep-before">
              Before
            </label>

            <label
              className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-6 text-center transition ${
                beforeFiles.length > 0
                  ? 'border-emerald-300 bg-emerald-50'
                  : 'border-slate-300 bg-slate-50 hover:border-brand-400 hover:bg-brand-50/50'
              }`}
            >
              <IconCamera className="mb-2 h-8 w-8 text-slate-400" />

              {beforeFiles.length > 0 ? (
                <span className="text-sm font-semibold text-emerald-600">
                  ✓ {beforeFiles.length} file dipilih
                </span>
              ) : (
                <>
                  <span className="text-sm font-semibold text-slate-600">
                    Klik untuk pilih foto/video Before
                  </span>
                  <span className="mt-1 text-xs text-slate-400">
                    Maksimal 25 file · JPG/JPEG/PNG/MP4/MOV/WEBM · maksimal 5 MB per file
                  </span>
                </>
              )}

              <input
                id="rep-before"
                type="file"
                accept="image/jpeg,image/png,video/mp4,video/quicktime,video/webm"
                multiple
                className="hidden"
                onChange={(e) => {
                  const files = Array.from(e.target.files ?? [])

                  if (files.length > 25) {
                    setFormError('Maksimal 25 file Before dapat diunggah.')
                    return
                  }

                  setFormError(null)
                  setBeforeFiles(files)
                }}
              />
            </label>

            {beforeFiles.length > 0 && (
              <div className="mt-2 space-y-1">
                {beforeFiles.map((file, index) => (
                  <p key={`${file.name}-${index}`} className="text-xs text-slate-500">
                    {index + 1}. {file.name}
                  </p>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="label" htmlFor="rep-after">
              After
            </label>

            <label
              className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-6 text-center transition ${
                afterFiles.length > 0
                  ? 'border-emerald-300 bg-emerald-50'
                  : 'border-slate-300 bg-slate-50 hover:border-brand-400 hover:bg-brand-50/50'
              }`}
            >
              <IconCamera className="mb-2 h-8 w-8 text-slate-400" />

              {afterFiles.length > 0 ? (
                <span className="text-sm font-semibold text-emerald-600">
                  ✓ {afterFiles.length} file dipilih
                </span>
              ) : (
                <>
                  <span className="text-sm font-semibold text-slate-600">
                    Klik untuk pilih foto/video After
                  </span>
                  <span className="mt-1 text-xs text-slate-400">
                    Maksimal 25 file · JPG/JPEG/PNG/MP4/MOV/WEBM · maksimal 5 MB per file
                  </span>
                </>
              )}

              <input
                id="rep-after"
                type="file"
                accept="image/jpeg,image/png,video/mp4,video/quicktime,video/webm"
                multiple
                className="hidden"
                onChange={(e) => {
                  const files = Array.from(e.target.files ?? [])

                  if (files.length > 25) {
                    setFormError('Maksimal 25 file After dapat diunggah.')
                    return
                  }

                  setFormError(null)
                  setAfterFiles(files)
                }}
              />
            </label>

            {afterFiles.length > 0 && (
              <div className="mt-2 space-y-1">
                {afterFiles.map((file, index) => (
                  <p key={`${file.name}-${index}`} className="text-xs text-slate-500">
                    {index + 1}. {file.name}
                  </p>
                ))}
              </div>
            )}
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
              required
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
