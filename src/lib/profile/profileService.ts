/**
 * profileService.ts – Service quản lý hồ sơ, lịch sử vote, quiz, thứ hạng và cài đặt người dùng.
 * Đóng gói độc lập (mock với độ trễ 300-500ms), dễ dàng chuyển đổi sang REST/GraphQL API.
 */

import {
  UserProfile,
  VoteHistoryItem,
  VoteHistoryFilter,
  QuizAttempt,
  QuizSummary,
  RankingEntry,
  MyRankingSummary,
  Badge,
  UserSettings,
  UserTask,
} from "@/types/profile"
import { calculateUserLevel } from "@/config/profile"
import { authService } from "@/lib/auth/authService"

const PROFILE_KEY = (id: string) => `dest_user_profile_${id}_v2`
const VOTE_HISTORY_KEY = (id: string) => `dest_user_vote_hist_${id}_v2`
const QUIZ_HISTORY_KEY = (id: string) => `dest_user_quiz_hist_${id}_v2`
const TASKS_KEY = (id: string) => `dest_user_tasks_${id}_v2`
const SETTINGS_KEY = (id: string) => `dest_user_settings_${id}_v2`

function sleep(ms = 350): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}

// ------------------------------------------------------------
// SEED DATA GENERATORS
// ------------------------------------------------------------

function generateInitialVoteHistory(userId: string): VoteHistoryItem[] {
  const now = new Date()

  // Generate records spread across today, last 7 days, last 30 days
  const sampleItems: Array<{
    destId: string
    name: string
    province: string
    region: string
    img: string
    daysAgo: number
    hoursAgo: number
    type: "base" | "bonus"
  }> = [
    {
      destId: "16",
      name: "Mù Cang Chải",
      province: "Lào Cai",
      region: "Bắc",
      img: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=300&h=200&fit=crop",
      daysAgo: 0,
      hoursAgo: 2,
      type: "base",
    },
    {
      destId: "15",
      name: "Sa Pa",
      province: "Lào Cai",
      region: "Bắc",
      img: "https://images.unsplash.com/photo-1528127269322-539801943592?w=300&h=200&fit=crop",
      daysAgo: 0,
      hoursAgo: 4,
      type: "base",
    },
    {
      destId: "25",
      name: "Ninh Bình",
      province: "Ninh Bình",
      region: "Bắc",
      img: "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=300&h=200&fit=crop",
      daysAgo: 1,
      hoursAgo: 10,
      type: "base",
    },
    {
      destId: "16",
      name: "Mù Cang Chải",
      province: "Lào Cai",
      region: "Bắc",
      img: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=300&h=200&fit=crop",
      daysAgo: 1,
      hoursAgo: 14,
      type: "bonus",
    },
    {
      destId: "13",
      name: "Đồng Văn",
      province: "Tuyên Quang",
      region: "Bắc",
      img: "https://images.unsplash.com/photo-1534067783941-51c9c23ecefd?w=300&h=200&fit=crop",
      daysAgo: 2,
      hoursAgo: 9,
      type: "base",
    },
    {
      destId: "67",
      name: "Mộc Châu",
      province: "Sơn La",
      region: "Bắc",
      img: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=300&h=200&fit=crop",
      daysAgo: 3,
      hoursAgo: 15,
      type: "base",
    },
    {
      destId: "57",
      name: "Hạ Long",
      province: "Quảng Ninh",
      region: "Bắc",
      img: "https://images.unsplash.com/photo-1528127269322-539801943592?w=300&h=200&fit=crop",
      daysAgo: 4,
      hoursAgo: 11,
      type: "base",
    },
    {
      destId: "61",
      name: "Cao Bằng",
      province: "Cao Bằng",
      region: "Bắc",
      img: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=300&h=200&fit=crop",
      daysAgo: 5,
      hoursAgo: 8,
      type: "bonus",
    },
    {
      destId: "16",
      name: "Mù Cang Chải",
      province: "Lào Cai",
      region: "Bắc",
      img: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=300&h=200&fit=crop",
      daysAgo: 6,
      hoursAgo: 18,
      type: "base",
    },
    {
      destId: "71",
      name: "Mai Châu",
      province: "Phú Thọ",
      region: "Bắc",
      img: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=300&h=200&fit=crop",
      daysAgo: 8,
      hoursAgo: 12,
      type: "base",
    },
    {
      destId: "25",
      name: "Ninh Bình",
      province: "Ninh Bình",
      region: "Bắc",
      img: "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=300&h=200&fit=crop",
      daysAgo: 11,
      hoursAgo: 16,
      type: "base",
    },
    {
      destId: "15",
      name: "Sa Pa",
      province: "Lào Cai",
      region: "Bắc",
      img: "https://images.unsplash.com/photo-1528127269322-539801943592?w=300&h=200&fit=crop",
      daysAgo: 14,
      hoursAgo: 10,
      type: "bonus",
    },
    {
      destId: "17",
      name: "Ba Bể",
      province: "Thái Nguyên",
      region: "Bắc",
      img: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=300&h=200&fit=crop",
      daysAgo: 18,
      hoursAgo: 14,
      type: "base",
    },
    {
      destId: "16",
      name: "Mù Cang Chải",
      province: "Lào Cai",
      region: "Bắc",
      img: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=300&h=200&fit=crop",
      daysAgo: 21,
      hoursAgo: 9,
      type: "base",
    },
    {
      destId: "9",
      name: "Cát Bà",
      province: "Hải Phòng",
      region: "Bắc",
      img: "https://images.unsplash.com/photo-1512100356356-de1b84283e18?w=300&h=200&fit=crop",
      daysAgo: 25,
      hoursAgo: 13,
      type: "base",
    },
    {
      destId: "13",
      name: "Đồng Văn",
      province: "Tuyên Quang",
      region: "Bắc",
      img: "https://images.unsplash.com/photo-1534067783941-51c9c23ecefd?w=300&h=200&fit=crop",
      daysAgo: 28,
      hoursAgo: 17,
      type: "bonus",
    },
  ]

  return sampleItems.map((item, index) => {
    const itemDate = new Date(now.getTime() - item.daysAgo * 86400000 - item.hoursAgo * 3600000)
    return {
      id: `vh-${userId}-${index + 1}`,
      userId,
      destinationId: item.destId,
      destinationName: item.name,
      destinationImage: item.img,
      province: item.province,
      region: item.region,
      timestamp: itemDate.toISOString(),
      voteType: item.type,
      voteCount: 1,
    }
  })
}

