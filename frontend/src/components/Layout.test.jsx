import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import Layout from './Layout'
import { renderWithAuth } from '../test/utils'

function renderAs(role) {
  const canApprove = role === 'admin' || role === 'guru'
  return renderWithAuth(<Layout />, {
    user: { name: `Pengguna ${role}`, role, can_approve: canApprove },
  })
}

describe('Layout — navigasi berbeda untuk tiap peran', () => {
  it('admin melihat menu Kelola Lab dan Persetujuan', () => {
    renderAs('admin')

    expect(screen.getByText('Kelola Lab')).toBeInTheDocument()
    expect(screen.getByText('Persetujuan')).toBeInTheDocument()
    expect(screen.getByText('Semua Booking')).toBeInTheDocument()
  })

  it('guru melihat Persetujuan tetapi bukan Kelola Lab', () => {
    renderAs('guru')

    expect(screen.getByText('Persetujuan')).toBeInTheDocument()
    expect(screen.getByText('Daftar Lab')).toBeInTheDocument()
    expect(screen.getByText('Semua Booking')).toBeInTheDocument()
    expect(screen.queryByText('Kelola Lab')).not.toBeInTheDocument()
  })

  it('siswa tidak melihat Persetujuan dan hanya melihat booking miliknya', () => {
    renderAs('siswa')

    expect(screen.getByText('Booking Saya')).toBeInTheDocument()
    expect(screen.getByText('Daftar Lab')).toBeInTheDocument()
    expect(screen.queryByText('Persetujuan')).not.toBeInTheDocument()
    expect(screen.queryByText('Semua Booking')).not.toBeInTheDocument()
    expect(screen.queryByText('Kelola Lab')).not.toBeInTheDocument()
  })
})
