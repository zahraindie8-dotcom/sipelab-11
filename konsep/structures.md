# 📐 Struktur Proyek SiLab

## Arsitektur Sistem

```
┌─────────────────────────────────────────────────────────┐
│                    Client (Browser)                      │
│  React 18 + Vite + Tailwind CSS (SPA)                   │
│  Port: localhost:5173 (dev) / static (production)        │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTP (Axios + Bearer Token)
                       ▼
┌─────────────────────────────────────────────────────────┐
│                  Laravel 10 REST API                     │
│  Sanctum Auth + RBAC (admin/guru/siswa)                  │
│  Port: localhost:8000 (dev) / public/ (production)       │
└──────────────────────┬──────────────────────────────────┘
                       │ Eloquent ORM
                       ▼
┌─────────────────────────────────────────────────────────┐
│                      MySQL 8                             │
│  9 tables: users, labs, bookings, reports,              │
│            notifications, sessions, + 3 Laravel defaults │
└─────────────────────────────────────────────────────────┘
```

---

## Struktur Folder

```
sipelab/
├── backend/                          # Laravel 10 REST API
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/Api/
│   │   │   │   ├── AuthController.php       # Login, Register, Logout, User
│   │   │   │   ├── BookingController.php    # CRUD + Approve/Reject/Cancel + Notifikasi
│   │   │   │   ├── LabController.php        # CRUD + Availability Check
│   │   │   │   ├── ReportController.php     # CRUD Laporan + Upload Foto
│   │   │   │   ├── UserController.php       # CRUD User (admin only)
│   │   │   │   ├── DashboardController.php  # Data dashboard per role
│   │   │   │   ├── NotificationController.php # Notifikasi + Mark Read
│   │   │   │   └── AnalyticsController.php  # Statistik penggunaan lab
│   │   │   ├── Middleware/
│   │   │   │   └── EnsureRole.php           # RBAC: role:admin, role:admin,guru
│   │   │   ├── Requests/
│   │   │   │   ├── StoreBookingRequest.php
│   │   │   │   ├── UpdateBookingRequest.php
│   │   │   │   ├── StoreLabRequest.php
│   │   │   │   └── UpdateLabRequest.php
│   │   │   └── Resources/
│   │   │       ├── BookingResource.php
│   │   │       └── LabResource.php
│   │   └── Models/
│   │       ├── User.php              # HasApiTokens, RBAC helpers
│   │       ├── Lab.php               # Status active/maintenance/inactive
│   │       ├── Booking.php           # Overlapping scope, status workflow
│   │       ├── Report.php            # Photo upload
│   │       └── Notification.php      # Type constants, markAsRead
│   ├── database/
│   │   ├── migrations/
│   │   │   ├── 2014_10_12_000000_create_users_table.php
│   │   │   ├── 2023_06_01_000001_create_labs_table.php
│   │   │   ├── 2023_06_01_000002_create_bookings_table.php
│   │   │   ├── 2023_06_01_000003_create_reports_table.php
│   │   │   └── 2023_06_01_000006_create_notifications_table.php
│   │   └── seeders/
│   ├── routes/
│   │   └── api.php                   # Semua route API
│   ├── storage/
│   │   └── app/public/reports/       # Foto bukti laporan
│   └── tests/                        # 41+ test cases
│
├── frontend/                         # React 18 + Vite + Tailwind
│   ├── src/
│   │   ├── api/
│   │   │   └── client.js             # Axios + Sanctum token interceptor
│   │   ├── context/
│   │   │   ├── AuthContext.jsx        # Login/Register/Logout state
│   │   │   └── ToastContext.jsx       # Global toast notification
│   │   ├── components/
│   │   │   ├── Layout.jsx             # Sidebar + Topbar (role-based theme)
│   │   │   ├── Modal.jsx              # Reusable modal
│   │   │   ├── Pagination.jsx         # Server-side pagination
│   │   │   ├── StatusBadge.jsx        # Badge status booking
│   │   │   ├── BookingDetail.jsx      # Detail booking modal
│   │   │   ├── StatCard.jsx           # Dashboard stat card
│   │   │   ├── EmptyState.jsx         # Empty state placeholder
│   │   │   ├── BarChart.jsx           # Chart penggunaan lab
│   │   │   ├── ProtectedRoute.jsx     # Auth guard
│   │   │   ├── RoleRoute.jsx          # Role guard
│   │   │   ├── ReportPrintView.jsx    # Print laporan
│   │   │   └── icons.jsx              # SVG icon components
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx          # Dispatcher ke role-specific dashboard
│   │   │   ├── dashboard/
│   │   │   │   ├── AdminDashboard.jsx
│   │   │   │   ├── GuruDashboard.jsx
│   │   │   │   ├── SiswaDashboard.jsx
│   │   │   │   └── parts.jsx          # Shared dashboard components
│   │   │   ├── Labs.jsx               # Daftar & kelola lab
│   │   │   ├── NewBooking.jsx         # Form booking + real-time availability
│   │   │   ├── Bookings.jsx           # Daftar booking + approve/reject
│   │   │   ├── BookingCalendar.jsx    # Kalender bulanan
│   │   │   ├── Approvals.jsx          # Antrian persetujuan
│   │   │   ├── Reports.jsx            # Laporan penggunaan
│   │   │   ├── Users.jsx              # Kelola user (admin)
│   │   │   ├── Analytics.jsx          # Statistik (admin)
│   │   │   ├── Notifications.jsx      # Notifikasi
│   │   │   └── NotFound.jsx           # 404 page
│   │   └── test/                      # 27+ test cases
│   └── .htaccess                      # SPA routing untuk shared hosting
│
├── database/
│   ├── sipelab.sql                    # Dump lengkap (7 tabel + data)
│   └── sipelab_upgrade.sql            # Tambahan kolom Smart Booking
│
├── docs/
│   └── DEPLOYMENT.md                  # Panduan deploy ke shared hosting
├── deploy.sh                          # Automasi build & packaging
├── start-dev.bat                      # Launcher dev (Laragon)
└── konsep/
    ├── ai.md                          # Konsep awal proyek
    └── structures.md                  # Dokumentasi ini
```

