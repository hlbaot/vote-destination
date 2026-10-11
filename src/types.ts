export type Page = "home" | "explore" | "detail" | "vote" | "cms" | "guide"

export type Region = "Bắc" | "Trung" | "Tây Nguyên" | "Nam"

export interface DestinationFact {
  label: string
  value: string
}

export interface Destination {
  id: string
  slug?: string
  name: string
  province?: string
  place: string
  region: Region
  category?: string
  thumbnail?: string
  image: string
  secondaryImage: string
  gallery?: string[]
  videoUrl?: string | null
  votes: string
  rawVotes: number
  tag: "Di sản thiên nhiên" | "Di sản văn hóa" | "Cảnh quan" | "Danh thắng"
  unescoTitle?: string
  shortDescription?: string
  lead: string
  introduction?: string
  description: string
  highlights?: string[]
  bestTime?: string
  address?: string
  facts: DestinationFact[]
  status?: "active"
  updatedAt?: string
  isVisible: boolean
}

export interface VoteRecord {
  id: string
  receiptCode: string
  destinationId: string
  destinationName: string
  maskedPhone: string
  timestamp: string
  timeAgo: string
  ip: string
  status: "verified" | "flagged"
  device: string
}

export interface ToastMessage {
  id: string
  type: "success" | "info" | "warning"
  text: string
}

export type PortalType = "public" | "admin"

export type AdminRole = "superadmin" | "moderator" | "editor" | "operator"

export interface AdminAccount {
  id: string
  username: string
  email: string
  passwordDemo: string
  fullName: string
  role: AdminRole
  roleTitle: string
  department: string
  avatar: string
  status: "active" | "inactive" | "locked"
  lastLogin: string
  permissions: string[]
}

export type IconName = "arrow" | "check" | "chevron" | "clock" | "eye" | "filter" | "heart" | "lock" | "map" | "menu" | "search" | "shield" | "spark" | "user" | "x" | "share" | "copy" | "trash" | "edit" | "plus" | "refresh" | "upload" | "image" | "logout" | "key" | "plane" | "building" | "star" | "calendar" | "headset" | "globe" | "play"
