import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { extractError } from '../api/client'
import { IconEye, IconEyeOff, IconFlask } from '../components/icons'

function ThemeIcon({ theme }) {
  if (theme === 'dark') {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className="h-5 w-5"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.65 17.65l1.42 1.42M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.65 6.35l1.42-1.42" />
      </svg>
    )
  }

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" />
    </svg>
  )
}

export default function Login() {
  const { login } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()
  const location = useLocation()

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('sipelab-theme') || 'dark'
  })

  const [form, setForm] = useState({
    email: '',
    password: '',
    remember: false,
  })

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    localStorage.setItem('sipelab-theme', theme)
  }, [theme])

  useEffect(() => {
    document.title = 'Masuk | SIPELAB-11'

    let metaDescription = document.querySelector(
      'meta[name="description"]'
    )

    if (!metaDescription) {
      metaDescription = document.createElement('meta')
      metaDescription.name = 'description'
      document.head.appendChild(metaDescription)
    }

    metaDescription.content =
      'Masuk ke SIPELAB-11 untuk mengakses sistem manajemen laboratorium.'
  }, [])

  const isDark = theme === 'dark'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    try {
      const user = await login(
        form.email,
        form.password,
        form.remember
      )

      toast(`Selamat datang, ${user.name}!`)

      const from = location.state?.from || '/dashboard'
      navigate(from, { replace: true })
    } catch (err) {
      setError(extractError(err))
    } finally {
      setSubmitting(false)
    }
  }

  const inputClass = isDark
    ? 'w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-brand-400/60 focus:bg-white/[0.06] focus:ring-2 focus:ring-brand-500/10'
    : 'w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10'

  const labelClass = isDark
    ? 'mb-2 block text-sm font-medium text-slate-200'
    : 'mb-2 block text-sm font-medium text-slate-700'

  return (
    <div
      className={
        isDark
          ? 'min-h-screen overflow-x-hidden bg-[#07111f] text-white'
          : 'min-h-screen overflow-x-hidden bg-slate-50 text-slate-900'
      }
    >
      {/* Background decoration */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div
          className={
            isDark
              ? 'absolute -left-32 -top-32 h-96 w-96 rounded-full bg-brand-600/15 blur-3xl'
              : 'absolute -left-32 -top-32 h-96 w-96 rounded-full bg-brand-500/10 blur-3xl'
          }
        />

        <div
          className={
            isDark
              ? 'absolute -bottom-48 -right-32 h-[34rem] w-[34rem] rounded-full bg-sky-500/10 blur-3xl'
              : 'absolute -bottom-48 -right-32 h-[34rem] w-[34rem] rounded-full bg-sky-400/10 blur-3xl'
          }
        />
      </div>

      {/* Navbar */}
      <header
        className={
          isDark
            ? 'relative z-30 border-b border-white/[0.06] bg-[#07111f]/85 backdrop-blur-xl'
            : 'relative z-30 border-b border-slate-200/80 bg-white/85 backdrop-blur-xl'
        }
      >
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">
          <Link
            to="/"
            className="flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-lg shadow-brand-900/20">
              <span className="text-sm font-black tracking-tight">
                SL
              </span>
            </div>

            <div className="hidden sm:block">
              <div
                className={
                  isDark
                    ? 'text-sm font-bold tracking-wide text-white'
                    : 'text-sm font-bold tracking-wide text-slate-900'
                }
              >
                SIPELAB-11
              </div>

              <div className="text-[11px] text-slate-500">
                Smart Lab Management
              </div>
            </div>
          </Link>

          <nav className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/#tentang"
              className={
                isDark
                  ? 'hidden rounded-lg px-3 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/5 hover:text-white sm:inline-flex'
                  : 'hidden rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 sm:inline-flex'
              }
            >
              Tentang
            </Link>

            <button
              type="button"
              onClick={() =>
                setTheme((current) =>
                  current === 'dark' ? 'light' : 'dark'
                )
              }
              className={
                isDark
                  ? 'inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-300 transition hover:bg-white/10 hover:text-white'
                  : 'inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-100 hover:text-slate-900'
              }
              aria-label={
                isDark
                  ? 'Aktifkan mode terang'
                  : 'Aktifkan mode gelap'
              }
              title={
                isDark
                  ? 'Mode terang'
                  : 'Mode gelap'
              }
            >
              <ThemeIcon theme={theme} />
            </button>

            <Link
              to="/login"
              className={
                isDark
                  ? 'hidden rounded-xl bg-white/10 px-4 py-2.5 text-sm font-semibold text-white sm:inline-flex'
                  : 'hidden rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-900 sm:inline-flex'
              }
            >
              Masuk
            </Link>

            <Link
              to="/register"
              className={
                isDark
                  ? 'inline-flex items-center justify-center rounded-xl border border-white/10 px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-white/5 hover:text-white'
                  : 'inline-flex items-center justify-center rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900'
              }
            >
              Daftar
            </Link>
          </nav>
        </div>
      </header>

      {/* Main */}
      <main className="relative z-10">
        <section className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16 lg:px-10 lg:py-20">
          <div className="mx-auto max-w-md">
            {/* Heading */}
            <div className="mb-8 text-center">
              <div
                className={
                  isDark
                    ? 'mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-brand-300'
                    : 'mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-brand-100 bg-brand-50 text-brand-600'
                }
              >
                <IconFlask className="h-7 w-7" />
              </div>

              <p
                className={
                  isDark
                    ? 'mb-2 text-xs font-bold uppercase tracking-[0.22em] text-brand-300'
                    : 'mb-2 text-xs font-bold uppercase tracking-[0.22em] text-brand-600'
                }
              >
                Selamat datang kembali
              </p>

              <h1
                className={
                  isDark
                    ? 'text-3xl font-black tracking-tight text-white sm:text-4xl'
                    : 'text-3xl font-black tracking-tight text-slate-900 sm:text-4xl'
                }
              >
                Masuk ke SIPELAB-11
              </h1>

              <p
                className={
                  isDark
                    ? 'mt-3 text-sm leading-6 text-slate-400'
                    : 'mt-3 text-sm leading-6 text-slate-500'
                }
              >
                Kelola aktivitas laboratorium Anda dengan
                mudah dan terstruktur.
              </p>
            </div>

            {/* Card */}
            <div
              className={
                isDark
                  ? 'rounded-3xl border border-white/10 bg-white/[0.045] p-6 shadow-2xl shadow-black/20 backdrop-blur-xl sm:p-8'
                  : 'rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/50 sm:p-8'
              }
            >
              <div className="mb-7">
                <h2
                  className={
                    isDark
                      ? 'text-xl font-bold text-white'
                      : 'text-xl font-bold text-slate-900'
                  }
                >
                  Masuk ke akun Anda
                </h2>

                <p
                  className={
                    isDark
                      ? 'mt-1 text-sm text-slate-400'
                      : 'mt-1 text-sm text-slate-500'
                  }
                >
                  Belum punya akun?{' '}
                  <Link
                    to="/register"
                    className={
                      isDark
                        ? 'font-semibold text-brand-300 transition hover:text-brand-200'
                        : 'font-semibold text-brand-600 transition hover:text-brand-700'
                    }
                  >
                    Daftar sekarang
                  </Link>
                </p>
              </div>

              {error && (
                <div
                  className={
                    isDark
                      ? 'mb-6 rounded-xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm font-medium text-rose-300'
                      : 'mb-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700'
                  }
                >
                  {error}
                </div>
              )}

              <form
                onSubmit={handleSubmit}
                className="space-y-5"
              >
                {/* Email */}
                <div>
                  <label
                    className={labelClass}
                    htmlFor="email"
                  >
                    Email
                  </label>

                  <input
                    id="email"
                    type="email"
                    required
                    autoComplete="email"
                    className={inputClass}
                    placeholder="nama@email.com"
                    value={form.email}
                    onChange={(e) =>
                      setForm((current) => ({
                        ...current,
                        email: e.target.value,
                      }))
                    }
                  />
                </div>

                {/* Password */}
                <div>
                  <label
                    className={labelClass}
                    htmlFor="password"
                  >
                    Password
                  </label>

                  <div className="relative">
                    <input
                      id="password"
                      type={
                        showPassword
                          ? 'text'
                          : 'password'
                      }
                      required
                      autoComplete="current-password"
                      className={`${inputClass} pr-12`}
                      placeholder="Masukkan password"
                      value={form.password}
                      onChange={(e) =>
                        setForm((current) => ({
                          ...current,
                          password: e.target.value,
                        }))
                      }
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(
                          (visible) => !visible
                        )
                      }
                      className={
                        isDark
                          ? 'absolute inset-y-0 right-0 flex w-12 items-center justify-center text-slate-500 transition hover:text-slate-200'
                          : 'absolute inset-y-0 right-0 flex w-12 items-center justify-center text-slate-400 transition hover:text-slate-700'
                      }
                      aria-label={
                        showPassword
                          ? 'Sembunyikan password'
                          : 'Tampilkan password'
                      }
                    >
                      {showPassword ? (
                        <IconEyeOff className="h-5 w-5" />
                      ) : (
                        <IconEye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Remember + Forgot */}
                <div className="flex items-center justify-between gap-4">
                  <label
                    className={
                      isDark
                        ? 'flex cursor-pointer items-center gap-2 text-sm text-slate-400'
                        : 'flex cursor-pointer items-center gap-2 text-sm text-slate-500'
                    }
                  >
                    <input
                      id="remember"
                      type="checkbox"
                      checked={form.remember}
                      onChange={(e) =>
                        setForm((current) => ({
                          ...current,
                          remember: e.target.checked,
                        }))
                      }
                      className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                    />

                    <span>Ingat saya</span>
                  </label>

                  <Link
                    to="/forgot-password"
                    className={
                      isDark
                        ? 'text-sm font-medium text-brand-300 transition hover:text-brand-200'
                        : 'text-sm font-medium text-brand-600 transition hover:text-brand-700'
                    }
                  >
                    Lupa password?
                  </Link>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex w-full items-center justify-center rounded-xl bg-brand-600 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand-900/20 transition hover:bg-brand-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting
                    ? 'Memproses...'
                    : 'Masuk'}
                </button>
              </form>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer
        className={
          isDark
            ? 'relative z-10 border-t border-white/[0.06] bg-[#050c16]'
            : 'relative z-10 border-t border-slate-200 bg-white'
        }
      >
        <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:px-10">
          <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
            {/* Brand */}
            <div>
              <Link
                to="/"
                className="inline-flex items-center gap-3"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white">
                  <span className="text-sm font-black">
                    SL
                  </span>
                </div>

                <div>
                  <div
                    className={
                      isDark
                        ? 'text-sm font-bold text-white'
                        : 'text-sm font-bold text-slate-900'
                    }
                  >
                    SIPELAB-11
                  </div>

                  <div className="text-[11px] text-slate-500">
                    Smart Lab Management
                  </div>
                </div>
              </Link>

              <p className="mt-4 max-w-sm text-sm leading-6 text-slate-500">
                Platform pengelolaan laboratorium yang membantu
                mengatur jadwal, pemakaian ruang, persetujuan,
                dan aktivitas pengguna secara terstruktur.
              </p>
            </div>

            {/* Navigasi */}
            <div>
              <h3
                className={
                  isDark
                    ? 'text-sm font-bold text-white'
                    : 'text-sm font-bold text-slate-900'
                }
              >
                Navigasi
              </h3>

              <div className="mt-4 space-y-3">
                <Link
                  to="/#beranda"
                  className="block text-sm text-slate-500 transition hover:text-brand-500"
                >
                  Beranda
                </Link>

                <Link
                  to="/#laboratorium"
                  className="block text-sm text-slate-500 transition hover:text-brand-500"
                >
                  Laboratorium
                </Link>

                <Link
                  to="/#fitur"
                  className="block text-sm text-slate-500 transition hover:text-brand-500"
                >
                  Fitur
                </Link>

                <Link
                  to="/#cara-kerja"
                  className="block text-sm text-slate-500 transition hover:text-brand-500"
                >
                  Cara Kerja
                </Link>
              </div>
            </div>

            {/* Sistem */}
            <div>
              <h3
                className={
                  isDark
                    ? 'text-sm font-bold text-white'
                    : 'text-sm font-bold text-slate-900'
                }
              >
                Sistem
              </h3>

              <div className="mt-4 space-y-3">
                <Link
                  to="/login"
                  className="block text-sm text-slate-500 transition hover:text-brand-500"
                >
                  Masuk
                </Link>

                <Link
                  to="/register"
                  className="block text-sm text-slate-500 transition hover:text-brand-500"
                >
                  Daftar
                </Link>

                <Link
                  to="/forgot-password"
                  className="block text-sm text-slate-500 transition hover:text-brand-500"
                >
                  Lupa Password
                </Link>

                <Link
                  to="/verify-email"
                  className="block text-sm text-slate-500 transition hover:text-brand-500"
                >
                  Verifikasi Email
                </Link>
              </div>
            </div>

            {/* Informasi */}
            <div>
              <h3
                className={
                  isDark
                    ? 'text-sm font-bold text-white'
                    : 'text-sm font-bold text-slate-900'
                }
              >
                Informasi
              </h3>

              <div className="mt-4 space-y-3 text-sm text-slate-500">
                <p>Manajemen Laboratorium</p>
                <p>Penjadwalan & Booking</p>
                <p>Persetujuan Penggunaan</p>
                <p>Monitoring Aktivitas</p>
              </div>
            </div>
          </div>

          <div
            className={
              isDark
                ? 'mt-10 flex flex-col gap-3 border-t border-white/[0.06] pt-6 text-xs text-slate-600 sm:flex-row sm:items-center sm:justify-between'
                : 'mt-10 flex flex-col gap-3 border-t border-slate-200 pt-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between'
            }
          >
            <p>
              © {new Date().getFullYear()} SIPELAB-11. All rights
              reserved.
            </p>

            <p>Smart Lab Management</p>
          </div>
        </div>
      </footer>
    </div>
  )
}