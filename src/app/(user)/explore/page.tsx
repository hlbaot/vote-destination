"use client"

import Explore from "@/features/user/explore"
import { useAppContext } from "@/context/AppContext"

export default function ExplorePage() {
  const {
    destinations,
    handleOpenDetail,
    favorites,
    handleToggleFavorite,
  } = useAppContext()

  return (
    <Explore
      destinations={destinations}
      onOpenDetail={handleOpenDetail}
      favorites={favorites}
      onToggleFavorite={handleToggleFavorite}
    />
  )
}
