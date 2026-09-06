import LandingPage from './pages/LandingPage'
import About from './pages/About'
import { Route, Routes } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import RoleRoute from './components/RoleRoute'
import Login from './pages/login'
import Register from './pages/register'
import VerifyEmail from './pages/VerifyEmail'
import ForgotPassword from './pages/ForgotPassword'
import Dashboard from './pages/Dashboard'
import Labs from './pages/Labs'
import NewBooking from './pages/NewBooking'
import Bookings from './pages/Bookings'
import Approvals from './pages/Approvals'
import Reports from './pages/Reports'
import Users from './pages/Users'
import Analytics from './pages/Analytics'
import BookingCalendar from './pages/BookingCalendar'
import Notifications from './pages/Notifications'
import AuditLogs from './pages/AuditLogs'
import SystemStatus from './pages/SystemStatus'
import IPManagement from './pages/IPManagement'
import NotFound from './pages/NotFound'

function FullScreenLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100">
      <div className="flex flex-col items-center gap-3">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600" />
        <p className="text-sm text-slate-500">Memuat aplikasi...</p>
      </div>
    </div>
  )
}

export default function App() {
  const { loading } = useAuth()

  if (loading) return <FullScreenLoader />

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/about" element={<About />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/labs" element={<Labs />} />
          <Route path="/booking/new" element={<NewBooking />} />
          <Route path="/bookings" element={<Bookings />} />
          <Route path="/calendar" element={<BookingCalendar />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route element={<RoleRoute roles={['admin', 'guru']} />}>
            <Route path="/approvals" element={<Approvals />} />
          </Route>
          <Route element={<RoleRoute roles={['admin']} />}>
            <Route path="/users" element={<Users />} />
            <Route path="/audit-logs" element={<AuditLogs />} />
            <Route path="/system-status" element={<SystemStatus />} />
            <Route path="/ip-management" element={<IPManagement />} />
          </Route>
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/reports" element={<Reports />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
