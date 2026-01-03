"use client"

import { useRouter } from "next/navigation"

export default function InboxBackButton() {
  const router = useRouter()

  return (
    <button
      type="button"
      onClick={() => {
        router.push("/messages")
        router.refresh()
      }}
      className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-neutral-50"
    >
      Inbox
    </button>
  )
}
