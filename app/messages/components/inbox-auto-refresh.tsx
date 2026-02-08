"use client"

export default function InboxAutoRefresh() {
  // Intentionally no-op. The inbox route is already dynamic;
  // a mount-time router.refresh() can cause back/navigation glitches.
  return null
}

