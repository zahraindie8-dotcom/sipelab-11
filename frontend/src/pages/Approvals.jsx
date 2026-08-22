import { useCallback, useEffect, useState } from 'react'
import client, { extractError } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import Modal from '../components/Modal'
import BookingDetail from '../components/BookingDetail'
import EmptyState from '../components/EmptyState'
import { IconCheckCircle, IconInbox, IconX } from '../components/icons'

export default function Approvals() {
  const { user } = useAuth()
  const { toast } = useToast()

  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [rejectTarget, setRejectTarget] = useState(null)
  const [reason, setReason] = useState('')
  const [detailTarget, setDetailTarget] = useState(null)

  const fetchPending = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await client.get('/bookings', {
        params: { status: 'pending', per_page: 20 },
      })
      setBookings(data.data)
    } catch (err) {
      toast(extractError(err), 'error')
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchPending()
  }, [fetchPending])

  const approve = async (b) => {
    setProcessing(true)
    try {
      await client.post(`/bookings/${b.id}/approve`)
      toast(`Booking ${b.lab_name} disetujui.`)
      fetchPending()
    } catch (err) {
      toast(extractError(err), 'error')
    } finally {
      setProcessing(false)
    }
  }

  const submitReject = async (e) => {
    e.preventDefault()
    setProcessing(true)
    try {
      await client.post(`/bookings/${rejectTarget.id}/reject`, { reason })
      toast(`Booking ${rejectTarget.lab_name} ditolak.`)
      setRejectTarget(null)
      setReason('')
      fetchPending()
    } catch (err) {
      toast(extractError(err), 'error')
    } finally {
      setProcessing(false)
    }
  }

  if (!user?.can_approve) return null

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Persetujuan Booking</h1>
        <p className="text-sm text-slate-500">
          Antrian booking yang menunggu persetujuan Anda
        </p>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600" />
          </div>
        ) : bookings.length === 0 ? (
          <EmptyState
            icon={IconInbox}
            title="Tidak ada booking menunggu"
            description="Semua antrian persetujuan sudah beres. Mantap!"
          />
        ) : (
          <ul className="divide-y divide-slate-100">
            {bookings.map((b) => (
              <li key={b.id} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between cursor-pointer transition hover:bg-slate-50/70">
                <div className="min-w-0" onClick={() => setDetailTarget(b)}>
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-brand-50 px-2 py-0.5 text-xs font-bold text-brand-700">
                      {b.lab_name}
                    </span>
                    <span className="text-xs text-slate-400">
                      diminta {b.created_at ? new Date(b.created_at).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' }) : '-'}
                    </span>
                  </div>
                  <p className="mt-2 font-semibold text-slate-700">{b.user_name}</p>
                  <p className="text-sm text-slate-500">
                    {b.date} · {b.start_time}–{b.end_time}
                  </p>
                  {b.notes && (
                    <p className="mt-1 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">
                      {b.notes}
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <button
                    onClick={() => approve(b)}
                    disabled={processing}
                    className="btn-success"
                  >
                    <IconCheckCircle className="h-4 w-4" />
                    Setujui
                  </button>
                  <button
                    onClick={() => {
                      setReason('')
                      setRejectTarget(b)
                    }}
                    disabled={processing}
                    className="btn-danger"
                  >
                    <IconX className="h-4 w-4" />
                    Tolak
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Modal detail booking */}
      <Modal open={!!detailTarget} onClose={() => setDetailTarget(null)} title="Detail Booking">
        {detailTarget && <BookingDetail booking={detailTarget} />}
      </Modal>

      <Modal open={!!rejectTarget} onClose={() => setRejectTarget(null)} title="Tolak Booking">
        {rejectTarget && (
          <form onSubmit={submitReject} className="space-y-4">
            <p className="text-sm text-slate-500">
              Anda akan menolak booking{' '}
              <span className="font-semibold text-slate-700">{rejectTarget.lab_name}</span> oleh{' '}
              <span className="font-semibold text-slate-700">{rejectTarget.user_name}</span> pada{' '}
              {rejectTarget.date} ({rejectTarget.start_time}–{rejectTarget.end_time}).
            </p>
            <div>
              <label className="label" htmlFor="ap-reason">
                Alasan Penolakan
              </label>
              <textarea
                id="ap-reason"
                rows="3"
                className="input"
                placeholder="Alasan ditolak akan dicatat pada riwayat booking..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setRejectTarget(null)} className="btn-secondary">
                Batal
              </button>
              <button type="submit" disabled={processing} className="btn-danger">
                {processing ? 'Memproses...' : 'Tolak Booking'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  )
}
