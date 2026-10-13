"use client"

import { useEffect } from "react"
import { create } from "zustand"
import {
  getVotes,
  getDailyVoteStatus,
  castVote as serviceCastVote,
  type DailyVoteStatus,
} from "@/lib/api/mapService"
import {
  ALLOW_MULTIPLE_VOTES_PER_DESTINATION,
  getStageFromVotes,
  TREE_STAGE_NAMES,
  DAILY_VOTE_LIMIT,
} from "@/config/vote"
import { authService } from "@/lib/auth/authService"

export interface VoteStoreState {
  votesByDestination: Record<string, number>
  usedToday: number
  bonusQuota: number
  baseQuota: number
  votedToday: string[]
  quizTriesLeft: number
  quizBonusClaimed: boolean
  isLoggedIn: boolean
  isSubmittingVote: Record<string, boolean>
  lastVotedId: string | null

  // Computed state
  remainingToday: number
  totalQuota: number
  voteStatus: DailyVoteStatus

  // Actions
  castVote: (
    destinationId: string,
    destinationName?: string,
    onStageUpgrade?: (destName: string, stageName: string) => void
  ) => Promise<{ success: boolean; error?: string; upgradedStage?: string }>
  refreshFromStorage: (userId?: string) => void
  claimQuizBonus: (bonus: number) => void
}

function getInitialState() {
  const currentVotes = typeof window !== "undefined" ? getVotes() : {}
  const authUser = typeof window !== "undefined" ? authService.getSession() : null
  const status = typeof window !== "undefined"
    ? getDailyVoteStatus(authUser?.id)
    : {
        baseQuota: DAILY_VOTE_LIMIT,
        bonusQuota: 0,
        usedToday: 0,
        votedDestinations: [],
        quizTriesLeft: 3,
        quizBonusClaimed: false,
        isLoggedIn: Boolean(authUser),
      }
  const total = status.baseQuota + status.bonusQuota
  const remaining = Math.max(0, total - status.usedToday)

  return {
    votesByDestination: currentVotes,
    usedToday: status.usedToday,
    bonusQuota: status.bonusQuota,
    baseQuota: status.baseQuota,
    votedToday: status.votedDestinations,
    quizTriesLeft: status.quizTriesLeft,
    quizBonusClaimed: status.quizBonusClaimed,
    isLoggedIn: status.isLoggedIn,
    remainingToday: remaining,
    totalQuota: total,
    voteStatus: status,
    isSubmittingVote: {},
    lastVotedId: null,
  }
}

