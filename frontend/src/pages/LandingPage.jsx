import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

function Icon({ name, size = 22, strokeWidth = 1.7 }) {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
  }

  const icons = {
    lab: (
      <>
        <path d="M9 3h6" />
        <path d="M10 3v6.5L5.5 17a3 3 0 0 0 2.6 4.5h7.8a3 3 0 0 0 2.6-4.5L14 9.5V3" />
        <path d="M7.5 15h9" />
      </>
    ),
    calendar: (
      <>
        <rect x="3" y="4.5" width="18" height="17" rx="2.5" />
        <path d="M16 2.5v4" />
        <path d="M8 2.5v4" />
        <path d="M3 9h18" />
        <path d="M8 13h.01" />
        <path d="M12 13h.01" />
        <path d="M16 13h.01" />
        <path d="M8 17h.01" />
        <path d="M12 17h.01" />
      </>
    ),
    booking: (
      <>
        <rect x="4" y="3" width="16" height="18" rx="2.5" />
        <path d="M8 7h8" />
        <path d="M8 11h8" />
        <path d="M8 15h4" />
        <path d="m15 15 1.5 1.5L19 14" />
      </>
    ),
    check: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="m8 12 2.5 2.5L16 9" />
      </>
    ),
    database: (
      <>
        <ellipse cx="12" cy="5" rx="7.5" ry="3" />
        <path d="M4.5 5v7c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3V5" />
        <path d="M4.5 12v7c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3v-7" />
      </>
    ),
    monitor: (
      <>
        <rect x="3" y="4" width="18" height="13" rx="2" />
        <path d="M8 21h8" />
        <path d="M12 17v4" />
        <path d="m7 13 2.5-2.5L11 12l3-3 3 3" />
      </>
    ),
    arrow: (
      <>
        <path d="M5 12h13" />
        <path d="m13 6 6 6-6 6" />
      </>
    ),
    shield: (
      <>
        <path d="M12 3 20 6v5.5c0 4.7-3.2 8.1-8 9.5-4.8-1.4-8-4.8-8-9.5V6l8-3Z" />
        <path d="m8.5 12 2.2 2.2 4.8-4.8" />
      </>
    ),
    users: (
      <>
        <circle cx="9" cy="8" r="3" />
        <path d="M3.5 20c.5-3.5 2.4-5.5 5.5-5.5s5 2 5.5 5.5" />
        <path d="M16 5.5a3 3 0 0 1 0 5.8" />
        <path d="M16.5 14.5c2.2.3 3.5 2 4 4.5" />
      </>
    ),
    menu: (
      <>
        <path d="M4 7h16" />
        <path d="M4 12h16" />
        <path d="M4 17h16" />
      </>
    ),
    close: (
      <>
        <path d="m6 6 12 12" />
        <path d="m18 6-12 12" />
      </>
    ),
    sun: (
      <>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2" />
        <path d="M12 20v2" />
        <path d="m4.93 4.93 1.42 1.42" />
        <path d="m17.65 17.65 1.42 1.42" />
        <path d="M2 12h2" />
        <path d="M20 12h2" />
        <path d="m4.93 19.07 1.42-1.42" />
        <path d="m17.65 6.35 1.42-1.42" />
      </>
    ),
    moon: (
      <>
        <path d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5 8.5 8.5 0 1 0 20.5 14.5Z" />
      </>
    ),
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
  }

  return <svg {...common}>{icons[name]}</svg>
}

const labs = [
  {
    name: 'Laboratorium RPL 01',
    category: 'Rekayasa Perangkat Lunak',
    capacity: '36 peserta',
    status: 'Tersedia',
    accent: 'from-indigo-500/20 via-indigo-500/5 to-transparent',
  },
  {
    name: 'Laboratorium RPL 02',
    category: 'Rekayasa Perangkat Lunak',
    capacity: '36 peserta',
    status: 'Digunakan',
    accent: 'from-violet-500/20 via-violet-500/5 to-transparent',
  },
  {
    name: 'Laboratorium Bahasa',
    category: 'Bahasa & Komunikasi',
    capacity: '32 peserta',
    status: 'Tersedia',
    accent: 'from-cyan-500/20 via-cyan-500/5 to-transparent',
  },
]

