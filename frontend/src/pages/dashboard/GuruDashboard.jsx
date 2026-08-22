import { useState } from 'react'
import client, { extractError } from '../../api/client'
import { useToast } from '../../context/ToastContext'
import Modal from '../../components/Modal'
import StatCard from '../../components/StatCard'
import MiniBarChart from '../../components/MiniBarChart'
import {
  IconCalendar,
  IconCheckCircle,
  IconClock,
  IconX,
} from '../../components/icons'
import { DashboardHeader, LabUsageChart, PendingQueue, BookNowButton } from './parts'

/**
 * Dashboard Guru — fokus persetujuan:
 * antrian booking yang menunggu persetujuan (dengan aksi langsung),
 * statistik booking, dan penggunaan lab.
 */
export default function GuruDashboard({ data = {}, refresh }) {
  const { toast } = useToast()
  const { stats = {}, lab_usage: labUsage = [], pending_approvals: pendingApprovals = [], mini_chart_data: miniChartData = [] } = data

  const [processing, setProcessing] = useState(false)
  const [rejectTarget, setRejectTarget] = useState(null)
  const [reason, setReason] = useState('')

  const approve = async (b) => {
    setProcessing(true)
    try {
      await client.post(`/bookings/${b.id}/approve`)
      toast(`Booking ${b.lab_name} disetujui.`)
      refresh()
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
      refresh()
    } catch (err) {
      toast(extractError(err), 'error')
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="space-y-6">
      <DashboardHeader
        title="Dashboard Guru"
        subtitle="Pantau antrian persetujuan & jadwal penggunaan lab"
        action={<BookNowButton />}
      />

      {/* Kartu statistik */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={IconClock}
          label="Menunggu"
          value={stats.pending}
          accent="amber"
          sub="Perlu persetujuan Anda"
        />
        <StatCard
          icon={IconCheckCircle}
          label="Disetujui"
          value={stats.approved}
          accent="emerald"
          sub="Jadwal terkonfirmasi"
          miniChart={<MiniBarChart data={miniChartData} color="bg-emerald-400" />}
        />
        <StatCard
          icon={IconX}
          label="Ditolak"
          value={stats.rejected}
          accent="rose"
          sub="Booking tertolak"
        />
        <StatCard
          icon={IconCalendar}
          label="Total Booking"
          value={stats.total_bookings}
          accent="sky"
          sub="Semua status"
          miniChart={<MiniBarChart data={miniChartData} color="bg-sky-400" />}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* Antrian persetujuan */}
        <div className="lg:col-span-3">
          <PendingQueue
            bookings={pendingApprovals}
            processing={processing}
            onApprove={approve}
            onReject={(b) => {
              setReason('')
              setRejectTarget(b)
            }}
            seeAllTo="/approvals"
          />
        </div>

        {/* Penggunaan lab */}
        <div className="lg:col-span-2">
          <LabUsageChart labUsage={labUsage} />
        </div>
      </div>

      {/* Modal alasan penolakan */}
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
              <label className="label" htmlFor="gd-reason">
                Alasan Penolakan <span className="text-rose-500">*</span>
              </label>
              <textarea
                id="gd-reason"
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
