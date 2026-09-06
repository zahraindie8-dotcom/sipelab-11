import { beforeEach, describe, expect, it, vi } from 'vitest'
import { act } from 'react'
import { fireEvent, screen, waitFor } from '@testing-library/react'
import Users from './Users'
import client from '../api/client'
import { renderWithAuth } from '../test/utils'

vi.mock('../api/client', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
  }
})

const usersResponse = {
  data: {
    data: [
      { id: 1, name: 'Admin Lab', email: 'admin@sipelab.test', role: 'admin', role_label: 'Admin', created_at: '2026-01-01T00:00:00Z' },
      { id: 2, name: 'Bapak Guru', email: 'guru@sipelab.test', role: 'guru', role_label: 'Guru', created_at: '2026-01-01T00:00:00Z' },
      { id: 3, name: 'Siswa Contoh', email: 'siswa@sipelab.test', role: 'siswa', role_label: 'Siswa', created_at: '2026-01-01T00:00:00Z' },
    ],
    meta: { current_page: 1, last_page: 1, total: 3, from: 1, to: 3 },
  },
}

const LONG_NAME = 'x'.repeat(300)

function renderUsers() {
  return renderWithAuth(<Users />, {
    user: { name: 'Admin', role: 'admin', can_approve: true },
  })
}

async function submitModal(buttonName) {
  await act(async () => {
    fireEvent.click(screen.getByRole('button', { name: buttonName }))
  })
}

describe('Users — halaman manajemen user untuk admin', () => {
  beforeEach(() => {
    client.get.mockResolvedValue(usersResponse)
    client.post.mockReset()
    client.put.mockReset()
    client.delete.mockReset()
  })

  it('menampilkan daftar user dari API', async () => {
    renderUsers()

    const adminElements = await screen.findAllByText('Admin Lab')
    expect(adminElements).toHaveLength(2)
    expect(screen.getAllByText('Bapak Guru')).toHaveLength(2)
    expect(screen.getAllByText('Siswa Contoh')).toHaveLength(2)
  })

  it('menampilkan form tambah user saat klik Tambah User', async () => {
    renderUsers()
    await screen.findAllByText('Admin Lab')

    fireEvent.click(screen.getByRole('button', { name: 'Tambah User' }))

    expect(screen.getByText('Tambah User Baru')).toBeInTheDocument()
    expect(screen.getByLabelText('Nama Lengkap')).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
  })

  it('menampilkan pesan error saat tambah user ditolak API', async () => {
    client.post.mockRejectedValue({
      response: {
        status: 422,
        data: {
          message: 'Email sudah terdaftar.',
          errors: { email: ['Email sudah terdaftar.'] },
        },
      },
    })

    renderUsers()
    await screen.findAllByText('Admin Lab')

    fireEvent.click(screen.getByRole('button', { name: 'Tambah User' }))
    fireEvent.change(screen.getByLabelText('Nama Lengkap'), { target: { value: 'Test User' } })
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@sipelab.test' } })
    fireEvent.change(screen.getAllByLabelText(/Password/)[0], { target: { value: 'password123' } })
    fireEvent.change(screen.getByLabelText('Konfirmasi Password'), { target: { value: 'password123' } })
    await submitModal('Simpan')

    expect(screen.getByText('Email sudah terdaftar.')).toBeInTheDocument()
    expect(client.post).toHaveBeenCalledWith('/users', expect.objectContaining({ name: 'Test User' }))
  })

  it('menampilkan pesan error nama terlalu panjang dari API', async () => {
    client.post.mockRejectedValue({
      response: {
        status: 422,
        data: {
          message: 'Nama terlalu panjang.',
          errors: { name: ['Nama terlalu panjang.'] },
        },
      },
    })

    renderUsers()
    await screen.findAllByText('Admin Lab')

    fireEvent.click(screen.getByRole('button', { name: 'Tambah User' }))
    fireEvent.change(screen.getByLabelText('Nama Lengkap'), { target: { value: LONG_NAME } })
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@sipelab.test' } })
    fireEvent.change(screen.getAllByLabelText(/Password/)[0], { target: { value: 'password123' } })
    fireEvent.change(screen.getByLabelText('Konfirmasi Password'), { target: { value: 'password123' } })
    await submitModal('Simpan')

    expect(screen.getByText('Nama terlalu panjang.')).toBeInTheDocument()
  })

  it('menutup modal dan menampilkan toast saat tambah user berhasil', async () => {
    client.post.mockResolvedValue({ data: { data: { id: 4 } } })

    renderUsers()
    await screen.findAllByText('Admin Lab')

    fireEvent.click(screen.getByRole('button', { name: 'Tambah User' }))
    fireEvent.change(screen.getByLabelText('Nama Lengkap'), { target: { value: 'User Baru' } })
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'baru@sipelab.test' } })
    fireEvent.change(screen.getAllByLabelText(/Password/)[0], { target: { value: 'password123' } })
    fireEvent.change(screen.getByLabelText('Konfirmasi Password'), { target: { value: 'password123' } })
    await submitModal('Simpan')

    expect(await screen.findByText('User baru berhasil ditambahkan.')).toBeInTheDocument()
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  })

  it('filter role hanya menampilkan user dengan role tertentu', async () => {
    const onlyGuru = {
      data: {
        data: [
          { id: 2, name: 'Bapak Guru', email: 'guru@sipelab.test', role: 'guru', role_label: 'Guru', created_at: '2026-01-01T00:00:00Z' },
        ],
        meta: { current_page: 1, last_page: 1, total: 1, from: 1, to: 1 },
      },
    }

    renderUsers()
    await screen.findAllByText('Admin Lab')

    client.get.mockResolvedValue(onlyGuru)
    fireEvent.click(screen.getByRole('button', { name: 'Guru' }))

    await waitFor(() => {
      expect(client.get).toHaveBeenCalledWith('/users', expect.objectContaining({
        params: expect.objectContaining({ role: 'guru' }),
      }))
    })
  })
})
