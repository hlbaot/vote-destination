"use client"
import React from "react"
import type { Region } from "@/types"

type FilterRegion = "all" | Region

interface Props {
  activeRegion: FilterRegion
  searchQuery: string
  onRegionChange: (r: FilterRegion) => void
  onSearchChange: (q: string) => void
}

const REGIONS: { value: FilterRegion; label: string }[] = [
  { value: "all", label: "Cả nước" },
  { value: "Bắc", label: "Miền Bắc" },
  { value: "Trung", label: "Miền Trung" },
  { value: "Tây Nguyên", label: "Tây Nguyên" },
  { value: "Nam", label: "Miền Nam" },
]

export default function MapFilterBar({ activeRegion, searchQuery, onRegionChange, onSearchChange }: Props) {
  return (
    <div className="bg-[#F4EFE6]/90 backdrop-blur-sm border-b border-[#E0D5C5] px-4 sm:px-6 py-3">
      <div className="max-w-7xl mx-auto flex flex-col xl:flex-row gap-3 items-start xl:items-center">
        {/* Region filter chips */}
        <div className="flex gap-1.5 overflow-x-auto flex-shrink-0 pb-0.5 sm:pb-0">
          {REGIONS.map((r) => (
            <button key={r.value} onClick={() => onRegionChange(r.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 border
                ${activeRegion === r.value
                  ? "bg-[#0F3D34] text-white border-[#0F3D34] shadow-sm"
                  : "bg-white/60 text-[#556963] border-[#E0D5C5] hover:border-[#0F3D34] hover:text-[#0F3D34]"}`}>
              {r.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative flex-1 min-w-0 max-w-xs">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8B9E8A]" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>
          </svg>
          <input type="search" value={searchQuery} onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Tìm điểm đến..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-full border border-[#E0D5C5] bg-white/70 text-[#1E2927] placeholder-[#8B9E8A] focus:outline-none focus:border-[#0F3D34] focus:ring-1 focus:ring-[#0F3D34]/30 transition-all" />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-0.5 xl:pb-0">
          <label className="text-[11px] font-semibold text-[#556963] whitespace-nowrap">Xem theo</label>
          <select disabled className="min-h-8 rounded-full border border-[#E0D5C5] bg-white/50 px-3 py-1 text-xs text-[#8B9E8A]">
            <option>Điểm đến dẫn đầu</option>
          </select>
          <label className="text-[11px] font-semibold text-[#556963] whitespace-nowrap">Thời gian</label>
          <select disabled className="min-h-8 rounded-full border border-[#E0D5C5] bg-white/50 px-3 py-1 text-xs text-[#8B9E8A]">
            <option>Toàn đợt</option>
          </select>
          <span className="text-[10px] text-[#8B9E8A] whitespace-nowrap">Dữ liệu theo ngày đang mock</span>
        </div>
      </div>
    </div>
  )
}
