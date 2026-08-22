import { useCallback, useEffect, useRef, useState } from 'react'
import client, { extractError } from '../api/client'
import { useToast } from '../context/ToastContext'
import Modal from '../components/Modal'
import Pagination from '../components/Pagination'
import StatusBadge from '../components/StatusBadge'
import EmptyState from '../components/EmptyState'
import ReportPrintView from '../components/ReportPrintView'
import { IconCamera, IconPlus, IconPrinter, IconTrash } from '../components/icons'

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
  const { toast } = useToast()

  const [reports, setReports] = useState([])
  const [meta, setMeta] = useState(null)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)

  const [uploadOpen, setUploadOpen] = useState(false)
  const [approvedBookings, setApprovedBookings] = useState([])
  const [form, setForm] = useState({ booking_id: '', description: '' })
  const [photo, setPhoto] = useState(null)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState(null)

  // Cetak
  const [printReports, setPrintReports] = useState(null)
  const [printing, setPrinting] = useState(false)

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

  useEffect(() => {
    fetchReports()
  }, [fetchReports])

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
    } catch (err) {
      setFormError(extractError(err))
    } finally {
      setSaving(false)
    }
  }

  const removeReport = async (r) => {
    if (!window.confirm('Hapus laporan ini?')) return
    try {
      await client.delete(`/reports/${r.id}`)
      toast('Laporan dihapus.')
      fetchReports()
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Laporan Penggunaan Lab</h1>
          <p className="text-sm text-slate-500">
            Bukti foto & deskripsi aktivitas penggunaan lab
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handlePrint} disabled={printing} className="btn-secondary">
            <IconPrinter className="h-4 w-4" />
            {printing ? 'Memuat...' : 'Cetak Laporan'}
          </button>
          <button onClick={openUpload} className="btn-primary">
            <IconPlus className="h-4 w-4" />
            Upload Laporan
          </button>
        </div>
      </div>

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
                <li key={r.id} className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
                  {r.photo_url ? (
                    <a
                      href={r.photo_url}
                      target="_blank"
                      rel="noreferrer"
                      className="block shrink-0 overflow-hidden rounded-xl ring-1 ring-slate-200 transition hover:ring-brand-400"
                      title="Lihat foto asli"
                    >
                      <img
                        src={r.photo_url}
                        alt="Bukti penggunaan lab"
                        className="h-24 w-36 object-cover"
                      />
                    </a>
                  ) : (
                    <div className="flex h-24 w-36 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                      <IconCamera className="h-8 w-8" />
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
