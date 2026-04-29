"use client"

import { Suspense, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"

function CheckinPageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const token = searchParams.get("token")
    const target = token ? `/student/checkin?token=${encodeURIComponent(token)}` : "/student/checkin"
    router.replace(target)
  }, [router, searchParams])

  return null
}

export default function CheckinPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CheckinPageInner />
    </Suspense>
  )
}
