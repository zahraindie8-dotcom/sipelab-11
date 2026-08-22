import axios from 'axios'

const TOKEN_KEY = 'sipelab_token'

export const getToken = () => localStorage.getItem(TOKEN_KEY)
export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token)
export const clearToken = () => localStorage.removeItem(TOKEN_KEY)

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { Accept: 'application/json' },
})

// Lampirkan token Sanctum ke setiap request.
client.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Tangani 401: token kadaluarsa -> hapus dan redirect ke login.
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearToken()
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  },
)

// Helper untuk mengambil pesan error dari response API.
export function extractError(error) {
  const data = error?.response?.data
  if (!data) return 'Terjadi kesalahan jaringan. Periksa koneksi Anda.'

  if (typeof data.message === 'string') return data.message

  // Pesan validasi per-field -> ambil pesan pertama.
  if (data.errors) {
    const firstKey = Object.keys(data.errors)[0]
    if (firstKey && Array.isArray(data.errors[firstKey])) {
      return data.errors[firstKey][0]
    }
  }
  return 'Terjadi kesalahan. Silakan coba lagi.'
}

export default client
