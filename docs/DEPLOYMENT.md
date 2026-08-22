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

File **`database/sipelab.sql`** (di root project) **sudah berisi hasil `migrate --seed` lengkap**: struktur 8 tabel + akun demo + 5 lab + booking contoh + 1 laporan. **Tidak perlu menjalankan `php artisan migrate` di hosting** — cukup import file ini lewat phpMyAdmin (langkah 1.4).

Untuk membuat ulang dump dari database lokal (misalnya setelah data berubah):

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
```

> **Tanpa SSH?** Buat symlink manual: di File Manager, folder `public_html/backend/public/storage` → symlink ke `public_html/backend/storage/app/public`. Atau pastikan hosting panel Anda punya menu "Symlink".

**Perbaiki permission:**

```bash
chmod -R 775 storage bootstrap/cache
```

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

## Bagian 3 — Checklist Go-Live

- [ ] `APP_ENV=production` dan `APP_DEBUG=false`
- [ ] `APP_KEY` sudah di-generate
- [ ] Database terimport & kredensial `.env` benar
- [ ] `storage/` & `bootstrap/cache` writable (755/775)
- [ ] Folder `public/storage` tersambung (symlink)
- [ ] SSL aktif → semua akses via `https://`
- [ ] Test login akun demo dari browser
- [ ] Test upload foto laporan (cek `storage/app/public/reports/`)

## ⚠️ Troubleshooting Umum

| Masalah | Solusi |
|---|---|
| Halaman kosong / error 500 | Cek `storage/logs/laravel.log`; pastikan `APP_KEY` ada |
| Foto laporan tidak tampil | Jalankan `php artisan storage:link` atau buat symlink manual |
| CORS blocked di browser | Cek `FRONTEND_URL` di `.env` backend |
| Login gagal terus | Pastikan sudah `php artisan migrate --seed` dan kredensial DB benar |
| SQLSTATE[HY000] | User database salah atau host DB bukan `localhost` |
