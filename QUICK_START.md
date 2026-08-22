# Quick Start Guide - SIPELab Aplikasi

## Persiapan Pertama Kali (Hanya Sekali)

### Step 1: Install Backend Dependencies
```bash
cd backend
composer install
```

### Step 2: Setup Database
```bash
cd backend
php artisan migrate --seed
```

Ini akan:
- Create semua database tables
- Seed test data dengan 3 user:
  - **Admin**: admin@test.com / password
  - **Guru**: guru@test.com / password
  - **Siswa**: siswa@test.com / password

### Step 3: Install Frontend Dependencies
```bash
cd frontend
npm install
```

## Menjalankan Aplikasi (Setiap Kali)

### Terminal 1 - Backend Server
```bash
cd backend
php artisan serve
```
✅ Backend akan jalan di: `http://127.0.0.1:8000`

### Terminal 2 - Frontend Server
```bash
cd frontend
npm run dev
```
✅ Frontend akan jalan di: `http://localhost:5173`

Buka browser → `http://localhost:5173`

## Login Testing

Gunakan credential untuk test:

```
Email: admin@test.com
Password: password
```

Atau:
```
Email: guru@test.com
Password: password
```

Atau:
```
Email: siswa@test.com
Password: password
```

## Jika Terjadi Masalah

### 1. "Gagal memuat data dashboard"
**Langkah**:
1. Buka DevTools di browser (F12)
2. Klik tab **Console**
3. Lihat error message yang muncul
4. Screenshot dan kirim error-nya

### 2. Port Sudah Terpakai
```bash
# Backend di port lain
php artisan serve --port=8001

# Frontend di port lain  
npm run dev -- --port 5174
```

### 3. "Table not found" error
Database belum di-setup:
```bash
cd backend
php artisan migrate --seed
```

### 4. "CORS" atau network error
Pastikan:
- Backend jalan di port 8000
- Frontend jalan di port 5173
- Tidak ada firewall yang block

## Database Reset (Jika Perlu)

Untuk reset database ke awal:
```bash
cd backend
php artisan migrate:fresh --seed
```

⚠️ Ini akan **menghapus semua data** dan buat ulang dengan test data.

## Struktur Folder

```
sipelab-11/
├── backend/          ← Laravel API
│   ├── app/
│   ├── routes/
│   ├── database/
│   └── storage/logs/ ← Check ini jika ada error
├── frontend/         ← React App
│   ├── src/
│   ├── public/
│   └── vite.config.js
├── database/         ← SQL dump files
├── DEBUG_API.md      ← Detailed debugging guide
└── FIXES_SUMMARY.md  ← Perbaikan yang sudah dilakukan
```

## Development Tips

### Check Backend Logs
```bash
tail -f backend/storage/logs/laravel.log
```

### Run Backend Tests
```bash
cd backend
php artisan test
```

### Run Frontend Tests
```bash
cd frontend
npm run test
```

### Build for Production
```bash
cd frontend
npm run build
```
Output akan ada di `frontend/dist/`

## Troubleshooting Checklist

- [ ] Backend jalan di `http://127.0.0.1:8000`
- [ ] Frontend jalan di `http://localhost:5173`
- [ ] Database sudah di-seed (ada data di table `users`)
- [ ] Bisa login dengan admin@test.com / password
- [ ] Browser DevTools Console tidak ada error merah
- [ ] Network tab menunjukkan `/api/dashboard` status 200

Jika semua checklist ✅, aplikasi seharusnya bisa jalan dengan normal!

## More Help

Lihat file:
- `DEBUG_API.md` - Untuk detailed API testing
- `FIXES_SUMMARY.md` - Untuk detail perbaikan yang sudah dilakukan
- `backend/storage/logs/laravel.log` - Untuk backend error logs
