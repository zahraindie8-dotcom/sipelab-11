const base = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  viewBox: '0 0 24 24',
  className: 'h-5 w-5',
}

export const IconHome = (p) => (
  <svg {...base} {...p}>
    <path d="M3 10.5 12 3l9 7.5" />
    <path d="M5 9.5V21h14V9.5" />
    <path d="M10 21v-6h4v6" />
  </svg>
)

export const IconCalendar = (p) => (
  <svg {...base} {...p}>
    <rect x="3" y="4.5" width="18" height="17" rx="2.5" />
    <path d="M8 2.5v4M16 2.5v4M3 9.5h18" />
  </svg>
)

export const IconFlask = (p) => (
  <svg {...base} {...p}>
    <path d="M9 3h6M10 3v6.2L4.8 18a2 2 0 0 0 1.8 3h10.8a2 2 0 0 0 1.8-3L14 9.2V3" />
    <path d="M7.5 14.5h9" />
  </svg>
)

export const IconCheckCircle = (p) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="m8.5 12.5 2.4 2.4 4.6-5.3" />
  </svg>
)

export const IconCamera = (p) => (
  <svg {...base} {...p}>
    <path d="M4 8.5A1.5 1.5 0 0 1 5.5 7h2.2l1.3-2h6l1.3 2h2.2A1.5 1.5 0 0 1 20 8.5v9a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 17.5z" />
    <circle cx="12" cy="13" r="3.2" />
  </svg>
)

export const IconLogout = (p) => (
  <svg {...base} {...p}>
    <path d="M9 21H5.5A1.5 1.5 0 0 1 4 19.5v-15A1.5 1.5 0 0 1 5.5 3H9" />
    <path d="M15 16.5 19.5 12 15 7.5M19.5 12H9" />
  </svg>
)

export const IconMenu = (p) => (
  <svg {...base} {...p}>
    <path d="M4 6.5h16M4 12h16M4 17.5h16" />
  </svg>
)

export const IconX = (p) => (
  <svg {...base} {...p}>
    <path d="m6 6 12 12M18 6 6 18" />
  </svg>
)

export const IconPlus = (p) => (
  <svg {...base} {...p}>
    <path d="M12 5v14M5 12h14" />
  </svg>
)

export const IconSearch = (p) => (
  <svg {...base} {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </svg>
)

export const IconEdit = (p) => (
  <svg {...base} {...p}>
    <path d="M4 20h4L19.5 8.5a2.1 2.1 0 0 0-3-3L5 17z" />
    <path d="m13.5 6.5 3 3" />
  </svg>
)

export const IconTrash = (p) => (
  <svg {...base} {...p}>
    <path d="M4 7h16M9.5 7V4.5h5V7M6.5 7l1 13h9l1-13" />
    <path d="M10 11v5M14 11v5" />
  </svg>
)

export const IconUsers = (p) => (
  <svg {...base} {...p}>
    <circle cx="9" cy="8" r="3.5" />
    <path d="M2.5 20c.8-3.2 3.4-5 6.5-5s5.7 1.8 6.5 5" />
    <path d="M16 5a3.5 3.5 0 0 1 0 6.6M18.5 15.4c1.5.9 2.5 2.4 3 4.6" />
  </svg>
)

export const IconClock = (p) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3.2 1.8" />
  </svg>
)

export const IconChart = (p) => (
  <svg {...base} {...p}>
    <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
  </svg>
)

export const IconShield = (p) => (
  <svg {...base} {...p}>
    <path d="M12 3 5 5.5v5c0 4.5 3 8 7 9.5 4-1.5 7-5 7-9.5v-5z" />
    <path d="m9 11.5 2.2 2.2L15.5 9" />
  </svg>
)

export const IconInbox = (p) => (
  <svg {...base} {...p}>
    <path d="M3.5 8 6 4.5h12L20.5 8l1 4v6a1.5 1.5 0 0 1-1.5 1.5H4A1.5 1.5 0 0 1 2.5 18v-6z" />
    <path d="M2.5 8h19M14 12h-4" />
  </svg>
)

export const IconPrinter = (p) => (
  <svg {...base} {...p}>
    <path d="M6 9V2h12v7" />
    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
    <rect x="6" y="14" width="12" height="8" />
  </svg>
)

export const IconTrending = (p) => (
  <svg {...base} {...p}>
    <path d="M22 7 13.5 15.5 8.5 10.5 2 17" />
    <path d="M16 7h6v6" />
  </svg>
)

export const IconMapPin = (p) => (
  <svg {...base} {...p}>
    <path d="M12 21c-4-4-8-7.5-8-11a8 8 0 0 1 16 0c0 3.5-4 7-8 11z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
)

export const IconChevronLeft = (p) => (
  <svg {...base} {...p}>
    <path d="m15 18-6-6 6-6" />
  </svg>
)

export const IconChevronRight = (p) => (
  <svg {...base} {...p}>
    <path d="m9 18 6-6-6-6" />
  </svg>
)

export const IconFilter = (p) => (
  <svg {...base} {...p}>
    <path d="M3 4h18l-7 8.5V18l-4 2V12.5z" />
  </svg>
)

export const IconDownload = (p) => (
  <svg {...base} {...p}>
    <path d="M12 3v12M8 11l4 4 4-4" />
    <path d="M4 17v2a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-2" />
  </svg>
)
