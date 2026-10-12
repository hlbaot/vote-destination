"use client"

import React from "react"
import Icon from "@/components/shared/Icon"

interface VoteHeroProps {
  onScrollToVote: () => void
  onOpenGuide: () => void
}

export default function VoteHero({
  onScrollToVote,
  onOpenGuide,
}: VoteHeroProps) {
  return (
    <section className="relative overflow-hidden bg-[#0A2620] text-[#FAF7F0] pt-12 pb-24 sm:pt-16 sm:pb-32">
      {/* Background Image with Dark Moss Gradient Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="/images/destinations/57.webp"
          alt="Phong cảnh Việt Nam"
          className="w-full h-full object-cover object-center scale-105 filter blur-[1px] opacity-35"
        />
        {/* Editorial Vignette & Gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0F3D34]/95 via-[#0F3D34]/88 to-[#0F3D34]" />
        
        {/* Subtle Topographic / Mountain Contour Patterns */}
        <svg
          className="absolute inset-0 w-full h-full opacity-10 pointer-events-none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern id="contour-pattern" width="120" height="120" patternUnits="userSpaceOnUse">
              <path
                d="M0 60 Q30 30 60 60 T120 60 M0 90 Q30 60 60 90 T120 90 M0 30 Q30 0 60 30 T120 30"
                fill="none"
                stroke="#FAF7F0"
                strokeWidth="1"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#contour-pattern)" />
        </svg>
      </div>

      {/* Main Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Prestige Eyebrow Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs sm:text-sm font-medium text-[#FAF7F0] mb-6 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-[#E05A36] animate-pulse" />
          <span className="tracking-wide uppercase text-[11px] sm:text-xs font-semibold text-[#DFB743]">
            HỘI THI TOÀN QUỐC 2026
          </span>
          <span className="text-white/40">•</span>
          <span>68 Điểm đến du lịch nông thôn tiêu biểu</span>
        </div>

        {/* Title */}
        <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white max-w-4xl mx-auto leading-[1.15] mb-5">
          Bình chọn điểm đến yêu thích
        </h1>

        {/* Description */}
        <p className="text-base sm:text-lg lg:text-xl text-[#D8E6E0] max-w-2xl mx-auto font-normal leading-relaxed mb-8">
          Tôn vinh vẻ đẹp cảnh sắc, văn hóa bản địa và con người tại các miền quê tươi đẹp trên khắp dải đất Việt Nam.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4 max-w-md mx-auto">
          <button
            type="button"
            onClick={onScrollToVote}
            className="w-full sm:w-auto px-7 py-3.5 bg-[#E05A36] hover:bg-[#CC4E2C] text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 text-base group cursor-pointer"
          >
            <span>Bình chọn ngay</span>
            <span className="group-hover:translate-x-1 transition-transform">
              <Icon name="arrow" size={18} />
            </span>
          </button>

          <button
            type="button"
            onClick={onOpenGuide}
            className="w-full sm:w-auto px-6 py-3.5 bg-white/10 hover:bg-white/15 text-white font-medium rounded-2xl border border-white/20 backdrop-blur-md transition-all duration-200 flex items-center justify-center gap-2 text-base cursor-pointer"
          >
            <Icon name="shield" size={18} className="text-[#DFB743]" />
            <span>Thể lệ & hướng dẫn</span>
          </button>
        </div>
      </div>
    </section>
  )
}
