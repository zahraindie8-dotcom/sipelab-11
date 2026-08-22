import { useCallback, useEffect, useState } from 'react'
import client, { extractError } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import Modal from '../components/Modal'
import Pagination from '../components/Pagination'
import EmptyState from '../components/EmptyState'
import {
  IconEdit,
  IconFlask,
  IconPlus,
  IconSearch,
  IconTrash,
  IconUsers,
} from '../components/icons'

const emptyForm = { name: '', capacity: '', description: '' }

export default function Labs() {
  const { user } = useAuth()
  const { toast } = useToast()
  const isAdmin = user?.role === 'admin'

  const [labs, setLabs] = useState([])
  const [meta, setMeta] = useState(null)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState(null)

  const [deleting, setDeleting] = useState(null)

  const fetchLabs = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await client.get('/labs', {
        params: { page, per_page: 10, search: search || undefined },
      })
      setLabs(data.data)
      setMeta(data.meta)
    } catch (err) {
      toast(extractError(err), 'error')
    } finally {
      setLoading(false)
    }
  }, [page, search, toast])

  useEffect(() => {
    fetchLabs()
  }, [fetchLabs])

  const openCreate = () => {
    setEditing(null)
    setForm(emptyForm)
    setFormError(null)
    setModalOpen(true)
  }

  const openEdit = (lab) => {
    setEditing(lab)
    setForm({ name: lab.name, capacity: lab.capacity, description: lab.description ?? '' })
    setFormError(null)
    setModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setFormError(null)
    try {
      if (editing) {
        await client.put(`/labs/${editing.id}`, form)
        toast('Data lab berhasil diperbarui.')
      } else {
        await client.post('/labs', form)
        toast('Lab baru berhasil ditambahkan.')
      }
      setModalOpen(false)
      fetchLabs()
    } catch (err) {
      setFormError(extractError(err))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (lab) => {
    setDeleting(lab.id)
    try {
      await client.delete(`/labs/${lab.id}`)
      toast('Lab berhasil dihapus.')
      fetchLabs()
    } catch (err) {
      toast(extractError(err), 'error')
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Daftar Lab</h1>
          <p className="text-sm text-slate-500">
            {isAdmin ? 'Kelola data lab sekolah' : 'Lihat informasi lab yang tersedia'}
          </p>
        </div>
        {isAdmin && (
          <button onClick={openCreate} className="btn-primary">
            <IconPlus className="h-4 w-4" />
            Tambah Lab
          </button>
        )}
      </div>

      {/* Pencarian */}
      <div className="relative max-w-sm">
        <IconSearch className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          className="input !pl-10"
          placeholder="Cari nama lab..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setPage(1)
          }}
        />
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600" />
          </div>
        ) : labs.length === 0 ? (
          <EmptyState
            icon={IconFlask}
            title="Belum ada lab"
            description="Tambahkan lab pertama untuk mulai mengelola jadwal penggunaan."
            action={
              isAdmin ? (
                <button onClick={openCreate} className="btn-primary">
                  <IconPlus className="h-4 w-4" />
                  Tambah Lab
                </button>
              ) : null
            }
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px]">
                <thead className="border-b border-slate-100 bg-slate-50">
                  <tr>
                    <th className="table-head">Nama Lab</th>
                    <th className="table-head">Kapasitas</th>
                    <th className="table-head">Deskripsi</th>
                    {isAdmin && <th className="table-head text-right">Aksi</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {labs.map((lab) => (
                    <tr key={lab.id} className="transition hover:bg-slate-50/70">
                      <td className="table-cell">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                            <IconFlask className="h-5 w-5" />
                          </div>
                          <span className="font-semibold text-slate-700">{lab.name}</span>
                        </div>
                      </td>
                      <td className="table-cell">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                          <IconUsers className="h-3.5 w-3.5" />
                          {lab.capacity} orang
                        </span>
                      </td>
                      <td className="table-cell max-w-xs truncate text-slate-500">
                        {lab.description || <span className="text-slate-300">—</span>}
                      </td>
                      {isAdmin && (
                        <td className="table-cell">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => openEdit(lab)}
                              className="rounded-lg p-2 text-slate-400 transition hover:bg-brand-50 hover:text-brand-600"
                              aria-label={`Edit ${lab.name}`}
                            >
                              <IconEdit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(lab)}
                              disabled={deleting === lab.id}
                              className="rounded-lg p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50"
                              aria-label={`Hapus ${lab.name}`}
                            >
                              <IconTrash className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination meta={meta} onChange={setPage} />
          </>
        )}
      </div>

      {/* Modal tambah/edit */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Lab' : 'Tambah Lab Baru'}
      >
        {formError && (
          <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
            {formError}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label" htmlFor="lab-name">
              Nama Lab
            </label>
            <input
              id="lab-name"
              className="input"
              placeholder="cth: Lab Komputer 3"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="label" htmlFor="lab-capacity">
              Kapasitas
            </label>
            <input
              id="lab-capacity"
              type="number"
              min="1"
              className="input"
              placeholder="cth: 36"
              value={form.capacity}
              onChange={(e) => setForm({ ...form, capacity: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="label" htmlFor="lab-desc">
              Deskripsi
            </label>
            <textarea
              id="lab-desc"
              rows="3"
              className="input"
              placeholder="Jelaskan fasilitas lab..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">
              Batal
            </button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'Menyimpan...' : editing ? 'Simpan Perubahan' : 'Simpan'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
