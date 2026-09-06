import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import client, { clearToken, getToken, setToken } from '../api/client'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Saat aplikasi dibuka, coba muat data user jika token ada.
  useEffect(() => {
    const token = getToken()
    if (!token) {
      setLoading(false)
      return
    }

    client
      .get('/user')
      .then((res) => setUser(res.data.data))
      .catch(() => clearToken())
      .finally(() => setLoading(false))
  }, [])

  const login = useCallback(async (email, password, remember = false) => {
    const { data } = await client.post('/login', { email, password, remember })
    setToken(data.token, remember)
    setUser(data.user)
    return data.user
  }, [])

  const register = useCallback(async (payload) => {
    const { data } = await client.post('/register', payload)
    // Registration doesn't return token anymore (email verification required)
    return data.user
  }, [])

  const logout = useCallback(async () => {
    try {
      await client.post('/logout')
    } catch {
      // tetap lanjut logout walau request gagal
    }
    clearToken()
    setUser(null)
  }, [])

  const verifyEmail = useCallback(async (email, token) => {
    const { data } = await client.post('/email/verify', { email, token })
    return data
  }, [])

  const sendVerificationEmail = useCallback(async () => {
    const { data } = await client.post('/email/verification/send')
    return data
  }, [])

  const resendVerificationEmail = useCallback(async (email) => {
    const { data } = await client.post('/email/verification/resend', { email })
    return data
  }, [])

  const isEmailVerified = user?.email_verified_at !== null

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      register, 
      logout,
      verifyEmail,
      sendVerificationEmail,
      resendVerificationEmail,
      isEmailVerified
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth harus dipakai di dalam AuthProvider')
  return ctx
}
