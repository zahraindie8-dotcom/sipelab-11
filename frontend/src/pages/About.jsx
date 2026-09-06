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
    users: (
      <>
        <circle cx="9" cy="8" r="3" />
        <path d="M3.5 20c.5-3.5 2.4-5.5 5.5-5.5s5 2 5.5 5.5" />
        <path d="M16 5.5a3 3 0 0 1 0 5.8" />
        <path d="M16.5 14.5c2.2.3 3.5 2 4 4.5" />
      </>
    ),
    shield: (
      <>
        <path d="M12 3 20 6v5.5c0 4.7-3.2 8.1-8 9.5-4.8-1.4-8-4.8-8-9.5V6l8-3Z" />
        <path d="m8.5 12 2.2 2.2 4.8-4.8" />
      </>
    ),
    arrow: (
      <>
        <path d="M5 12h13" />
        <path d="m13 6 6 6-6 6" />
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
      <path d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5 8.5 8.5 0 1 0 20.5 14.5Z" />
    ),
    question: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M9.5 9a2.7 2.7 0 1 1 4.8 1.7c-.9 1-2.3 1.4-2.3 3" />
        <path d="M12 17h.01" />
      </>
    ),
  }

  return <svg {...common}>{icons[name]}</svg>
}

const faqs = [
  {
    question: 'Apa itu SIPELAB-11?',
    answer:
      'SIPELAB-11 adalah Smart Lab Management, sebuah platform untuk membantu mengelola peminjaman, jadwal, persetujuan, dan penggunaan laboratorium secara lebih terstruktur dalam satu sistem.',
  },
  {
    question: 'Siapa saja yang dapat menggunakan SIPELAB?',
    answer:
      'SIPELAB dapat digunakan oleh guru, staf, siswa dan siswi, mahasiswa, serta pengelola atau administrator laboratorium sesuai dengan hak akses masing-masing.',
  },
  {
    question: 'Apakah siswa dan siswi dapat melakukan booking laboratorium?',
    answer:
      'Ya. Siswa dan siswi yang memiliki akun dapat mengajukan booking laboratorium dengan mengisi data penggunaan seperti laboratorium, tanggal, waktu, tujuan, dan informasi pendukung lainnya.',
  },
  {
    question: 'Apakah booking langsung disetujui setelah diajukan?',
    answer:
      'Tidak selalu. Pengajuan booking perlu melalui proses pemeriksaan dan persetujuan dari pihak yang memiliki kewenangan sebelum penggunaan laboratorium dapat dilakukan.',
  },
  {
    question: 'Bagaimana cara mengetahui status booking?',
    answer:
      'Status booking dapat dipantau melalui sistem. Pengguna dapat melihat apakah pengajuan masih menunggu, telah disetujui, atau ditolak.',
  },
  {
    question: 'Apakah laporan penggunaan laboratorium diperlukan?',
    answer:
      'Untuk penggunaan yang telah disetujui, pengguna dapat diminta mengirimkan laporan penggunaan laboratorium agar aktivitas setelah penggunaan ruang dapat terdokumentasi dengan lebih baik.',
  },
  {
    question: 'Apakah SIPELAB dapat digunakan melalui HP?',
    answer:
      'Ya. Tampilan SIPELAB dirancang responsif sehingga dapat digunakan melalui komputer, laptop, tablet, maupun smartphone.',
  },
]

const audiences = [
  {
    icon: 'users',
    title: 'Guru & Staf',
    description:
      'Membantu mengajukan, memantau, dan mengelola penggunaan laboratorium sesuai kebutuhan kegiatan.',
  },
  {
    icon: 'users',
    title: 'Siswa & Siswi',
    description:
      'Memudahkan proses pengajuan penggunaan laboratorium dan pemantauan status booking.',
  },
  {
    icon: 'lab',
    title: 'Mahasiswa',
    description:
      'Mendukung pengelolaan kebutuhan penggunaan laboratorium secara lebih teratur dan terdokumentasi.',
  },
  {
    icon: 'shield',
    title: 'Pengelola Laboratorium',
    description:
      'Membantu mengatur data laboratorium, pengguna, jadwal, booking, dan proses persetujuan.',
  },
]

