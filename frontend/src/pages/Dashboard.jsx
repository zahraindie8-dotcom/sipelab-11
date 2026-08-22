import { useCallback, useEffect, useState } from 'react'
import client from '../api/client'
import { useAuth } from '../context/AuthContext'
import AdminDashboard from './dashboard/AdminDashboard'
import GuruDashboard from './dashboard/GuruDashboard'
import SiswaDashboard from './dashboard/SiswaDashboard'

export default function Dashboard() {
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await client.get('/dashboard')
      setData(res.data)
    } catch (err) {
      const errorMsg = err?.response?.data?.message || err?.message || 'Gagal memuat data dashboard. Pastikan Anda sudah login.'
      setError(errorMsg)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (user) {
      fetchData()
    } else {
      setLoading(false)
    }
  }, [user, fetchData])

  if (!user) {
    return (
      <div className="card p-8 text-center text-sm font-medium text-slate-600">
        Mohon login terlebih dahulu.
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="card p-8">
          <p className="text-center text-sm font-medium text-rose-600">{error}</p>
        </div>
        <div className="text-center">
          <button onClick={fetchData} className="btn-primary">
            Coba Lagi
          </button>
        </div>
      </div>
    )
  }

  if (loading || !data) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600" />
      </div>
    )
  }

  // Dashboard berbeda untuk tiap peran.
  if (user?.role === 'admin') return <AdminDashboard data={data} />
  if (user?.role === 'guru') return <GuruDashboard data={data} refresh={fetchData} />

  return <SiswaDashboard data={data} user={user} />
}