---

## Database Schema

### Tabel: `users`
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | bigint PK | Auto increment |
| name | string | Nama lengkap |
| email | string (unique) | Email login |
| password | string | Hashed (bcrypt) |
| role | enum(admin,guru,siswa) | Role user |
| created_at | timestamp | |
| updated_at | timestamp | |

### Tabel: `labs`
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | bigint PK | Auto increment |
| name | string | Nama lab |
| code | varchar(50) unique | Kode lab (KOM-01, IPA-01, dll) |
| capacity | integer | Kapasitas orang |
| description | text | Deskripsi |
| location | string | Lokasi fisik |
| status | enum(active,maintenance,inactive) | Status lab |
| created_at | timestamp | |
| updated_at | timestamp | |

### Tabel: `bookings`
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | bigint PK | Auto increment |
| user_id | FK → users.id | Pemesan |
| lab_id | FK → labs.id | Lab yang dipesan |
| date | date | Tanggal booking |
| start_time | time | Jam mulai |
| end_time | time | Jam selesai |
| purpose | varchar(500) | Tujuan penggunaan |
| participant_count | int unsigned | Jumlah peserta |
| status | enum(pending,approved,rejected,cancelled,completed) | Status booking |
| approved_by | FK → users.id | Yang menyetujui |
| approved_at | timestamp | Waktu persetujuan |
| rejection_reason | varchar(1000) | Alasan penolakan |
| notes | text | Catatan |
| created_at | timestamp | |

### Tabel: `reports`
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | bigint PK | Auto increment |
| booking_id | FK → bookings.id | Booking terkait |
| user_id | FK → users.id | Pembuat laporan |
| photo | string | Path foto bukti |
| description | text | Deskripsi aktivitas |
| created_at | timestamp | |

### Tabel: `notifications`
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | bigint PK | Auto increment |
| user_id | FK → users.id | Penerima notifikasi |
| type | varchar(50) | Jenis notifikasi |
| title | string | Judul |
| message | text | Isi pesan |
| booking_id | FK → bookings.id | Booking terkait |
| is_read | boolean | Sudah dibaca |
| created_at | timestamp | |
| updated_at | timestamp | |

### Tabel: `sessions` (untuk SESSION_DRIVER=database)
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | varchar(255) PK | Session ID |
| user_id | FK → users.id | User (nullable) |
| ip_address | varchar(45) | IP client |
| user_agent | text | Browser info |
| payload | longtext | Session data |
| last_activity | int | Timestamp aktivitas |

---

## API Endpoints

### Autentikasi (Publik)
| Method | Endpoint | Keterangan |
|---|---|---|
| POST | `/api/login` | Login, return token + user |
| POST | `/api/register` | Register (role otomatis siswa) |

### Autentikasi (Login)
| Method | Endpoint | Keterangan |
|---|---|---|
| GET | `/api/user` | Data user yang login |
| POST | `/api/logout` | Hapus token |

### Dashboard
| Method | Endpoint | Keterangan |
|---|---|---|
| GET | `/api/dashboard` | Data dashboard (role-based) |

### Labs
| Method | Endpoint | Akses | Keterangan |
|---|---|---|---|
| GET | `/api/labs` | Semua | Daftar lab + filter search/status |
| GET | `/api/labs/{id}` | Semua | Detail lab |
| POST | `/api/labs` | Admin | Tambah lab |
| PUT | `/api/labs/{id}` | Admin | Edit lab |
| DELETE | `/api/labs/{id}` | Admin | Hapus lab |
| GET | `/api/labs/{id}/availability` | Semua | Cek ketersediaan jadwal |

