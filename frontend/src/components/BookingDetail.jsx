import StatusBadge from './StatusBadge'
import { IconCalendar, IconClock, IconFlask, IconCamera, IconUsers, IconShield } from './icons'

const roleBadge = {
  admin: 'bg-brand-100 text-brand-700 ring-brand-200',
  guru: 'bg-sky-100 text-sky-700 ring-sky-200',
  siswa: 'bg-emerald-100 text-emerald-700 ring-emerald-200',
}

function InfoRow({ label, children }) {
  return (
    <div className="flex items-start gap-3 py-2.5">
      <span className="w-20 shrink-0 text-[11px] font-semibold uppercase tracking-wider text-slate-400 sm:w-28 sm:text-xs">
        {label}
      </span>
      <div className="flex-1 text-sm text-slate-700">{children}</div>
    </div>
  )
}

export default function BookingDetail({ booking }) {
  if (!booking) return null

  return (
    <div className="space-y-1">
      {/* Lab & Status */}
      <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
            <IconFlask className="h-5 w-5" />
          </div>
          <div>
            <p className="font-bold text-slate-800">{booking.lab_name}</p>
            {booking.lab?.capacity && (
              <p className="text-xs text-slate-400">
                Kapasitas {booking.lab.capacity} orang
              </p>
            )}
          </div>
        </div>
        <StatusBadge status={booking.status} />
      </div>

      {/* Detail */}
      <div className="divide-y divide-slate-100 border-t border-slate-100">
        <InfoRow label="Pemesan">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">
              {booking.user_name?.charAt(0).toUpperCase()}
            </div>
            <span className="font-semibold">{booking.user_name}</span>
            {booking.user?.role && (
              <span
                className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ring-1 ring-inset ${
                  roleBadge[booking.user.role] ?? 'bg-slate-100 text-slate-600 ring-slate-200'
                }`}
              >
                {booking.user.role_label ?? booking.user.role}
              </span>
            )}
          </div>
        </InfoRow>

        <InfoRow label="Tanggal">
          <div className="flex items-center gap-2">
            <IconCalendar className="h-4 w-4 text-slate-400" />
            <span className="font-medium">
              {booking.date
                ? new Date(`${booking.date}T00:00`).toLocaleDateString('id-ID', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })
                : '—'}
            </span>
          </div>
        </InfoRow>

        <InfoRow label="Jam">
          <div className="flex items-center gap-2">
            <IconClock className="h-4 w-4 text-slate-400" />
            <span className="font-medium">
              {booking.start_time} – {booking.end_time}
            </span>
            {booking.start_time && booking.end_time && (
              <span className="text-xs text-slate-400">
                ({(() => {
                  const [sh, sm] = booking.start_time.split(':').map(Number)
                  const [eh, em] = booking.end_time.split(':').map(Number)
                  const dur = (eh * 60 + em) - (sh * 60 + sm)
                  return dur >= 60 ? `${Math.floor(dur / 60)}j ${dur % 60 > 0 ? `${dur % 60}m` : ''}` : `${dur}m`
                })()})
              </span>
            )}
          </div>
        </InfoRow>

        {booking.purpose && (
          <InfoRow label="Tujuan">
            <span>{booking.purpose}</span>
          </InfoRow>
        )}

        {booking.participant_count > 0 && (
          <InfoRow label="Peserta">
            <div className="flex items-center gap-2">
              <IconUsers className="h-4 w-4 text-slate-400" />
              <span className="font-medium">{booking.participant_count} orang</span>
              {booking.lab?.capacity && (
                <span className="text-xs text-slate-400">
                  / {booking.lab.capacity} kapasitas
                </span>
              )}
            </div>
          </InfoRow>
        )}

        {booking.notes && (
          <InfoRow label="Catatan">
            <div className="rounded-lg bg-slate-50 px-3 py-2 text-sm leading-relaxed text-slate-600">
              {booking.notes}
            </div>
          </InfoRow>
        )}

        {booking.rejection_reason && (
          <InfoRow label="Alasan Tolak">
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm leading-relaxed text-rose-700">
              {booking.rejection_reason}
            </div>
          </InfoRow>
        )}

        {booking.approved_by && (
          <InfoRow label="Disetujui Oleh">
            <div className="flex items-center gap-2">
              <IconShield className="h-4 w-4 text-emerald-500" />
              <span className="font-medium text-emerald-700">
                {booking.approver?.name ?? `User #${booking.approved_by}`}
              </span>
              {booking.approved_at && (
                <span className="text-xs text-slate-400">
                  {new Date(booking.approved_at).toLocaleString('id-ID', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              )}
            </div>
          </InfoRow>
        )}

        {booking.has_report && (
          <InfoRow label="Laporan">
            <div className="flex items-center gap-2 text-emerald-600">
              <IconCamera className="h-4 w-4" />
              <span className="text-sm font-semibold">Laporan sudah diunggah</span>
            </div>
          </InfoRow>
        )}

        <InfoRow label="Dibuat">
          <span className="text-xs text-slate-400">
            {booking.created_at
              ? new Date(booking.created_at).toLocaleString('id-ID', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : '—'}
          </span>
        </InfoRow>
      </div>
    </div>
  )
}
