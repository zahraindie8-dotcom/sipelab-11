import { useEffect, useState } from 'react'
import client from '../api/client'
import { extractError } from '../api/client'
import { useToast } from '../context/ToastContext'
import { IconCheckCircle, IconRefresh, IconXCircle } from '../components/icons'

export default function SystemStatus() {
  const { toast } = useToast()
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(true)
  const [lastChecked, setLastChecked] = useState(null)

  const fetchStatus = async () => {
    setLoading(true)
    try {
      const { data } = await client.get('/system/status')
      setStatus(data)
      setLastChecked(new Date())
    } catch (err) {
      toast(extractError(err), 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStatus()
  }, [])

  const StatusBadge = ({ status }) => {
    if (status === 'healthy') {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
          <IconCheckCircle className="h-3 w-3" />
          Healthy
        </span>
      )
    }
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-700">
        <IconXCircle className="h-3 w-3" />
        {status === 'degraded' ? 'Degraded' : 'Unhealthy'}
      </span>
    )
  }

  const InfoItem = ({ label, value }) => (
    <div className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
      <span className="text-sm text-slate-600">{label}</span>
      <span className="text-sm font-medium text-slate-800">{value || '-'}</span>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">System Status</h1>
          <p className="text-sm text-slate-500">Status komponen sistem</p>
        </div>
        <div className="flex items-center gap-3">
          {lastChecked && (
            <span className="text-xs text-slate-500">
              Terakhir dicek: {lastChecked.toLocaleTimeString('id-ID')}
            </span>
          )}
          <button
            onClick={fetchStatus}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            <IconRefresh className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {loading && !status ? (
        <div className="flex items-center justify-center py-12">
          <div className="inline-flex h-10 w-10 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
        </div>
      ) : status ? (
        <>
          {/* Overall Status */}
          <div className={`rounded-xl border p-6 ${
            status.status === 'healthy' 
              ? 'border-emerald-200 bg-emerald-50' 
              : 'border-red-200 bg-red-50'
          }`}>
            <div className="flex items-center gap-3">
              {status.status === 'healthy' ? (
                <IconCheckCircle className="h-8 w-8 text-emerald-600" />
              ) : (
                <IconXCircle className="h-8 w-8 text-red-600" />
              )}
              <div>
                <h2 className="text-lg font-bold text-slate-800">
                  {status.status === 'healthy' ? 'Semua Sistem Normal' : 'Ada Masalah pada Sistem'}
                </h2>
                <p className="text-sm text-slate-600">
                  {status.status === 'healthy' 
                    ? 'Semua komponen berjalan dengan baik'
                    : 'Beberapa komponen mengalami masalah'}
                </p>
              </div>
            </div>
          </div>

          {/* System Components */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* App Info */}
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-semibold text-slate-800">Application</h3>
                <StatusBadge status={status.checks?.app?.status} />
              </div>
              <div className="space-y-1">
                <InfoItem label="Name" value={status.checks?.app?.name} />
                <InfoItem label="Version" value={status.checks?.app?.version} />
                <InfoItem label="Environment" value={status.checks?.app?.environment} />
                <InfoItem label="Debug" value={status.checks?.app?.debug ? 'Enabled' : 'Disabled'} />
              </div>
            </div>

            {/* Database */}
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-semibold text-slate-800">Database</h3>
                <StatusBadge status={status.checks?.database?.status} />
              </div>
              <div className="space-y-1">
                <InfoItem label="Driver" value={status.checks?.database?.driver} />
                <InfoItem label="Response Time" value={`${status.checks?.database?.response_time_ms}ms`} />
                {status.checks?.database?.tables && Object.entries(status.checks.database.tables).map(([table, count]) => (
                  <InfoItem key={table} label={table} value={count === 'error' ? 'Error' : `${count} rows`} />
                ))}
              </div>
            </div>

            {/* Cache */}
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-semibold text-slate-800">Cache</h3>
                <StatusBadge status={status.checks?.cache?.status} />
              </div>
              <div className="space-y-1">
                <InfoItem label="Driver" value={status.checks?.cache?.driver} />
                <InfoItem label="Response Time" value={`${status.checks?.cache?.response_time_ms}ms`} />
              </div>
            </div>

            {/* Storage */}
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-semibold text-slate-800">Storage</h3>
                <StatusBadge status={status.checks?.storage?.status} />
              </div>
              <div className="space-y-1">
                {status.checks?.storage?.disks && Object.entries(status.checks.storage.disks).map(([disk, info]) => (
                  <div key={disk} className="flex items-center justify-between py-1">
                    <span className="text-sm text-slate-600">{disk}</span>
                    <span className={`text-xs font-medium ${info.writable ? 'text-emerald-600' : 'text-red-600'}`}>
                      {info.writable ? '✓ Writable' : '✗ Not Writable'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Queue */}
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-semibold text-slate-800">Queue</h3>
                <StatusBadge status={status.checks?.queue?.status} />
              </div>
              <div className="space-y-1">
                <InfoItem label="Driver" value={status.checks?.queue?.driver} />
                <InfoItem label="Message" value={status.checks?.queue?.message} />
              </div>
            </div>

            {/* Mail */}
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-semibold text-slate-800">Mail</h3>
                <StatusBadge status={status.checks?.mail?.status} />
              </div>
              <div className="space-y-1">
                <InfoItem label="Driver" value={status.checks?.mail?.driver} />
                <InfoItem label="From" value={status.checks?.mail?.from} />
              </div>
            </div>
          </div>

          {/* Server Info */}
          {status.checks?.server && (
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-semibold text-slate-800">Server</h3>
                <StatusBadge status={status.checks?.server?.status} />
              </div>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <InfoItem label="PHP Version" value={status.checks?.server?.php_version} />
                <InfoItem label="Memory Limit" value={status.checks?.server?.memory_limit} />
                <InfoItem label="Max Execution Time" value={`${status.checks?.server?.max_execution_time}s`} />
                <InfoItem label="Upload Max Filesize" value={status.checks?.server?.upload_max_filesize} />
                <InfoItem label="Post Max Size" value={status.checks?.server?.post_max_size} />
                <InfoItem label="Disk Free Space" value={status.checks?.server?.disk_free_space} />
                <InfoItem label="Disk Total Space" value={status.checks?.server?.disk_total_space} />
              </div>
            </div>
          )}
        </>
      ) : null}
    </div>
  )
}