### Bookings
| Method | Endpoint | Akses | Keterangan |
|---|---|---|---|
| GET | `/api/bookings` | Semua | Daftar booking (filter: status, lab_id, date) |
| GET | `/api/bookings/{id}` | Pemilik/Admin | Detail booking |
| POST | `/api/bookings` | Semua | Buat booking baru |
| PUT | `/api/bookings/{id}` | Pemilik/Admin | Edit booking (status pending) |
| DELETE | `/api/bookings/{id}` | Pemilik/Admin | Hapus booking |
| POST | `/api/bookings/{id}/cancel` | Pemilik/Admin | Batalkan booking (status pending) |
| POST | `/api/bookings/{id}/approve` | Admin/Guru | Setujui booking |
| POST | `/api/bookings/{id}/reject` | Admin/Guru | Tolak booking + alasan |

### Reports
| Method | Endpoint | Akses | Keterangan |
|---|---|---|---|
| GET | `/api/reports` | Semua | Laporan milik sendiri |
| GET | `/api/reports/all` | Admin/Guru | Semua laporan |
| POST | `/api/reports` | Semua | Upload laporan (1x per booking) |
| DELETE | `/api/reports/{id}` | Pemilik/Admin | Hapus laporan |

### Users (Admin only)
| Method | Endpoint | Keterangan |
|---|---|---|
| GET | `/api/users` | Daftar user + filter/search |
| GET | `/api/users/{id}` | Detail user |
| POST | `/api/users` | Tambah user |
| PUT | `/api/users/{id}` | Edit user |
| DELETE | `/api/users/{id}` | Hapus user |

### Notifications
| Method | Endpoint | Keterangan |
|---|---|---|
| GET | `/api/notifications` | Daftar notifikasi (paginated) |
| GET | `/api/notifications/unread-count` | Jumlah belum dibaca |
| POST | `/api/notifications/{id}/read` | Tandai sudah dibaca |
| POST | `/api/notifications/read-all` | Tandai semua sudah dibaca |

### Analytics (Admin only)
| Method | Endpoint | Keterangan |
|---|---|---|
| GET | `/api/analytics` | Statistik penggunaan lab |

---

## Booking Status Workflow

```
                    ┌──────────┐
                    │ pending  │
                    └────┬─────┘
                         │
            ┌────────────┼────────────┐
            ▼            ▼            ▼
      ┌──────────┐ ┌──────────┐ ┌───────────┐
      │ approved │ │ rejected │ │ cancelled │
      └──────────┘ └──────────┘ └───────────┘
            │
            ▼
      ┌──────────┐
      │completed │  (opsional)
      └──────────┘
```

- **pending → approved**: Admin/guru menyetujui
- **pending → rejected**: Admin/guru menolak (wajib isi alasan)
- **pending → cancelled**: Pemesan/admin membatalkan
- **approved → completed**: Tandai selesai (opsional)
- Booking yang sudah approved/rejected/cancelled **tidak bisa diedit**

---

## Notifikasi Otomatis

| Event | Penerima | Type |
|---|---|---|
| Booking dibuat | Semua admin & guru (kecuali pengirim) | `booking_created` |
| Booking disetujui | Pemesan | `booking_approved` |
| Booking ditolak | Pemesan | `booking_rejected` |
| Booking dibatalkan (oleh siswa) | Semua admin & guru | `booking_cancelled` |

---

## RBAC (Role-Based Access Control)

| Fitur | Admin | Guru | Siswa |
|---|---|---|---|
| Login | ✅ | ✅ | ✅ |
| Register | ❌ | ❌ | ✅ |
| Dashboard | ✅ (all stats) | ✅ (approval queue) | ✅ (personal) |
| Booking Lab | ✅ | ✅ | ✅ |
| Approve/Reject | ✅ | ✅ | ❌ |
| Cancel Booking | ✅ (semua) | ❌ (hanya milik sendiri) | ✅ (hanya pending milik sendiri) |
| Kelola Lab | ✅ | ❌ | ❌ |
| Lihat Laporan | ✅ (semua) | ✅ (semua) | ✅ (hanya milik) |
| Upload Laporan | ✅ | ✅ | ✅ |
| Kelola User | ✅ | ❌ | ❌ |
| Statistik | ✅ | ❌ | ❌ |

---

## Middleware

| Middleware | Keterangan |
|---|---|
| `auth:sanctum` | Cek token valid |
| `role:admin` | Hanya admin |
| `role:admin,guru` | Admin dan guru |
| `EnsureRole` | Custom middleware untuk RBAC |

---

## Key Design Decisions

1. **Anti double-booking**: Menggunakan database transaction + `scopeOverlapping` untuk cek konflik jadwal. Hanya booking `pending`/`approved` yang dianggap mengunci slot.

2. **Session driver database**: Menghindari masalah folder session di shared hosting. Tabel `sessions` dibuat via SQL manual.

3. **Dual SQL import**: `sipelab.sql` (struktur dasar) + `sipelab_upgrade.sql` (kolom tambahan Smart Booking). Tidak perlu `php artisan migrate` di hosting.

4. **Frontend SPA**: React + Vite build ke static files. `.htaccess` untuk SPA routing di shared hosting.

5. **Role-based dashboard**: Setiap role memiliki dashboard yang dirancang khusus sesuai kebutuhan mereka.

6. **Real-time availability check**: Form booking mengecek ketersediaan lab secara real-time (debounce 500ms) sebelum submit.
