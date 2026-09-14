/**
 * ReportPrintView — Komponen layout cetak untuk laporan penggunaan lab.
 *
 * Digunakan untuk render konten yang akan dikirim ke window.print().
 * Tidak memiliki interaksi — murni presentasi data.
 */

import { useEffect, useState } from 'react'
import client, { extractError } from '../api/client'

function formatDateTime(value) {
  if (!value) return '-'
  return new Date(value).toLocaleString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatDate(value) {
  if (!value) return '-'
  return new Date(`${value}T00:00`).toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

const statusLabel = {
  pending: 'Menunggu',
  approved: 'Disetujui',
  rejected: 'Ditolak',
  completed: 'Selesai',
}

export default function ReportPrintView({ reports, printDate }) {
  const [fileUrls, setFileUrls] = useState({})

  useEffect(() => {
    let active = true
    const urls = {}

    const loadFiles = async () => {
      for (const report of reports) {
        for (const file of report.files ?? []) {
          try {
            const response = await client.get(
              `/reports/${report.id}/files/${file.id}`,
              {
                responseType: 'blob',
              }
            )

            if (!active) return

            const url = URL.createObjectURL(response.data)
            const cacheKey = `${report.id}-${file.id}`

            urls[cacheKey] = url

            setFileUrls((prev) => ({
              ...prev,
              [cacheKey]: url,
            }))
          } catch (err) {
            if (active) {
              extractError(err)
            }
          }
        }
      }
    }

    loadFiles()

    return () => {
      active = false
      Object.values(urls).forEach((url) => URL.revokeObjectURL(url))
    }
  }, [reports])

  return (
    <div className="print-content">
      {/* Kop / Header cetak */}
      <div className="print-header">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Laporan Penggunaan Lab Sekolah</h1>
            <p className="text-sm text-slate-500">
              Sistem Manajemen Penggunaan Lab (SiLab)
            </p>
          </div>

          <div className="text-right text-xs text-slate-500">
            <p>Dicetak: {printDate}</p>
            <p>Total laporan: {reports.length}</p>
          </div>
        </div>

        <hr className="mt-3 border-slate-300" />
      </div>

      {/* Tabel rekap */}
      {reports.length > 0 && (
        <div className="mt-6">
          <h2 className="mb-2 text-sm font-bold uppercase tracking-wider text-slate-600">
            Rekap Penggunaan Lab
          </h2>

          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-slate-100">
                <th className="border border-slate-300 px-3 py-2 text-left text-xs font-bold">
                  No
                </th>
                <th className="border border-slate-300 px-3 py-2 text-left text-xs font-bold">
                  Lab
                </th>
                <th className="border border-slate-300 px-3 py-2 text-left text-xs font-bold">
                  Tanggal
                </th>
                <th className="border border-slate-300 px-3 py-2 text-left text-xs font-bold">
                  Jam
                </th>
                <th className="border border-slate-300 px-3 py-2 text-left text-xs font-bold">
                  Pelapor
                </th>
                <th className="border border-slate-300 px-3 py-2 text-left text-xs font-bold">
                  Status
                </th>
                <th className="border border-slate-300 px-3 py-2 text-left text-xs font-bold">
                  Deskripsi
                </th>
              </tr>
            </thead>

            <tbody>
              {reports.map((r, i) => (
                <tr
                  key={r.id}
                  className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}
                >
                  <td className="border border-slate-300 px-3 py-2 text-center">
                    {i + 1}
                  </td>

                  <td className="border border-slate-300 px-3 py-2 font-medium">
                    {r.booking?.lab_name ?? `Borrowing #${r.booking_id}`}
                  </td>

                  <td className="border border-slate-300 px-3 py-2">
                    {r.booking?.date ? formatDate(r.booking.date) : '—'}
                  </td>

                  <td className="border border-slate-300 px-3 py-2">
                    {r.booking?.start_time}–{r.booking?.end_time}
                  </td>

                  <td className="border border-slate-300 px-3 py-2">
                    {r.user?.name ?? '—'}
                  </td>

                  <td className="border border-slate-300 px-3 py-2">
                    {statusLabel[r.booking?.status] ??
                      r.booking?.status ??
                      '—'}
                  </td>

                  <td className="max-w-xs border border-slate-300 px-3 py-2">
                    <p className="line-clamp-2 text-xs">
                      {r.description || '—'}
                    </p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Detail laporan */}
      {reports.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-600">
            Detail Laporan
          </h2>

          <div className="space-y-4">
            {reports.map((r, i) => {
              const beforeFiles =
                r.files?.filter((file) => file.type === 'before') ?? []

              const afterFiles =
                r.files?.filter((file) => file.type === 'after') ?? []

              const hasNewFiles =
                beforeFiles.length > 0 || afterFiles.length > 0

              return (
                <div
                  key={r.id}
                  className="page-break-inside-avoid rounded border border-slate-200 p-4"
                >
                  <div className="flex items-start gap-4">
                    {/* Laporan lama */}
                    {!hasNewFiles && r.photo_url && (
                      <img
                        src={r.photo_url}
                        alt={`Foto laporan #${r.id}`}
                        className="h-32 w-48 shrink-0 rounded object-cover ring-1 ring-slate-200"
                      />
                    )}

                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold">
                          {i + 1}.{' '}
                          {r.booking?.lab_name ??
                            `Borrowing #${r.booking_id}`}
                        </span>

                        <span className="rounded bg-slate-100 px-2 py-0.5 text-xs">
                          {statusLabel[r.booking?.status] ?? '—'}
                        </span>
                      </div>

                      <p className="mt-1 text-xs text-slate-500">
                        {r.booking?.date
                          ? formatDate(r.booking.date)
                          : '—'}{' '}
                        · {r.booking?.start_time}–{r.booking?.end_time}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        Pelapor: {r.user?.name ?? '—'} · Dilaporkan:{' '}
                        {formatDateTime(r.created_at)}
                      </p>

                      <div className="mt-2 flex flex-wrap gap-2 text-xs">
                        <span className="rounded bg-slate-100 px-2 py-1">
                          Kelas: {r.booking?.kelas ?? '—'}
                        </span>

                        <span className="rounded bg-slate-100 px-2 py-1">
                          Jurusan: {r.booking?.jurusan ?? '—'}
                        </span>
                      </div>

                      {r.description && (
                        <p className="mt-2 text-sm text-slate-600">
                          {r.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Before */}
                  {beforeFiles.length > 0 && (
                    <div className="mt-4">
                      <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                        Before
                      </p>

                      <div className="grid grid-cols-4 gap-2">
                        {beforeFiles.map((file) => {
                          const url = fileUrls[`${r.id}-${file.id}`]
                          const extension =
                            file.file?.split('.').pop()?.toLowerCase() ?? ''
                          const isVideo = ['mp4', 'mov', 'webm'].includes(
                            extension
                          )

                          return (
                            <div key={file.id}>
                              {url ? (
                                isVideo ? (
                                  <video
                                    src={url}
                                    controls
                                    className="h-28 w-full rounded object-cover ring-1 ring-slate-200"
                                  />
                                ) : (
                                  <img
                                    src={url}
                                    alt="Before"
                                    className="h-28 w-full rounded object-cover ring-1 ring-slate-200"
                                  />
                                )
                              ) : (
                                <div className="flex h-28 items-center justify-center rounded bg-slate-100 text-xs text-slate-400">
                                  Memuat...
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* After */}
                  {afterFiles.length > 0 && (
                    <div className="mt-4">
                      <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                        After
                      </p>

                      <div className="grid grid-cols-4 gap-2">
                        {afterFiles.map((file) => {
                          const url = fileUrls[`${r.id}-${file.id}`]
                          const extension =
                            file.file?.split('.').pop()?.toLowerCase() ?? ''
                          const isVideo = ['mp4', 'mov', 'webm'].includes(
                            extension
                          )

                          return (
                            <div key={file.id}>
                              {url ? (
                                isVideo ? (
                                  <video
                                    src={url}
                                    controls
                                    className="h-28 w-full rounded object-cover ring-1 ring-slate-200"
                                  />
                                ) : (
                                  <img
                                    src={url}
                                    alt="After"
                                    className="h-28 w-full rounded object-cover ring-1 ring-slate-200"
                                  />
                                )
                              ) : (
                                <div className="flex h-28 items-center justify-center rounded bg-slate-100 text-xs text-slate-400">
                                  Memuat...
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {reports.length === 0 && (
        <div className="mt-10 text-center text-sm text-slate-400">
          Tidak ada laporan untuk ditampilkan.
        </div>
      )}

      {/* Footer cetak */}
      <div className="print-footer mt-8 border-t border-slate-300 pt-3 text-xs text-slate-400">
        <p>
          Dokumen ini dicetak secara otomatis dari Sistem Manajemen Penggunaan
          Lab Sekolah (SiLab).
        </p>
      </div>
    </div>
  )
}