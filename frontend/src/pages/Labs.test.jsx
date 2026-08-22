import { beforeEach, describe, expect, it, vi } from 'vitest'
import { act } from 'react'
import { fireEvent, screen, waitFor } from '@testing-library/react'
import Labs from './Labs'
import client from '../api/client'
import { renderWithAuth } from '../test/utils'

// Mock klien API tetapi tetap pakai extractError asli dari modul.
vi.mock('../api/client', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
  }
})

const labsResponse = {
  data: {
    data: [{ id: 1, name: 'Lab Komputer 1', capacity: 36, description: 'Lab komputer' }],
    meta: { current_page: 1, last_page: 1, total: 1, from: 1, to: 1 },
  },
}

// Nama melebihi 255 karakter: lolos cek klien (tidak ada maxlength),
// tapi ditolak API oleh aturan `name.max:255`.
const LONG_NAME = 'x'.repeat(300)

function renderLabs() {
  return renderWithAuth(<Labs />, { user: { name: 'Admin', role: 'admin', can_approve: true } })
}

async function submitModal(buttonName) {
  await act(async () => {
    fireEvent.click(screen.getByRole('button', { name: buttonName }))
  })
}

describe('Labs — pesan error validasi form tampil ke pengguna', () => {
  beforeEach(() => {
    client.get.mockImplementation((url) => {
      if (url === '/labs') return Promise.resolve(labsResponse)
      return Promise.resolve({ data: { data: [] } })
    })
    client.post.mockReset()
    client.put.mockReset()
  })

  it('menampilkan pesan error saat menambah lab ditolak API', async () => {
    client.post.mockRejectedValue({
      response: {
        status: 422,
        data: {
          message: 'Nama lab terlalu panjang.',
          errors: { name: ['Nama lab terlalu panjang.'] },
        },
      },
    })

    renderLabs()
    await screen.findByText('Lab Komputer 1')

    fireEvent.click(screen.getByRole('button', { name: 'Tambah Lab' }))
    fireEvent.change(screen.getByLabelText('Nama Lab'), { target: { value: LONG_NAME } })
    fireEvent.change(screen.getByLabelText('Kapasitas'), { target: { value: '30' } })
    await submitModal('Simpan')

    expect(screen.getByText('Nama lab terlalu panjang.')).toBeInTheDocument()
    expect(client.post).toHaveBeenCalledWith('/labs', expect.objectContaining({ name: LONG_NAME }))
  })

  it('menampilkan pesan error saat edit lab ditolak API', async () => {
    client.put.mockRejectedValue({
      response: {
        status: 422,
        data: {
          message: 'Nama lab terlalu panjang.',
          errors: { name: ['Nama lab terlalu panjang.'] },
        },
      },
    })

    renderLabs()
    await screen.findByText('Lab Komputer 1')

    fireEvent.click(screen.getByRole('button', { name: 'Edit Lab Komputer 1' }))
    fireEvent.change(screen.getByLabelText('Nama Lab'), { target: { value: LONG_NAME } })
    await submitModal('Simpan Perubahan')

    expect(screen.getByText('Nama lab terlalu panjang.')).toBeInTheDocument()
    expect(client.put).toHaveBeenCalledWith('/labs/1', expect.objectContaining({ name: LONG_NAME }))
  })

  it('menutup modal dan menampilkan toast saat tambah lab berhasil', async () => {
    client.post.mockResolvedValue({ data: { data: { id: 2 } } })

    renderLabs()
    await screen.findByText('Lab Komputer 1')

    fireEvent.click(screen.getByRole('button', { name: 'Tambah Lab' }))
    fireEvent.change(screen.getByLabelText('Nama Lab'), { target: { value: 'Lab Baru' } })
    fireEvent.change(screen.getByLabelText('Kapasitas'), { target: { value: '30' } })
    await submitModal('Simpan')

    expect(await screen.findByText('Lab baru berhasil ditambahkan.')).toBeInTheDocument()
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  })
})
