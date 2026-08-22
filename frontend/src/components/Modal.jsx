import { useEffect } from 'react'
import { IconX } from './icons'

export default function Modal({ open, onClose, title, children, size = 'md' }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  const sizes = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl' }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm animate-[fadeIn_.15s_ease-out]"
        onClick={onClose}
      />
      <div
        className={`relative z-10 w-full ${sizes[size]} rounded-t-2xl bg-white shadow-lift sm:rounded-2xl animate-[popIn_.18s_ease-out]`}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h3 className="text-base font-semibold text-slate-800">{title}</h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            aria-label="Tutup"
          >
            <IconX className="h-5 w-5" />
          </button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto px-6 py-5">{children}</div>
      </div>
      <style>{`@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes popIn { from { opacity: 0; transform: translateY(12px) scale(.98); } to { opacity: 1; transform: translateY(0) scale(1); } }`}</style>
    </div>
  )
}
