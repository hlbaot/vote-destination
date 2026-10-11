"use client"

import { Page } from "../types"
import { Logo } from "./Header"

export default function Footer({ go }: { go: (page: Page) => void }) {
  return (
    <footer>
      <div className="container footer-grid">
        <Logo />
        <p>
          Chương trình bình chọn tôn vinh vẻ đẹp thiên nhiên, văn hóa và con
          người Việt Nam thông qua 68 hồ sơ điểm đến. Người dùng có thể tra cứu
          thông tin, xem hồ sơ chi tiết và tham gia bình chọn minh bạch.
        </p>
        <div className="footer-links">
          <button onClick={() => go("home")}>Trang chủ</button>
          <button onClick={() => go("explore")}>Danh sách điểm đến</button>
          <button onClick={() => go("vote")}>Bình chọn & kết quả</button>
          <button onClick={() => go("cms")}>Quản trị nội dung CMS</button>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>© 2025 Hội thi bình chọn điểm đến Việt Nam</span>
        <span>Giao diện tương thích máy tính, máy tính bảng và điện thoại</span>
      </div>
    </footer>
  )
}