const features = [
  {
    number: '01',
    icon: 'booking',
    title: 'Peminjaman terstruktur',
    description:
      'Ajukan penggunaan laboratorium dengan data ruang, tanggal, waktu, dan kebutuhan yang tersusun jelas.',
  },
  {
    number: '02',
    icon: 'calendar',
    title: 'Jadwal lebih transparan',
    description:
      'Lihat ketersediaan ruang sebelum melakukan booking sehingga jadwal penggunaan lebih mudah diatur.',
  },
  {
    number: '03',
    icon: 'check',
    title: 'Approval lebih jelas',
    description:
      'Setiap pengajuan memiliki status yang jelas sehingga pengguna mengetahui perkembangan booking mereka.',
  },
  {
    number: '04',
    icon: 'database',
    title: 'Data terpusat',
    description:
      'Informasi laboratorium, pengguna, jadwal, dan peminjaman tersimpan dalam satu sistem yang terorganisir.',
  },
]

const steps = [
  {
    number: '01',
    icon: 'lab',
    title: 'Temukan ruang',
    description: 'Pilih laboratorium yang sesuai dengan kebutuhan kegiatan.',
  },
  {
    number: '02',
    icon: 'calendar',
    title: 'Atur waktu',
    description: 'Tentukan tanggal dan waktu penggunaan laboratorium.',
  },
  {
    number: '03',
    icon: 'booking',
    title: 'Kirim booking',
    description: 'Ajukan permintaan penggunaan melalui sistem.',
  },
  {
    number: '04',
    icon: 'check',
    title: 'Tunggu approval',
    description: 'Pantau status pengajuan sampai mendapatkan persetujuan.',
  },
]

