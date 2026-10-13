import { UserLevel, LevelProgress } from "@/types/profile"

export const USER_LEVEL_CONFIG: Array<{
  level: UserLevel
  min: number
  max: number
  icon: string
  nextThreshold: number
}> = [
  { level: "Mầm", min: 0, max: 5, icon: "🌱", nextThreshold: 6 },
  { level: "Cây non", min: 6, max: 20, icon: "🌿", nextThreshold: 21 },
  { level: "Cây lớn", min: 21, max: 50, icon: "🌳", nextThreshold: 51 },
  { level: "Nở hoa", min: 51, max: Infinity, icon: "🌸", nextThreshold: 51 },
]

export function calculateUserLevel(votes: number): LevelProgress {
  const currentVotes = Math.max(0, votes)

  if (currentVotes >= 51) {
    return {
      currentLevel: "Nở hoa",
      nextLevel: null,
      currentVotes,
      threshold: 51,
      nextThreshold: 51,
      percent: 100,
      remainingToNext: 0,
    }
  }

  if (currentVotes >= 21) {
    const range = 51 - 21
    const progress = currentVotes - 21
    return {
      currentLevel: "Cây lớn",
      nextLevel: "Nở hoa",
      currentVotes,
      threshold: 21,
      nextThreshold: 51,
      percent: Math.min(100, Math.round((progress / range) * 100)),
      remainingToNext: 51 - currentVotes,
    }
  }

  if (currentVotes >= 6) {
    const range = 21 - 6
    const progress = currentVotes - 6
    return {
      currentLevel: "Cây non",
      nextLevel: "Cây lớn",
      currentVotes,
      threshold: 6,
      nextThreshold: 21,
      percent: Math.min(100, Math.round((progress / range) * 100)),
      remainingToNext: 21 - currentVotes,
    }
  }

  // Level "Mầm"
  const range = 6 - 0
  return {
    currentLevel: "Mầm",
    nextLevel: "Cây non",
    currentVotes,
    threshold: 0,
    nextThreshold: 6,
    percent: Math.min(100, Math.round((currentVotes / range) * 100)),
    remainingToNext: 6 - currentVotes,
  }
}

export const VIETNAM_PROVINCES: string[] = [
  "Hà Nội",
  "TP. Hồ Chí Minh",
  "Đà Nẵng",
  "Hải Phòng",
  "Cần Thơ",
  "Quảng Ninh",
  "Thừa Thiên Huế",
  "Ninh Bình",
  "Lào Cai",
  "Yên Bái",
  "Hà Giang",
  "Sơn La",
  "Cao Bằng",
  "Bắc Kạn",
  "Tuyên Quang",
  "Thái Nguyên",
  "Phú Thọ",
  "Bắc Giang",
  "Bắc Ninh",
  "Quảng Bình",
  "Quảng Trị",
  "Quảng Nam",
  "Quảng Ngãi",
  "Bình Định",
  "Khánh Hòa",
  "Lâm Đồng",
  "Đắk Lắk",
  "Gia Lai",
  "Kon Tum",
  "Bà Rịa - Vũng Tàu",
  "Đồng Nai",
  "Bình Dương",
  "Kiên Giang",
  "An Giang",
]
