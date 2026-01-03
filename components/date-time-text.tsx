"use client"

import { useMemo } from "react"

type Props = {
  value: Date | string | number | null | undefined
  className?: string
}

export default function DateTimeText({ value, className }: Props) {
  const text = useMemo(() => {
    if (!value) return ""
    const d = value instanceof Date ? value : new Date(value)
    if (Number.isNaN(d.getTime())) return ""

    // Uses the viewer's local timezone automatically (DST included)
    return new Intl.DateTimeFormat("en-AU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(d)
  }, [value])

  if (!text) return null
  return <span className={className}>{text}</span>
}
