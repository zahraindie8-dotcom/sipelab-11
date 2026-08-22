import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { extractError } from '../api/client'
import { IconFlask } from '../components/icons'

export default function Register() {
  const { register } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const user = await register(form)
      toast(`Registrasi berhasil. Selamat datang, ${user.name}!`)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(extractError(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-900 px-4 py-10">
      <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-brand-600/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -left-24 h-[28rem] w-[28rem] rounded-full bg-sky-500/20 blur-3xl" />

      <div className="relative z-10 w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-lift">
            <IconFlask className="h-7 w-7" />
          </div>
          <h1 className="mt-4 text-2xl font-bold text-white">Daftar Akun Siswa</h1>
          <p className="mt-1 text-sm text-slate-400">
            Akun guru & admin dibuat oleh administrator sekolah
          </p>
        </div>

        <div className="card p-6 sm:p-8">
          {error && (
            <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label" htmlFor="name">
                Nama Lengkap
              </label>
              <input
                id="name"
                type="text"
                required
                className="input"
                placeholder="Nama siswa"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div>
              <label className="label" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
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
                minLength={8}
                className="input"
                placeholder="Minimal 8 karakter"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>
            <div>
              <label className="label" htmlFor="password_confirmation">
                Konfirmasi Password
              </label>
              <input
                id="password_confirmation"
                type="password"
                required
                className="input"
                placeholder="Ulangi password"
                value={form.password_confirmation}
                onChange={(e) =>
                  setForm({ ...form, password_confirmation: e.target.value })
                }
              />
            </div>
            <button type="submit" disabled={submitting} className="btn-primary w-full">
              {submitting ? 'Mendaftarkan...' : 'Daftar'}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-slate-500">
            Sudah punya akun?{' '}
            <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-700">
              Masuk di sini
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
