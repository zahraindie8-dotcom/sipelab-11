import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import { ToastProvider } from '../context/ToastContext'

/**
 * Render komponen yang membutuhkan Router + AuthContext + Toast dengan user palsu.
 * `user` cukup berisi { name, role, can_approve } — atribut yang dipakai UI.
 */
export function renderWithAuth(ui, { user = null, route = '/', ...options } = {}) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <ToastProvider>
        <AuthContext.Provider
          value={{
            user,
            loading: false,
            login: vi.fn(),
            register: vi.fn(),
            logout: vi.fn(),
          }}
        >
          {ui}
        </AuthContext.Provider>
      </ToastProvider>
    </MemoryRouter>,
    options,
  )
}
