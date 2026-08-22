import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import Dashboard from './Dashboard'
import client from '../api/client'
import { renderWithAuth } from '../test/utils'

vi.mock('../api/client', () => ({
  default: { get: vi.fn() },
}))

const dashboardData = {
  stats: { total_labs: 1, total_bookings: 0, pending: 0, approved: 0, rejected: 0 },
  lab_usage: [],
  recent_bookings: [],
  pending_approvals: [],
  upcoming_bookings: [],
}

function renderAs(role) {
  return renderWithAuth(<Dashboard />, {
    user: { name: `Pengguna ${role}`, role, can_approve: role !== 'siswa' },
  })
}

describe('Dashboard — tampilan berbeda untuk tiap peran', () => {
  beforeEach(() => {
    client.get.mockResolvedValue({ data: dashboardData })
  })

  it('role admin melihat Dashboard Admin', async () => {
    renderAs('admin')

    expect(await screen.findByText('Dashboard Admin')).toBeInTheDocument()
    expect(screen.queryByText('Dashboard Guru')).not.toBeInTheDocument()
    expect(screen.queryByText('Dashboard Siswa')).not.toBeInTheDocument()
  })

  it('role guru melihat Dashboard Guru dengan fokus persetujuan', async () => {
    renderAs('guru')

    expect(await screen.findByText('Dashboard Guru')).toBeInTheDocument()
    expect(screen.getByText('Antrian Persetujuan')).toBeInTheDocument()
  })

  it('role siswa melihat Dashboard Siswa dengan sambutan personal', async () => {
    renderAs('siswa')

    expect(await screen.findByText('Dashboard Siswa')).toBeInTheDocument()
    expect(screen.getByText(/Halo, Pengguna/)).toBeInTheDocument()
    expect(screen.queryByText('Dashboard Admin')).not.toBeInTheDocument()
  })
})
