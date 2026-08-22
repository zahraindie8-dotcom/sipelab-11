import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import client, { extractError } from '../api/client'
import { useToast } from '../context/ToastContext'
import { IconCalendar, IconFlask, IconPlus, IconUsers, IconCheckCircle, IconX } from '../components/icons'

export default function NewBooking() {
  const { toast } = useToast()
  const navigate = useNavigate()

  const [labs, setLabs] = useState([])
  const [form, setForm] = useState({
    lab_id: '',
    date: '',
    start_time: '08:00',
    end_time: '10:00',
    purpose: '',
    participant_count: '',
    notes: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  // Availability check state
  const [checking, setChecking] = useState(false)
  const [availability, setAvailability] = useState(null)
  const [selectedLab, setSelectedLab] = useState(null)

  useEffect(() => {
    client
      .get('/labs', { params: { per_page: 50, status: 'active' } })
      .then((res) => setLabs(res.data.data))
      .catch(() => toast('Gagal memuat daftar lab.', 'error'))
  }, [toast])

  // Update selectedLab when lab_id changes
  useEffect(() => {
    if (form.lab_id) {
      const lab = labs.find((l) => l.id === Number(form.lab_id))
      setSelectedLab(lab)
    } else {
      setSelectedLab(null)
    }
  }, [form.lab_id, labs])

  // Check availability when date, time, or lab changes
  useEffect(() => {
    if (!form.lab_id || !form.date || !form.start_time || !form.end_time) {
      setAvailability(null)
      return
    }

    const timer = setTimeout(() => {
      setChecking(true)
      client
        .get(`/labs/${form.lab_id}/availability`, {
          params: { date: form.date, start_time: form.start_time, end_time: form.end_time },
        })
        .then((res) => setAvailability(res.data))
        .catch(() => setAvailability(null))
        .finally(() => setChecking(false))
    }, 500)

    return () => clearTimeout(timer)
  }, [form.lab_id, form.date, form.start_time, form.end_time])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      const payload = { ...form }
      if (payload.participant_count) {
        payload.participant_count = parseInt(payload.participant_count, 10)
      } else {
        delete payload.participant_count
      }
      const res = await client.post('/bookings', payload)
      toast('Booking berhasil dibuat. Menunggu persetujuan.')
      navigate('/bookings', { state: { highlight: res.data.data?.id } })
    } catch (err) {
      setError(extractError(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Booking Lab</h1>
        <p className="text-sm text-slate-500">
          Ajukan peminjaman lab. Booking perlu disetujui admin/guru terlebih dahulu.
        </p>
      </div>

      <div className="card p-6">
        {error && (
          <div className="mb-5 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Pilih Lab */}
          <div>
            <label className="label" htmlFor="bk-lab">
              Pilih Laboratorium
            </label>
            <div className="relative">
              <IconFlask className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <select
                id="bk-lab"
                className="input !pl-10"
                value={form.lab_id}
                onChange={(e) => setForm({ ...form, lab_id: e.target.value })}
                required
              >
                <option value="">— Pilih laboratorium —</option>
                {labs.map((lab) => (
                  <option key={lab.id} value={lab.id}>
                    {lab.code} — {lab.name} ({lab.capacity} orang)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Info Lab Terpilih */}
          {selectedLab && (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-700">{selectedLab.name}</p>
                  <p className="text-xs text-slate-500">
                    {selectedLab.location || 'Lokasi tidak tersedia'} · Kapasitas: {selectedLab.capacity} orang
                  </p>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                  <IconCheckCircle className="h-3 w-3" />
                  {selectedLab.status_label}
                </span>
              </div>
            </div>
          )}

          {/* Tanggal & Jam */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="label" htmlFor="bk-date">
                Tanggal
              </label>
              <div className="relative">
                <IconCalendar className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="bk-date"
                  type="date"
                  className="input !pl-10"
                  min={new Date().toISOString().split('T')[0]}
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  required
                />
              </div>
            </div>
            <div>
              <label className="label" htmlFor="bk-start">
                Jam Mulai
              </label>
              <input
                id="bk-start"
                type="time"
                className="input"
                value={form.start_time}
                onChange={(e) => setForm({ ...form, start_time: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="label" htmlFor="bk-end">
                Jam Selesai
              </label>
              <input
                id="bk-end"
                type="time"
                className="input"
                value={form.end_time}
                onChange={(e) => setForm({ ...form, end_time: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Cek Ketersediaan */}
          {checking && (
            <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-brand-200 border-t-brand-600" />
              Mengecek ketersediaan...
            </div>
          )}
          {availability && !checking && (
            <div
              className={`rounded-lg border px-4 py-3 text-sm font-medium ${
                availability.available
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                  : 'border-rose-200 bg-rose-50 text-rose-700'
              }`}
            >
              {availability.available ? (
                <span className="flex items-center gap-2">
                  <IconCheckCircle className="h-4 w-4" />
                  Lab tersedia pada jadwal ini
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <IconX className="h-4 w-4" />
                  Jadwal bentrok! Lab sudah dipesan pada waktu ini.
                  {availability.conflicts?.length > 0 && (
                    <span className="text-xs font-normal">
                      ({availability.conflicts.length} booking aktif)
                    </span>
                  )}
                </span>
              )}
            </div>
          )}

          {/* Tujuan & Jumlah Peserta */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="bk-purpose">
                Tujuan Penggunaan
              </label>
              <input
                id="bk-purpose"
                className="input"
                placeholder="cth: Praktikum jaringan komputer"
                value={form.purpose}
                onChange={(e) => setForm({ ...form, purpose: e.target.value })}
              />
            </div>
            <div>
              <label className="label" htmlFor="bk-participants">
                Jumlah Peserta
              </label>
              <div className="relative">
                <IconUsers className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="bk-participants"
                  type="number"
                  min="1"
                  max={selectedLab?.capacity || 500}
                  className="input !pl-10"
                  placeholder={selectedLab ? `Maks. ${selectedLab.capacity}` : 'Jumlah peserta'}
                  value={form.participant_count}
                  onChange={(e) => setForm({ ...form, participant_count: e.target.value })}
                />
              </div>
              {selectedLab && form.participant_count && parseInt(form.participant_count) > selectedLab.capacity && (
                <p className="mt-1 text-xs text-rose-500">
                  Melebihi kapasitas lab ({selectedLab.capacity} orang)
                </p>
              )}
            </div>
          </div>

          {/* Catatan */}
          <div>
            <label className="label" htmlFor="bk-notes">
              Catatan / Keperluan
            </label>
            <textarea
              id="bk-notes"
              rows="3"
              className="input"
              placeholder="cth: Praktikum pemrograman dasar, kelas X IPA 1..."
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-5">
            <button type="button" onClick={() => navigate(-1)} className="btn-secondary">
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting || (availability && !availability.available)}
              className="btn-primary"
            >
              <IconPlus className="h-4 w-4" />
              {submitting ? 'Mengirim...' : 'Ajukan Booking'}
            </button>
          </div>
        </form>
      </div>

      <div className="rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-700">
        💡 <span className="font-semibold">Tips:</span> Sistem otomatis memeriksa bentrok jadwal
        di lab yang sama pada tanggal yang sama. Jika bentrok, permintaan Anda akan ditolak
        otomatis.
      </div>
    </div>
  )
}
