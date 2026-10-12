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
