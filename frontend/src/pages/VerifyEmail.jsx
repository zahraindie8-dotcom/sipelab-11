import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { IconCheckCircle, IconFlask, IconMail, IconRefresh } from '../components/icons'

export default function VerifyEmail() {
  const { verifyEmail, resendVerificationEmail } = useAuth()
  const [email, setEmail] = useState('')
  const [token, setToken] = useState('')
  const [loading, setLoading] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleVerify = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    try {
      const result = await verifyEmail(email, token)
      setMessage(result.message)
      setSuccess(true)
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memverifikasi email.')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setResendLoading(true)
    setError('')
    setMessage('')

    try {
      const result = await resendVerificationEmail(email)
      setMessage(result.message)
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal mengirim ulang email verifikasi.')
    } finally {
      setResendLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 shadow-lg shadow-indigo-500/25">
            <IconFlask className="h-7 w-7 text-white" />
          </div>
          <h1 className="mt-4 text-2xl font-bold text-white">SiLab</h1>
          <p className="text-sm text-slate-400">Smart Lab Management</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl bg-white shadow-xl shadow-black/10">
          <div className="p-8">
            {success ? (
              // Success State
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                  <IconCheckCircle className="h-8 w-8 text-emerald-600" />
                </div>
                <h2 className="mb-2 text-xl font-bold text-slate-800">Email Terverifikasi!</h2>
                <p className="mb-6 text-slate-600">
                  Email Anda berhasil diverifikasi. Anda sekarang bisa login dan menggunakan semua fitur.
                </p>
                <a
                  href="/login"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
                >
                  Login Sekarang
                </a>
              </div>
            ) : (
              // Verification Form
              <>
                <div className="mb-6 text-center">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-100">
                    <IconMail className="h-7 w-7 text-indigo-600" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-800">Verifikasi Email</h2>
                  <p className="mt-2 text-sm text-slate-500">
                    Masukkan kode verifikasi 6 karakter yang dikirim ke email Anda.
                  </p>
                </div>

                {error && (
                  <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 ring-1 ring-red-200">
                    {error}
                  </div>
                )}

                {message && (
                  <div className="mb-4 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700 ring-1 ring-emerald-200">
                    {message}
                  </div>
                )}

                <form onSubmit={handleVerify} className="space-y-4">
                  <div>
                    <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-700">
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      placeholder="email@sekolah.sch.id"
                    />
                  </div>

                  <div>
                    <label htmlFor="token" className="mb-1 block text-sm font-medium text-slate-700">
                      Kode Verifikasi
                    </label>
                    <input
                      id="token"
                      type="text"
                      value={token}
                      onChange={(e) => {
                        setToken(e.target.value)
                        console.log('KODE YANG DIKETIK:', e.target.value)
                      }}
                      required
                      maxLength={6}
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-center text-lg font-mono tracking-widest text-slate-800 transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      placeholder="XXXXXX"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {loading ? (
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    ) : (
                      'Verifikasi Email'
                    )}
                  </button>
                </form>

                <div className="mt-6 border-t border-slate-100 pt-4">
                  <p className="mb-3 text-center text-sm text-slate-500">
                    Tidak menerima kode?
                  </p>
                  <button
                    onClick={handleResend}
                    disabled={resendLoading}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {resendLoading ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-400 border-t-transparent" />
                    ) : (
                      <>
                        <IconRefresh className="h-4 w-4" />
                        Kirim Ulang Email Verifikasi
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Back to Login */}
        <p className="mt-6 text-center text-sm text-slate-400">
          <a href="/login" className="font-medium text-indigo-400 hover:text-indigo-300">
            Kembali ke Login
          </a>
        </p>
      </div>
    </div>
  )
}
