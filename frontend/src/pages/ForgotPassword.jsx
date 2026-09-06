import { useState } from 'react'
import { Link } from 'react-router-dom'
import client from '../api/client'
import { extractError } from '../api/client'
import { IconCheckCircle, IconFlask, IconLock, IconMail, IconShield } from '../components/icons'

export default function ForgotPassword() {
  const [step, setStep] = useState(1) // 1: email, 2: code, 3: new password, 4: success
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [resetToken, setResetToken] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const handleSendCode = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await client.post('/forgot-password', { email })
      setMessage('Kode reset password telah dikirim ke email Anda.')
      setStep(2)
    } catch (err) {
      setError(extractError(err))
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyCode = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const { data } = await client.post('/verify-reset-code', { email, code })
      setResetToken(data.reset_token)
      setMessage('')
      setStep(3)
    } catch (err) {
      setError(extractError(err))
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await client.post('/reset-password', {
        email,
        reset_token: resetToken,
        password,
        password_confirmation: passwordConfirmation,
      })
      setStep(4)
    } catch (err) {
      setError(extractError(err))
    } finally {
      setLoading(false)
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
            {/* Step 4: Success */}
            {step === 4 ? (
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                  <IconCheckCircle className="h-8 w-8 text-emerald-600" />
                </div>
                <h2 className="mb-2 text-xl font-bold text-slate-800">Password Berhasil Diubah!</h2>
                <p className="mb-6 text-slate-600">
                  Silakan login dengan password baru Anda.
                </p>
                <Link
                  to="/login"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
                >
                  Login Sekarang
                </Link>
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="mb-6 text-center">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-100">
                    {step === 1 && <IconMail className="h-7 w-7 text-indigo-600" />}
                    {step === 2 && <IconShield className="h-7 w-7 text-indigo-600" />}
                    {step === 3 && <IconLock className="h-7 w-7 text-indigo-600" />}
                  </div>
                  <h2 className="text-xl font-bold text-slate-800">
                    {step === 1 && 'Lupa Password'}
                    {step === 2 && 'Masukkan Kode'}
                    {step === 3 && 'Password Baru'}
                  </h2>
                  <p className="mt-2 text-sm text-slate-500">
                    {step === 1 && 'Masukkan email Anda untuk reset password'}
                    {step === 2 && 'Masukkan kode 6 karakter dari email Anda'}
                    {step === 3 && 'Masukkan password baru Anda'}
                  </p>
                </div>

                {/* Progress Steps */}
                <div className="mb-6 flex items-center justify-center gap-2">
                  {[1, 2, 3].map((s) => (
                    <div
                      key={s}
                      className={`h-2 w-2 rounded-full ${
                        s <= step ? 'bg-indigo-600' : 'bg-slate-200'
                      }`}
                    />
                  ))}
                </div>

                {/* Error/Message */}
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

                {/* Step 1: Email */}
                {step === 1 && (
                  <form onSubmit={handleSendCode} className="space-y-4">
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
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {loading ? (
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      ) : (
                        'Kirim Kode Reset'
                      )}
                    </button>
                  </form>
                )}

                {/* Step 2: Code */}
                {step === 2 && (
                  <form onSubmit={handleVerifyCode} className="space-y-4">
                    <div>
                      <label htmlFor="code" className="mb-1 block text-sm font-medium text-slate-700">
                        Kode Reset
                      </label>
                      <input
                        id="code"
                        type="text"
                        value={code}
                        onChange={(e) => setCode(e.target.value.toUpperCase())}
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
                        'Verifikasi Kode'
                      )}
                    </button>
                  </form>
                )}

                {/* Step 3: New Password */}
                {step === 3 && (
                  <form onSubmit={handleResetPassword} className="space-y-4">
                    <div>
                      <label htmlFor="password" className="mb-1 block text-sm font-medium text-slate-700">
                        Password Baru
                      </label>
                      <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={8}
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                        placeholder="Minimal 8 karakter"
                      />
                    </div>
                    <div>
                      <label htmlFor="password_confirmation" className="mb-1 block text-sm font-medium text-slate-700">
                        Konfirmasi Password
                      </label>
                      <input
                        id="password_confirmation"
                        type="password"
                        value={passwordConfirmation}
                        onChange={(e) => setPasswordConfirmation(e.target.value)}
                        required
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                        placeholder="Ulangi password"
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
                        'Reset Password'
                      )}
                    </button>
                  </form>
                )}
              </>
            )}
          </div>
        </div>

        {/* Back to Login */}
        <p className="mt-6 text-center text-sm text-slate-400">
          <Link to="/login" className="font-medium text-indigo-400 hover:text-indigo-300">
            Kembali ke Login
          </Link>
        </p>
      </div>
    </div>
  )
}