export const useVotesStore = create<VoteStoreState>((set, get) => ({
  ...getInitialState(),

  refreshFromStorage: (userId?: string) => {
    if (typeof window === "undefined") return
    const authUser = authService.getSession()
    const activeUserId = userId || authUser?.id
    const currentVotes = getVotes()
    const status = getDailyVoteStatus(activeUserId)
    const total = status.baseQuota + status.bonusQuota
    const remaining = Math.max(0, total - status.usedToday)

    set({
      votesByDestination: currentVotes,
      usedToday: status.usedToday,
      bonusQuota: status.bonusQuota,
      baseQuota: status.baseQuota,
      votedToday: status.votedDestinations,
      quizTriesLeft: status.quizTriesLeft,
      quizBonusClaimed: status.quizBonusClaimed,
      isLoggedIn: Boolean(authUser),
      remainingToday: remaining,
      totalQuota: total,
      voteStatus: status,
    })
  },

  claimQuizBonus: () => {
    get().refreshFromStorage()
  },

  castVote: async (destinationId, destinationName, onStageUpgrade) => {
    const state = get()

    // 0. Check authentication at store level
    const authUser = authService.getSession()
    if (!authUser) {
      return { success: false, error: "Vui lòng đăng nhập để bình chọn." }
    }
    if (authUser.role === "admin") {
      return { success: false, error: "Tài khoản quản trị viên không thể tham gia bình chọn." }
    }

    // 1. Anti double-click lock
    if (state.isSubmittingVote[destinationId]) {
      return { success: false, error: "Đang xử lý bình chọn..." }
    }

    // 2. Validate remaining quota
    const total = state.baseQuota + state.bonusQuota
    const remaining = Math.max(0, total - state.usedToday)
    if (remaining <= 0) {
      return {
        success: false,
        error: "Hết lượt hôm nay, làm mới lúc 00:00 (giờ Việt Nam)",
      }
    }

    // 3. Validate duplicate rule
    if (!ALLOW_MULTIPLE_VOTES_PER_DESTINATION && state.votedToday.includes(destinationId)) {
      return {
        success: false,
        error: "Bạn đã bình chọn điểm đến này hôm nay.",
      }
    }

    // 4. Snapshot for rollback
    const prevVotes = state.votesByDestination[destinationId] ?? 0
    const prevUsed = state.usedToday
    const prevVotedToday = [...state.votedToday]

    // 5. Optimistic update
    const newVotes = prevVotes + 1
    const newUsed = prevUsed + 1
    const newRemaining = Math.max(0, total - newUsed)
    const newVotedToday = [...prevVotedToday, destinationId]

    set((prev) => ({
      votesByDestination: {
        ...prev.votesByDestination,
        [destinationId]: newVotes,
      },
      usedToday: newUsed,
      remainingToday: newRemaining,
      votedToday: newVotedToday,
      isSubmittingVote: {
        ...prev.isSubmittingVote,
        [destinationId]: true,
      },
      voteStatus: {
        ...prev.voteStatus,
        usedToday: newUsed,
        votedDestinations: newVotedToday,
      },
    }))

    try {
      // Small natural delay so spinner is visible and smooth
      await new Promise((r) => setTimeout(r, 200))
      const res = serviceCastVote(destinationId, authUser.id)

      if (!res.success) {
        // Rollback on service rejection
        set((prev) => ({
          votesByDestination: {
            ...prev.votesByDestination,
            [destinationId]: prevVotes,
          },
          usedToday: prevUsed,
          remainingToday: Math.max(0, total - prevUsed),
          votedToday: prevVotedToday,
          isSubmittingVote: {
            ...prev.isSubmittingVote,
            [destinationId]: false,
          },
          voteStatus: {
            ...prev.voteStatus,
            usedToday: prevUsed,
            votedDestinations: prevVotedToday,
          },
        }))
        return { success: false, error: res.error || "Không thể thực hiện bình chọn." }
      }

      // Check if tree upgraded to a new stage
      const prevStage = getStageFromVotes(prevVotes)
      const newStage = getStageFromVotes(newVotes)
      let upgradedStage: string | undefined
      if (newStage > prevStage) {
        upgradedStage = TREE_STAGE_NAMES[newStage]
        if (onStageUpgrade && destinationName) {
          onStageUpgrade(destinationName, upgradedStage)
        }
      }

      set((prev) => ({
        lastVotedId: destinationId,
        isSubmittingVote: {
          ...prev.isSubmittingVote,
          [destinationId]: false,
        },
      }))

      return { success: true, upgradedStage }
    } catch (err: any) {
      // Rollback on error
      set((prev) => ({
        votesByDestination: {
          ...prev.votesByDestination,
          [destinationId]: prevVotes,
        },
        usedToday: prevUsed,
        remainingToday: Math.max(0, total - prevUsed),
        votedToday: prevVotedToday,
        isSubmittingVote: {
          ...prev.isSubmittingVote,
          [destinationId]: false,
        },
        voteStatus: {
          ...prev.voteStatus,
          usedToday: prevUsed,
          votedDestinations: prevVotedToday,
        },
      }))
      return { success: false, error: err?.message || "Lỗi hệ thống khi gửi bình chọn." }
    }
  },
}))

/**
 * useVotes hook – subscribed React hook providing reactive vote state and actions.
 * Automatically synchronizes with localStorage and cross-tab updates.
 */
export function useVotes() {
  const store = useVotesStore()

  useEffect(() => {
    store.refreshFromStorage()
    const handleStorage = (e: StorageEvent) => {
      if (
        !e.key ||
        e.key.startsWith("map_daily_vote_") ||
        e.key === "vote_auth_session_v2" ||
        e.key === "dest_votes_override_v1"
      ) {
        store.refreshFromStorage()
      }
    }
    window.addEventListener("storage", handleStorage)
    return () => window.removeEventListener("storage", handleStorage)
  }, [])

  return store
}

