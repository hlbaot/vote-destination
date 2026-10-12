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
  imageCredit?: string
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
