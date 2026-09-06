import { useEffect, useState } from 'react'
import client from '../api/client'
import { extractError } from '../api/client'
import { useToast } from '../context/ToastContext'
import { IconCheckCircle, IconDownload, IconFilter, IconRefresh, IconSearch, IconX } from '../components/icons'

const actionLabels = {
  login: 'Login',
  logout: 'Logout',
  register: 'Register',
  create: 'Membuat',
  update: 'Mengubah',
  delete: 'Menghapus',
  approve: 'Menyetujui',
  reject: 'Menolak',
  cancel: 'Membatalkan',
  export: 'Export',
  upload: 'Upload',
}

const actionColors = {
  login: 'bg-emerald-100 text-emerald-700',
  logout: 'bg-slate-100 text-slate-700',
  register: 'bg-blue-100 text-blue-700',
  create: 'bg-green-100 text-green-700',
  update: 'bg-yellow-100 text-yellow-700',
  delete: 'bg-red-100 text-red-700',
  approve: 'bg-emerald-100 text-emerald-700',
  reject: 'bg-red-100 text-red-700',
  cancel: 'bg-orange-100 text-orange-700',
  export: 'bg-purple-100 text-purple-700',
  upload: 'bg-indigo-100 text-indigo-700',
}

export default function AuditLogs() {
  const { toast } = useToast()
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({})
  const [filters, setFilters] = useState({
    action: '',
    entity_type: '',
    search: '',
    page: 1,
  })
  const [showFilters, setShowFilters] = useState(false)

  const fetchLogs = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filters.action) params.append('action', filters.action)
      if (filters.entity_type) params.append('entity_type', filters.entity_type)
      if (filters.search) params.append('search', filters.search)
      params.append('page', filters.page)
      params.append('per_page', 20)

      const { data } = await client.get(`/audit-logs?${params.toString()}`)
      setLogs(data.data)
      setPagination(data.meta)
    } catch (err) {
      toast(extractError(err), 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLogs()
  }, [filters])

  const handleExport = async () => {
    try {
      const response = await client.get('/audit-logs/export', { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `audit_logs_${new Date().toISOString().slice(0, 10)}.csv`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      toast('Export berhasil')
    } catch (err) {
      toast(extractError(err), 'error')
    }
  }

  const resetFilters = () => {
    setFilters({ action: '', entity_type: '', search: '', page: 1 })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Audit Logs</h1>
          <p className="text-sm text-slate-500">Riwayat aktivitas sistem</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <IconFilter className="h-4 w-4" />
            Filter
          </button>
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <IconDownload className="h-4 w-4" />
            Export CSV
          </button>
          <button
            onClick={fetchLogs}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <IconRefresh className="h-4 w-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Search</label>
              <div className="relative">
                <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
                  className="w-full rounded-lg border border-slate-200 py-2 pl-10 pr-4 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="Cari..."
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Action</label>
              <select
                value={filters.action}
                onChange={(e) => setFilters({ ...filters, action: e.target.value, page: 1 })}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="">Semua Action</option>
                <option value="login">Login</option>
                <option value="logout">Logout</option>
                <option value="register">Register</option>
                <option value="create">Create</option>
                <option value="update">Update</option>
                <option value="delete">Delete</option>
                <option value="approve">Approve</option>
                <option value="reject">Reject</option>
                <option value="upload">Upload</option>
                <option value="export">Export</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Entity</label>
              <select
                value={filters.entity_type}
                onChange={(e) => setFilters({ ...filters, entity_type: e.target.value, page: 1 })}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="">Semua Entity</option>
                <option value="App\Models\User">User</option>
                <option value="App\Models\Lab">Lab</option>
                <option value="App\Models\Booking">Booking</option>
                <option value="App\Models\Report">Report</option>
              </select>
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button
              onClick={resetFilters}
              className="text-sm font-medium text-slate-600 hover:text-slate-800"
            >
              Reset Filter
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Waktu
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  User
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Action
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Entity
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  IP Address
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
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-4 py-12 text-center">
                    <p className="text-sm text-slate-500">Tidak ada data audit log</p>
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600">
                      {new Date(log.created_at).toLocaleString('id-ID')}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-slate-800">{log.user?.name || '-'}</div>
                      <div className="text-xs text-slate-500">{log.user?.email || '-'}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${actionColors[log.action] || 'bg-slate-100 text-slate-700'}`}>
                        {actionLabels[log.action] || log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-slate-800">{log.entity_name}</div>
                      {log.entity_id && (
                        <div className="text-xs text-slate-500">ID: {log.entity_id}</div>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600">
                      {log.ip_address || '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.last_page > 1 && (
          <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-4 py-3">
            <div className="text-sm text-slate-600">
              Menampilkan {pagination.from}-{pagination.to} dari {pagination.total} data
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => setFilters({ ...filters, page: Math.max(1, filters.page - 1) })}
                disabled={filters.page === 1}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Sebelumnya
              </button>
              <button
                onClick={() => setFilters({ ...filters, page: Math.min(pagination.last_page, filters.page + 1) })}
                disabled={filters.page === pagination.last_page}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Selanjutnya
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