export default function LandingPage() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('sipelab-theme') || 'dark'
  })

  const [mobileMenu, setMobileMenu] = useState(false)

  const isDark = theme === 'dark'

  useEffect(() => {
    localStorage.setItem('sipelab-theme', theme)
  }, [theme])

  useEffect(() => {
    document.title =
      'SIPELAB-11 — Sistem Peminjaman & Manajemen Laboratorium'

    const description =
      'SIPELAB-11 membantu mengelola peminjaman, jadwal, persetujuan, dan penggunaan laboratorium secara terstruktur dalam satu sistem.'

    let meta = document.querySelector('meta[name="description"]')

    if (!meta) {
      meta = document.createElement('meta')
      meta.name = 'description'
      document.head.appendChild(meta)
    }

    meta.setAttribute('content', description)

    return () => {
      document.title = 'SIPELAB-11'
    }
  }, [])

  const toggleTheme = () => {
    setTheme((current) => (current === 'light' ? 'dark' : 'light'))
  }

  const page = isDark
    ? 'bg-[#070811] text-white'
    : 'bg-[#f7f7f5] text-[#101116]'

  const muted = isDark ? 'text-white/55' : 'text-black/55'

  const border = isDark ? 'border-white/10' : 'border-black/10'

  return (
    <div
      className={`min-h-screen overflow-x-hidden transition-colors duration-300 ${page}`}
    >
      {/* BACKGROUND */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div
          className={`absolute -left-40 -top-40 h-[520px] w-[520px] rounded-full blur-3xl ${
            isDark ? 'bg-indigo-600/10' : 'bg-indigo-400/10'
          }`}
        />

        <div
          className={`absolute -right-40 top-[30%] h-[520px] w-[520px] rounded-full blur-3xl ${
            isDark ? 'bg-violet-600/8' : 'bg-violet-400/8'
          }`}
        />

        <div
          className={`absolute bottom-0 left-[35%] h-[400px] w-[400px] rounded-full blur-3xl ${
            isDark ? 'bg-cyan-600/5' : 'bg-cyan-400/5'
          }`}
        />
      </div>

      {/* NAVBAR */}
      <header className="fixed left-0 right-0 top-0 z-50 px-4 pt-4 sm:px-6 lg:px-8">
        <nav
          className={`mx-auto max-w-[1480px] rounded-2xl border px-4 py-3 backdrop-blur-xl sm:px-5 ${
            isDark
              ? 'border-white/10 bg-[#090a12]/80'
              : 'border-black/10 bg-white/80'
          }`}
        >
          <div className="flex items-center justify-between gap-4">
            <Link
              to="/"
              className="flex min-w-0 items-center gap-3"
              onClick={() => setMobileMenu(false)}
            >
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${
                  isDark
                    ? 'border-white/10 bg-white/[0.06]'
                    : 'border-black/10 bg-black/[0.04]'
                }`}
              >
                <span className="text-sm font-black tracking-tight">SL</span>
              </div>

              <div className="min-w-0">
                <div className="truncate text-sm font-bold tracking-tight">
                  SIPELAB-11
                </div>
                <div className={`hidden text-[11px] sm:block ${muted}`}>
                  Smart Lab Management
                </div>
              </div>
            </Link>

            {/* DESKTOP */}
            <div className="hidden items-center gap-2 md:flex">
              <a
                href="#tentang"
                className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                  isDark
                    ? 'text-white/65 hover:bg-white/5 hover:text-white'
                    : 'text-black/60 hover:bg-black/5 hover:text-black'
                }`}
              >
                Tentang
              </a>

              <button
                type="button"
                onClick={toggleTheme}
                aria-label={
                  isDark ? 'Aktifkan mode terang' : 'Aktifkan mode gelap'
                }
                className={`flex h-10 w-10 items-center justify-center rounded-xl border transition ${
                  isDark
                    ? 'border-white/10 text-white/70 hover:bg-white/5 hover:text-white'
                    : 'border-black/10 text-black/60 hover:bg-black/5 hover:text-black'
                }`}
              >
                <Icon name={isDark ? 'sun' : 'moon'} size={18} />
              </button>

              <Link
                to="/login"
                className={`rounded-xl px-4 py-2.5 text-sm font-bold transition ${
                  isDark
                    ? 'text-white/80 hover:bg-white/5 hover:text-white'
                    : 'text-black/70 hover:bg-black/5 hover:text-black'
                }`}
              >
                Masuk
              </Link>

              <Link
                to="/register"
                className="rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-black shadow-lg shadow-black/10 transition hover:-translate-y-0.5 hover:bg-white/90"
              >
                Daftar
              </Link>
            </div>

            {/* MOBILE */}
            <div className="flex items-center gap-2 md:hidden">
              <button
                type="button"
                onClick={toggleTheme}
                aria-label="Ganti tema"
                className={`flex h-10 w-10 items-center justify-center rounded-xl border ${
                  isDark
                    ? 'border-white/10 text-white/70'
                    : 'border-black/10 text-black/60'
                }`}
              >
                <Icon name={isDark ? 'sun' : 'moon'} size={18} />
              </button>

              <button
                type="button"
                onClick={() => setMobileMenu((value) => !value)}
                aria-label="Buka menu"
                className={`flex h-10 w-10 items-center justify-center rounded-xl border ${
                  isDark
                    ? 'border-white/10 text-white/70'
                    : 'border-black/10 text-black/60'
                }`}
              >
                <Icon name={mobileMenu ? 'close' : 'menu'} size={19} />
              </button>
            </div>
          </div>

          {mobileMenu && (
            <div
              className={`mt-3 border-t pt-3 md:hidden ${
                isDark ? 'border-white/10' : 'border-black/10'
              }`}
            >
              <div className="grid gap-2">
                <a
                  href="#tentang"
                  onClick={() => setMobileMenu(false)}
                  className={`rounded-xl px-4 py-3 text-sm font-semibold ${
                    isDark ? 'hover:bg-white/5' : 'hover:bg-black/5'
                  }`}
                >
                  Tentang
                </a>

                <Link
                  to="/login"
                  onClick={() => setMobileMenu(false)}
                  className={`rounded-xl px-4 py-3 text-sm font-semibold ${
                    isDark ? 'hover:bg-white/5' : 'hover:bg-black/5'
                  }`}
                >
                  Masuk
                </Link>

                <Link
                  to="/register"
                  onClick={() => setMobileMenu(false)}
                  className="rounded-xl bg-white px-4 py-3 text-center text-sm font-bold text-black"
                >
                  Daftar
                </Link>
              </div>
            </div>
          )}
        </nav>
      </header>

      {/* HERO */}
      <main>
        <section
          id="beranda"
          className="mx-auto max-w-[1480px] px-5 pb-20 pt-36 sm:px-8 sm:pt-40 lg:px-12 lg:pb-28 lg:pt-44"
        >
          <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">
            <div>
              <div
                className={`mb-7 inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-semibold ${
                  isDark
                    ? 'border-white/10 bg-white/[0.04] text-white/65'
                    : 'border-black/10 bg-white text-black/60'
                }`}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Sistem laboratorium yang lebih terstruktur
              </div>

              <h1
                className={`max-w-5xl text-[42px] font-black leading-[1.02] tracking-[-0.045em] sm:text-[58px] lg:text-[76px] ${
                  isDark ? 'text-white' : 'text-[#101116]'
                }`}
              >
                Kelola laboratorium.
                <br />
                <span
                  className={
                    isDark
                      ? 'text-white/35'
                      : 'text-black/25'
                  }
                >
                  Lebih sederhana.
                </span>
              </h1>

              <p
                className={`mt-7 max-w-2xl text-base font-medium leading-7 sm:text-lg sm:leading-8 ${muted}`}
              >
                SIPELAB-11 menyatukan peminjaman ruang, jadwal, persetujuan,
                dan informasi laboratorium dalam satu pengalaman yang rapi,
                cepat, dan mudah digunakan.
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/login"
                  className="group inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-bold text-black shadow-xl shadow-black/10 transition hover:-translate-y-0.5 hover:bg-white/90"
                >
                  Mulai menggunakan
                  <Icon
                    name="arrow"
                    size={17}
                    strokeWidth={2}
                  />
                </Link>

                <a
                  href="#laboratorium"
                  className={`inline-flex items-center justify-center rounded-xl border px-6 py-3.5 text-sm font-bold transition ${
                    isDark
                      ? 'border-white/10 text-white/75 hover:bg-white/5 hover:text-white'
                      : 'border-black/10 text-black/65 hover:bg-black/5 hover:text-black'
                  }`}
                >
                  Lihat laboratorium
                </a>
              </div>

              <div className="mt-10 flex flex-wrap items-center gap-x-7 gap-y-3">
                <div className="flex items-center gap-2">
                  <Icon name="shield" size={17} />
                  <span className={`text-xs font-semibold ${muted}`}>
                    Terstruktur
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Icon name="database" size={17} />
                  <span className={`text-xs font-semibold ${muted}`}>
                    Data terpusat
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Icon name="monitor" size={17} />
                  <span className={`text-xs font-semibold ${muted}`}>
                    Responsif
                  </span>
                </div>
              </div>
            </div>

            {/* HERO PRODUCT PREVIEW */}
            <div className="relative">
              <div
                className={`absolute -inset-5 rounded-[2rem] blur-3xl ${
                  isDark ? 'bg-indigo-500/10' : 'bg-indigo-500/5'
                }`}
              />

              <div
                className={`relative overflow-hidden rounded-[2rem] border p-3 shadow-2xl ${
                  isDark
                    ? 'border-white/10 bg-[#0d0f18]/90 shadow-black/30'
                    : 'border-black/10 bg-white shadow-black/10'
                }`}
              >
                <div
                  className={`rounded-[1.5rem] border ${
                    isDark
                      ? 'border-white/10 bg-[#10121c]'
                      : 'border-black/10 bg-[#fafafa]'
                  }`}
                >
                  <div
                    className={`flex items-center justify-between border-b px-5 py-4 ${
                      isDark ? 'border-white/10' : 'border-black/10'
                    }`}
                  >
                    <div>
                      <div className="text-sm font-bold">
                        Pengajuan Booking
                      </div>
                      <div className={`mt-0.5 text-xs ${muted}`}>
                        Buat jadwal penggunaan laboratorium
                      </div>
                    </div>

                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                        isDark ? 'bg-white/5' : 'bg-black/5'
                      }`}
                    >
                      <Icon name="calendar" size={18} />
                    </div>
                  </div>

                  <div className="space-y-4 p-5">
                    <div>
                      <div className={`mb-2 text-[11px] font-bold ${muted}`}>
                        LABORATORIUM
                      </div>

                      <div
                        className={`flex items-center justify-between rounded-xl border px-4 py-3 ${
                          isDark
                            ? 'border-white/10 bg-white/[0.025]'
                            : 'border-black/10 bg-black/[0.02]'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                              isDark ? 'bg-indigo-500/10' : 'bg-indigo-500/10'
                            }`}
                          >
                            <Icon name="lab" size={18} />
                          </div>

                          <div>
                            <div className="text-sm font-bold">
                              Laboratorium RPL 01
                            </div>
                            <div className={`text-xs ${muted}`}>
                              36 peserta
                            </div>
                          </div>
                        </div>

                        <Icon name="check" size={18} />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <div className={`mb-2 text-[11px] font-bold ${muted}`}>
                          TANGGAL
                        </div>

                        <div
                          className={`rounded-xl border px-4 py-3 text-sm font-semibold ${
                            isDark
                              ? 'border-white/10 bg-white/[0.025]'
                              : 'border-black/10 bg-black/[0.02]'
                          }`}
                        >
                          12 Sep 2026
                        </div>
                      </div>

                      <div>
                        <div className={`mb-2 text-[11px] font-bold ${muted}`}>
                          WAKTU
                        </div>

                        <div
                          className={`rounded-xl border px-4 py-3 text-sm font-semibold ${
                            isDark
                              ? 'border-white/10 bg-white/[0.025]'
                              : 'border-black/10 bg-black/[0.02]'
                          }`}
                        >
                          08:00–10:00
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className={`mb-2 text-[11px] font-bold ${muted}`}>
                        STATUS
                      </div>

                      <div
                        className={`flex items-center justify-between rounded-xl border px-4 py-3 ${
                          isDark
                            ? 'border-emerald-400/10 bg-emerald-400/[0.04]'
                            : 'border-emerald-500/15 bg-emerald-500/[0.04]'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-emerald-400" />
                          <span className="text-sm font-bold">
                            Menunggu persetujuan
                          </span>
                        </div>

                        <Icon name="clock" size={17} />
                      </div>
                    </div>

                    <button
                      type="button"
                      className="w-full rounded-xl bg-white px-4 py-3.5 text-sm font-bold text-black"
                    >
                      Ajukan Booking
                    </button>
                  </div>
                </div>
              </div>

              <div
                className={`absolute -bottom-5 -left-5 hidden rounded-2xl border px-4 py-3 shadow-xl sm:block ${
                  isDark
                    ? 'border-white/10 bg-[#11131d]/95'
                    : 'border-black/10 bg-white/95'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-400/10 text-emerald-500">
                    <Icon name="check" size={18} />
                  </div>
                  <div>
                    <div className="text-xs font-bold">
                      Jadwal terorganisir
                    </div>
                    <div className={`text-[11px] ${muted}`}>
                      Lebih mudah dipantau
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* LABORATORIUM */}
        <section
          id="laboratorium"
          className={`scroll-mt-28 border-y ${
            isDark ? 'border-white/10' : 'border-black/10'
          }`}
        >
          <div className="mx-auto max-w-[1480px] px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
            <div className="flex flex-col justify-between gap-7 lg:flex-row lg:items-end">
              <div>
                <div
                  className={`mb-4 text-xs font-bold uppercase tracking-[0.22em] ${
                    isDark ? 'text-white/35' : 'text-black/35'
                  }`}
                >
                  Laboratorium
                </div>

                <h2 className="max-w-3xl text-3xl font-black tracking-[-0.035em] sm:text-5xl">
                  Ruang yang tersedia,
                  <br />
                  informasi yang jelas.
                </h2>
              </div>

              <p
                className={`max-w-md text-sm font-medium leading-6 ${muted}`}
              >
                Informasi laboratorium dibuat lebih mudah dipahami agar proses
                memilih ruang dan menyusun jadwal menjadi lebih cepat.
              </p>
            </div>

            <div className="mt-12 grid gap-4 lg:grid-cols-3">
              {labs.map((lab) => (
                <div
                  key={lab.name}
                  className={`group relative overflow-hidden rounded-2xl border p-6 transition duration-300 hover:-translate-y-1 ${
                    isDark
                      ? 'border-white/10 bg-white/[0.025] hover:bg-white/[0.045]'
                      : 'border-black/10 bg-white hover:bg-white/80'
                  }`}
                >
                  <div
                    className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${lab.accent}`}
                  />

                  <div className="relative">
                    <div className="flex items-start justify-between gap-4">
                      <div
                        className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                          isDark ? 'bg-white/5' : 'bg-black/5'
                        }`}
                      >
                        <Icon name="lab" size={21} />
                      </div>

                      <span
                        className={`rounded-full px-3 py-1.5 text-[11px] font-bold ${
                          lab.status === 'Tersedia'
                            ? 'bg-emerald-400/10 text-emerald-500'
                            : isDark
                              ? 'bg-white/5 text-white/50'
                              : 'bg-black/5 text-black/50'
                        }`}
                      >
                        {lab.status}
                      </span>
                    </div>

                    <div className="mt-10">
                      <h3 className="text-xl font-black tracking-tight">
                        {lab.name}
                      </h3>

                      <p className={`mt-2 text-sm font-medium ${muted}`}>
                        {lab.category}
                      </p>
                    </div>

                    <div
                      className={`mt-7 flex items-center justify-between border-t pt-4 ${
                        isDark ? 'border-white/10' : 'border-black/10'
                      }`}
                    >
                      <span className={`text-xs font-semibold ${muted}`}>
                        Kapasitas
                      </span>
                      <span className="text-sm font-bold">
                        {lab.capacity}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FITUR */}
        <section
          id="fitur"
          className="scroll-mt-28 mx-auto max-w-[1480px] px-5 py-20 sm:px-8 lg:px-12 lg:py-32"
        >
          <div className="grid gap-14 lg:grid-cols-[0.75fr_1.25fr] lg:gap-24">
            <div>
              <div
                className={`mb-4 text-xs font-bold uppercase tracking-[0.22em] ${
                  isDark ? 'text-white/35' : 'text-black/35'
                }`}
              >
                Fitur utama
              </div>

              <h2 className="max-w-xl text-3xl font-black tracking-[-0.035em] sm:text-5xl">
                Semua yang penting,
                <br />
                tetap sederhana.
              </h2>

              <p
                className={`mt-6 max-w-md text-sm font-medium leading-7 ${muted}`}
              >
                Sistem dirancang untuk mengurangi proses yang berulang dan
                membuat informasi penggunaan laboratorium lebih mudah
                dipantau.
              </p>
            </div>

            <div
              className={`divide-y border-y ${
                isDark ? 'divide-white/10 border-white/10' : 'divide-black/10 border-black/10'
              }`}
            >
              {features.map((feature) => (
                <div
                  key={feature.number}
                  className="group grid gap-5 py-7 sm:grid-cols-[60px_48px_1fr] sm:items-start"
                >
                  <span
                    className={`text-xs font-bold tracking-wider ${
                      isDark ? 'text-white/30' : 'text-black/30'
                    }`}
                  >
                    {feature.number}
                  </span>

                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                      isDark ? 'bg-white/5' : 'bg-black/5'
                    }`}
                  >
                    <Icon name={feature.icon} size={20} />
                  </div>

                  <div>
                    <h3 className="text-lg font-black tracking-tight">
                      {feature.title}
                    </h3>

                    <p
                      className={`mt-2 max-w-xl text-sm font-medium leading-6 ${muted}`}
                    >
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CARA KERJA */}
        <section
          id="cara-kerja"
          className={`scroll-mt-28 border-y ${
            isDark ? 'border-white/10 bg-white/[0.015]' : 'border-black/10 bg-black/[0.015]'
          }`}
        >
          <div className="mx-auto max-w-[1480px] px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
            <div className="max-w-2xl">
              <div
                className={`mb-4 text-xs font-bold uppercase tracking-[0.22em] ${
                  isDark ? 'text-white/35' : 'text-black/35'
                }`}
              >
                Cara kerja
              </div>

              <h2 className="text-3xl font-black tracking-[-0.035em] sm:text-5xl">
                Dari pencarian ruang
                <br />
                sampai persetujuan.
              </h2>
            </div>

            <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {steps.map((step) => (
                <div
                  key={step.number}
                  className={`relative rounded-2xl border p-6 ${
                    isDark
                      ? 'border-white/10 bg-[#0c0e16]'
                      : 'border-black/10 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                        isDark ? 'bg-white/5' : 'bg-black/5'
                      }`}
                    >
                      <Icon name={step.icon} size={20} />
                    </div>

                    <span
                      className={`text-xs font-bold ${
                        isDark ? 'text-white/25' : 'text-black/25'
                      }`}
                    >
                      {step.number}
                    </span>
                  </div>

                  <h3 className="mt-9 text-lg font-black">
                    {step.title}
                  </h3>

                  <p
                    className={`mt-2 text-sm font-medium leading-6 ${muted}`}
                  >
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* TENTANG */}
        <section
          id="tentang"
          className="scroll-mt-28 mx-auto max-w-[1480px] px-5 py-20 sm:px-8 lg:px-12 lg:py-32"
        >
          <div
            className={`overflow-hidden rounded-[2rem] border ${
              isDark
                ? 'border-white/10 bg-white/[0.025]'
                : 'border-black/10 bg-white'
            }`}
          >
            <div className="grid lg:grid-cols-[0.9fr_1.1fr]">
              <div
                className={`relative min-h-[330px] overflow-hidden border-b p-8 sm:p-12 lg:border-b-0 lg:border-r ${
                  isDark ? 'border-white/10' : 'border-black/10'
                }`}
              >
                <div className="absolute inset-0">
                  <div
                    className={`absolute left-10 top-10 h-40 w-40 rounded-full border ${
                      isDark ? 'border-white/10' : 'border-black/10'
                    }`}
                  />

                  <div
                    className={`absolute bottom-10 right-10 h-56 w-56 rounded-full border ${
                      isDark ? 'border-white/5' : 'border-black/5'
                    }`}
                  />

                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                    <div
                      className={`flex h-28 w-28 items-center justify-center rounded-[2rem] border ${
                        isDark
                          ? 'border-white/10 bg-white/[0.04]'
                          : 'border-black/10 bg-black/[0.03]'
                      }`}
                    >
                      <Icon name="lab" size={48} strokeWidth={1.2} />
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <span
                    className={`text-xs font-bold uppercase tracking-[0.2em] ${
                      isDark ? 'text-white/35' : 'text-black/35'
                    }`}
                  >
                    Tentang SIPELAB-11
                  </span>
                </div>
              </div>

              <div className="p-8 sm:p-12 lg:p-16">
                <h2 className="max-w-3xl text-3xl font-black tracking-[-0.035em] sm:text-5xl">
                  Satu tempat untuk mengatur
                  penggunaan laboratorium.
                </h2>

                <p
                  className={`mt-7 max-w-2xl text-base font-medium leading-8 ${muted}`}
                >
                  SIPELAB-11 dirancang sebagai sistem manajemen laboratorium
                  yang membantu pengguna mengelola proses peminjaman secara
                  lebih terarah. Mulai dari melihat ruang, menentukan jadwal,
                  mengirim pengajuan, hingga memantau persetujuan.
                </p>

                <div className="mt-9 grid gap-4 sm:grid-cols-2">
                  <div
                    className={`rounded-2xl border p-5 ${
                      isDark
                        ? 'border-white/10 bg-white/[0.02]'
                        : 'border-black/10 bg-black/[0.02]'
                    }`}
                  >
                    <Icon name="users" size={21} />

                    <h3 className="mt-4 text-sm font-black">
                      Untuk berbagai pengguna
                    </h3>

                    <p className={`mt-2 text-xs font-medium leading-5 ${muted}`}>
                      Mendukung alur penggunaan laboratorium yang lebih
                      terorganisir.
                    </p>
                  </div>

                  <div
                    className={`rounded-2xl border p-5 ${
                      isDark
                        ? 'border-white/10 bg-white/[0.02]'
                        : 'border-black/10 bg-black/[0.02]'
                    }`}
                  >
                    <Icon name="monitor" size={21} />

                    <h3 className="mt-4 text-sm font-black">
                      Siap digunakan lintas perangkat
                    </h3>

                    <p className={`mt-2 text-xs font-medium leading-5 ${muted}`}>
                      Antarmuka dibuat responsif untuk desktop maupun perangkat
                      mobile.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-[1480px] px-5 pb-20 sm:px-8 lg:px-12 lg:pb-28">
          <div
            className={`relative overflow-hidden rounded-[2rem] border px-7 py-14 text-center sm:px-12 sm:py-20 ${
              isDark
                ? 'border-white/10 bg-white/[0.035]'
                : 'border-black/10 bg-black/[0.025]'
            }`}
          >
            <div
              className={`pointer-events-none absolute left-1/2 top-0 h-56 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl ${
                isDark ? 'bg-indigo-500/15' : 'bg-indigo-500/10'
              }`}
            />

            <div className="relative">
              <div
                className={`mx-auto flex h-12 w-12 items-center justify-center rounded-2xl ${
                  isDark ? 'bg-white/5' : 'bg-black/5'
                }`}
              >
                <Icon name="lab" size={22} />
              </div>

              <h2 className="mx-auto mt-6 max-w-3xl text-3xl font-black tracking-[-0.035em] sm:text-5xl">
                Saatnya membuat pengelolaan
                laboratorium lebih terarah.
              </h2>

              <p
                className={`mx-auto mt-5 max-w-xl text-sm font-medium leading-6 ${muted}`}
              >
                Mulai dari satu sistem untuk mengatur peminjaman, jadwal,
                persetujuan, dan informasi laboratorium.
              </p>

              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <Link
                  to="/register"
                  className="rounded-xl bg-white px-6 py-3.5 text-sm font-bold text-black transition hover:-translate-y-0.5 hover:bg-white/90"
                >
                  Buat akun
                </Link>

                <Link
                  to="/login"
                  className={`rounded-xl border px-6 py-3.5 text-sm font-bold transition ${
                    isDark
                      ? 'border-white/10 text-white/75 hover:bg-white/5 hover:text-white'
                      : 'border-black/10 text-black/65 hover:bg-black/5 hover:text-black'
                  }`}
                >
                  Masuk ke sistem
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer
        className={`border-t ${
          isDark ? 'border-white/10' : 'border-black/10'
        }`}
      >
        <div className="mx-auto max-w-[1480px] px-5 py-14 sm:px-8 lg:px-12 lg:py-16">
          <div className="grid gap-12 lg:grid-cols-[1.5fr_0.8fr_0.9fr_1fr]">
            {/* BRAND */}
            <div>
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl border ${
                    isDark
                      ? 'border-white/10 bg-white/[0.04]'
                      : 'border-black/10 bg-black/[0.03]'
                  }`}
                >
                  <span className="text-sm font-black">SL</span>
                </div>

                <div>
                  <div className="text-sm font-black">SIPELAB-11</div>
                  <div className={`text-[11px] ${muted}`}>
                    Smart Lab Management
                  </div>
                </div>
              </div>

              <p
                className={`mt-6 max-w-sm text-sm font-medium leading-6 ${muted}`}
              >
                Platform untuk membantu pengelolaan peminjaman, jadwal, dan
                penggunaan laboratorium secara lebih terstruktur.
              </p>
            </div>

            {/* NAVIGASI */}
            <div>
              <h3 className="text-xs font-black uppercase tracking-[0.18em]">
                Navigasi
              </h3>

              <div className="mt-5 grid gap-3">
                <a
                  href="#beranda"
                  className={`w-fit text-sm font-medium transition ${
                    isDark
                      ? 'text-white/50 hover:text-white'
                      : 'text-black/50 hover:text-black'
                  }`}
                >
                  Beranda
                </a>

                <a
                  href="#laboratorium"
                  className={`w-fit text-sm font-medium transition ${
                    isDark
                      ? 'text-white/50 hover:text-white'
                      : 'text-black/50 hover:text-black'
                  }`}
                >
                  Laboratorium
                </a>

                <a
                  href="#fitur"
                  className={`w-fit text-sm font-medium transition ${
                    isDark
                      ? 'text-white/50 hover:text-white'
                      : 'text-black/50 hover:text-black'
                  }`}
                >
                  Fitur
                </a>

                <a
                  href="#cara-kerja"
                  className={`w-fit text-sm font-medium transition ${
                    isDark
                      ? 'text-white/50 hover:text-white'
                      : 'text-black/50 hover:text-black'
                  }`}
                >
                  Cara Kerja
                </a>

                <a
                  href="#tentang"
                  className={`w-fit text-sm font-medium transition ${
                    isDark
                      ? 'text-white/50 hover:text-white'
                      : 'text-black/50 hover:text-black'
                  }`}
                >
                  Tentang
                </a>
              </div>
            </div>

            {/* SISTEM */}
            <div>
              <h3 className="text-xs font-black uppercase tracking-[0.18em]">
                Sistem
              </h3>

              <div className="mt-5 grid gap-3">
                <Link
                  to="/login"
                  className={`w-fit text-sm font-medium transition ${
                    isDark
                      ? 'text-white/50 hover:text-white'
                      : 'text-black/50 hover:text-black'
                  }`}
                >
                  Masuk
                </Link>

                <Link
                  to="/register"
                  className={`w-fit text-sm font-medium transition ${
                    isDark
                      ? 'text-white/50 hover:text-white'
                      : 'text-black/50 hover:text-black'
                  }`}
                >
                  Daftar
                </Link>

                <span className={`text-sm font-medium ${muted}`}>
                  Peminjaman
                </span>

                <span className={`text-sm font-medium ${muted}`}>
                  Jadwal
                </span>

                <span className={`text-sm font-medium ${muted}`}>
                  Persetujuan
                </span>
              </div>
            </div>

            {/* INFORMASI */}
            <div>
              <h3 className="text-xs font-black uppercase tracking-[0.18em]">
                Informasi
              </h3>

              <div className="mt-5 space-y-4">
                <div className="flex gap-3">
                  <div className="mt-0.5 shrink-0">
                    <Icon name="monitor" size={17} />
                  </div>

                  <p className={`text-sm font-medium leading-5 ${muted}`}>
                    Sistem manajemen laboratorium berbasis web.
                  </p>
                </div>

                <div className="flex gap-3">
                  <div className="mt-0.5 shrink-0">
                    <Icon name="clock" size={17} />
                  </div>

                  <p className={`text-sm font-medium leading-5 ${muted}`}>
                    Pengajuan dan pemantauan booking dalam satu sistem.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div
            className={`mt-14 flex flex-col gap-4 border-t pt-6 sm:flex-row sm:items-center sm:justify-between ${
              isDark ? 'border-white/10' : 'border-black/10'
            }`}
          >
            <p className={`text-xs font-medium ${muted}`}>
              © {new Date().getFullYear()} SIPELAB-11. All rights reserved.
            </p>

            <div className={`text-xs font-medium ${muted}`}>
              Smart Lab Management
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}