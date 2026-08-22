import { Link } from 'react-router-dom'
import { IconFlask } from '../components/icons'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-100 px-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-lift">
        <IconFlask className="h-8 w-8" />
      </div>
      <p className="mt-6 text-6xl font-black tracking-tight text-brand-600">404</p>
      <h1 className="mt-2 text-xl font-bold text-slate-800">Halaman tidak ditemukan</h1>
      <p className="mt-2 max-w-sm text-sm text-slate-500">
        Halaman yang Anda cari tidak ada atau telah dipindahkan.
      </p>
      <Link to="/dashboard" className="btn-primary mt-6">
        Kembali ke Dashboard
      </Link>
    </div>
  )
}
