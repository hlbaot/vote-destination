"use client"

import { Suspense } from "react"
import { useParams } from "next/navigation"
import Detail from "@/features/user/destination-detail"
import { useAppContext } from "@/context/AppContext"

function DestinationDetailContent() {
  const params = useParams()
  const id = typeof params?.id === "string" ? params.id : Array.isArray(params?.id) ? params.id[0] : ""

  const {
    destinations,
    handleStartVote,
    favorites,
    handleToggleFavorite,
    handleOpenDetail,
    handleShare,
    navigate,
  } = useAppContext()

  const destination = destinations.find((d) => d.id === id) || destinations[0]

  if (!destination) {
    return (
      <div className="container" style={{ padding: "60px 20px", textAlign: "center" }}>
        <h2>Không tìm thấy điểm đến</h2>
        <button className="btn-primary" onClick={() => navigate("explore")} style={{ marginTop: "20px" }}>
          Quay lại trang khám phá
        </button>
      </div>
    )
  }

  return (
    <Detail
      destination={destination}
      allDestinations={destinations}
      onStartVote={handleStartVote}
      isFavorite={favorites.includes(destination.id)}
      onToggleFavorite={handleToggleFavorite}
      onOpenDetail={handleOpenDetail}
      onShare={handleShare}
      go={navigate}
    />
  )
}

export default function DestinationDetailPage() {
  return (
    <Suspense fallback={<div className="container" style={{ padding: "80px 20px", textAlign: "center" }}>Đang tải thông tin điểm đến...</div>}>
      <DestinationDetailContent />
    </Suspense>
  )
}
