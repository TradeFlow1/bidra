"use client"

import { useEffect, useMemo, useState } from "react"

function pad2(n: number) {
  return String(Math.max(0, Math.floor(n))).padStart(2, "0")
}

function formatRemaining(ms: number) {
  if (!Number.isFinite(ms) || ms <= 0) return "Ended"
  const totalSec = Math.floor(ms / 1000)
  const days = Math.floor(totalSec / 86400)
  const rem = totalSec % 86400
  const hours = Math.floor(rem / 3600)
  const mins = Math.floor((rem % 3600) / 60)

  if (days >= 2) return `${days}d ${hours}h`
  if (days === 1) return `1d ${hours}h`
  if (hours >= 1) return `${hours}h ${pad2(mins)}m`
  return `${mins}m`
}

export default function CountdownClock({
  endsAt,
  className,
}: {
  endsAt: string | Date | null | undefined
  className?: string
}) {
  const endMs = useMemo(() => {
    if (!endsAt) return null
    const d = endsAt instanceof Date ? endsAt : new Date(String(endsAt))
    const t = d.getTime()
    return Number.isFinite(t) ? t : null
  }, [endsAt])

  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    // tick every 20s (enough for minutes/hours UX without hammering)
    const id = setInterval(() => setNow(Date.now()), 20000)
    return () => clearInterval(id)
  }, [])

  if (!endMs) return null

  const msLeft = endMs - now
  const label = formatRemaining(msLeft)

  const isEnded = msLeft <= 0

  return (
    <span
      className={
        className ||
        `inline-flex items-center rounded-full border border-black/10 px-3 py-1 text-xs font-semibold ${
          isEnded ? "bg-black/[0.03] text-[var(--bidra-ink-2)]" : "bg-black/[0.03] text-[var(--bidra-ink)]"
        }`
      }
      aria-label="Time remaining"
      title={isEnded ? "Ended" : "Time remaining"}
    >
      {label}
    </span>
  )
}
