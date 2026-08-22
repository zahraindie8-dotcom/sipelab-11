import { useCallback, useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import client, { extractError } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import StatusBadge from '../components/StatusBadge'
import Pagination from '../components/Pagination'
import Modal from '../components/Modal'
import BookingDetail from '../components/BookingDetail'
import EmptyState from '../components/EmptyState'
import DateRangeFilter from '../components/DateRangeFilter'
import { IconCalendar, IconCheckCircle, IconDownload, IconPlus, IconSearch, IconTrash, IconX } from '../components/icons'

const statusFilters = [
  { value: '', label: 'Semua' },
  { value: 'pending', label: 'Menunggu' },
  { value: 'approved', label: 'Disetujui' },
  { value: 'rejected', label: 'Ditolak' },
  { value: 'cancelled', label: 'Dibatalkan' },
]

export default function Bookings() {
  const { user } = useAuth()
  const { toast } = useToast()
  const location = useLocation()
  const isApprover = user?.can_approve

  const [bookings, setBookings] = useState([])
  const [meta, setMeta] = useState(null)
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    date_from: '',
    date_to: '',
    lab_id: '',
    search: '',
  })
  const [labs, setLabs] = useState([])

  // Modal detail
  const [detailTarget, setDetailTarget] = useState(null)

  // Modal tolak
  const [rejectTarget, setRejectTarget] = useState(null)
  const [reason, setReason] = useState('')
  const [processing, setProcessing] = useState(false)

  const fetchBookings = useCallback(async () => {
    setLoading(true)
    try {
      const params = {
        page,
        per_page: 10,
        status: status || undefined,
        date_from: filters.date_from || undefined,
        date_to: filters.date_to || undefined,
        lab_id: filters.lab_id || undefined,
      }
      const { data } = await client.get('/bookings', { params })
      let filteredData = data.data
      
      // Client-side search filter for user name
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        filteredData = filteredData.filter(
          (b) =>
            b.user_name?.toLowerCase().includes(searchLower) ||
            b.lab_name?.toLowerCase().includes(searchLower)
        )
      }
      
      setBookings(filteredData)
      setMeta(data.meta)
    } catch (err) {
      toast(extractError(err), 'error')
    } finally {
      setLoading(false)
    }
  }, [page, status, filters, toast])

  useEffect(() => {
    fetchBookings()
  }, [fetchBookings])

  // Fetch labs for filter dropdown
  useEffect(() => {
    if (isApprover) {
      client
        .get('/labs', { params: { per_page: 50 } })
        .then((res) => setLabs(res.data.data))
        .catch(() => {})
    }
  }, [isApprover])

  // Highlight booking yang baru dibuat.
  const [highlightId, setHighlightId] = useState(location.state?.highlight ?? null)
  useEffect(() => {
    if (highlightId) {
      const timer = setTimeout(() => setHighlightId(null), 2500)
      return () => clearTimeout(timer)
    }
  }, [highlightId])

  const act = async (fn, successMsg, bookingId) => {
    setProcessing(true)
    try {
      await fn()
      toast(successMsg)
      fetchBookings()
    } catch (err) {
      toast(extractError(err), 'error')
    } finally {
      setProcessing(false)
      setRejectTarget(null)
    }
  }

  const approve = (b) =>
    act(() => client.post(`/bookings/${b.id}/approve`), `Booking ${b.lab_name} disetujui.`, b.id)

  const submitReject = (e) => {
    e.preventDefault()
    act(
      () => client.post(`/bookings/${rejectTarget.id}/reject`, { reason }),
      `Booking ${rejectTarget.lab_name} ditolak.`,
      rejectTarget.id,
    )
  }

  const cancelBooking = (b) =>
    act(
      () => client.post(`/bookings/${b.id}/cancel`),
      'Booking berhasil dibatalkan.',
      b.id,
    )

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">
            {isApprover ? 'Semua Booking' : 'Booking Saya'}
          </h1>
          <p className="text-sm text-slate-500">
            {isApprover
              ? 'Pantau dan kelola seluruh jadwal penggunaan lab'
              : 'Riwayat booking lab Anda'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isApprover && (
            <a
              href={`/api/export/bookings${status ? `?status=${status}` : ''}${filters.date_from ? `${status ? '&' : '?'}date_from=${filters.date_from}` : ''}${filters.date_to ? `${status || filters.date_from ? '&' : '?'}date_to=${filters.date_to}` : ''}${filters.lab_id ? `${status || filters.date_from || filters.date_to ? '&' : '?'}lab_id=${filters.lab_id}` : ''}`}
              target="_blank"
              rel="noreferrer"
              className="btn-secondary"
            >
              <IconDownload className="h-4 w-4" />
              Export CSV
            </a>
          )}
          <Link to="/booking/new" className="btn-primary">
            <IconPlus className="h-4 w-4" />
            Booking Lab
          </Link>
        </div>
      </div>

      {/* Filter status */}
      <div className="flex flex-wrap items-center gap-2">
        {statusFilters.map((f) => (
          <button
            key={f.value}
            onClick={() => {
              setStatus(f.value)
              setPage(1)
            }}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
              status === f.value
                ? 'bg-brand-600 text-white shadow-sm'
                : 'bg-white text-slate-500 ring-1 ring-inset ring-slate-200 hover:bg-slate-50'
            }`}
          >
            {f.label}
          </button>
        ))}
        <DateRangeFilter
          filters={filters}
          onChange={(f) => { setFilters(f); setPage(1) }}
          open={showFilters}
          onToggle={() => setShowFilters(!showFilters)}
        />
      </div>

      {/* Advanced Filters (lab & search for approvers) */}
      {showFilters && isApprover && (
        <div className="card p-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Laboratorium</label>
              <select
                className="input"
                value={filters.lab_id}
                onChange={(e) => {
                  setFilters({ ...filters, lab_id: e.target.value })
                  setPage(1)
                }}
              >
                <option value="">Semua Lab</option>
                {labs.map((lab) => (
                  <option key={lab.id} value={lab.id}>
                    {lab.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Cari</label>
              <div className="relative">
                <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  className="input !pl-10"
                  placeholder="Cari nama user/lab..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                />
              </div>
            </div>
          </div>
          <div className="mt-3 flex justify-end">
            <button
              onClick={() => {
                setFilters({ date_from: '', date_to: '', lab_id: '', search: '' })
                setPage(1)
              }}
              className="text-sm font-medium text-slate-500 hover:text-slate-700"
            >
              Reset Filter
            </button>
          </div>
        </div>
      )}

      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600" />
          </div>
        ) : bookings.length === 0 ? (
          <EmptyState
            icon={IconCalendar}
            title="Tidak ada booking"
            description="Belum ada data booking untuk filter ini."
            action={
              <Link to="/booking/new" className="btn-primary">
                <IconPlus className="h-4 w-4" />
                Booking Lab
              </Link>
            }
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px]">
                <thead className="border-b border-slate-100 bg-slate-50">
                  <tr>
                    <th className="table-head">Lab</th>
                    {isApprover && <th className="table-head">Pemesan</th>}
                    <th className="table-head">Jadwal</th>
                    <th className="table-head">Status</th>
                    <th className="table-head text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {bookings.map((b) => (                      <tr
                      key={b.id}
                      onClick={() => setDetailTarget(b)}
                      className={`cursor-pointer transition hover:bg-slate-50/70 ${
                        highlightId === b.id ? 'bg-brand-50/70' : ''
                      }`}
                    >
                      <td className="table-cell">
                        <span className="font-semibold text-slate-700">{b.lab_name}</span>
                        <p className="mt-0.5 max-w-[220px] truncate text-xs text-slate-400">
                          {b.notes || 'Tanpa catatan'}
                        </p>
                      </td>
                      {isApprover && (
                        <td className="table-cell">
                          <span className="font-medium text-slate-600">{b.user_name}</span>
                        </td>
                      )}
                      <td className="table-cell">
                        <p className="font-medium text-slate-700">{b.date}</p>
                        <p className="text-xs text-slate-400">
                          {b.start_time}–{b.end_time}
                        </p>
                      </td>
                      <td className="table-cell">
                        <StatusBadge status={b.status} />
                      </td>
                      <td className="table-cell">
                        <div className="flex items-center justify-end gap-1.5">
                          {isApprover && b.status === 'pending' && (
                            <>
                              <button
                                onClick={() => approve(b)}
                                disabled={processing}
                                className="rounded-lg bg-emerald-50 p-2 text-emerald-600 transition hover:bg-emerald-100 disabled:opacity-50"
                                title="Setujui"
                              >
                                <IconCheckCircle className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setReason('')
                                  setRejectTarget(b)
                                }}
                                disabled={processing}
                                className="rounded-lg bg-rose-50 p-2 text-rose-600 transition hover:bg-rose-100 disabled:opacity-50"
                                title="Tolak"
                              >
                                <IconX className="h-4 w-4" />
                              </button>
                            </>
                          )}
                          {(user?.id === b.user?.id || user?.role === 'admin') &&
                            b.status === 'pending' && (
                              <button
                                onClick={() => cancelBooking(b)}
                                disabled={processing}
                                className="rounded-lg p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50"
                                title="Batalkan booking"
                              >
                                <IconTrash className="h-4 w-4" />
                              </button>
                            )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination meta={meta} onChange={setPage} />
          </>
        )}
      </div>

      {/* Modal detail booking */}
      <Modal open={!!detailTarget} onClose={() => setDetailTarget(null)} title="Detail Booking">
        {detailTarget && <BookingDetail booking={detailTarget} />}
      </Modal>

      {/* Modal alasan penolakan */}
      <Modal open={!!rejectTarget} onClose={() => setRejectTarget(null)} title="Tolak Booking">
        {rejectTarget && (
          <form onSubmit={submitReject} className="space-y-4">
            <p className="text-sm text-slate-500">
              Anda akan menolak booking <span className="font-semibold text-slate-700">{rejectTarget.lab_name}</span>{' '}
              pada {rejectTarget.date} ({rejectTarget.start_time}–{rejectTarget.end_time}).
            </p>
            <div>
              <label className="label" htmlFor="reject-reason">
                Alasan Penolakan <span className="text-rose-500">*</span>
              </label>
              <textarea
                id="reject-reason"
                rows="3"
                className="input"
                placeholder="cth: Jadwal bertabrakan dengan kegiatan sekolah..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setRejectTarget(null)} className="btn-secondary">
                Batal
              </button>
              <button type="submit" disabled={processing || !reason.trim()} className="btn-danger">
                {processing ? 'Memproses...' : 'Tolak Booking'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  )
}
