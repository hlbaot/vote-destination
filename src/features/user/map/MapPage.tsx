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

// Lazy-load heavy SVG map (ssr: false – d3-zoom needs browser)
const VietnamGrowthMap = dynamic(() => import("@/components/user/map/VietnamGrowthMap"), {
  ssr: false,
  loading: () => (
    <div className="flex-1 rounded-2xl bg-gradient-to-b from-[#F4FBF0] to-[#E3F4FB] flex flex-col items-center justify-center gap-4" style={{ minHeight: 480 }}>
      <div className="w-12 h-12 rounded-full border-[3px] border-[var(--color-primary)] border-t-transparent animate-spin" />
      <p className="text-sm text-[var(--color-primary)] font-medium">Đang tải bản đồ…</p>
    </div>
  ),
})

type FilterRegion = "all" | Region
interface Toast { id: string; message: string; type: "success" | "error" | "info" }

export default function MapPage() {
  const { destinations, handleRecordVote } = useAppContext()

  // Filter / search
  const [filterRegion, setFilterRegion] = useState<FilterRegion>("all")
  const [searchQuery, setSearchQuery] = useState("")

  // Map selection
  const [selectedDestId, setSelectedDestId] = useState<string | null>(null)

  // Vote status
  const [voteStatus, setVoteStatus] = useState<DailyVoteStatus>({
    baseQuota: voteConfig.limitPerDay,
    bonusQuota: 0,
    usedToday: 0,
    votedDestinations: [],
    quizTriesLeft: MAP_CONFIG.quizMaxTriesPerDay,
    quizBonusClaimed: false,
    isLoggedIn: true,
  })

  useEffect(() => {
    setVoteStatus(getDailyVoteStatus())
  }, [])

  // Timeline
  const [timelineSnapshots] = useState<TimelineSnapshot[]>(() => getMockTimeline(destinations))
  const [timelineVotes, setTimelineVotes] = useState<Record<string, number> | null>(null)

  // Modals
  const [isQuizOpen, setIsQuizOpen] = useState(false)

  // Leaderboard flash
  const [flashIds, setFlashIds] = useState<Set<string>>(new Set())
  const prevVotesRef = useRef<Record<string, number>>({})

  // Toasts
  const [toasts, setToasts] = useState<Toast[]>([])
  const pushToast = (message: string, type: Toast["type"] = "info") => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2,5)}`
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500)
  }

  // Derived data
  const mapNodes = useMemo(() => getMapDestinations(destinations), [destinations])
  const leaderboard = useMemo(() => getLeaderboard(destinations, 15), [destinations])
  const provinceData = useMemo(() => getProvinceMapData(destinations), [destinations])
  const selectedNode = useMemo<MapDestinationNode | null>(() =>
    selectedDestId ? (mapNodes.find(n => n.id === selectedDestId) ?? null) : null
  , [mapNodes, selectedDestId])

  const votedToday = voteStatus.votedDestinations.includes(selectedDestId ?? "")
  const hasVotesLeft = voteStatus.usedToday < (voteStatus.baseQuota + voteStatus.bonusQuota)
  const currentVotes = selectedNode && timelineVotes
    ? (timelineVotes[selectedNode.id] ?? selectedNode.rawVotes)
    : selectedNode?.rawVotes

  // Polling (mock: just refresh vote status; real: fetch updated vote counts)
  useEffect(() => {
    const id = setInterval(() => {
      setVoteStatus(getDailyVoteStatus())
      // Flash detection (would compare against server data in production)
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
  }, [mapNodes])

  const handleVote = useCallback((destId: string) => {
    const result = castVote(destId)
    if (!result.success) { pushToast(result.error ?? "Không thể bình chọn.", "error"); return }
    const dest = destinations.find(d => d.id === destId)
    handleRecordVote(destId, "map-vote", `MAP-${Date.now()}`)
    setVoteStatus(getDailyVoteStatus())
    pushToast(`Đã bình chọn ${dest?.name ?? "điểm đến"}! 🌿`, "success")
    setFlashIds(new Set([destId]))
    setTimeout(() => setFlashIds(new Set()), 1500)
  }, [destinations, handleRecordVote])

  const handleShare = (id: string) => {
    const dest = destinations.find(d => d.id === id)
    if (dest && typeof window !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(`${window.location.origin}/destination/${id}`)
      pushToast("Đã sao chép liên kết chia sẻ!", "success")
    }
  }

  const totalVotes = useMemo(() => destinations.reduce((s, d) => s + d.rawVotes, 0), [destinations])

  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex flex-col">
      {/* ─── Page Header ──────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-[var(--color-surface)] to-[#F1FAEC] text-[var(--color-text)] px-4 sm:px-6 py-3 flex items-center justify-between gap-3 flex-wrap border-b border-[var(--color-border)] shadow-[var(--shadow-brand)]">
        <div className="flex items-center gap-3 min-w-0">
          <Link href="/" className="text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] transition-colors text-sm font-medium flex-shrink-0">
            ← Trang chủ
          </Link>
          <span className="text-[var(--color-primary)] flex-shrink-0">/</span>
          <h1 className="font-serif text-[var(--color-primary-dark)] font-bold text-sm sm:text-base truncate">🗺️ Bản đồ bình chọn</h1>
        </div>
        <div className="flex items-center gap-4 flex-wrap flex-shrink-0">
          <MapCountdown />
          <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)]">
            <span className="font-bold text-[var(--color-primary-dark)]">{totalVotes.toLocaleString("vi-VN")}</span>
            <span>phiếu</span>
          </div>
          <Link href="/vote"
            className="bg-[var(--color-accent)] hover:bg-[var(--color-primary-hover)] text-white text-xs font-semibold px-3 py-1.5 rounded-full transition-colors whitespace-nowrap">
            Bình chọn →
          </Link>
        </div>
      </div>

      {/* ─── Filter bar ───────────────────────────────────────────── */}
      <MapFilterBar
        activeRegion={filterRegion}
        searchQuery={searchQuery}
        onRegionChange={setFilterRegion}
        onSearchChange={setSearchQuery}
      />

      {/* ─── Main layout ──────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden" style={{ minHeight: 0 }}>
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_320px] xl:grid-cols-[1fr_340px] gap-3 px-3 sm:px-4 lg:px-5 pt-3 pb-0 overflow-hidden"
          style={{ minHeight: 0, maxWidth: 1600, margin: "0 auto", width: "100%" }}>

          {/* MAP AREA */}
          <div
            className="flex overflow-hidden rounded-2xl border border-[var(--color-border)] shadow-[var(--shadow-brand)]"
            style={{
              height: "clamp(420px, calc(100dvh - 220px), 760px)",
              minHeight: 420,
            }}
          >
            {/* Map */}
            <div className="flex-1 min-w-0 relative">
              <VietnamGrowthMap
                destinations={mapNodes}
                provinces={provinceData}
                selectedId={selectedDestId}
                onSelectDestination={setSelectedDestId}
                onDeselectAll={() => setSelectedDestId(null)}
                filterRegion={filterRegion}
                searchQuery={searchQuery}
                timelineVotes={timelineVotes ?? undefined}
              />
            </div>

            {/* Destination Dock */}
            {selectedNode && (
              <div className="w-[300px] flex-shrink-0 overflow-hidden"
                style={{ animation: "dockSlideIn 0.25s ease-out" }}>
                <DestinationDock
                  node={selectedNode}
                  votedToday={votedToday}
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

          {/* RIGHT COLUMN */}
          <div className="flex flex-col gap-3 overflow-y-auto pb-3" style={{ scrollbarWidth: "thin" }}>
            <DailyVoteCard
              status={voteStatus}
              onDoQuiz={() => setIsQuizOpen(true)}
            />
            <div className="flex-1 min-h-0 overflow-hidden rounded-2xl border border-[var(--color-border)] shadow-sm" style={{ minHeight: 300 }}>
              <LeaderboardPanel
                entries={leaderboard}
                provinceEntries={provinceData}
                selectedId={selectedDestId}
                onSelect={(id) => setSelectedDestId(id)}
                flashIds={flashIds}
              />
            </div>
          </div>
        </div>

        {/* ─── Timeline ─────────────────────────────────────────── */}
        <GrowthTimeline
          snapshots={timelineSnapshots}
          onDateChange={setTimelineVotes}
          disabled={true}
        />
      </div>

      {/* ─── Toast stack ──────────────────────────────────────────── */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 items-end pointer-events-none">
        {toasts.map(t => (
          <div key={t.id}
            className={`px-4 py-3 rounded-xl text-sm font-medium shadow-lg border pointer-events-auto max-w-xs
              ${t.type === "success" ? "bg-green-50 border-green-200 text-green-800"
                : t.type === "error" ? "bg-red-50 border-red-200 text-red-700"
                : "bg-[var(--color-surface-tint)] border-[var(--color-border)] text-[var(--color-text)]"}`}
            style={{ animation: "dockSlideIn 0.3s ease-out" }}>
            {t.message}
          </div>
        ))}
      </div>

      {/* ─── Quiz Modal ───────────────────────────────────────────── */}
      <QuizModal
        isOpen={isQuizOpen}
        onClose={() => { setIsQuizOpen(false); setVoteStatus(getDailyVoteStatus()) }}
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
