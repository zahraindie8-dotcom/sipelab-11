import { useCallback, useEffect, useState } from 'react'
import client, { extractError } from '../api/client'
import { useToast } from '../context/ToastContext'
import Pagination from '../components/Pagination'
import EmptyState from '../components/EmptyState'
import { IconInbox, IconCheckCircle } from '../components/icons'

const typeIcons = {
  booking_created: '📋',
  booking_approved: '✅',
  booking_rejected: '❌',
  booking_cancelled: '🚫',
}

const typeColors = {
  booking_created: 'border-slate-200 bg-white',
  booking_approved: 'border-emerald-200 bg-emerald-50/50',
  booking_rejected: 'border-rose-200 bg-rose-50/50',
  booking_cancelled: 'border-slate-200 bg-slate-50/50',
}

export default function Notifications() {
  const { toast } = useToast()
  const [notifications, setNotifications] = useState([])
  const [meta, setMeta] = useState(null)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)

  const fetchNotifications = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await client.get('/notifications', {
        params: { page, per_page: 15 },
      })
      setNotifications(data.data)
      setMeta(data.meta)
    } catch (err) {
      toast(extractError(err), 'error')
    } finally {
      setLoading(false)
    }
  }, [page, toast])

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  const markAsRead = async (id) => {
    try {
      await client.post(`/notifications/${id}/read`)
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      )
    } catch {
      // silent
    }
  }

  const markAllAsRead = async () => {
    try {
      await client.post('/notifications/read-all')
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
      toast('Semua notifikasi ditandai sudah dibaca.')
    } catch {
      toast('Gagal menandai notifikasi.', 'error')
    }
  }

  const unreadCount = notifications.filter((n) => !n.is_read).length

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Notifikasi</h1>
          <p className="text-sm text-slate-500">Pemberitahuan terkait booking lab Anda</p>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllAsRead} className="btn-secondary">
            <IconCheckCircle className="h-4 w-4" />
            Tandai Semua Dibaca ({unreadCount})
          </button>
        )}
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600" />
          </div>
        ) : notifications.length === 0 ? (
          <EmptyState
            icon={IconInbox}
            title="Tidak ada notifikasi"
            description="Notifikasi terkait booking akan muncul di sini."
          />
        ) : (
          <>
            <ul className="divide-y divide-slate-100">
              {notifications.map((n) => (
                <li
                  key={n.id}
                  onClick={() => !n.is_read && markAsRead(n.id)}
                  className={`flex items-start gap-4 px-5 py-4 transition hover:bg-slate-50/70 cursor-pointer ${
                    typeColors[n.type] ?? ''
                  } ${!n.is_read ? 'border-l-4 border-l-brand-500' : ''}`}
                >
                  <span className="mt-0.5 text-lg">
                    {typeIcons[n.type] ?? '🔔'}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-slate-800">{n.title}</p>
                      {!n.is_read && (
                        <span className="h-2 w-2 rounded-full bg-brand-500" />
                      )}
                    </div>
                    <p className="mt-1 text-sm text-slate-600">{n.message}</p>
                    <p className="mt-1 text-xs text-slate-400">
                      {n.created_at
                        ? new Date(n.created_at).toLocaleString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : '—'}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
            <Pagination meta={meta} onChange={setPage} />
          </>
        )}
      </div>
    </div>
  )
}