const workflow = [
  {
    number: '01',
    title: 'Pilih laboratorium',
    description:
      'Temukan ruang laboratorium yang sesuai dengan kebutuhan kegiatan.',
    icon: 'lab',
  },
  {
    number: '02',
    title: 'Ajukan booking',
    description:
      'Tentukan tanggal, waktu, tujuan, dan data penggunaan laboratorium.',
    icon: 'booking',
  },
  {
    number: '03',
    title: 'Proses persetujuan',
    description:
      'Pengajuan diperiksa dan diproses oleh pihak yang memiliki kewenangan.',
    icon: 'check',
  },
  {
    number: '04',
    title: 'Gunakan & laporkan',
    description:
      'Setelah disetujui, laboratorium dapat digunakan dan aktivitas dapat dilaporkan.',
    icon: 'calendar',
  },
]

export default function About() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('sipelab-theme') || 'dark'
  })

  const [mobileMenu, setMobileMenu] = useState(false)
  const [openFaq, setOpenFaq] = useState(null)

  const isDark = theme === 'dark'

  useEffect(() => {
    localStorage.setItem('sipelab-theme', theme)
  }, [theme])

  useEffect(() => {
    document.title = 'Tentang SIPELAB-11 | Smart Lab Management'

    const description =
      'Kenali SIPELAB-11, sistem manajemen laboratorium untuk membantu guru, staf, siswa, siswi, mahasiswa, dan pengelola laboratorium mengatur peminjaman, jadwal, persetujuan, dan penggunaan laboratorium.'

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
              <Link
                to="/"
                className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                  isDark
                    ? 'text-white/65 hover:bg-white/5 hover:text-white'
                    : 'text-black/60 hover:bg-black/5 hover:text-black'
                }`}
              >
                Beranda
              </Link>

              <a
                href="/#laboratorium"
                className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                  isDark
                    ? 'text-white/65 hover:bg-white/5 hover:text-white'
                    : 'text-black/60 hover:bg-black/5 hover:text-black'
                }`}
              >
                Laboratorium
              </a>

              <a
                href="/#cara-kerja"
                className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                  isDark
                    ? 'text-white/65 hover:bg-white/5 hover:text-white'
                    : 'text-black/60 hover:bg-black/5 hover:text-black'
                }`}
              >
                Cara Kerja
              </a>

              <Link
                to="/about"
                className={`rounded-xl px-4 py-2 text-sm font-bold ${
                  isDark
                    ? 'bg-white/10 text-white'
                    : 'bg-black/5 text-black'
                }`}
              >
                Tentang
              </Link>

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
                <Link
                  to="/"
                  onClick={() => setMobileMenu(false)}
                  className={`rounded-xl px-4 py-3 text-sm font-semibold ${
                    isDark ? 'hover:bg-white/5' : 'hover:bg-black/5'
                  }`}
                >
                  Beranda
                </Link>

                <a
                  href="/#laboratorium"
                  onClick={() => setMobileMenu(false)}
                  className={`rounded-xl px-4 py-3 text-sm font-semibold ${
                    isDark ? 'hover:bg-white/5' : 'hover:bg-black/5'
                  }`}
                >
                  Laboratorium
                </a>

                <a
                  href="/#cara-kerja"
                  onClick={() => setMobileMenu(false)}
                  className={`rounded-xl px-4 py-3 text-sm font-semibold ${
                    isDark ? 'hover:bg-white/5' : 'hover:bg-black/5'
                  }`}
                >
                  Cara Kerja
                </a>

                <Link
                  to="/about"
                  onClick={() => setMobileMenu(false)}
                  className={`rounded-xl px-4 py-3 text-sm font-bold ${
                    isDark ? 'bg-white/10' : 'bg-black/5'
                  }`}
                >
                  Tentang
                </Link>

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

      <main>
        {/* HERO */}
        <section className="mx-auto max-w-[1480px] px-5 pb-20 pt-36 sm:px-8 sm:pt-40 lg:px-12 lg:pb-28 lg:pt-44">
          <div className="max-w-4xl">
            <div
              className={`mb-7 inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-semibold ${
                isDark
                  ? 'border-white/10 bg-white/[0.04] text-white/65'
                  : 'border-black/10 bg-white text-black/60'
              }`}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Tentang SIPELAB-11
            </div>

            <h1 className="text-[42px] font-black leading-[1.02] tracking-[-0.045em] sm:text-[62px] lg:text-[78px]">
              Mengatur laboratorium.
              <br />
              <span
                className={
                  isDark ? 'text-white/35' : 'text-black/25'
                }
              >
                Lebih terarah.
              </span>
            </h1>

            <p
              className={`mt-7 max-w-3xl text-base font-medium leading-8 sm:text-lg ${muted}`}
            >
              SIPELAB-11 adalah Smart Lab Management yang membantu mengelola
              peminjaman, jadwal, persetujuan, dan penggunaan laboratorium
              dalam satu sistem yang lebih rapi dan mudah dipantau.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-bold text-black shadow-xl transition hover:-translate-y-0.5 hover:bg-white/90"
              >
                Mulai menggunakan
                <Icon name="arrow" size={17} strokeWidth={2} />
              </Link>

              <a
                href="#faq"
                className={`inline-flex items-center justify-center rounded-xl border px-6 py-3.5 text-sm font-bold transition ${
                  isDark
                    ? 'border-white/10 text-white/75 hover:bg-white/5 hover:text-white'
                    : 'border-black/10 text-black/65 hover:bg-black/5 hover:text-black'
                }`}
              >
                Lihat Q&A
              </a>
            </div>
          </div>
        </section>

        {/* TENTANG */}
        <section className={`border-y ${border}`}>
          <div className="mx-auto max-w-[1480px] px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
            <div className="grid gap-14 lg:grid-cols-[0.8fr_1.2fr] lg:gap-24">
              <div>
                <div
                  className={`mb-4 text-xs font-bold uppercase tracking-[0.22em] ${
                    isDark ? 'text-white/35' : 'text-black/35'
                  }`}
                >
                  Tentang platform
                </div>

                <h2 className="text-3xl font-black tracking-[-0.035em] sm:text-5xl">
                  Satu sistem untuk
                  <br />
                  penggunaan lab.
                </h2>
              </div>

              <div>
                <p
                  className={`text-base font-medium leading-8 sm:text-lg ${muted}`}
                >
                  Pengelolaan laboratorium membutuhkan informasi yang jelas
                  mengenai ruang, waktu, pengguna, dan status peminjaman.
                  SIPELAB-11 dibuat untuk menyatukan proses tersebut sehingga
                  pengguna tidak perlu bergantung pada pencatatan yang
                  terpisah-pisah.
                </p>

                <p
                  className={`mt-6 text-base font-medium leading-8 sm:text-lg ${muted}`}
                >
                  Dengan alur booking dan persetujuan yang jelas, setiap
                  penggunaan laboratorium dapat lebih mudah dipantau dan
                  didokumentasikan.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* UNTUK SIAPA */}
        <section className="mx-auto max-w-[1480px] px-5 py-20 sm:px-8 lg:px-12 lg:py-32">
          <div className="max-w-3xl">
            <div
              className={`mb-4 text-xs font-bold uppercase tracking-[0.22em] ${
                isDark ? 'text-white/35' : 'text-black/35'
              }`}
            >
              Untuk siapa?
            </div>

            <h2 className="text-3xl font-black tracking-[-0.035em] sm:text-5xl">
              Dibuat untuk berbagai
              <br />
              kebutuhan pengguna.
            </h2>

            <p className={`mt-6 max-w-2xl text-sm leading-7 ${muted}`}>
              SIPELAB dirancang agar dapat mendukung berbagai pengguna yang
              membutuhkan akses dan pengelolaan laboratorium secara lebih
              terstruktur.
            </p>
          </div>

          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {audiences.map((item) => (
              <div
                key={item.title}
                className={`rounded-2xl border p-6 transition duration-300 hover:-translate-y-1 ${
                  isDark
                    ? 'border-white/10 bg-white/[0.025] hover:bg-white/[0.045]'
                    : 'border-black/10 bg-white hover:bg-black/[0.02]'
                }`}
              >
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                    isDark ? 'bg-white/5' : 'bg-black/5'
                  }`}
                >
                  <Icon name={item.icon} size={21} />
                </div>

                <h3 className="mt-8 text-lg font-black">{item.title}</h3>

                <p className={`mt-3 text-sm leading-6 ${muted}`}>
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ALUR */}
        <section className={`border-y ${border}`}>
          <div className="mx-auto max-w-[1480px] px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
            <div className="max-w-3xl">
              <div
                className={`mb-4 text-xs font-bold uppercase tracking-[0.22em] ${
                  isDark ? 'text-white/35' : 'text-black/35'
                }`}
              >
                Alur penggunaan
              </div>

              <h2 className="text-3xl font-black tracking-[-0.035em] sm:text-5xl">
                Dari booking sampai
                <br />
                penggunaan laboratorium.
              </h2>
            </div>

            <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {workflow.map((item) => (
                <div
                  key={item.number}
                  className={`rounded-2xl border p-6 ${
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
                      <Icon name={item.icon} size={20} />
                    </div>

                    <span
                      className={`text-xs font-bold ${
                        isDark ? 'text-white/25' : 'text-black/25'
                      }`}
                    >
                      {item.number}
                    </span>
                  </div>

                  <h3 className="mt-9 text-lg font-black">
                    {item.title}
                  </h3>

                  <p className={`mt-2 text-sm leading-6 ${muted}`}>
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* KEUNGGULAN */}
        <section className="mx-auto max-w-[1480px] px-5 py-20 sm:px-8 lg:px-12 lg:py-32">
          <div className="grid gap-14 lg:grid-cols-[0.75fr_1.25fr] lg:gap-24">
            <div>
              <div
                className={`mb-4 text-xs font-bold uppercase tracking-[0.22em] ${
                  isDark ? 'text-white/35' : 'text-black/35'
                }`}
              >
                Mengapa SIPELAB?
              </div>

              <h2 className="text-3xl font-black tracking-[-0.035em] sm:text-5xl">
                Lebih jelas.
                <br />
                Lebih teratur.
              </h2>
            </div>

            <div
              className={`divide-y border-y ${
                isDark
                  ? 'divide-white/10 border-white/10'
                  : 'divide-black/10 border-black/10'
              }`}
            >
              {[
                {
                  title: 'Informasi terpusat',
                  text: 'Data laboratorium, booking, jadwal, dan status penggunaan berada dalam satu sistem.',
                },
                {
                  title: 'Jadwal lebih mudah dipantau',
                  text: 'Pengguna dapat melihat informasi waktu penggunaan dan status pengajuan dengan lebih jelas.',
                },
                {
                  title: 'Proses persetujuan terdokumentasi',
                  text: 'Setiap pengajuan memiliki status sehingga proses booking lebih mudah ditelusuri.',
                },
                {
                  title: 'Dapat digunakan lintas perangkat',
                  text: 'Antarmuka responsif sehingga sistem dapat digunakan melalui komputer maupun smartphone.',
                },
              ].map((item, index) => (
                <div key={item.title} className="grid gap-4 py-7 sm:grid-cols-[50px_1fr]">
                  <span
                    className={`text-xs font-bold ${
                      isDark ? 'text-white/30' : 'text-black/30'
                    }`}
                  >
                    0{index + 1}
                  </span>

                  <div>
                    <h3 className="text-lg font-black">{item.title}</h3>
                    <p className={`mt-2 text-sm leading-6 ${muted}`}>
                      {item.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section
          id="faq"
          className={`scroll-mt-28 border-y ${
            isDark
              ? 'border-white/10 bg-white/[0.015]'
              : 'border-black/10 bg-black/[0.015]'
          }`}
        >
          <div className="mx-auto max-w-[1000px] px-5 py-20 sm:px-8 lg:py-28">
            <div className="text-center">
              <div
                className={`mb-4 text-xs font-bold uppercase tracking-[0.22em] ${
                  isDark ? 'text-white/35' : 'text-black/35'
                }`}
              >
                Q&A
              </div>

              <h2 className="text-3xl font-black tracking-[-0.035em] sm:text-5xl">
                Pertanyaan yang sering
                <br />
                ditanyakan.
              </h2>

              <p className={`mx-auto mt-6 max-w-2xl text-sm leading-7 ${muted}`}>
                Beberapa pertanyaan umum mengenai SIPELAB dan proses
                penggunaan laboratorium.
              </p>
            </div>

            <div className="mt-12 space-y-3">
              {faqs.map((faq, index) => {
                const isOpen = openFaq === index

                return (
                  <div
                    key={faq.question}
                    className={`overflow-hidden rounded-2xl border ${
                      isDark
                        ? 'border-white/10 bg-[#0c0e16]'
                        : 'border-black/10 bg-white'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setOpenFaq(isOpen ? null : index)
                      }
                      className="flex w-full items-center justify-between gap-5 px-5 py-5 text-left sm:px-6"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                            isDark ? 'bg-white/5' : 'bg-black/5'
                          }`}
                        >
                          <Icon name="question" size={17} />
                        </div>

                        <span className="text-sm font-bold sm:text-base">
                          {faq.question}
                        </span>
                      </div>

                      <span
                        className={`text-xl font-light transition-transform ${
                          isOpen ? 'rotate-45' : ''
                        }`}
                      >
                        +
                      </span>
                    </button>

                    {isOpen && (
                      <div className="px-5 pb-5 sm:px-6 sm:pb-6">
                        <div
                          className={`ml-[52px] border-l pl-5 text-sm leading-7 ${muted} ${
                            isDark ? 'border-white/10' : 'border-black/10'
                          }`}
                        >
                          {faq.answer}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-[1480px] px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
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
                Siap mengelola penggunaan
                laboratorium dengan lebih teratur?
              </h2>

              <p
                className={`mx-auto mt-5 max-w-xl text-sm leading-6 ${muted}`}
              >
                Gunakan SIPELAB-11 untuk membantu mengatur booking, jadwal,
                persetujuan, dan penggunaan laboratorium.
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
      <footer className={`border-t ${border}`}>
        <div className="mx-auto max-w-[1480px] px-5 py-14 sm:px-8 lg:px-12 lg:py-16">
          <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr]">
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

              <p className={`mt-6 max-w-sm text-sm leading-6 ${muted}`}>
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
                <Link
                  to="/"
                  className={`w-fit text-sm font-medium transition ${
                    isDark
                      ? 'text-white/50 hover:text-white'
                      : 'text-black/50 hover:text-black'
                  }`}
                >
                  Beranda
                </Link>

                <a
                  href="/#laboratorium"
                  className={`w-fit text-sm font-medium transition ${
                    isDark
                      ? 'text-white/50 hover:text-white'
                      : 'text-black/50 hover:text-black'
                  }`}
                >
                  Laboratorium
                </a>

                <a
                  href="/#cara-kerja"
                  className={`w-fit text-sm font-medium transition ${
                    isDark
                      ? 'text-white/50 hover:text-white'
                      : 'text-black/50 hover:text-black'
                  }`}
                >
                  Cara Kerja
                </a>

                <Link
                  to="/about"
                  className={`w-fit text-sm font-medium transition ${
                    isDark
                      ? 'text-white/50 hover:text-white'
                      : 'text-black/50 hover:text-black'
                  }`}
                >
                  Tentang
                </Link>
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
          </div>

          <div
            className={`mt-14 flex flex-col gap-4 border-t pt-6 sm:flex-row sm:items-center sm:justify-between ${border}`}
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