"use client"
/**
 * MapPage.tsx – "Bản đồ bình chọn" feature page.
 * Route: /ban-do-binh-chon
 *
 * Layout (desktop):
 *   Header bar (breadcrumb + countdown + total votes)
 *   MapFilterBar
 *   [Map + DestinationDock] | [DailyVoteCard + LeaderboardPanel]
 *   GrowthTimeline
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import dynamic from "next/dynamic"
import Link from "next/link"
import { useAppContext } from "@/context/AppContext"
import MapFilterBar from "@/components/user/map/MapFilterBar"
import DailyVoteCard from "@/components/user/map/DailyVoteCard"
import LeaderboardPanel from "@/components/user/map/LeaderboardPanel"
import QuizModal from "@/components/user/map/QuizModal"
import MapCountdown from "@/components/user/map/MapCountdown"
import DestinationDock from "@/components/user/map/DestinationDock"
import GrowthTimeline from "@/components/user/map/GrowthTimeline"
import type { Region } from "@/types"
import { voteConfig } from "@/data/destinations"
import {
  getMapDestinations, getLeaderboard, getProvinceMapData, getDailyVoteStatus,
  castVote, getMockTimeline, MAP_CONFIG,
  type MapDestinationNode, type DailyVoteStatus, type TimelineSnapshot,
} from "@/lib/api/mapService"

import { useVotes } from "@/lib/store/useVotes"

// Lazy-load heavy SVG map (ssr: false – d3-zoom needs browser)
const VietnamGrowthMap = dynamic(() => import("@/components/user/map/VietnamGrowthMap"), {
  ssr: false,
  loading: () => (
    <div className="flex-1 rounded-2xl bg-linear-to-b from-[#F4FBF0] to-[#E3F4FB] flex flex-col items-center justify-center gap-4" style={{ minHeight: 480 }}>
      <div className="w-12 h-12 rounded-full border-[3px] border-(--color-primary) border-t-transparent animate-spin" />
      <p className="text-sm text-(--color-primary) font-medium">Đang tải bản đồ…</p>
    </div>
  ),
})

type FilterRegion = "all" | Region
interface Toast { id: string; message: string; type: "success" | "error" | "info" }

export default function MapPage() {
  const { destinations, handleRecordVote } = useAppContext()
  const {
    votesByDestination,
    remainingToday,
    votedToday,
    castVote,
    voteStatus,
    refreshFromStorage,
  } = useVotes()

  // Filter / search
  const [filterRegion, setFilterRegion] = useState<FilterRegion>("all")
  const [searchQuery, setSearchQuery] = useState("")

  // Map selection & hover
  const [selectedDestId, setSelectedDestId] = useState<string | null>(null)
  const [hoveredDestId, setHoveredDestId] = useState<string | null>(null)

  // Timeline
  const [timelineSnapshots] = useState<TimelineSnapshot[]>(() => getMockTimeline(destinations))
  const [timelineVotes, setTimelineVotes] = useState<Record<string, number> | null>(null)

  // Modals
  const [isQuizOpen, setIsQuizOpen] = useState(false)

  // Leaderboard flash
  const [flashIds, setFlashIds] = useState<Set<string>>(new Set())
  const prevVotesRef = useRef<Record<string, number>>({})

  // Body class for 100dvh app shell
  useEffect(() => {
    document.body.classList.add("vote-page-body")
    return () => {
      document.body.classList.remove("vote-page-body")
    }
  }, [])

  // Toasts
  const [toasts, setToasts] = useState<Toast[]>([])
  const pushToast = (message: string, type: Toast["type"] = "info") => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2,5)}`
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500)
  }

  // Derived data using reactive votesByDestination from store
  const mapNodes = useMemo(() => getMapDestinations(destinations, votesByDestination), [destinations, votesByDestination])
  // All entries for complete scrollable list
  const leaderboard = useMemo(() => getLeaderboard(destinations, destinations.length, votesByDestination), [destinations, votesByDestination])
  const provinceData = useMemo(() => getProvinceMapData(destinations, votesByDestination), [destinations, votesByDestination])
  const selectedNode = useMemo<MapDestinationNode | null>(() =>
    selectedDestId ? (mapNodes.find(n => n.id === selectedDestId) ?? null) : null
  , [mapNodes, selectedDestId])

  const isSelectedVotedToday = votedToday.includes(selectedDestId ?? "")
  const hasVotesLeft = remainingToday > 0
  const currentVotes = selectedNode && timelineVotes
    ? (timelineVotes[selectedNode.id] ?? selectedNode.rawVotes)
    : selectedNode?.rawVotes

  // Polling (mock: refresh from storage periodically)
  useEffect(() => {
    const id = setInterval(() => {
      refreshFromStorage()
      const newFlash = new Set<string>()
      for (const node of mapNodes) {
        const prev = prevVotesRef.current[node.id]
        if (prev !== undefined && node.rawVotes !== prev) newFlash.add(node.id)
        prevVotesRef.current[node.id] = node.rawVotes
      }
      if (newFlash.size > 0) {
        setFlashIds(newFlash)
        setTimeout(() => setFlashIds(new Set()), 1500)
      }
    }, MAP_CONFIG.pollingIntervalMs)
    return () => clearInterval(id)
  }, [mapNodes, refreshFromStorage])

  const handleVote = useCallback(async (destId: string) => {
    const dest = destinations.find(d => d.id === destId)
    const result = await castVote(destId, dest?.name)
    if (!result.success) {
      pushToast(result.error ?? "Không thể bình chọn.", "error")
      return
    }
    handleRecordVote(destId, "map-vote", `MAP-${Date.now()}`)
    pushToast(`Đã bình chọn ${dest?.name ?? "điểm đến"}! 🌿`, "success")
    if (result.upgradedStage) {
      pushToast(`Cây ${dest?.name} đã lên giai đoạn ${result.upgradedStage}! 🎉`, "success")
    }
    setFlashIds(new Set([destId]))
    setTimeout(() => setFlashIds(new Set()), 1500)
  }, [destinations, castVote, handleRecordVote])

  const handleShare = (id: string) => {
    const dest = destinations.find(d => d.id === id)
    if (dest && typeof window !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(`${window.location.origin}/destination/${id}`)
      pushToast("Đã sao chép liên kết chia sẻ!", "success")
    }
  }

  const totalVotes = useMemo(
    () => destinations.reduce((s, d) => s + (votesByDestination[d.id] ?? d.rawVotes), 0),
    [destinations, votesByDestination],
  )

  return (
    <div className="vote-map-page flex-1 min-h-0 h-full w-full bg-(--color-bg) flex flex-col overflow-hidden">
      {/* ─── Page Header / Breadcrumb Bar (flex: 0 0 auto) ──────────── */}
      <div className="vote-breadcrumb-bar bg-linear-to-r from-(--color-surface) to-[#F1FAEC] text-(--color-text) px-3 sm:px-5 py-2 flex items-center justify-between gap-3 flex-wrap border-b border-(--color-border) shrink-0 shadow-xs">
        <div className="flex items-center gap-2.5 min-w-0">
          <Link href="/" className="text-(--color-primary) hover:text-(--color-primary-hover) transition-colors text-xs sm:text-sm font-medium shrink-0">
            ← Trang chủ
          </Link>
          <span className="text-(--color-primary) shrink-0 text-xs">/</span>
          <h1 className="font-serif text-(--color-primary-dark) font-bold text-xs sm:text-sm truncate">🗺️ Bản đồ bình chọn</h1>
        </div>
        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          <MapCountdown />
          <div className="flex items-center gap-1 text-xs text-(--color-text-muted)">
            <span className="font-bold text-(--color-primary-dark)">{totalVotes.toLocaleString("vi-VN")}</span>
            <span>phiếu</span>
          </div>
          <Link href="/vote"
            className="bg-(--color-accent) hover:bg-(--color-primary-hover) text-white text-[11px] sm:text-xs font-semibold px-2.5 sm:px-3 py-1 rounded-full transition-colors whitespace-nowrap">
            Bình chọn →
          </Link>
        </div>
      </div>

      {/* ─── Filter bar (flex: 0 0 auto) ────────────────────────────── */}
      <MapFilterBar
        activeRegion={filterRegion}
        searchQuery={searchQuery}
        onRegionChange={setFilterRegion}
        onSearchChange={setSearchQuery}
      />

      {/* ─── Main content area (flex: 1 1 auto, min-height: 0) ────────── */}
      <div className="vote-main-content flex-1 min-h-0 w-full overflow-hidden p-3 sm:p-4 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_300px] xl:grid-cols-[minmax(0,1fr)_360px] gap-3 sm:gap-4"
        style={{ height: "100%", maxWidth: 1680, margin: "0 auto" }}>

        {/* MAP AREA (Cột trái: 100% height, min-height: 0) */}
        <div className="vote-map-card h-full min-h-0 flex overflow-hidden rounded-2xl border border-(--color-border) shadow-(--shadow-brand) relative bg-linear-to-br from-[#F4FBF0] to-[#E3F4FB]">
          {/* Map */}
          <div className="flex-1 min-w-0 h-full relative">
            <VietnamGrowthMap
              destinations={mapNodes}
              provinces={provinceData}
              selectedId={selectedDestId}
              hoveredId={hoveredDestId}
              onSelectDestination={setSelectedDestId}
              onDeselectAll={() => setSelectedDestId(null)}
              onHoverDestination={setHoveredDestId}
              filterRegion={filterRegion}
              searchQuery={searchQuery}
              timelineVotes={timelineVotes ?? undefined}
            />
          </div>

          {/* Destination Dock */}
          {selectedNode && (
            <div className="w-72 sm:w-76 shrink-0 h-full overflow-hidden z-20"
              style={{ animation: "dockSlideIn 0.25s ease-out" }}>
              <DestinationDock
                node={selectedNode}
                votedToday={isSelectedVotedToday}
                hasVotesLeft={hasVotesLeft}
                onVote={handleVote}
                onClose={() => setSelectedDestId(null)}
                onViewProfile={(id) => { if (typeof window !== "undefined") window.open(`/destination/${id}`, "_blank") }}
                onShare={handleShare}
                currentVotes={currentVotes}
              />
            </div>
          )}
        </div>

        {/* RIGHT COLUMN (Cột phải: flex column, 100% height, min-height: 0, overflow: hidden) */}
        <div className="vote-right-col flex flex-col gap-3 h-full min-h-0 overflow-hidden">
          {/* Panel "Vote hôm nay" (flex: 0 0 auto) */}
          <DailyVoteCard
            status={voteStatus}
            onDoQuiz={() => setIsQuizOpen(true)}
          />

          {/* Panel "Vườn cây nổi bật" (flex: 1 1 auto, min-height: 0) */}
          <div className="vote-leaderboard-container flex-1 min-h-0 overflow-hidden rounded-2xl border border-(--color-border) shadow-xs">
            <LeaderboardPanel
              entries={leaderboard}
              provinceEntries={provinceData}
              selectedId={selectedDestId}
              hoveredId={hoveredDestId}
              onSelect={(id) => setSelectedDestId(id)}
              flashIds={flashIds}
              filterKey={`${filterRegion}-${searchQuery}`}
            />
          </div>
        </div>
      </div>

      {/* ─── Toast stack ──────────────────────────────────────────── */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 items-end pointer-events-none">
        {toasts.map(t => (
          <div key={t.id}
            className={`px-4 py-3 rounded-xl text-sm font-medium shadow-lg border pointer-events-auto max-w-xs
              ${t.type === "success" ? "bg-green-50 border-green-200 text-green-800"
                : t.type === "error" ? "bg-red-50 border-red-200 text-red-700"
                : "bg-(--color-surface-tint) border-(--color-border) text-(--color-text)"}`}
            style={{ animation: "dockSlideIn 0.3s ease-out" }}>
            {t.message}
          </div>
        ))}
      </div>

      {/* ─── Quiz Modal ───────────────────────────────────────────── */}
      <QuizModal
        isOpen={isQuizOpen}
        onClose={() => { setIsQuizOpen(false); refreshFromStorage() }}
        triesLeft={voteStatus.quizTriesLeft}
        bonusClaimed={voteStatus.quizBonusClaimed}
      />

      <style>{`
        @keyframes dockSlideIn {
          from { opacity: 0; transform: translateX(16px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
        }
      `}</style>
    </div>
  )
}
