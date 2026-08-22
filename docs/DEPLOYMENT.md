# 🚀 Panduan Deploy ke Shared Hosting (cPanel)

Panduan ini untuk men-deploy **backend Laravel** + **frontend React (static)** ke shared hosting cPanel — jenis hosting paling umum dan murah di Indonesia.

## Ringkasan Arsitektur

```
Domain Anda (mis. lab.sekolah.sch.id)
│
├── /public_html/backend       → root Laravel (public/ diarahkan ke sini)
│
└── /public_html/ (root)       → file build React (dist)
```

> **Cara alternatif (disarankan):** deploy frontend di subdomain `app.lab.sekolah.sch.id` dan API di `lab.sekolah.sch.id` atau subfolder.

---

## Bagian 1 — Siapkan Backend Laravel

### 1.1 Install dependency (di komputer Anda)

```bash
cd backend
composer install --optimize-autoloader --no-dev
```

> `--no-dev` memangkas ukuran project (tanpa PHPUnit, dll.) — penting karena shared hosting punya batas file & storage.

### 1.2 Upload ke hosting

1. Zip folder `backend/` (tanpa folder `node_modules`).
2. Login cPanel → **File Manager**.
3. Upload zip ke `public_html/` lalu **Extract**.
4. Hasil akhir: `public_html/backend/` berisi `app/`, `bootstrap/`, `vendor/`, `artisan`, dll.

### 1.3 Konfigurasi .env

```bash
# di komputer Anda — sesuaikan lalu upload
cd backend
cp .env.example .env
```

Ubah di `.env`:

```ini
APP_ENV=production
APP_DEBUG=false
APP_URL=https://lab.sekolah.sch.id
DB_CONNECTION=mysql
DB_HOST=localhost
DB_DATABASE=USERNAME_sipelab
DB_USERNAME=USERNAME_sipelab
DB_PASSWORD=passworddbAnda
FRONTEND_URL=https://lab.sekolah.sch.id
SESSION_DRIVER=database
CACHE_DRIVER=file
QUEUE_CONNECTION=sync
MAIL_MAILER=log
```

> `SESSION_DRIVER=database` menghindari error folder session di hosting. Jangan lupa generate `APP_KEY` sebelum upload: `php artisan key:generate`.

### 1.4 Import database via phpMyAdmin

1. cPanel → **MySQL Databases**: buat database + user, beri **ALL PRIVILEGES**.
2. Isi nama database & user ke `.env` di atas.
3. cPanel → **phpMyAdmin** → pilih database → **Import** → upload `database/sipelab.sql` *(file sudah disertakan di project — lihat bagian 1.6)*.

### 1.5 Arahkan Laravel ke `public/`

Cara terbaik (disarankan) — buat **subdomain**:

1. cPanel → **Subdomains** → buat `api.lab.sekolah.sch.id`.
2. Document root diarahkan ke: `public_html/backend/public`.
3. Selesai — API diakses di `https://api.lab.sekolah.sch.id/api`.

Alternatif (tanpa subdomain) — letakkan isi `backend/public/*` di `public_html/` dan isi `backend/` lainnya di `public_html/sipelab-backend/`, lalu ubah `index.php`:

```php
require __DIR__.'/../sipelab-backend/vendor/autoload.php';
$app = require_once __DIR__.'/../sipelab-backend/bootstrap/app.php';
```

### 1.6 File database siap import

Project memiliki **2 file SQL** yang harus di-import secara berurutan:

1. **`database/sipelab.sql`** — struktur dasar 7 tabel + akun demo + 5 lab + booking contoh + 1 laporan.
2. **`database/sipelab_upgrade.sql`** — tambahan kolom Smart Booking Lab (code, location, status, notifications, dll.).

**Urutan import di phpMyAdmin:**
1. Import `database/sipelab.sql` (struktur + data awal)
2. Import `database/sipelab_upgrade.sql` (tambah kolom baru)

**Tidak perlu menjalankan `php artisan migrate` di hosting.**

Untuk membuat ulang dump dari database lokal:

```bash
php artisan migrate --seed
mysqldump -u root -p sipelab > ../database/sipelab.sql
```

> Catatan: import lewat phpMyAdmin hanya membuat **tabel + data**. Setelah import, pastikan `.env` terisi (`DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`) lalu generate `APP_KEY` sebelum upload.

Jalankan perintah berikut (jika hosting menyediakan terminal / SSH):

