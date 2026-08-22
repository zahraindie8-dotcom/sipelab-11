import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/**
 * Gerbang akses berbasis peran.
 *
 * - Belum login            → redirect ke /login
 * - Role tidak diizinkan   → redirect ke /dashboard miliknya
 * - Role diizinkan         → render halaman (Outlet)
 *
 * Contoh pemakaian:
 *   <Route element={<RoleRoute roles={['admin', 'guru']} />}>
 *     <Route path="/approvals" element={<Approvals />} />
 *   </Route>
 */
export default function RoleRoute({ roles }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) return null

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}