function generateInitialTasks(): UserTask[] {
  return [
    {
      id: "task-quiz-daily",
      title: "Thử tài kiến thức Quiz nông thôn",
      description: "Trả lời đúng các câu hỏi về danh thắng & làng quê Việt Nam để nhận vote.",
      reward: 1,
      progress: 0,
      maxProgress: 1,
      status: "todo",
      category: "daily",
    },
    {
      id: "task-share-dest",
      title: "Chia sẻ điểm đến yêu thích",
      description: "Sao chép và lan tỏa liên kết điểm đến nông thôn tới cộng đồng hoặc mạng xã hội.",
      reward: 1,
      progress: 1,
      maxProgress: 1,
      status: "claimable",
      category: "daily",
    },
    {
      id: "task-streak-7days",
      title: "Điểm danh bình chọn 7 ngày liên tiếp",
      description: "Đồng hành liên tục cùng chương trình tôn vinh du lịch nông thôn 2026.",
      reward: 3,
      progress: 4,
      maxProgress: 7,
      status: "in_progress",
      category: "special",
    },
    {
      id: "task-multi-region",
      title: "Gieo mầm khắp 3 miền Bắc – Trung – Nam",
      description: "Bình chọn cho ít nhất một điểm đến ở cả 3 miền của Tổ quốc.",
      reward: 2,
      progress: 2,
      maxProgress: 3,
      status: "in_progress",
      category: "special",
    },
  ]
}

