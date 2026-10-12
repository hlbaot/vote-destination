"use client"

import { Suspense, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Vote from "@/views/Vote"
import { useAppContext } from "@/context/AppContext"

function VoteContent() {
  const searchParams = useSearchParams()
  const preselectedId = searchParams.get("id")

  const {
    destinations,
    selectedDestination,
    setSelectedDestination,
    handleRecordVote,
    handleCopyReceipt,
    navigate,
  } = useAppContext()

  useEffect(() => {
    if (preselectedId) {
      const found = destinations.find((d) => d.id === preselectedId)
      if (found && found.id !== selectedDestination?.id) {
        setSelectedDestination(found)
      }
    }
  }, [preselectedId, destinations, selectedDestination?.id, setSelectedDestination])

  return (
    <Vote
      go={navigate}
      destinations={destinations}
      selectedDestination={selectedDestination || destinations[0]}
      onSelectDestination={setSelectedDestination}
      onRecordVote={handleRecordVote}
      onCopyReceipt={handleCopyReceipt}
    />
  )
}

export default function VotePage() {
  return (
    <Suspense fallback={<div className="container" style={{ padding: "80px 20px", textAlign: "center" }}>Đang tải cổng bình chọn...</div>}>
      <VoteContent />
    </Suspense>
  )
}
