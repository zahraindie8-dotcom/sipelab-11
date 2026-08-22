# Panduan Debug Dashboard API

## Langkah 1: Start Backend Laravel

```bash
cd backend
php artisan serve
```

Backend akan jalan di `http://127.0.0.1:8000`

## Langkah 2: Start Frontend React

Di terminal baru:

```bash
cd frontend
npm run dev
```

Frontend akan jalan di `http://localhost:5173`

## Langkah 3: Setup Database (jika belum)

Jika database belum ada, jalankan:

```bash
cd backend
php artisan migrate --seed
```

Ini akan create tables dan seed data:
- Admin: admin@test.com / password
- Guru: guru@test.com / password
- Siswa: siswa@test.com / password

## Langkah 4: Test API Endpoints

### 1. Login
```bash
curl -X POST http://127.0.0.1:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"password"}'
```

Response:
```json
{
  "message": "Login berhasil.",
  "token": "ABC123...",
  "user": {
    "id": 1,
    "name": "Admin",
    "email": "admin@test.com",
    "role": "admin"
  }
}
```

**Copy token ini untuk request berikutnya**

### 2. Get Current User
```bash
curl -X GET http://127.0.0.1:8000/api/user \
  -H "Authorization: Bearer TOKEN_DARI_LOGIN"
```

Response seharusnya UserResource langsung (bukan wrapped):
```json
{
  "id": 1,
  "name": "Admin",
  "email": "admin@test.com",
  "role": "admin"
}
```

### 3. Get Dashboard Data
```bash
curl -X GET http://127.0.0.1:8000/api/dashboard \
  -H "Authorization: Bearer TOKEN_DARI_LOGIN"
```

Response:
```json
{
  "stats": {
    "total_labs": 5,
    "total_bookings": 20,
    "pending": 3,
    "approved": 15,
    "rejected": 1,
    "cancelled": 1
  },
  "lab_usage": [...],
  "recent_bookings": [...],
  "pending_approvals": [...],
  "upcoming_bookings": [...],
  "unread_notifications": 0,
  "mini_chart_data": [...]
}
```

## Langkah 5: Check Browser Console

Di browser, tekan F12 untuk buka Developer Tools:

1. Tab **Network** - Lihat apakah request `/api/dashboard` success (status 200)
2. Tab **Console** - Lihat apakah ada error message dari `[Dashboard]` atau `[Auth]` logs

Jika ada error:
- Status 401 → Auth token invalid/expired → Perlu login ulang
- Status 500 → Backend error → Check Laravel error logs: `backend/storage/logs/laravel.log`
- Status 404 → Route tidak ditemukan → Check `backend/routes/api.php`
- CORS error → Proxy tidak jalan → Check Vite proxy config

## Langkah 6: Perbaiki Issue yang Ketemu

Jika menemukan error:

### Backend Error (status 500)
Check file: `backend/storage/logs/laravel.log`

### Proxy/CORS Error
Pastikan:
- Backend jalan di `http://127.0.0.1:8000`
- Frontend menjalankan dengan `npm run dev` (bukan build)
- Vite proxy sudah dikonfigurasi di `frontend/vite.config.js`

### Auth Error (status 401)
Pastikan:
- Token tersimpan di localStorage dengan key `sipelab_token`
- Authorization header dikirim: `Authorization: Bearer {token}`
- Token sudah valid (tidak expired)

## Langkah 7: Test di Browser

1. Buka `http://localhost:5173`
2. Login dengan:
   - Email: `admin@test.com` / Password: `password` (untuk test admin)
   - Email: `guru@test.com` / Password: `password` (untuk test guru)
   - Email: `siswa@test.com` / Password: `password` (untuk test siswa)
3. Check browser console untuk error logs
4. Buka Network tab untuk lihat API requests

## Troubleshooting

### "Gagal memuat data dashboard"
1. Check Network tab - apakah request `/api/dashboard` success?
2. Check Console - baca error message dari `[Dashboard]` log
3. Check Browser Console vs Backend - mana yang error?

### Status 401 (Unauthorized)
1. Token tidak dikirim → Check localStorage `sipelab_token` key ada atau tidak
2. Token expired → Login ulang
3. Token invalid → Check backend `api_tokens` table di database

### Status 500 (Server Error)
Check `backend/storage/logs/laravel.log` untuk detail error

### Database Kosong
Jalankan:
```bash
cd backend
php artisan migrate:fresh --seed
```

### Port Sudah Terpakai
Jika 8000 atau 5173 sudah pakai, gunakan port berbeda:

Backend:
```bash
php artisan serve --port=8001
```

Kemudian update vite.config.js proxy target ke `http://127.0.0.1:8001`

Frontend:
```bash
npm run dev -- --port 5174
```