function generateInitialQuizHistory(userId: string): QuizAttempt[] {
  const now = new Date()
  return [
    {
      id: `qa-${userId}-1`,
      userId,
      title: "Bộ câu hỏi Di sản nông nghiệp & Làng nghề miền Bắc",
      timestamp: new Date(now.getTime() - 1 * 86400000).toISOString(),
      score: 10,
      totalQuestions: 10,
      timeSpent: "2 phút 15 giây",
      bonusGranted: 1,
      status: "completed",
      questionsReview: [
        {
          id: "q1",
          question: "Ruộng bậc thang Mù Cang Chải thuộc tỉnh nào?",
          options: ["Lào Cai", "Yên Bái", "Sơn La", "Lai Châu"],
          selectedAnswer: 1,
          correctAnswer: 1,
          isCorrect: true,
          explanation: "Mù Cang Chải là huyện vùng cao thuộc tỉnh Yên Bái, nổi tiếng với danh thắng ruộng bậc thang quốc gia.",
        },
        {
          id: "q2",
          question: "Vùng đất nào nổi danh với 'Đệ nhất danh trà'?",
          options: ["Lâm Đồng", "Thái Nguyên", "Sơn La", "Hà Giang"],
          selectedAnswer: 1,
          correctAnswer: 1,
          isCorrect: true,
          explanation: "Thái Nguyên được vinh danh là vùng đất đệ nhất danh trà với những đồi chè Tân Cương trứ danh.",
        },
        {
          id: "q3",
          question: "Vịnh Hạ Long được UNESCO công nhận là Di sản thiên nhiên thế giới lần đầu vào năm nào?",
          options: ["1994", "1999", "2000", "2003"],
          selectedAnswer: 0,
          correctAnswer: 0,
          isCorrect: true,
          explanation: "Vịnh Hạ Long được UNESCO công nhận lần đầu tiên vào năm 1994 về giá trị thẩm mỹ cảnh quan.",
        },
      ],
    },
    {
      id: `qa-${userId}-2`,
      userId,
      title: "Khám phá Văn hóa sông nước & Làng quê Nam Bộ",
      timestamp: new Date(now.getTime() - 4 * 86400000).toISOString(),
      score: 8,
      totalQuestions: 10,
      timeSpent: "3 phút 40 giây",
      bonusGranted: 1,
      status: "completed",
      questionsReview: [
        {
          id: "q4",
          question: "Chợ nổi Cái Răng là nét văn hóa đặc trưng của tỉnh/thành phố nào?",
          options: ["Tiền Giang", "Vĩnh Long", "Cần Thơ", "Đồng Tháp"],
          selectedAnswer: 2,
          correctAnswer: 2,
          isCorrect: true,
          explanation: "Chợ nổi Cái Răng nằm trên sông Cái Răng thuộc quận Cái Răng, thành phố Cần Thơ.",
        },
        {
          id: "q5",
          question: "Vườn quốc gia Tràm Chim nổi tiếng với loài chim quý hiếm nào?",
          options: ["Sếu đầu đỏ", "Giang sen", "Cò thìa", "Diệc lửa"],
          selectedAnswer: 0,
          correctAnswer: 0,
          isCorrect: true,
          explanation: "Sếu đầu đỏ (Grus antigone sharpii) là loài chim quý biểu tượng tại Vườn quốc gia Tràm Chim, Đồng Tháp.",
        },
      ],
    },
    {
      id: `qa-${userId}-3`,
      userId,
      title: "Địa danh & Sản vật Nông thôn Việt Nam 2026",
      timestamp: new Date(now.getTime() - 9 * 86400000).toISOString(),
      score: 9,
      totalQuestions: 10,
      timeSpent: "2 phút 50 giây",
      bonusGranted: 1,
      status: "completed",
      questionsReview: [],
    },
  ]
}

