import { voteConfig } from "@/data/destinations"

/**
 * Global vote configuration rules (admin configurable)
 */
export const DAILY_VOTE_LIMIT = voteConfig.limitPerDay // 3
export const ALLOW_MULTIPLE_VOTES_PER_DESTINATION = false
export const TREE_STAGE_THRESHOLDS = [0, 4000, 8000, 11000] as const
export const TREE_STAGE_NAMES = ["Mầm", "Cây non", "Cây lớn", "Nở hoa"] as const

/**
 * Returns YYYY-MM-DD in Asia/Ho_Chi_Minh timezone (Vietnam time UTC+7).
 * Ensures daily vote reset triggers at 00:00 VN time regardless of user's device timezone.
 */
export function getVietnamDateString(date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date)
}

export function getStageFromVotes(votes: number): 0 | 1 | 2 | 3 {
  const [, t1, t2, t3] = TREE_STAGE_THRESHOLDS
  if (votes >= t3) return 3
  if (votes >= t2) return 2
  if (votes >= t1) return 1
  return 0
}
