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

  const fetchData = useCallback(() => {
    client
      .get('/dashboard')
      .then((res) => setData(res.data))
      .catch(() => setError('Gagal memuat data dashboard.'))
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  if (error) {
    return (
      <div className="card p-8 text-center text-sm font-medium text-rose-600">
        {error}
      </div>
    )
  }

  if (!data) {
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
