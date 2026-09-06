import { useEffect, useState } from 'react'
import client from '../api/client'
import { extractError } from '../api/client'
import { useToast } from '../context/ToastContext'
import { IconAdd, IconCheckCircle, IconRefresh, IconTrash, IconX } from '../components/icons'

export default function IPManagement() {
  const { toast } = useToast()
  const [blockedIPs, setBlockedIPs] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [newIP, setNewIP] = useState('')
  const [newReason, setNewReason] = useState('')

  const fetchBlockedIPs = async () => {
    setLoading(true)
    try {
      const { data } = await client.get('/security/blocked-ips')
      setBlockedIPs(data.blocked_ips || [])
    } catch (err) {
      // If endpoint doesn't exist, use empty array
      setBlockedIPs([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBlockedIPs()
  }, [])

  const handleBlockIP = async () => {
    if (!newIP.trim()) {
      toast('IP address wajib diisi', 'error')
      return
    }

    // Validate IP format
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/
    if (!ipRegex.test(newIP)) {
      toast('Format IP address tidak valid', 'error')
      return
    }

    try {
      await client.post('/security/block-ip', {
        ip: newIP,
        reason: newReason,
      })
      toast('IP berhasil diblokir')
      setShowAddModal(false)
      setNewIP('')
      setNewReason('')
      fetchBlockedIPs()
    } catch (err) {
      toast(extractError(err), 'error')
    }
  }

  const handleUnblockIP = async (ip) => {
    try {
      await client.delete(`/security/unblock-ip/${ip}`)
      toast('IP berhasil di-unblock')
      fetchBlockedIPs()
    } catch (err) {
      toast(extractError(err), 'error')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">IP Management</h1>
          <p className="text-sm text-slate-500">Kelola IP yang diblokir</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            <IconAdd className="h-4 w-4" />
            Block IP
          </button>
          <button
            onClick={fetchBlockedIPs}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            <IconRefresh className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Info Card */}
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
        <div className="flex gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100">
            <span className="text-amber-600">⚠</span>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-amber-800">Tentang IP Blocking</h3>
            <p className="mt-1 text-sm text-amber-700">
              IP yang diblokir tidak akan bisa mengakses aplikasi. IP akan otomatis di-unblock setelah periode tertentu (default: 1 jam untuk auto-block).
            </p>
          </div>
        </div>
      </div>

      {/* Blocked IPs Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  IP Address
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Alasan
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Blocked At
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Expires At
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-4 py-12 text-center">
                    <div className="inline-flex h-8 w-8 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
                    <p className="mt-2 text-sm text-slate-500">Memuat data...</p>
                  </td>
                </tr>
              ) : blockedIPs.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-4 py-12 text-center">
                    <IconCheckCircle className="mx-auto h-12 w-12 text-emerald-400" />
                    <p className="mt-2 text-sm font-medium text-slate-800">Tidak ada IP yang diblokir</p>
                    <p className="mt-1 text-sm text-slate-500">Semua IP diperbolehkan mengakses sistem</p>
                  </td>
                </tr>
              ) : (
                blockedIPs.map((item, index) => (
                  <tr key={index} className="hover:bg-slate-50">
                    <td className="whitespace-nowrap px-4 py-3">
                      <span className="font-mono text-sm font-medium text-slate-800">{item.ip}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">{item.reason || '-'}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600">
                      {item.blocked_at ? new Date(item.blocked_at).toLocaleString('id-ID') : '-'}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600">
                      {item.expires_at ? new Date(item.expires_at).toLocaleString('id-ID') : 'Permanent'}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      <button
                        onClick={() => handleUnblockIP(item.ip)}
                        className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50"
                      >
                        <IconTrash className="h-4 w-4" />
                        Unblock
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800">Block IP Address</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <IconX className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">IP Address</label>
                <input
                  type="text"
                  value={newIP}
                  onChange={(e) => setNewIP(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="192.168.1.100"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Alasan (opsional)</label>
                <textarea
                  value={newReason}
                  onChange={(e) => setNewReason(e.target.value)}
                  rows={2}
                  className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="Brute force attempt..."
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setShowAddModal(false)}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Batal
              </button>
              <button
                onClick={handleBlockIP}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
              >
                Block IP
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