function generateInitialBadges(): Badge[] {
  return [
    {
      id: "badge-first-seed",
      name: "Người Gieo Mầm Đầu Tiên",
      icon: "🌱",
      description: "Thực hiện thành công lượt bình chọn đầu tiên trong cuộc thi.",
      category: "vote",
      unlocked: true,
      unlockedAt: "15/03/2026",
      conditionText: "Bình chọn ít nhất 1 điểm đến",
    },
    {
      id: "badge-green-hands",
      name: "Bàn Tay Xanh Nông Thôn",
      icon: "🌿",
      description: "Tích lũy từ 10 lượt bình chọn trở lên cho các điểm đến.",
      category: "vote",
      unlocked: true,
      unlockedAt: "25/03/2026",
      conditionText: "Đạt mốc 10 lượt bình chọn",
    },
    {
      id: "badge-quiz-master",
      name: "Nhà Thông Thái Địa Lý",
      icon: "🎓",
      description: "Hoàn thành xuất sắc vòng thi Quiz với điểm số tuyệt đối 10/10.",
      category: "quiz",
      unlocked: true,
      unlockedAt: "02/04/2026",
      conditionText: "Đạt 10/10 điểm trong 1 lượt Quiz",
    },
    {
      id: "badge-all-regions",
      name: "Đại Sứ Xuyên Việt",
      icon: "🗺️",
      description: "Bình chọn cho ít nhất một điểm đến tại cả 3 miền Bắc, Trung và Nam.",
      category: "community",
      unlocked: true,
      unlockedAt: "05/04/2026",
      conditionText: "Bình chọn đủ 3 miền Bắc – Trung – Nam",
    },
    {
      id: "badge-streak-7",
      name: "Đồng Hành Bền Bỉ",
      icon: "🔥",
      description: "Tham gia bình chọn liên tục trong 7 ngày không gián đoạn.",
      category: "vote",
      unlocked: false,
      conditionText: "Điểm danh vote 7 ngày liên tiếp (hiện tại: 4/7 ngày)",
    },
    {
      id: "badge-champion-tree",
      name: "Trồng Cây Đại Thụ",
      icon: "🌳",
      description: "Đóng góp hơn 50 lượt bình chọn nâng tầm cảnh quan Việt.",
      category: "vote",
      unlocked: false,
      conditionText: "Đạt mốc 50 lượt bình chọn (hiện tại: 16/50 phiếu)",
    },
  ]
}

function generateInitialSettings(userEmail: string): UserSettings {
  return {
    notifyDailyReminder: true,
    notifyRankUp: true,
    notifyContestResults: true,
    language: "vi",
    publicLeaderboardName: true,
    partialAnonymity: true,
    linkedGoogleEmail: userEmail || "haidang.nguyen@gmail.com",
  }
}

// ------------------------------------------------------------
// PROFILE SERVICE IMPLEMENTATION
// ------------------------------------------------------------

