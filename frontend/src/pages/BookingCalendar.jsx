import { useCallback, useEffect, useMemo, useState } from 'react'
import client, { extractError } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import StatusBadge from '../components/StatusBadge'
import Modal from '../components/Modal'
import BookingDetail from '../components/BookingDetail'
import { IconCalendar, IconChevronLeft, IconChevronRight, IconFlask } from '../components/icons'

const DAY_NAMES = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']
const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
]

const statusColors = {
  pending: 'bg-amber-100 text-amber-800 border-amber-300',
  approved: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  rejected: 'bg-rose-100 text-rose-800 border-rose-300',
  cancelled: 'bg-slate-100 text-slate-600 border-slate-300',
  completed: 'bg-sky-100 text-sky-800 border-sky-300',
}

export default function BookingCalendar() {
  const { user } = useAuth()
  const { toast } = useToast()

  const [bookings, setBookings] = useState([])
  const [labs, setLabs] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedLab, setSelectedLab] = useState('')
  const [detailTarget, setDetailTarget] = useState(null)

  const isApprover = user?.can_approve

  // Fetch bookings for current month
  const fetchBookings = useCallback(async () => {
    setLoading(true)
    try {
      const year = currentDate.getFullYear()
      const month = currentDate.getMonth() + 1
      const startDate = `${year}-${String(month).padStart(2, '0')}-01`
      const endDate = new Date(year, month, 0).toISOString().split('T')[0]

      const params = {
        per_page: 100,
        date_from: startDate,
        date_to: endDate,
      }
      if (selectedLab) params.lab_id = selectedLab

      const { data } = await client.get('/bookings', { params })
      setBookings(data.data)
    } catch (err) {
      toast(extractError(err), 'error')
    } finally {
      setLoading(false)
    }
  }, [currentDate, selectedLab, toast])

  useEffect(() => {
    client
      .get('/labs', { params: { per_page: 50 } })
      .then((res) => setLabs(res.data.data))
      .catch(() => {})
  }, [])

  useEffect(() => {
    fetchBookings()
  }, [fetchBookings])

  // Build calendar days
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()

    const days = []

    // Empty days before first day
    for (let i = 0; i < firstDay; i++) {
      days.push({ date: null, bookings: [] })
    }

    // Days of month
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
      const dayBookings = bookings.filter((b) => b.date === dateStr)
      days.push({
        date: d,
        dateStr,
        bookings: dayBookings,
        isToday:
          new Date().getFullYear() === year &&
          new Date().getMonth() === month &&
          new Date().getDate() === d,
      })
    }

    return days
  }, [currentDate, bookings])

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Kalender Booking</h1>
          <p className="text-sm text-slate-500">Lihat jadwal booking lab dalam bentuk kalender</p>
        </div>
      </div>

      {/* Filter & Navigation */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center justify-center gap-1 sm:justify-start sm:gap-2">
          <button onClick={prevMonth} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100">
            <IconChevronLeft className="h-5 w-5" />
          </button>
          <h2 className="min-w-[140px] text-center text-base font-bold text-slate-700 sm:min-w-[180px] sm:text-lg">
            {MONTH_NAMES[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <button onClick={nextMonth} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100">
            <IconChevronRight className="h-5 w-5" />
          </button>
          <button onClick={goToToday} className="btn-secondary text-xs">
            Hari Ini
          </button>
        </div>

        <select
          className="input max-w-full sm:max-w-[200px]"
          value={selectedLab}
          onChange={(e) => setSelectedLab(e.target.value)}
        >
          <option value="">Semua Lab</option>
          {labs.map((lab) => (
            <option key={lab.id} value={lab.id}>
              {lab.name}
            </option>
          ))}
        </select>
      </div>

      {/* Calendar Grid */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600" />
          </div>
        ) : (
          <>
            {/* Day headers */}
            <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50">
              {DAY_NAMES.map((day) => (
                <div key={day} className="p-2 text-center text-[10px] font-bold uppercase tracking-wider text-slate-500 sm:p-3 sm:text-xs">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar cells */}
            <div className="grid grid-cols-7">
              {calendarDays.map((day, idx) => (
                <div
                  key={idx}
                  className={`min-h-[60px] border-b border-r border-slate-100 p-0.5 sm:min-h-[100px] sm:p-1.5 ${
                    day.date ? 'bg-white hover:bg-slate-50/50' : 'bg-slate-50'
                  } ${day.isToday ? 'ring-2 ring-inset ring-brand-400' : ''}`}
                >
                  {day.date && (
                    <>
                      <div
                        className={`mb-0.5 text-right text-xs font-semibold sm:mb-1 sm:text-sm ${
                          day.isToday ? 'text-brand-600' : 'text-slate-600'
                        }`}
                      >
                        {day.date}
                      </div>
                      <div className="space-y-0.5 sm:space-y-1">
                        {day.bookings.slice(0, 2).map((b) => (
                          <button
                            key={b.id}
                            onClick={() => setDetailTarget(b)}
                            className={`block w-full truncate rounded border px-1 py-px text-left text-[8px] font-semibold transition hover:shadow-sm sm:px-1.5 sm:py-0.5 sm:text-[10px] ${
                              statusColors[b.status] ?? 'bg-slate-100 text-slate-600'
                            }`}
                            title={`${b.lab_name} · ${b.start_time}-${b.end_time}`}
                          >
                            <span className="hidden sm:inline">{b.start_time?.slice(0, 5)} </span>{b.lab_name}
                          </button>
                        ))}
                        {day.bookings.length > 2 && (
                          <p className="text-center text-[8px] font-semibold text-slate-400 sm:text-[10px]">
                            +{day.bookings.length - 2} lagi
                          </p>
                        )}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-2 gap-y-1 text-[11px] text-slate-500 sm:gap-4 sm:text-xs">
        <span className="font-semibold">Legenda:</span>
        {Object.entries(statusColors).map(([status, color]) => (
          <div key={status} className="flex items-center gap-1">
            <span className={`h-2.5 w-2.5 rounded border sm:h-3 sm:w-3 ${color}`} />
            <span className="capitalize">{status === 'pending' ? 'Menunggu' : status === 'approved' ? 'Disetujui' : status === 'rejected' ? 'Ditolak' : status === 'cancelled' ? 'Dibatalkan' : 'Selesai'}</span>
          </div>
        ))}
      </div>

      {/* Modal detail */}
      <Modal open={!!detailTarget} onClose={() => setDetailTarget(null)} title="Detail Booking">
        {detailTarget && <BookingDetail booking={detailTarget} />}
      </Modal>
    </div>
  )
}
