import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import {
  IconCalendar,
  IconCamera,
  IconChart,
  IconCheckCircle,
  IconFlask,
  IconHome,
  IconLogout,
  IconMenu,
  IconPlus,
  IconTrending,
  IconUsers,
  IconX,
} from './icons'

const roleBadge = {
  admin: 'bg-brand-100 text-brand-700 ring-brand-200',
  guru: 'bg-sky-100 text-sky-700 ring-sky-200',
  siswa: 'bg-emerald-100 text-emerald-700 ring-emerald-200',
}

const roleLabel = { admin: 'Admin', guru: 'Guru', siswa: 'Siswa' }

// Identitas visual per peran: setiap role punya warna tema sendiri
// sehingga tampilan aplikasi jelas berbeda satu sama lain.
const roleTheme = {
  admin: {
    sidebar: 'bg-slate-900',
    logo: 'from-brand-500 to-brand-700',
    subtitle: 'text-brand-300',
    navIdle: 'text-brand-200 hover:bg-white/5 hover:text-white',
    avatar: 'from-brand-400 to-brand-600',
    strip: 'bg-brand-500',
  },
  guru: {
    sidebar: 'bg-gradient-to-b from-slate-900 to-sky-950',
    logo: 'from-sky-500 to-sky-700',
    subtitle: 'text-sky-300',
    navIdle: 'text-sky-200 hover:bg-white/5 hover:text-white',
    avatar: 'from-sky-400 to-sky-600',
    strip: 'bg-sky-500',
  },
  siswa: {
    sidebar: 'bg-gradient-to-b from-slate-900 to-emerald-950',
    logo: 'from-emerald-500 to-emerald-700',
    subtitle: 'text-emerald-300',
    navIdle: 'text-emerald-200 hover:bg-white/5 hover:text-white',
    avatar: 'from-emerald-400 to-emerald-600',
    strip: 'bg-emerald-500',
  },
}

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  if (!user) return null

  const theme = roleTheme[user.role] ?? roleTheme.admin

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: IconHome, end: true },
    { to: '/booking/new', label: 'Booking Lab', icon: IconPlus },
    {
      to: '/bookings',
      label: user.can_approve ? 'Semua Booking' : 'Booking Saya',
      icon: IconCalendar,
    },
    ...(user.can_approve
      ? [{ to: '/approvals', label: 'Persetujuan', icon: IconCheckCircle }]
      : []),
    { to: '/labs', label: user.role === 'admin' ? 'Kelola Lab' : 'Daftar Lab', icon: IconFlask },
    { to: '/reports', label: 'Laporan', icon: IconCamera },
    ...(user.role === 'admin'
      ? [
          { to: '/analytics', label: 'Statistik', icon: IconTrending },
          { to: '/users', label: 'Kelola User', icon: IconUsers },
        ]
      : []),
  ]

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const sidebar = (
    <div className="flex h-full flex-col">
      {/* Strip warna identitas peran */}
      <div className={`h-1 shrink-0 ${theme.strip}`} />

      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${theme.logo} text-white shadow-lift`}>
          <IconFlask className="h-5 w-5" />
        </div>
        <div>
          <p className="text-base font-bold leading-tight text-white">SiLab</p>
          <p className={`text-[11px] font-medium ${theme.subtitle}`}>Smart Lab Management</p>
        </div>
      </div>

      {/* Navigasi */}
      <nav className="mt-2 flex-1 space-y-1 overflow-y-auto px-3">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `group flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium transition-all duration-150 ${
                isActive
                ? 'bg-white/10 text-white shadow-sm'
                : theme.navIdle
              }`
            }
          >
            <item.icon className="h-5 w-5 shrink-0" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Profil */}
      <div className="border-t border-white/10 p-4">
        <div className="flex items-center gap-3 rounded-xl bg-white/5 p-3">
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${theme.avatar} text-sm font-bold text-white`}>
            {user.name?.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-white">{user.name}</p>
            <span
              className={`mt-0.5 inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ring-1 ring-inset ${roleBadge[user.role]}`}
            >
              {roleLabel[user.role] ?? user.role}
            </span>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm font-medium text-brand-200 transition hover:bg-white/10 hover:text-white"
        >
          <IconLogout className="h-4 w-4" />
          Keluar
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Sidebar desktop */}
      <aside className={`fixed inset-y-0 left-0 z-40 hidden w-64 lg:block ${theme.sidebar}`}>
        {sidebar}
      </aside>

      {/* Sidebar mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className={`absolute inset-y-0 left-0 w-72 shadow-lift animate-[slideIn_.2s_ease-out] ${theme.sidebar}`}>
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute right-3 top-4 rounded-lg p-1.5 text-brand-200 hover:bg-white/10"
              aria-label="Tutup menu"
            >
              <IconX className="h-5 w-5" />
            </button>
            {sidebar}
          </aside>
          <style>{`@keyframes slideIn { from { transform: translateX(-100%); } to { transform: translateX(0); } }`}</style>
        </div>
      )}

      {/* Konten */}
      <div className="lg:pl-64">
        {/* Topbar */}
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur">
          <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 lg:hidden"
                aria-label="Buka menu"
              >
                <IconMenu className="h-5 w-5" />
              </button>
              <div className="hidden items-center gap-2 text-sm text-slate-400 sm:flex">
                <IconChart className="h-4 w-4" />
                <span>Manajemen Penggunaan Lab Sekolah</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <span className="hidden text-slate-400 sm:inline">Selamat datang,</span>
              <span className="font-semibold text-slate-800">{user.name}</span>
              <span
                className={`hidden rounded-full px-2 py-0.5 text-[10px] font-bold ring-1 ring-inset md:inline ${roleBadge[user.role]}`}
              >
                {roleLabel[user.role] ?? user.role}
              </span>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>

        <footer className="pb-6 text-center text-xs text-slate-400">
          SiLab — Smart Lab Management System v1.0
        </footer>
      </div>
    </div>
  )
}
