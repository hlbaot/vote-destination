"use client"

import Home from "@/features/user/home"
import { useAppContext } from "@/context/AppContext"

export default function HomePage() {
  const {
    destinations,
    handleOpenDetail,
    favorites,
    handleToggleFavorite,
    navigate,
  } = useAppContext()

  return (
    <Home
      go={navigate}
      destinations={destinations}
      onOpenDetail={handleOpenDetail}
      favorites={favorites}
      onToggleFavorite={handleToggleFavorite}
    />
  )
}