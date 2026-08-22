import { beforeEach, describe, expect, it, vi } from 'vitest'
import { act } from 'react'
import { fireEvent, screen, waitFor } from '@testing-library/react'
import Reports from './Reports'
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

const approvedBooking = {
  id: 10,
  lab_name: 'Lab IPA',
  date: '2026-09-01',
  start_time: '08:00',
  end_time: '10:00',
  has_report: false,
}

function renderReports() {
  return renderWithAuth(<Reports />, {
    user: { name: 'Siswa', role: 'siswa', can_approve: false },
  })
}

function mockApi() {
  client.get.mockImplementation((url) => {
    if (url === '/bookings') {
      return Promise.resolve({ data: { data: [approvedBooking] } })
    }
    // Daftar laporan kosong.
    return Promise.resolve({
      data: { data: [], meta: { current_page: 1, last_page: 1, total: 0 } },
    })
  })
}

async function openUploadModal() {
  await screen.findByText('Laporan Penggunaan Lab')
  fireEvent.click(screen.getAllByRole('button', { name: 'Upload Laporan' })[0])
  // Tunggu opsi booking termuat di dalam modal.
  await waitFor(() => {
    expect(screen.getByRole('option', { name: /Lab IPA/ })).toBeInTheDocument()
  })
}

function attachPhoto() {
  const input = screen.getByLabelText(/pilih foto/i)
  fireEvent.change(input, {
    target: { files: [new File(['foto'], 'foto.jpg', { type: 'image/jpeg' })] },
  })
}

async function submitUpload() {
  await act(async () => {
    fireEvent.click(screen.getByRole('button', { name: 'Simpan Laporan' }))
  })
}

describe('Reports — pesan error validasi modal upload tampil ke pengguna', () => {
  beforeEach(() => {
    mockApi()
    client.post.mockReset()
  })

  it('menampilkan error saat submit tanpa foto (validasi sisi klien)', async () => {
    renderReports()
    await openUploadModal()

    fireEvent.change(screen.getByLabelText('Booking (disetujui)'), { target: { value: '10' } })
    await submitUpload()

    expect(screen.getByText('Foto bukti penggunaan wajib diunggah.')).toBeInTheDocument()
    expect(client.post).not.toHaveBeenCalled()
  })

  it('menampilkan pesan error API saat upload ditolak dan modal tetap terbuka', async () => {
    client.post.mockRejectedValue({
      response: {
        status: 422,
        data: { message: 'Booking ini sudah memiliki laporan.' },
      },
    })

    renderReports()
    await openUploadModal()

    fireEvent.change(screen.getByLabelText('Booking (disetujui)'), { target: { value: '10' } })
    attachPhoto()
    await submitUpload()

    expect(screen.getByText('Booking ini sudah memiliki laporan.')).toBeInTheDocument()
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('menutup modal dan menampilkan toast saat upload berhasil', async () => {
    client.post.mockResolvedValue({ data: { data: { id: 5 } } })

    renderReports()
    await openUploadModal()

    fireEvent.change(screen.getByLabelText('Booking (disetujui)'), { target: { value: '10' } })
    attachPhoto()
    await submitUpload()

    expect(await screen.findByText('Laporan penggunaan lab berhasil diunggah.')).toBeInTheDocument()
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  })
})
