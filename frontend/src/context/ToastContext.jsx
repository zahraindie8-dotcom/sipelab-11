import { createContext, useCallback, useContext, useState } from 'react'

const ToastContext = createContext(null)

let nextId = 0

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const push = useCallback(
    (message, type = 'success') => {
      const id = ++nextId
      setToasts((prev) => [...prev, { id, message, type }])
      setTimeout(() => dismiss(id), 4000)
    },
    [dismiss],
  )

  return (
    <ToastContext.Provider value={{ toast: push }}>
      {children}

      {/* Container toast */}
      <div className="pointer-events-none fixed inset-x-0 top-4 z-[100] flex flex-col items-center gap-2 px-4">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-lg border px-4 py-3 text-sm font-medium shadow-lift backdrop-blur animate-[toastIn_.25s_ease-out] ${
              t.type === 'error'
                ? 'border-rose-200 bg-rose-50/95 text-rose-700'
                : t.type === 'info'
                  ? 'border-sky-200 bg-sky-50/95 text-sky-700'
                  : 'border-emerald-200 bg-emerald-50/95 text-emerald-700'
            }`}
          >
            <span className="mt-0.5 shrink-0">
              {t.type === 'error' ? '⚠️' : t.type === 'info' ? 'ℹ️' : '✅'}
            </span>
            <span className="flex-1">{t.message}</span>
            <button
              onClick={() => dismiss(t.id)}
              className="shrink-0 opacity-50 transition hover:opacity-100"
              aria-label="Tutup notifikasi"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      <style>{`@keyframes toastIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast harus dipakai di dalam ToastProvider')
  return ctx
}
