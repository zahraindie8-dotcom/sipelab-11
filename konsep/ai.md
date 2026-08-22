{
  "project": {
    "name": "Smart Lab Management System",
    "version": "1.0.0",
    "type": "web + mobile ready",
    "description": "Aplikasi manajemen penggunaan lab sekolah berbasis Laravel, ReactJS, Tailwind, dan Flutter (optional mobile). Fokus pada booking lab, monitoring, dan laporan tanpa AI dan tanpa QR absensi."
  },

  "tech_stack": {
    "backend": "Laravel 10 (REST API)",
    "frontend": "ReactJS + Tailwind CSS",
    "mobile": "Flutter (optional, API ready)",
    "database": "MySQL",
    "auth": "Laravel Sanctum",
    "hosting_target": "Shared Hosting (cPanel)"
  },

  "constraints": {
    "no_ai": true,
    "no_qr_attendance": true,
    "lightweight": true,
    "shared_hosting_friendly": true,
    "no_node_backend_required": true
  },

  "modules": [
    "authentication",
    "lab_management",
    "booking_system",
    "approval_system",
    "reporting",
    "dashboard"
  ],

  "roles": [
    "admin",
    "guru",
    "siswa"
  ],

  "features": {
    "authentication": [
      "Login",
      "Register (optional untuk siswa)",
      "Role-based access control"
    ],
    "lab_management": [
      "CRUD data lab",
      "Kapasitas lab",
      "Deskripsi lab"
    ],
    "booking_system": [
      "Booking lab berdasarkan tanggal dan jam",
      "Validasi bentrok jadwal",
      "Status booking (pending, approved, rejected)"
    ],
    "approval_system": [
      "Admin/guru menyetujui booking",
      "Riwayat approval"
    ],
    "reporting": [
      "Upload foto bukti penggunaan lab",
      "Deskripsi aktivitas",
      "Tanggal & waktu otomatis"
    ],
    "dashboard": [
      "Total penggunaan lab",
      "Jumlah booking",
      "Status booking",
      "Aktivitas terbaru"
    ]
  },

  "database_schema": {
    "users": {
      "id": "bigint (PK)",
      "name": "string",
      "email": "string (unique)",
      "password": "string",
      "role": "enum(admin,guru,siswa)",
      "created_at": "timestamp",
      "updated_at": "timestamp"
    },
    "labs": {
      "id": "bigint (PK)",
      "name": "string",
      "capacity": "integer",
      "description": "text",
      "created_at": "timestamp",
      "updated_at": "timestamp"
    },
    "bookings": {
      "id": "bigint (PK)",
      "user_id": "FK -> users.id",
      "lab_id": "FK -> labs.id",
      "date": "date",
      "start_time": "time",
      "end_time": "time",
      "status": "enum(pending,approved,rejected)",
      "notes": "text",
      "created_at": "timestamp"
    },
    "reports": {
      "id": "bigint (PK)",
      "booking_id": "FK -> bookings.id",
      "photo": "string (path)",
      "description": "text",
      "created_at": "timestamp"
    }
  },

  "api_endpoints": {
    "auth": [
      "POST /api/login",
      "POST /api/register",
      "POST /api/logout"
    ],
    "labs": [
      "GET /api/labs",
      "POST /api/labs",
      "PUT /api/labs/{id}",
      "DELETE /api/labs/{id}"
    ],
    "bookings": [
      "GET /api/bookings",
      "POST /api/bookings",
      "PUT /api/bookings/{id}",
      "DELETE /api/bookings/{id}"
    ],
    "approval": [
      "POST /api/bookings/{id}/approve",
      "POST /api/bookings/{id}/reject"
    ],
    "reports": [
      "POST /api/reports",
      "GET /api/reports"
    ]
  },

  "backend_instructions": {
    "setup": [
      "Install Laravel",
      "Setup database MySQL",
      "Konfigurasi .env",
      "Install Sanctum"
    ],
    "structure": [
      "Controllers: AuthController, LabController, BookingController, ReportController",
      "Models: User, Lab, Booking, Report",
      "Middleware: role-based"
    ],
    "rules": [
      "Gunakan validation di setiap request",
      "Gunakan Eloquent ORM",
      "Pisahkan logic di controller",
      "Gunakan API Resource (optional)"
    ]
  },

  "frontend_instructions": {
    "setup": [
      "Create React App / Vite",
      "Install Tailwind CSS",
      "Setup routing (React Router)"
    ],
    "pages": [
      "Login Page",
      "Dashboard",
      "Lab List",
      "Booking Form",
      "Booking List",
      "Approval Page (admin/guru)"
    ],
    "ui_guidelines": [
      "Clean modern UI",
      "Responsive",
      "Gunakan card layout",
      "Gunakan tabel untuk data"
    ]
  },

  "mobile_optional": {
    "description": "Flutter hanya sebagai client API",
    "features": [
      "Login",
      "Booking lab",
      "Lihat jadwal",
      "Upload laporan"
    ]
  },

  "deployment": {
    "type": "shared hosting",
    "steps": [
      "Upload project Laravel ke public_html",
      "Set folder public sebagai root",
      "Import database via phpMyAdmin",
      "Set .env production",
      "Set permission storage & bootstrap/cache"
    ]
  },

  "output_required": [
    "Struktur folder lengkap",
    "Migration Laravel",
    "Controller contoh",
    "API routes",
    "React component contoh",
    "Cara deploy ke shared hosting"
  ]
}