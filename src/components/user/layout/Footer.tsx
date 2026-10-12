"use client"

import { Page } from "@/types"
import { Logo } from "@/components/user/layout/Header"
import { useAppContext } from "@/context/AppContext"

export default function Footer({ go: propGo }: { go?: (page: Page) => void } = {}) {
  const context = useAppContext()
  const go = propGo || context?.navigate || (() => { })

  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        {/* CỘT 1: Logo sắc nét + Mô tả chương trình */}
        <div className="footer-col-brand">
          <div className="footer-logo-container">
            <Logo />
          </div>
          <p className="footer-desc">
            Chương trình bình chọn Điểm đến du lịch nông thôn Việt Nam tốt nhất 2026
            tôn vinh vẻ đẹp thiên nhiên, bản sắc văn hóa làng quê và con
            người Việt Nam thông qua 68 hồ sơ điểm đến. Người dùng có thể tra cứu
            thông tin, xem hồ sơ chi tiết và tham gia bình chọn minh bạch.
          </p>
        </div>

        {/* CỘT 2: Menu liên kết có khoảng cách rõ ràng */}
        <div className="footer-col-nav">
          <h4 className="footer-heading">Liên kết nhanh</h4>
          <div className="footer-links">
            <button type="button" onClick={() => go("home")}>
              Trang chủ
            </button>
            <button type="button" onClick={() => go("explore")}>
              Danh sách điểm đến
            </button>
            <button type="button" onClick={() => go("vote")}>
              Bình chọn & kết quả
            </button>
            <button type="button" onClick={() => go("cms")}>
              Quản trị nội dung CMS
            </button>
          </div>
        </div>

        {/* CỘT 3: Thông tin chương trình bình chọn */}
        <div className="footer-col-info">
          <h4 className="footer-heading">Thông tin chương trình</h4>
          <ul className="footer-info-list">
            <li>
              <strong>Chương trình:</strong> Điểm đến du lịch nông thôn Việt Nam tốt nhất 2026
            </li>
            <li>
              <strong>Quy mô đề cử:</strong> 68 hồ sơ điểm đến thuộc 34 tỉnh/thành
            </li>
            <li>
              <strong>Cổng bình chọn:</strong> Mở trực tuyến 24/7, xác thực minh bạch
            </li>
            <li>
              <strong>Sứ mệnh:</strong> Tôn vinh danh thắng nông thôn, lan tỏa giá trị di sản Việt
            </li>
          </ul>
        </div>
      </div>


    </footer>
  )
}
