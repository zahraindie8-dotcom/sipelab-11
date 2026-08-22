import { useCallback, useEffect, useState } from 'react'
import client, { extractError } from '../api/client'
import { useToast } from '../context/ToastContext'
import Modal from '../components/Modal'
import Pagination from '../components/Pagination'
import EmptyState from '../components/EmptyState'
import { IconPlus, IconSearch, IconTrash, IconEdit, IconUsers, IconShield } from '../components/icons'

const emptyForm = { name: '', email: '', password: '', password_confirmation: '', role: 'siswa' }

const roleOptions = [
  { value: 'admin', label: 'Admin' },
  { value: 'guru', label: 'Guru' },
  { value: 'siswa', label: 'Siswa' },
]

const roleBadge = {
  admin: 'bg-brand-100 text-brand-700 ring-brand-200',
  guru: 'bg-sky-100 text-sky-700 ring-sky-200',
  siswa: 'bg-emerald-100 text-emerald-700 ring-emerald-200',
}

const roleFilters = [
  { value: '', label: 'Semua Role' },
  { value: 'admin', label: 'Admin' },
  { value: 'guru', label: 'Guru' },
  { value: 'siswa', label: 'Siswa' },
]

export default function Users() {
  const { toast } = useToast()

  const [users, setUsers] = useState([])
  const [meta, setMeta] = useState(null)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [loading, setLoading] = useState(true)

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState(null)

  const [deleting, setDeleting] = useState(null)

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await client.get('/users', {
        params: {
          page,
          per_page: 10,
          search: search || undefined,
          role: roleFilter || undefined,
        },
      })
      setUsers(data.data)
      setMeta(data.meta)
    } catch (err) {
      toast(extractError(err), 'error')
    } finally {
      setLoading(false)
    }
  }, [page, search, roleFilter, toast])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const openCreate = () => {
    setEditing(null)
    setForm(emptyForm)
    setFormError(null)
    setModalOpen(true)
  }

  const openEdit = (user) => {
    setEditing(user)
    setForm({
      name: user.name,
      email: user.email,
      password: '',
      password_confirmation: '',
      role: user.role,
    })
    setFormError(null)
    setModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setFormError(null)
    try {
      if (editing) {
        // Saat edit, kirim password hanya jika diisi.
        const payload = { ...form }
        if (!payload.password) {
          delete payload.password
          delete payload.password_confirmation
        }
        await client.put(`/users/${editing.id}`, payload)
        toast('Data user berhasil diperbarui.')
      } else {
        await client.post('/users', form)
        toast('User baru berhasil ditambahkan.')
      }
      setModalOpen(false)
      fetchUsers()
    } catch (err) {
      setFormError(extractError(err))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (user) => {
    if (!window.confirm(`Hapus user "${user.name}"?`)) return
    setDeleting(user.id)
    try {
      await client.delete(`/users/${user.id}`)
      toast('User berhasil dihapus.')
      fetchUsers()
    } catch (err) {
      toast(extractError(err), 'error')
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Kelola User</h1>
          <p className="text-sm text-slate-500">Manajemen akun admin, guru, dan siswa</p>
        </div>
        <button onClick={openCreate} className="btn-primary">
          <IconPlus className="h-4 w-4" />
          Tambah User
        </button>
      </div>

      {/* Filter & Search */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative max-w-sm flex-1">
          <IconSearch className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            className="input !pl-10"
            placeholder="Cari nama atau email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {roleFilters.map((f) => (
            <button
              key={f.value}
              onClick={() => {
                setRoleFilter(f.value)
                setPage(1)
              }}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                roleFilter === f.value
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-white text-slate-500 ring-1 ring-inset ring-slate-200 hover:bg-slate-50'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tabel */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600" />
          </div>
        ) : users.length === 0 ? (
          <EmptyState
            icon={IconUsers}
            title="Tidak ada user"
            description="Tidak ada user yang cocok dengan filter atau pencarian."
            action={
              <button onClick={openCreate} className="btn-primary">
                <IconPlus className="h-4 w-4" />
                Tambah User
              </button>
            }
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px]">
                <thead className="border-b border-slate-100 bg-slate-50">
                  <tr>
                    <th className="table-head">Nama</th>
                    <th className="table-head">Email</th>
                    <th className="table-head">Role</th>
                    <th className="table-head">Terdaftar</th>
                    <th className="table-head text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map((u) => (
                    <tr key={u.id} className="transition hover:bg-slate-50/70">
                      <td className="table-cell">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-600">
                            {u.name?.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-semibold text-slate-700">{u.name}</span>
                        </div>
                      </td>
                      <td className="table-cell text-slate-500">{u.email}</td>
                      <td className="table-cell">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${
                            roleBadge[u.role] ?? 'bg-slate-100 text-slate-600 ring-slate-200'
                          }`}
                        >
                          <IconShield className="h-3 w-3" />
                          {u.role_label ?? u.role}
                        </span>
                      </td>
                      <td className="table-cell text-xs text-slate-400">
                        {u.created_at
                          ? new Date(u.created_at).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })
                          : '—'}
                      </td>
                      <td className="table-cell">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEdit(u)}
                            className="rounded-lg p-2 text-slate-400 transition hover:bg-brand-50 hover:text-brand-600"
                            aria-label={`Edit ${u.name}`}
                          >
                            <IconEdit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(u)}
                            disabled={deleting === u.id}
                            className="rounded-lg p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50"
                            aria-label={`Hapus ${u.name}`}
                          >
                            <IconTrash className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
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
        title={editing ? 'Edit User' : 'Tambah User Baru'}
        size="lg"
      >
        {formError && (
          <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
            {formError}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="user-name">
                Nama Lengkap
              </label>
              <input
                id="user-name"
                className="input"
                placeholder="cth: Ahmad Fauzi"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="label" htmlFor="user-email">
                Email
              </label>
              <input
                id="user-email"
                type="email"
                className="input"
                placeholder="cth: ahmad@sekolah.sch.id"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="user-password">
                Password {editing && <span className="font-normal text-slate-400">(kosongkan jika tidak ubah)</span>}
              </label>
              <input
                id="user-password"
                type="password"
                className="input"
                placeholder={editing ? '••••••••' : 'Minimal 8 karakter'}
                minLength={8}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required={!editing}
              />
            </div>
            <div>
              <label className="label" htmlFor="user-password-confirm">
                Konfirmasi Password
              </label>
              <input
                id="user-password-confirm"
                type="password"
                className="input"
                placeholder="Ulangi password"
                value={form.password_confirmation}
                onChange={(e) => setForm({ ...form, password_confirmation: e.target.value })}
                required={!editing && form.password !== ''}
              />
            </div>
          </div>

          <div>
            <label className="label" htmlFor="user-role">
              Role
            </label>
            <div className="relative">
              <IconShield className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <select
                id="user-role"
                className="input !pl-10"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                required
              >
                {roleOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
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
