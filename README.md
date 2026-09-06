# 🧪 SiLab — Smart Lab Management System

Aplikasi manajemen penggunaan lab sekolah berbasis **Laravel 10 (REST API)** + **ReactJS + Tailwind CSS**, siap di-deploy ke **shared hosting (cPanel)**. Tanpa AI, tanpa QR absensi, ringan dan hemat resource.

## ✨ Fitur

| Modul | Deskripsi |
|---|---|
| 🔐 **Autentikasi** | Login, register (siswa), RBAC 3 role: `admin`, `guru`, `siswa` (Laravel Sanctum) |
| 📧 **Email Verifikasi** | Verifikasi email 6 digit saat registrasi |
| 🧪 **Manajemen Lab** | CRUD data lab, kapasitas, deskripsi |
| 📅 **Sistem Booking** | Booking berdasarkan tanggal & jam, **validasi bentrok jadwal otomatis**, status `pending / approved / rejected`, **detail booking** (klik baris) |
| ✅ **Persetujuan** | Admin/guru menyetujui atau menolak booking (dengan alasan) |
| 📸 **Laporan** | Upload foto bukti penggunaan lab + deskripsi aktivitas + timestamp otomatis |
| 👥 **Manajemen User** | Admin CRUD user (nama, email, password, role) + filter & pencarian |
| 📊 **Dashboard** | Total penggunaan lab, jumlah booking, status booking, aktivitas terbaru (role-based: admin / guru / siswa) |
| 🛡️ **Keamanan** | CSP nonce, rate limiting, private storage, production-safe error handling |

## 🛠 Tech Stack

- **Backend:** Laravel 10 (REST API) + Laravel Sanctum + MySQL
- **Frontend:** ReactJS 18 + Vite + Tailwind CSS + React Router + Axios
- **Mobile (opsional):** Flutter — API sudah siap (`/api/*`)
- **Hosting:** Shared hosting (cPanel) — tanpa Node.js backend

## 🛡️ Keamanan

| Fitur | Status | Detail |
|-------|--------|--------|
| Authentication | ✅ | Laravel Sanctum (token-based) |
| Authorization | ✅ | Role-Based Access Control (RBAC) |
| Email Verification | ✅ | 6-digit code verification |
| Password Security | ✅ | Bcrypt hashing |
| SQL Injection | ✅ | Eloquent ORM (parameterized queries) |
| XSS Protection | ✅ | React auto-escaping + CSP nonce |
| CSRF Protection | ✅ | Laravel CSRF middleware |
| Rate Limiting | ✅ | Per-route throttle middleware |
| File Security | ✅ | Private storage + UUID naming |
| Error Handling | ✅ | Production-safe (no info leak) |
| Security Headers | ✅ | CSP, HSTS, X-Frame-Options |

**Skor Keamanan: ⭐⭐⭐⭐⭐ (5/5)**

Lihat [docs/SECURITY.md](docs/SECURITY.md) untuk dokumentasi lengkap.

## 📁 Struktur Folder

```
├── backend/                 # Laravel 10 REST API
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/Api/   # Auth, Lab, Booking, Report, Dashboard, User
│   │   │   ├── Middleware/        # EnsureRole (RBAC)
│   │   │   ├── Requests/          # Form Request validation
│   │   │   └── Resources/         # API Resource
│   │   ├── Models/                # User, Lab, Booking, Report
│   │   └── Providers/
│   ├── config/
│   ├── database/
│   │   ├── migrations/
│   │   ├── factories/
│   │   └── seeders/              # Akun demo + lab + booking contoh
│   ├── routes/api.php
│   └── public/
└── frontend/                # React + Vite + Tailwind (SPA)
    └── src/
        ├── api/             # Axios client + interceptor token
        ├── context/         # Auth & Toast
        ├── components/      # Layout, Modal, StatusBadge, BookingDetail, dll.
        └── pages/           # Login, Dashboard, Labs, Booking, Approval, Reports, Users
└── database/sipelab.sql     # Dump DB hasil migrate+seed — siap import ke phpMyAdmin
```

## 🚀 Cara Menjalankan (Development)

### ⚡ Quick Start dengan Laragon (Windows)

Jika memakai Laragon (seperti komputer ini), semua tool sudah tersedia:

- **PHP 8.1**: `E:\LARAGON\bin\php\php-8.1.10-Win32-vs16-x64\php.exe`
- **Composer**: `E:\LARAGON\bin\composer\composer.phar`
- **MySQL 8**: sudah berjalan via Laragon (user `root`, password kosong)
- **Node.js**: `E:\note-js\node.exe`

