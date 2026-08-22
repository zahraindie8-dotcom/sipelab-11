import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import client, { extractError } from '../api/client'
import { useToast } from '../context/ToastContext'
import { IconCalendar, IconFlask, IconPlus } from '../components/icons'

export default function NewBooking() {
  const { toast } = useToast()
  const navigate = useNavigate()

  const [labs, setLabs] = useState([])
  const [form, setForm] = useState({
    lab_id: '',
    date: '',
    start_time: '',
    end_time: '',
    notes: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    client
      .get('/labs', { params: { per_page: 50 } })
      .then((res) => setLabs(res.data.data))
      .catch(() => toast('Gagal memuat daftar lab.', 'error'))
  }, [toast])

  // Default jam sekolah.
  useEffect(() => {
    if (!form.start_time) setForm((f) => ({ ...f, start_time: '08:00' }))
    if (!form.end_time) setForm((f) => ({ ...f, end_time: '10:00' }))
  }, [form.start_time, form.end_time])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      const res = await client.post('/bookings', form)
      toast('Booking berhasil dibuat. Menunggu persetujuan.')
      navigate(`/bookings`, { state: { highlight: res.data.data?.id } })
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
          <div>
            <label className="label" htmlFor="bk-lab">
              Pilih Lab
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
                <option value="">— Pilih lab —</option>
                {labs.map((lab) => (
                  <option key={lab.id} value={lab.id}>
                    {lab.name} (kapasitas {lab.capacity})
                  </option>
                ))}
              </select>
            </div>
          </div>

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
            <button type="submit" disabled={submitting} className="btn-primary">
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
