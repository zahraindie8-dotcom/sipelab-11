#!/bin/bash
# ============================================================
# SiLab Deploy Script — Shared Hosting (cPanel)
# Jalankan dari root folder project
# ============================================================

set -e

echo "========================================"
echo "  SiLab Deploy Script"
echo "========================================"
echo ""

# --- Step 1: Backend composer install ---
echo "[1/5] Installing backend dependencies (production)..."
cd backend
composer install --optimize-autoloader --no-dev 2>/dev/null || echo "  ⚠️  Composer install dilewati (jalankan manual jika perlu)"
cd ..

# --- Step 2: Generate APP_KEY ---
echo "[2/5] Generating APP_KEY..."
cd backend
if grep -q "^APP_KEY=$" .env 2>/dev/null || grep -q "^APP_KEY=base64:" .env 2>/dev/null; then
  php artisan key:generate --force 2>/dev/null && echo "  ✅ APP_KEY generated" || echo "  ⚠️  APP_KEY generation dilewati (jalankan manual: php artisan key:generate)"
else
  echo "  ℹ️  APP_KEY sudah ada, skip."
fi
cd ..

# --- Step 3: Build frontend ---
echo "[3/5] Building frontend..."
cd frontend
npm install 2>/dev/null
npm run build
cd ..

# --- Step 4: Copy .htaccess ke dist ---
echo "[4/5] Copying .htaccess to dist..."
cp frontend/.htaccess frontend/dist/.htaccess 2>/dev/null && echo "  ✅ .htaccess copied" || echo "  ⚠️  .htaccess copy failed"

# --- Step 5: Create ZIP packages ---
echo "[5/5] Creating ZIP packages..."
mkdir -p dist

# Backend ZIP (tanpa vendor, node_modules, tests)
cd backend
zip -r ../dist/sipelab-backend.zip . \
  -x "node_modules/*" \
  -x ".env" \
  -x ".env.production" \
  -x "storage/logs/*" \
  -x "storage/framework/cache/*" \
  -x "storage/framework/sessions/*" \
  -x "storage/framework/views/*" \
  -x "bootstrap/cache/*.php" \
  2>/dev/null
cd ..

# Frontend ZIP (isi dist/)
cd frontend
zip -r ../dist/sipelab-frontend.zip dist/ 2>/dev/null
cd ..

echo ""
echo "========================================"
echo "  ✅ Build selesai!"
echo "========================================"
echo ""
echo "📁 File siap upload:"
echo "   dist/sipelab-backend.zip   → Upload ke public_html/"
echo "   dist/sipelab-frontend.zip  → Upload ke public_html/"
echo ""
echo "📄 Database:"
echo "   database/sipelab.sql           → Import via phpMyAdmin"
echo "   database/sipelab_upgrade.sql   → Import SETELAH sipelab.sql"
echo ""
echo "📝 Konfigurasi:"
echo "   backend/.env.production  → Rename ke .env lalu isi kredensial DB"
echo ""
echo "📚 Baca panduan lengkap: docs/DEPLOYMENT.md"
echo ""
