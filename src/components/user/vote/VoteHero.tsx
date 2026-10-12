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
    <section className="relative overflow-hidden bg-[var(--color-bg)] text-[var(--color-text)] pt-12 pb-24 sm:pt-16 sm:pb-32">
      {/* Background Image with Dark Moss Gradient Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="/images/destinations/57.webp"
          alt="Phong cảnh Việt Nam"
          className="w-full h-full object-cover object-center scale-105 filter blur-[1px] opacity-35"
        />
        {/* Editorial Vignette & Gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-bg)]/92 via-[#F1FAEC]/88 to-[#E3F4FB]/92" />
        
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
                stroke="var(--color-surface)"
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
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 backdrop-blur-md border border-[var(--color-border)] text-xs sm:text-sm font-medium text-[var(--color-text)] mb-6 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-[var(--color-accent)] animate-pulse" />
          <span className="tracking-wide uppercase text-[11px] sm:text-xs font-semibold text-[var(--color-accent)]">
            HỘI THI TOÀN QUỐC 2026
          </span>
          <span className="text-[var(--color-text-muted)]">•</span>
          <span>68 Điểm đến du lịch nông thôn tiêu biểu</span>
        </div>

        {/* Title */}
        <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[var(--color-primary-dark)] max-w-4xl mx-auto leading-[1.15] mb-5">
          Bình chọn điểm đến yêu thích
        </h1>

        {/* Description */}
        <p className="text-base sm:text-lg lg:text-xl text-[var(--color-text-muted)] max-w-2xl mx-auto font-normal leading-relaxed mb-8">
          Tôn vinh vẻ đẹp cảnh sắc, văn hóa bản địa và con người tại các miền quê tươi đẹp trên khắp dải đất Việt Nam.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4 max-w-md mx-auto">
          <button
            type="button"
            onClick={onScrollToVote}
            className="w-full sm:w-auto px-7 py-3.5 bg-[var(--color-accent)] hover:bg-[var(--color-primary-hover)] text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 text-base group cursor-pointer"
          >
            <span>Bình chọn ngay</span>
            <span className="group-hover:translate-x-1 transition-transform">
              <Icon name="arrow" size={18} />
            </span>
          </button>

          <button
            type="button"
            onClick={onOpenGuide}
            className="w-full sm:w-auto px-6 py-3.5 bg-white/85 hover:bg-[var(--color-surface-tint)] text-[var(--color-primary-dark)] font-medium rounded-2xl border border-[var(--color-border)] backdrop-blur-md transition-all duration-200 flex items-center justify-center gap-2 text-base cursor-pointer"
          >
            <Icon name="shield" size={18} className="text-[var(--color-accent)]" />
            <span>Thể lệ & hướng dẫn</span>
          </button>
        </div>
      </div>
    </section>
  )
}