```bash
php artisan storage:link
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

> **Tanpa SSH?** Buat symlink manual: di File Manager, folder `public_html/backend/public/storage` → symlink ke `public_html/backend/storage/app/public`. Atau pastikan hosting panel Anda punya menu "Symlink".

**Perbaiki permission:**

```bash
chmod -R 775 storage bootstrap/cache
```

**Session driver:** `.env` sudah diatur `SESSION_DRIVER=database`. Jika tabel `sessions` belum ada, jalankan:

```bash
php artisan session:table
php artisan migrate
```

> Atau import SQL berikut via phpMyAdmin:
> ```sql
> CREATE TABLE `sessions` (
>   `id` varchar(255) NOT NULL,
>   `user_id` bigint unsigned DEFAULT NULL,
>   `ip_address` varchar(45) DEFAULT NULL,
>   `user_agent` text,
>   `payload` longtext,
>   `last_activity` int,
>   PRIMARY KEY (`id`),
>   KEY `sessions_user_id_index` (`user_id`),
>   KEY `sessions_last_activity_index` (`last_activity`)
> ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
> ```

---

## Bagian 2 — Build & Deploy Frontend React

### 2.1 Build di komputer Anda

```bash
cd frontend
npm install
npm run build          # hasil di folder frontend/dist
```

### 2.2 Konfigurasi API URL

Saat build, buat `.env` dulu (atau set variabel environment):

```bash
# frontend/.env
VITE_API_URL=https://api.lab.sekolah.sch.id/api
```

Ulangi `npm run build` setelah mengubah URL.

### 2.3 Upload hasil build

1. Upload **isi** folder `frontend/dist/` ke `public_html/` (atau subdomain frontend).
2. Tambahkan file `.htaccess` di folder frontend (untuk SPA routing):

```apache
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /
    RewriteRule ^index\.html$ - [L]
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule . /index.html [L]
</IfModule>
```

### 2.4 Pastikan CORS benar

Di backend `.env`, `FRONTEND_URL` harus berisi origin persis tempat frontend dipasang, misalnya:

```ini
FRONTEND_URL=https://lab.sekolah.sch.id
```

Kalau ada lebih dari satu origin (www & non-www), pisahkan koma:
`FRONTEND_URL=https://lab.sekolah.sch.id,https://www.lab.sekolah.sch.id`

---

## Bagian 3 — Automasi Deploy

Jalankan script deploy dari root project:

```bash
chmod +x deploy.sh
./deploy.sh
```

Script akan:
1. Install backend dependencies (production)
2. Generate APP_KEY
3. Build frontend
4. Copy .htaccess ke dist/
5. Buat ZIP packages di folder `dist/`

**Akun demo (password: `password`):**
| Email | Role |
|---|---|
| `admin@sipelab.test` | Admin |
| `guru@sipelab.test` | Guru |
| `siswa@sipelab.test` | Siswa |

## Bagian 4 — Checklist Go-Live

- [ ] `APP_ENV=production` dan `APP_DEBUG=false`
- [ ] `APP_KEY` sudah di-generate
- [ ] Database `sipelab.sql` **DAN** `sipelab_upgrade.sql` terimport
- [ ] Kredensial `.env` benar (DB_HOST=localhost, DB_DATABASE, DB_USERNAME, DB_PASSWORD)
- [ ] `SESSION_DRIVER=database` dan tabel `sessions` sudah ada
- [ ] `storage/` & `bootstrap/cache` writable (755/775)
- [ ] Folder `public/storage` tersambung (symlink)
- [ ] SSL aktif → semua akses via `https://`
- [ ] CORS: `FRONTEND_URL` sesuai domain frontend
- [ ] Test login akun demo dari browser
- [ ] Test buat booking + cek notifikasi
- [ ] Test upload foto laporan (cek `storage/app/public/reports/`)

## ⚠️ Troubleshooting Umum

| Masalah | Solusi |
|---|---|
| Halaman kosong / error 500 | Cek `storage/logs/laravel.log`; pastikan `APP_KEY` ada |
| Foto laporan tidak tampil | Jalankan `php artisan storage:link` atau buat symlink manual |
| CORS blocked di browser | Cek `FRONTEND_URL` di `.env` backend |
| Login gagal terus | Pastikan sudah `php artisan migrate --seed` dan kredensial DB benar |
| SQLSTATE[HY000] | User database salah atau host DB bukan `localhost` |
