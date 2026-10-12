import type { Metadata } from "next"
import MapPageClient from "@/features/user/map"

export const metadata: Metadata = {
  title: "Bản đồ bình chọn – 68 Điểm đến yêu thích Việt Nam",
  description:
    "Bình chọn điểm đến Việt Nam trên bản đồ cây tăng trưởng với 34 tỉnh/thành và 68 điểm đến.",
}

export default function VotePage() {
  return <MapPageClient />
}
