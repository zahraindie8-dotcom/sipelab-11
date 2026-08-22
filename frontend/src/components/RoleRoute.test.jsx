import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Route, Routes } from 'react-router-dom'
import RoleRoute from './RoleRoute'
import { renderWithAuth } from '../test/utils'

function setup(user, route) {
  return renderWithAuth(
    <Routes>
      <Route element={<RoleRoute roles={['admin', 'guru']} />}>
        <Route path="/approvals" element={<div>Halaman Persetujuan</div>} />
      </Route>
      <Route path="/dashboard" element={<div>Dashboard Saya</div>} />
      <Route path="/login" element={<div>Halaman Login</div>} />
    </Routes>,
    { user, route },
  )
}

describe('RoleRoute — pembatasan akses halaman berdasarkan peran', () => {
  it('menampilkan halaman untuk role yang diizinkan (guru)', () => {
    setup({ name: 'Guru', role: 'guru', can_approve: true }, '/approvals')

    expect(screen.getByText('Halaman Persetujuan')).toBeInTheDocument()
  })

  it('menampilkan halaman untuk role yang diizinkan (admin)', () => {
    setup({ name: 'Admin', role: 'admin', can_approve: true }, '/approvals')

    expect(screen.getByText('Halaman Persetujuan')).toBeInTheDocument()
  })

  it('mengalihkan siswa ke /dashboard saat mencoba membuka /approvals', () => {
    setup({ name: 'Siswa', role: 'siswa', can_approve: false }, '/approvals')

    expect(screen.getByText('Dashboard Saya')).toBeInTheDocument()
    expect(screen.queryByText('Halaman Persetujuan')).not.toBeInTheDocument()
  })

  it('mengalihkan pengguna yang belum login ke /login', () => {
    setup(null, '/approvals')

    expect(screen.getByText('Halaman Login')).toBeInTheDocument()
  })
})
