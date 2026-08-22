import { beforeEach, describe, expect, it, vi } from 'vitest'
import { act } from 'react'
import { fireEvent, screen, waitFor } from '@testing-library/react'
import { Route, Routes, useLocation } from 'react-router-dom'
import NewBooking from './NewBooking'
import client from '../api/client'
import { renderWithAuth } from '../test/utils'

// Mock klien API (axios) tetapi tetap pakai extractError asli dari modul.
vi.mock('../api/client', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
  }
})

const labsResponse = {
  data: { data: [{ id: 1, name: 'Lab Komputer 1', capacity: 36 }] },
}

function BookingsProbe() {
  const location = useLocation()
  return (
    <div data-testid="bookings-page" data-highlight={location.state?.highlight ?? ''}>
      Halaman Booking
    </div>
  )
}

function renderNewBooking() {
  return renderWithAuth(
    <Routes>
      <Route path="/" element={<NewBooking />} />
      <Route path="/bookings" element={<BookingsProbe />} />
    </Routes>,
    { route: '/' },
  )
}

// Klik tombol submit dan tunggu handler async (post) selesai di dalam act(),
// sehingga update state tidak memunculkan warning React.
async function submitForm() {
  await act(async () => {
    fireEvent.click(screen.getByRole('button', { name: /Ajukan Booking/ }))
  })
}

// Isi form lengkap lalu kirim.
async function fillAndSubmit() {
  await waitFor(() => {
    expect(screen.getByRole('option', { name: /Lab Komputer 1/ })).toBeInTheDocument()
  })
  fireEvent.change(screen.getByLabelText('Pilih Laboratorium'), { target: { value: '1' } })
  fireEvent.change(screen.getByLabelText('Tanggal'), { target: { value: '2026-09-01' } })
  fireEvent.change(screen.getByLabelText('Jam Mulai'), { target: { value: '08:00' } })
  fireEvent.change(screen.getByLabelText('Jam Selesai'), { target: { value: '10:00' } })
  await submitForm()
}

describe('NewBooking — pesan error validasi ditampilkan ke pengguna', () => {
  beforeEach(() => {
    client.get.mockResolvedValue(labsResponse)
    client.post.mockReset()
  })

  it('menampilkan pesan error validasi bentrok jadwal saat API menolak (422)', async () => {
    client.post.mockRejectedValue({
      response: {
        status: 422,
        data: {
          message: 'Jadwal bentrok: lab sudah dipesan pada tanggal dan jam tersebut.',
          errors: {
            schedule: ['Jadwal bentrok: lab sudah dipesan pada tanggal dan jam tersebut.'],
          },
        },
      },
    })

    renderNewBooking()
    await fillAndSubmit()

    expect(await screen.findByText('Jadwal bentrok: lab sudah dipesan pada tanggal dan jam tersebut.')).toBeInTheDocument()
  })

  it('menampilkan pesan error validasi per-field (mis. tanggal masa lalu)', async () => {
    client.post.mockRejectedValue({
      response: {
        status: 422,
        data: {
          message: 'Tanggal tidak boleh di masa lalu.',
          errors: { date: ['Tanggal tidak boleh di masa lalu.'] },
        },
      },
    })

    renderNewBooking()
    await fillAndSubmit()

    expect(await screen.findByText('Tanggal tidak boleh di masa lalu.')).toBeInTheDocument()
  })

  it('menampilkan pesan message umum saat error tidak berisi daftar errors', async () => {
    client.post.mockRejectedValue({
      response: { status: 422, data: { message: 'Gagal membuat booking. Silakan coba lagi.' } },
    })

    renderNewBooking()
    await fillAndSubmit()

    expect(await screen.findByText('Gagal membuat booking. Silakan coba lagi.')).toBeInTheDocument()
  })

  it('menghilangkan error lama saat pengiriman berikutnya dimulai', async () => {
    client.post.mockRejectedValueOnce({
      response: { status: 422, data: { errors: { schedule: ['Jadwal bentrok pertama.'] } } },
    })

    renderNewBooking()
    await fillAndSubmit()
    expect(await screen.findByText('Jadwal bentrok pertama.')).toBeInTheDocument()

    // Pengiriman kedua berhasil → error lama hilang dan pindah ke /bookings.
    client.post.mockResolvedValueOnce({ data: { data: { id: 42 } } })
    await submitForm()

    await waitFor(() => {
      expect(screen.queryByText('Jadwal bentrok pertama.')).not.toBeInTheDocument()
    })
    expect(await screen.findByTestId('bookings-page')).toBeInTheDocument()
  })

  it('mengarahkan ke /bookings dengan id highlight dan menampilkan toast sukses saat berhasil', async () => {
    client.post.mockResolvedValue({ data: { data: { id: 42 } } })

    renderNewBooking()
    await fillAndSubmit()

    expect(await screen.findByTestId('bookings-page')).toBeInTheDocument()
    expect(screen.getByTestId('bookings-page').dataset.highlight).toBe('42')
    expect(screen.getByText('Booking berhasil dibuat. Menunggu persetujuan.')).toBeInTheDocument()
  })
})
