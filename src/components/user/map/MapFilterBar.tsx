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
    <div className="vote-filter-bar bg-[var(--color-surface-tint)]/90 backdrop-blur-sm border-b border-[var(--color-border)] px-3 sm:px-5 py-1.5 shrink-0">
      <div className="max-w-[1680px] mx-auto flex flex-wrap gap-2 items-center justify-between">
        {/* Region filter chips */}
        <div className="flex gap-1 overflow-x-auto flex-shrink-0 py-0.5" style={{ scrollbarWidth: "none" }}>
          {REGIONS.map((r) => (
            <button key={r.value} onClick={() => onRegionChange(r.value)}
              className={`px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-150 border
                ${activeRegion === r.value
                  ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)] shadow-xs"
                  : "bg-white/80 text-[var(--color-text-muted)] border-[var(--color-border)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary-dark)]"}`}>
              {r.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative flex-1 min-w-[140px] max-w-xs">
          <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>
          </svg>
          <input type="search" value={searchQuery} onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Tìm điểm đến..."
            className="w-full pl-8 pr-2.5 py-1 text-xs rounded-full border border-[var(--color-border)] bg-white/80 text-[var(--color-text)] placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-primary-dark)] focus:ring-1 focus:ring-[var(--color-primary-dark)]/30 transition-all" />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto shrink-0 py-0.5" style={{ scrollbarWidth: "none" }}>
          <label className="text-[10px] font-semibold text-[var(--color-text-muted)] whitespace-nowrap">Xem theo</label>
          <select disabled className="h-7 rounded-full border border-[var(--color-border)] bg-white/60 px-2 py-0 text-[11px] text-[var(--color-text-muted)]">
            <option>Điểm đến dẫn đầu</option>
          </select>
          <label className="text-[10px] font-semibold text-[var(--color-text-muted)] whitespace-nowrap">Thời gian</label>
          <select disabled className="h-7 rounded-full border border-[var(--color-border)] bg-white/60 px-2 py-0 text-[11px] text-[var(--color-text-muted)]">
            <option>Toàn đợt</option>
          </select>
          <span className="text-[9px] text-[var(--color-text-muted)] whitespace-nowrap hidden sm:inline">Mock theo ngày</span>
        </div>
      </div>
    </div>
  )
}
