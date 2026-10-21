import * as React from "react"

export function ChestIcon({ color, size = 40, locked }: { color: string; size?: number; locked?: boolean }) {
  const id = React.useId().replace(/:/g, "")
  return (
    <svg viewBox="0 0 48 44" width={size} height={(size * 44) / 48} aria-hidden>
      <defs>
        <linearGradient id={`c${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity=".9" />
          <stop offset=".35" stopColor={color} />
          <stop offset="1" stopColor={color} stopOpacity=".75" />
        </linearGradient>
      </defs>
      <path d="M6 18c0-8 8-13 18-13s18 5 18 13z" fill={`url(#c${id})`} stroke="#00000030" />
      <rect x="6" y="18" width="36" height="22" rx="4" fill={`url(#c${id})`} stroke="#00000030" />
      <rect x="6" y="17" width="36" height="4" fill="#00000025" />
      <rect x="20" y="15" width="8" height="11" rx="2" fill="#fff" stroke="#00000030" />
      {locked ? <circle cx="24" cy="21" r="1.8" fill="#333" /> : <circle cx="24" cy="21" r="1.8" fill={color} />}
      <path d="M10 26h28" stroke="#ffffff70" strokeWidth="1.5" />
    </svg>
  )
}