export const profileService = {
  /**
   * Lấy thông tin hồ sơ người dùng
   */
  async getProfile(userId: string): Promise<UserProfile> {
    await sleep(250)

    if (typeof window === "undefined") {
      const levelProgress = calculateUserLevel(16)
      return {
        id: userId,
        name: "Nguyễn Hải Đăng",
        email: "haidang.nguyen@gmail.com",
        avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop",
        phone: "0912345678",
        province: "Hà Nội",
        bio: "Yêu du lịch trải nghiệm, khám phá những làng quê yên bình của dải đất hình chữ S.",
        joinedAt: "15/03/2026",
        level: levelProgress.currentLevel,
        levelProgress,
        stats: { totalVotes: 16, totalDestinations: 8, myRank: 14 },
      }
    }

    try {
      const raw = localStorage.getItem(PROFILE_KEY(userId))
      let profile: UserProfile | null = raw ? JSON.parse(raw) : null

      // Sync with auth user session if available
      const sessionUser = authService.getSession()
      const fallbackName = sessionUser?.name || "Nguyễn Hải Đăng"
      const fallbackEmail = sessionUser?.email || "haidang.nguyen@gmail.com"
      const fallbackAvatar = sessionUser?.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop"

      // Sync votes count with actual vote history
      const historyRaw = localStorage.getItem(VOTE_HISTORY_KEY(userId))
      const history: VoteHistoryItem[] = historyRaw
        ? JSON.parse(historyRaw)
        : generateInitialVoteHistory(userId)
      if (!historyRaw) {
        localStorage.setItem(VOTE_HISTORY_KEY(userId), JSON.stringify(history))
      }

      const totalVotes = history.reduce((sum, item) => sum + item.voteCount, 0)
      const uniqueDestinations = new Set(history.map((item) => item.destinationId)).size
      const levelProgress = calculateUserLevel(totalVotes)

      if (!profile) {
        profile = {
          id: userId,
          name: fallbackName,
          email: fallbackEmail,
          avatarUrl: fallbackAvatar,
          phone: "0912345678",
          province: "Hà Nội",
          bio: "Yêu du lịch trải nghiệm, khám phá những làng quê yên bình của dải đất hình chữ S.",
          joinedAt: "15/03/2026",
          level: levelProgress.currentLevel,
          levelProgress,
          stats: {
            totalVotes,
            totalDestinations: uniqueDestinations,
            myRank: 14,
          },
        }
        localStorage.setItem(PROFILE_KEY(userId), JSON.stringify(profile))
      } else {
        // Update reactive metrics
        profile.stats = {
          ...profile.stats,
          totalVotes,
          totalDestinations: uniqueDestinations,
        }
        profile.levelProgress = levelProgress
        profile.level = levelProgress.currentLevel
        if (sessionUser && sessionUser.name && sessionUser.name !== profile.name) {
          profile.name = sessionUser.name
        }
      }

      return profile
    } catch {
      const levelProgress = calculateUserLevel(16)
      return {
        id: userId,
        name: "Nguyễn Hải Đăng",
        email: "haidang.nguyen@gmail.com",
        avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop",
        phone: "0912345678",
        province: "Hà Nội",
        bio: "Yêu du lịch trải nghiệm, khám phá những làng quê yên bình của dải đất hình chữ S.",
        joinedAt: "15/03/2026",
        level: levelProgress.currentLevel,
        levelProgress,
        stats: { totalVotes: 16, totalDestinations: 8, myRank: 14 },
      }
    }
  },

  /**
   * Cập nhật thông tin cá nhân (Tab 1)
   */
  async updateProfile(userId: string, data: Partial<UserProfile>): Promise<UserProfile> {
    await sleep(350)
    const current = await this.getProfile(userId)
    const updated: UserProfile = {
      ...current,
      ...data,
      name: data.name?.trim() || current.name,
      phone: data.phone?.trim() || current.phone,
      province: data.province || current.province,
      bio: data.bio !== undefined ? data.bio.slice(0, 120) : current.bio,
    }

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(PROFILE_KEY(userId), JSON.stringify(updated))

        // Sync with auth user session so header reflects instantly
        const session = authService.getSession()
        if (session && session.id === userId) {
          authService.setSession({
            ...session,
            name: updated.name,
            avatarUrl: updated.avatarUrl,
          })
        }
      } catch {}
    }

    return updated
  },

  /**
   * Cập nhật ảnh đại diện người dùng
   */
  async updateAvatar(userId: string, avatarUrl: string): Promise<string> {
    await sleep(300)
    const current = await this.getProfile(userId)
    const updated: UserProfile = {
      ...current,
      avatarUrl,
    }

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(PROFILE_KEY(userId), JSON.stringify(updated))
        const session = authService.getSession()
        if (session && session.id === userId) {
          authService.setSession({
            ...session,
            avatarUrl,
          })
        }
      } catch {}
    }

    return avatarUrl
  },

  /**
   * Lấy lịch sử bình chọn có bộ lọc & phân trang (Tab 3)
   */
  async getVoteHistory(
    userId: string,
    filter?: Partial<VoteHistoryFilter>,
  ): Promise<{
    items: VoteHistoryItem[]
    total: number
    mostVotedDestination?: { name: string; count: number }
  }> {
    await sleep(250)

    let all: VoteHistoryItem[] = []
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem(VOTE_HISTORY_KEY(userId))
        if (raw) {
          all = JSON.parse(raw)
        } else {
          all = generateInitialVoteHistory(userId)
          localStorage.setItem(VOTE_HISTORY_KEY(userId), JSON.stringify(all))
        }
      } catch {
        all = generateInitialVoteHistory(userId)
      }
    } else {
      all = generateInitialVoteHistory(userId)
    }

    // Determine most voted destination
    const countMap: Record<string, { name: string; count: number }> = {}
    for (const v of all) {
      if (!countMap[v.destinationId]) {
        countMap[v.destinationId] = { name: v.destinationName, count: 0 }
      }
      countMap[v.destinationId].count += v.voteCount
    }
    const sortedDests = Object.values(countMap).sort((a, b) => b.count - a.count)
    const mostVotedDestination = sortedDests[0]

    // Apply filtering
    let filtered = [...all]
    const now = Date.now()

    if (filter?.timeRange && filter.timeRange !== "all") {
      if (filter.timeRange === "today") {
        const startOfToday = new Date()
        startOfToday.setHours(0, 0, 0, 0)
        filtered = filtered.filter((i) => new Date(i.timestamp).getTime() >= startOfToday.getTime())
      } else if (filter.timeRange === "7days") {
        const sevenDaysAgo = now - 7 * 86400000
        filtered = filtered.filter((i) => new Date(i.timestamp).getTime() >= sevenDaysAgo)
      } else if (filter.timeRange === "30days") {
        const thirtyDaysAgo = now - 30 * 86400000
        filtered = filtered.filter((i) => new Date(i.timestamp).getTime() >= thirtyDaysAgo)
      }
    }

    if (filter?.voteType && filter.voteType !== "all") {
      filtered = filtered.filter((i) => i.voteType === filter.voteType)
    }

    if (filter?.search?.trim()) {
      const q = filter.search.toLowerCase().trim()
      filtered = filtered.filter(
        (i) =>
          i.destinationName.toLowerCase().includes(q) ||
          i.province.toLowerCase().includes(q),
      )
    }

    // Sorting
    filtered.sort((a, b) => {
      const ta = new Date(a.timestamp).getTime()
      const tb = new Date(b.timestamp).getTime()
      return filter?.sortBy === "oldest" ? ta - tb : tb - ta
    })

    const total = filtered.length
    const page = filter?.page || 1
    const pageSize = filter?.pageSize || 10
    const start = (page - 1) * pageSize
    const paginatedItems = filtered.slice(0, start + pageSize)

    return {
      items: paginatedItems,
      total,
      mostVotedDestination,
    }
  },

  /**
   * Thêm 1 bản ghi vào lịch sử bình chọn
   */
  async addVoteHistoryItem(
    userId: string,
    item: Omit<VoteHistoryItem, "id" | "timestamp" | "userId">,
  ): Promise<VoteHistoryItem> {
    const newItem: VoteHistoryItem = {
      ...item,
      id: `vh-${userId}-${Date.now()}`,
      userId,
      timestamp: new Date().toISOString(),
    }

    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem(VOTE_HISTORY_KEY(userId))
        const list: VoteHistoryItem[] = raw ? JSON.parse(raw) : generateInitialVoteHistory(userId)
        list.unshift(newItem)
        localStorage.setItem(VOTE_HISTORY_KEY(userId), JSON.stringify(list))
      } catch {}
    }

    return newItem
  },

  /**
   * Lấy danh sách nhiệm vụ nhận thêm vote (Tab 2)
   */
  async getTasks(userId: string): Promise<UserTask[]> {
    await sleep(200)
    if (typeof window === "undefined") return generateInitialTasks()

    try {
      const raw = localStorage.getItem(TASKS_KEY(userId))
      if (raw) return JSON.parse(raw)
      const initial = generateInitialTasks()
      localStorage.setItem(TASKS_KEY(userId), JSON.stringify(initial))
      return initial
    } catch {
      return generateInitialTasks()
    }
  },

  /**
   * Nhận thưởng nhiệm vụ (Tab 2)
   */
  async claimTaskReward(
    userId: string,
    taskId: string,
  ): Promise<{ success: boolean; reward: number; message: string }> {
    await sleep(300)
    const tasks = await this.getTasks(userId)
    const task = tasks.find((t) => t.id === taskId)

    if (!task) {
      return { success: false, reward: 0, message: "Không tìm thấy nhiệm vụ." }
    }
    if (task.status === "claimed") {
      return { success: false, reward: 0, message: "Phần thưởng đã được nhận." }
    }

    task.status = "claimed"
    task.progress = task.maxProgress

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(TASKS_KEY(userId), JSON.stringify(tasks))

        // Thêm bonus vote vào store dùng chung map_daily_vote_${userId}_v2
        const voteKey = `map_daily_vote_${userId}_v2`
        const rawVote = localStorage.getItem(voteKey)
        const voteData = rawVote ? JSON.parse(rawVote) : { used: 0, bonus: 0, votedIds: [] }
        voteData.bonus = (voteData.bonus || 0) + task.reward
        localStorage.setItem(voteKey, JSON.stringify(voteData))

        // Ghi lại lịch sử nhận thưởng
        await this.addVoteHistoryItem(userId, {
          destinationId: "task-reward",
          destinationName: `Nhiệm vụ: ${task.title}`,
          destinationImage: "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=300&h=200&fit=crop",
          province: "Toàn quốc",
          region: "Bắc",
          voteType: "bonus",
          voteCount: task.reward,
        })
      } catch {}
    }

    return {
      success: true,
      reward: task.reward,
      message: `Đã nhận thành công +${task.reward} lượt bình chọn thưởng!`,
    }
  },

  /**
   * Lấy lịch sử làm Quiz (Tab 4)
   */
  async getQuizHistory(
    userId: string,
  ): Promise<{ attempts: QuizAttempt[]; summary: QuizSummary }> {
    await sleep(250)
    let attempts: QuizAttempt[] = []

    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem(QUIZ_HISTORY_KEY(userId))
        if (raw) {
          attempts = JSON.parse(raw)
        } else {
          attempts = generateInitialQuizHistory(userId)
          localStorage.setItem(QUIZ_HISTORY_KEY(userId), JSON.stringify(attempts))
        }
      } catch {
        attempts = generateInitialQuizHistory(userId)
      }
    } else {
      attempts = generateInitialQuizHistory(userId)
    }

    const totalAttempts = attempts.length
    const totalScore = attempts.reduce((acc, a) => acc + a.score, 0)
    const averageScore = totalAttempts > 0 ? Math.round((totalScore / totalAttempts) * 10) / 10 : 0
    const highestScore = attempts.reduce((max, a) => Math.max(max, a.score), 0)
    const totalBonusVotes = attempts.reduce((sum, a) => sum + (a.bonusGranted || 0), 0)

    return {
      attempts,
      summary: {
        totalAttempts,
        averageScore,
        highestScore,
        totalBonusVotes,
      },
    }
  },

  /**
   * Lấy bảng xếp hạng & thông tin thứ hạng của tôi (Tab 5)
   */
  async getRanking(
    period: "week" | "month" | "all",
    userId: string,
  ): Promise<{ list: RankingEntry[]; mySummary: MyRankingSummary }> {
    await sleep(300)
    const profile = await this.getProfile(userId)
    const myVotes = profile.stats.totalVotes

    // Top 10 users mock list
    const factor = period === "week" ? 0.35 : period === "month" ? 0.7 : 1
    const baseTop10: Array<{ name: string; avatar: string; votes: number }> = [
      { name: "Trần Bảo An", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&h=120&fit=crop", votes: Math.round(98 * factor) },
      { name: "Lê Minh Khang", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop", votes: Math.round(84 * factor) },
      { name: "Vũ Phương Thảo", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&h=120&fit=crop", votes: Math.round(76 * factor) },
      { name: "Hoàng Gia Huy", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&h=120&fit=crop", votes: Math.round(62 * factor) },
      { name: "Phạm Thùy Linh", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=120&h=120&fit=crop", votes: Math.round(55 * factor) },
      { name: "Đặng Tuấn Kiệt", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&h=120&fit=crop", votes: Math.round(48 * factor) },
      { name: "Bùi Ngọc Hân", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&h=120&fit=crop", votes: Math.round(41 * factor) },
      { name: "Ngô Thanh Tùng", avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&h=120&fit=crop", votes: Math.round(35 * factor) },
      { name: "Dương Ánh Tuyết", avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&h=120&fit=crop", votes: Math.round(29 * factor) },
      { name: "Trịnh Quang Vinh", avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&h=120&fit=crop", votes: Math.round(24 * factor) },
    ]

    const list: RankingEntry[] = baseTop10.map((item, index) => {
      // Partial masking name: e.g. "Trần B***"
      const parts = item.name.split(" ")
      const maskedName =
        parts.length > 1
          ? `${parts[0]} ${parts[parts.length - 1][0]}***`
          : `${item.name[0]}***`

      return {
        rank: index + 1,
        userId: `usr-${index + 1}`,
        name: maskedName,
        avatarUrl: item.avatar,
        totalVotes: item.votes,
        level: calculateUserLevel(item.votes).currentLevel,
        isMe: false,
      }
    })

    const rankAboveVotes = 20
    const gapToNextRank = Math.max(1, rankAboveVotes - myVotes)

    const mySummary: MyRankingSummary = {
      myRank: 14,
      totalVotes: myVotes,
      gapToNextRank,
      nextRankUser: {
        name: "Lâm Đình K***",
        rank: 13,
        totalVotes: rankAboveVotes,
      },
    }

    return { list, mySummary }
  },

  /**
   * Lấy danh sách huy hiệu (Tab 5)
   */
  async getBadges(_userId: string): Promise<Badge[]> {
    await sleep(200)
    return generateInitialBadges()
  },

  /**
   * Lấy cài đặt tài khoản (Tab 6)
   */
  async getSettings(userId: string): Promise<UserSettings> {
    await sleep(200)
    if (typeof window === "undefined") return generateInitialSettings("")

    try {
      const raw = localStorage.getItem(SETTINGS_KEY(userId))
      if (raw) return JSON.parse(raw)
      const session = authService.getSession()
      const initial = generateInitialSettings(session?.email || "")
      localStorage.setItem(SETTINGS_KEY(userId), JSON.stringify(initial))
      return initial
    } catch {
      return generateInitialSettings("")
    }
  },

  /**
   * Cập nhật cài đặt tài khoản (Tab 6)
   */
  async updateSettings(
    userId: string,
    settings: Partial<UserSettings>,
  ): Promise<UserSettings> {
    await sleep(250)
    const current = await this.getSettings(userId)
    const updated = { ...current, ...settings }

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(SETTINGS_KEY(userId), JSON.stringify(updated))
      } catch {}
    }

    return updated
  },

  /**
   * Xóa tài khoản (Zone nguy hiểm Tab 6)
   */
  async deleteAccount(userId: string): Promise<boolean> {
    await sleep(400)
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem(PROFILE_KEY(userId))
        localStorage.removeItem(VOTE_HISTORY_KEY(userId))
        localStorage.removeItem(QUIZ_HISTORY_KEY(userId))
        localStorage.removeItem(TASKS_KEY(userId))
        localStorage.removeItem(SETTINGS_KEY(userId))
        localStorage.removeItem(`map_daily_vote_${userId}_v2`)
        await authService.logout()
      } catch {}
    }
    return true
  },
}