```bash
# sekali saja (sudah dilakukan di komputer ini)
cd backend
php /e/LARAGON/bin/composer/composer.phar install
cp .env.example .env && php artisan key:generate
php artisan migrate --seed
php artisan storage:link

# jalankan kedua server (atau klik dua kali start-dev.bat)
cd backend && php artisan serve          # http://127.0.0.1:8000
cd frontend && npm run dev              # http://localhost:5173
```

> 💡 File **`start-dev.bat`** di root project menyalakan backend + frontend sekaligus.

### 1. Backend (butuh PHP ≥ 8.1 + Composer + MySQL)

```bash
cd backend
cp .env.example .env          # Windows: copy .env.example .env
composer install
php artisan key:generate
# isi kredensial DB di file .env (DB_DATABASE, DB_USERNAME, DB_PASSWORD)
php artisan migrate --seed
php artisan storage:link      # agar foto laporan bisa diakses
php artisan serve             # http://127.0.0.1:8000
```

### 2. Frontend (butuh Node.js ≥ 18)

```bash
cd frontend
npm install
npm run dev                   # http://localhost:5173 (proxy API otomatis)
```

### ✅ Status Pengujian

Backend sudah diuji di komputer ini (Laragon):

- `php artisan test` → **41+ test lulus** (validasi bentrok jadwal, persetujuan, RBAC admin/guru/siswa, validasi input tiap endpoint, user management)
- Alur API end-to-end teruji: login → booking → deteksi bentrok (422) → approve → upload laporan → dashboard
- Frontend `npm test` → **27+ test komponen lulus** (RoleRoute, navigasi Layout per role, pemilihan dashboard per role, pesan error form booking/lab/laporan/user management, detail booking)
- Frontend `npm run build` sukses; dev server berjalan di `http://localhost:5173`

### 🔑 Akun Demo (password semua: `password`)

| Role | Email |
|---|---|
| Admin | `admin@sipelab.test` |
| Guru | `guru@sipelab.test` |
| Siswa | `siswa@sipelab.test` |

## 🌐 Endpoint API Utama

| Method | Endpoint | Akses |
|---|---|---|
| POST | `/api/login` | publik |
| POST | `/api/register` | publik (role otomatis siswa) |
| POST | `/api/logout` | login |
| GET | `/api/user` | login |
| GET | `/api/dashboard` | login |
| GET/POST | `/api/labs` | GET: login · POST: admin |
| PUT/DELETE | `/api/labs/{id}` | admin |
| GET/POST | `/api/bookings` | login |
| PUT/DELETE | `/api/bookings/{id}` | pemilik / admin |
| POST | `/api/bookings/{id}/approve` | admin, guru |
| POST | `/api/bookings/{id}/reject` | admin, guru |
| GET/POST | `/api/reports` | login (POST: booking disetujui, 1x per booking) |
| GET/POST | `/api/users` | GET: admin · POST: admin |
| PUT/DELETE | `/api/users/{id}` | admin |

Response standar:

```json
{
  "message": "Login berhasil.",
  "token": "1|abcdef...",
  "user": { "id": 1, "name": "...", "role": "admin" }
}
```

## 🚀 Deploy ke Production

```bash
# 1. Deploy security upgrade
cd backend
bash deploy-security-upgrade.sh

# 2. Setup cron jobs
bash setup-crons.sh

# 3. Setup SSL (ganti dengan domain Anda)
sudo bash setup-ssl.sh lab.sekolah.sch.id

# 4. Edit .env untuk email
nano .env
# Set MAIL_USERNAME dan MAIL_PASSWORD
```

Lihat [docs/DEPLOYMENT_CHECKLIST.md](docs/DEPLOYMENT_CHECKLIST.md) untuk panduan lengkap.

## 📊 Monitoring

```bash
# Security report
php artisan security:report --period=24h

# Real-time monitor
bash security-monitor.sh

# Manual backup
bash backup.sh
```

## 📄 Dokumentasi Lainnya

- [Security Documentation](docs/SECURITY.md)
- [API Documentation](docs/API_DOCUMENTATION.md)
- [Cron Jobs Setup](docs/CRON_SETUP.md)
- [Email SMTP Setup](docs/EMAIL_SMTP_SETUP.md)
- [SSL Setup](docs/SSL_SETUP.md)
- [Deployment Checklist](docs/DEPLOYMENT_CHECKLIST.md)
- [Security Testing](docs/SECURITY_TESTING.md)
- [Panduan Deploy ke Shared Hosting (cPanel)](docs/DEPLOYMENT.md)
- File konsep: [`konsep/ai.md`](konsep/ai.md)

## 🗄️ Database Siap Import

File **`database/sipelab.sql`** di root project berisi hasil migrate + seed lengkap (8 tabel, akun demo, 5 lab, booking contoh). Untuk deploy ke shared hosting, cukup buat database di cPanel lalu **Import** file ini via phpMyAdmin — lihat [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) bagian 1.4–1.6.
