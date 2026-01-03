"use client"

import { useEffect, useRef } from "react"
import { useRouter } from "next/navigation"

export default function InboxAutoRefresh() {
  const router = useRouter()
  const ran = useRef(false)

  useEffect(() => {
    if (ran.current) return
    ran.current = true
    router.refresh()
  }, [router])

  return null
}
