export type UserLevel = "Mầm" | "Cây non" | "Cây lớn" | "Nở hoa"

export interface LevelProgress {
  currentLevel: UserLevel
  nextLevel: UserLevel | null
  currentVotes: number
  threshold: number
  nextThreshold: number
  percent: number
  remainingToNext: number
}

export interface UserStats {
  totalVotes: number
  totalDestinations: number
  myRank: number
}

export interface UserProfile {
  id: string
  name: string
  email: string
  avatarUrl: string
  phone: string
  province: string
  bio: string
  joinedAt: string
  level: UserLevel
  levelProgress: LevelProgress
  stats: UserStats
}

export type ProfileTab = "thong-tin" | "vote" | "lich-su" | "quiz" | "xep-hang" | "cai-dat"

export interface UserTask {
  id: string
  title: string
  description: string
  reward: number // +n vote
  progress: number
  maxProgress: number
  status: "todo" | "in_progress" | "claimable" | "claimed"
  category: "daily" | "special"
}

export interface VoteHistoryItem {
  id: string
  userId: string
  destinationId: string
  destinationName: string
  destinationImage: string
  province: string
  region: string
  timestamp: string // ISO
  voteType: "base" | "bonus"
  voteCount: number
}

export interface VoteHistoryFilter {
  timeRange: "today" | "7days" | "30days" | "all"
  voteType: "all" | "base" | "bonus"
  search: string
  sortBy: "newest" | "oldest"
  page: number
  pageSize: number
}

export interface QuizQuestionReview {
  id: string
  question: string
  options: string[]
  selectedAnswer: number
  correctAnswer: number
  isCorrect: boolean
  explanation: string
}

export interface QuizAttempt {
  id: string
  userId: string
  title: string
  timestamp: string
  score: number
  totalQuestions: number
  timeSpent: string
  bonusGranted: number
  status: "completed" | "unclaimed"
  questionsReview: QuizQuestionReview[]
}

export interface QuizSummary {
  totalAttempts: number
  averageScore: number
  highestScore: number
  totalBonusVotes: number
}

export interface RankingEntry {
  rank: number
  userId: string
  name: string
  avatarUrl: string
  totalVotes: number
  level: UserLevel
  isMe: boolean
}

export interface MyRankingSummary {
  myRank: number
  totalVotes: number
  gapToNextRank: number
  nextRankUser?: {
    name: string
    rank: number
    totalVotes: number
  }
}

export interface Badge {
  id: string
  name: string
  icon: string
  description: string
  category: "vote" | "quiz" | "community"
  unlocked: boolean
  unlockedAt?: string
  conditionText: string
}

export interface UserSettings {
  notifyDailyReminder: boolean
  notifyRankUp: boolean
  notifyContestResults: boolean
  language: "vi" | "en"
  publicLeaderboardName: boolean
  partialAnonymity: boolean
  linkedGoogleEmail: string
}
