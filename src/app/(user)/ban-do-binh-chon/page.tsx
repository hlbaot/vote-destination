import type { Metadata } from "next"
import MapPageClient from "@/features/user/map"

export const metadata: Metadata = {
  title: "Bản đồ bình chọn – 68 Điểm đến yêu thích Việt Nam",
  description: "Theo dõi bình chọn 68 điểm đến yêu thích Việt Nam theo thời gian thực trên bản đồ cây tăng trưởng sinh động.",
}

export default function BanDoBinhChonPage() {
  return <MapPageClient />
}
