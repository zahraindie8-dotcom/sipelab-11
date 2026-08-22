import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { extractError } from '../api/client'
import { IconFlask } from '../components/icons'

const demoAccounts = [
  { label: 'Admin', email: 'admin@sipelab.test', password: 'password' },
  { label: 'Guru', email: 'guru@sipelab.test', password: 'password' },
  { label: 'Siswa', email: 'siswa@sipelab.test', password: 'password' },
]

export default function Login() {
  const { login } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()
  const location = useLocation()

  const [form, setForm] = useState({ email: '', password: '' })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const user = await login(form.email, form.password)
      toast(`Selamat datang, ${user.name}!`)
      const from = location.state?.from || '/dashboard'
      navigate(from, { replace: true })
    } catch (err) {
      setError(extractError(err))
    } finally {
      setSubmitting(false)
    }
  }

  const fillDemo = (acc) => {
    setForm({ email: acc.email, password: acc.password })
    setError(null)
  }

  // Preload daftar lab agar tombol demo akun tidak membuang request (opsional).
  // Tidak perlu — hanya untuk akses cepat saat development.

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-900 px-4">
      {/* Dekorasi latar */}
      <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-brand-600/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-24 h-[28rem] w-[28rem] rounded-full bg-sky-500/20 blur-3xl" />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-lift">
            <IconFlask className="h-7 w-7" />
          </div>
          <h1 className="mt-4 text-2xl font-bold text-white">SiLab</h1>
          <p className="mt-1 text-sm text-slate-400">
            Smart Lab Management — kelola penggunaan lab sekolah dengan mudah
          </p>
        </div>

        <div className="card p-6 sm:p-8">
          <h2 className="text-lg font-bold text-slate-800">Masuk ke akun Anda</h2>
          <p className="mt-1 text-sm text-slate-500">
            Belum punya akun?{' '}
            <Link to="/register" className="font-semibold text-brand-600 hover:text-brand-700">
              Daftar sebagai siswa
            </Link>
          </p>

          {error && (
            <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <div>
              <label className="label" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                className="input"
                placeholder="nama@sekolah.sch.id"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div>
              <label className="label" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                autoComplete="current-password"
                className="input"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>
            <button type="submit" disabled={submitting} className="btn-primary w-full">
              {submitting ? 'Memproses...' : 'Masuk'}
            </button>
          </form>

          {/* Akun demo */}
          <div className="mt-6 border-t border-slate-100 pt-5">
            <p className="mb-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-400">
              Akun demo (password: <code>password</code>)
            </p>
            <div className="grid grid-cols-3 gap-2">
              {demoAccounts.map((acc) => (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => fillDemo(acc)}
                  className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-2 text-xs font-semibold text-slate-600 transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
                >
                  {acc.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
