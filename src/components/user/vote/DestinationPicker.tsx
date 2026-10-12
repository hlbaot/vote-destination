"use client"

import React, { useMemo, useState } from "react"
import { Destination, Region } from "@/types"
import Icon from "@/components/shared/Icon"

interface DestinationPickerProps {
  destinations: Destination[]
  selectedDestination: Destination
  voterPhone: string
  voterName: string
  onSelectDestination: (dest: Destination) => void
  onBackToStep1: () => void
  onConfirmVote: () => void
}

export default function DestinationPicker({
  destinations,
  selectedDestination,
  voterPhone,
  voterName,
  onSelectDestination,
  onBackToStep1,
  onConfirmVote,
}: DestinationPickerProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedRegion, setSelectedRegion] = useState<"all" | Region>("all")
  const [selectedProvince, setSelectedProvince] = useState<string>("all")

  // Available provinces based on current list
  const availableProvinces = useMemo(() => {
    const set = new Set<string>()
    destinations.forEach((d) => {
      if (selectedRegion === "all" || d.region === selectedRegion) {
        set.add(d.place)
      }
    })
    return Array.from(set).sort((a, b) => a.localeCompare(b, "vi"))
  }, [destinations, selectedRegion])

  // Filtered destinations
  const filtered = useMemo(() => {
    return destinations.filter((d) => {
      // Region
      if (selectedRegion !== "all" && d.region !== selectedRegion) return false
      // Province
      if (selectedProvince !== "all" && d.place !== selectedProvince) return false
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim()
        const matchName = d.name.toLowerCase().includes(q)
        const matchPlace = d.place.toLowerCase().includes(q)
        const matchCategory = d.category?.toLowerCase().includes(q)
        if (!matchName && !matchPlace && !matchCategory) return false
      }
      return true
    })
  }, [destinations, selectedRegion, selectedProvince, searchQuery])

  return (
    <div className="bg-[var(--color-surface-tint)] border border-[var(--color-border)] rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--color-border)]">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-accent)] block mb-1">
            BƯỚC 02 / 03
          </span>
          <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[var(--color-primary-dark)] tracking-tight">
            Chọn điểm đến yêu thích
          </h3>
          <p className="text-sm text-[#52645E] mt-1">
            Tìm kiếm hoặc lọc điểm đến trong danh sách 68 hồ sơ để bỏ phiếu.
          </p>
        </div>

        {/* Back to Step 1 & Voter Info summary */}
        <div className="flex items-center gap-3 bg-[#EAE2D3] border border-[#DDD3C0] px-3.5 py-2 rounded-2xl">
          <div className="text-xs text-[#52645E]">
            Cử tri:{" "}
            <strong className="text-[var(--color-primary-dark)]">
              {voterName ? `${voterName} (` : ""}
              {voterPhone || "098***"}
              {voterName ? ")" : ""}
            </strong>
          </div>
          <button
            type="button"
            onClick={onBackToStep1}
            className="text-xs font-semibold text-[var(--color-accent)] hover:underline cursor-pointer"
          >
            Sửa
          </button>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="space-y-4">
        {/* Search Input */}
        <div className="relative rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] shadow-sm focus-within:ring-2 focus-within:ring-[var(--color-primary-dark)] focus-within:border-[var(--color-primary-dark)]">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[var(--color-text-muted)]">
            <Icon name="search" size={18} />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên điểm đến, tỉnh thành (ví dụ: Sa Pa, Ba Bể, Ninh Bình...)"
            className="w-full pl-11 pr-10 py-3.5 bg-transparent rounded-2xl text-base text-[var(--color-text)] placeholder:text-[#9BAAA4] focus:outline-none"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
            >
              <Icon name="x" size={16} />
            </button>
          )}
        </div>

        {/* Region Pills & Province Dropdown */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Region Filter Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-[#E8E0D2] rounded-2xl">
            {(
              [
                { id: "all", label: "Tất cả (68)" },
                { id: "Bắc", label: "Miền Bắc" },
                { id: "Trung", label: "Miền Trung" },
                { id: "Tây Nguyên", label: "Tây Nguyên" },
                { id: "Nam", label: "Miền Nam" },
              ] as const
            ).map((reg) => (
              <button
                key={reg.id}
                type="button"
                className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${selectedRegion === reg.id
                    ? "bg-[var(--color-primary)] text-white shadow-sm"
                    : "text-[#475A53] hover:text-[var(--color-primary-dark)] hover:bg-black/5"
                  }`}
                onClick={() => {
                  setSelectedRegion(reg.id)
                  setSelectedProvince("all")
                }}
              >
                {reg.label}
              </button>
            ))}
          </div>

          {/* Province Filter Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-[var(--color-text-muted)] whitespace-nowrap font-medium hidden sm:inline">
              Tỉnh thành:
            </span>
            <select
              value={selectedProvince}
              onChange={(e) => setSelectedProvince(e.target.value)}
              className="px-3.5 py-2 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] text-xs sm:text-sm font-medium text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-dark)]"
            >
              <option value="all">Tất cả tỉnh thành ({availableProvinces.length})</option>
              {availableProvinces.map((prov) => (
                <option key={prov} value={prov}>
                  {prov}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Destinations Grid */}
      <div className="min-h-[300px]">
        {filtered.length === 0 ? (
          <div className="text-center py-12 px-4 bg-[#EBE4D6] rounded-2xl border border-dashed border-[#D2C5B0]">
            <p className="text-sm font-semibold text-[var(--color-primary-dark)]">
              Không tìm thấy điểm đến phù hợp với từ khóa & bộ lọc
            </p>
            <p className="text-xs text-[#63756F] mt-1">
              Thử xóa từ khóa tìm kiếm hoặc chọn lại vùng miền
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery("")
                setSelectedRegion("all")
                setSelectedProvince("all")
              }}
              className="mt-3 px-4 py-2 bg-[var(--color-primary)] text-white text-xs font-semibold rounded-xl"
            >
              Xem lại tất cả 68 điểm đến
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[600px] overflow-y-auto pr-1">
            {filtered.map((item) => {
              const isSelected = selectedDestination.id === item.id

              return (
                <div
                  key={item.id}
                  onClick={() => onSelectDestination(item)}
                  className={`group relative rounded-2xl overflow-hidden border transition-all duration-200 cursor-pointer flex flex-col ${isSelected
                      ? "border-[var(--color-accent)] ring-2 ring-[var(--color-accent)]/40 bg-[var(--color-surface)] shadow-md"
                      : "border-[var(--color-border)] bg-[var(--color-bg)] hover:border-[var(--color-primary-dark)]/40 hover:shadow-sm"
                    }`}
                >
                  {/* Image container with Fallback */}
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)]">
                    {item.thumbnail ? (
                      <img
                        src={item.thumbnail}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          // Hide broken image, show gradient fallback
                          ; (e.target as HTMLImageElement).style.display = "none"
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-white/70 p-4 text-center">
                        <Icon name="map" size={28} className="text-[var(--color-accent)] mb-1" />
                        <span className="text-xs font-medium">{item.name}</span>
                      </div>
                    )}

                    {/* Badge: Region & Category */}
                    <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1">
                      <span className="px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-white text-[11px] font-semibold">
                        {item.region}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-[var(--color-accent)] text-[var(--color-primary-dark)] text-[11px] font-bold">
                        {item.tag || item.category}
                      </span>
                    </div>

                    {/* Checkmark badge when selected */}
                    {isSelected && (
                      <div className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full bg-[var(--color-accent)] text-white flex items-center justify-center shadow-lg ring-2 ring-white">
                        <Icon name="check" size={14} />
                      </div>
                    )}
                  </div>

                  {/* Body Info */}
                  <div className="p-4 flex-1 flex flex-col justify-between gap-2">
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="font-serif text-base font-bold text-[var(--color-primary-dark)] group-hover:text-[var(--color-accent)] transition-colors line-clamp-1">
                          {item.name}
                        </h4>
                        <span className="text-xs font-bold text-[var(--color-accent)] whitespace-nowrap">
                          {item.votes} phiếu
                        </span>
                      </div>
                      <p className="text-xs text-[#52645E] mt-0.5 flex items-center gap-1">
                        <span>📍</span> {item.place}
                      </p>
                    </div>

                    <p className="text-xs text-[#63756F] line-clamp-2 leading-relaxed">
                      {item.shortDescription || item.lead}
                    </p>

                    <div className="pt-2 border-t border-[#EDE4D5] flex items-center justify-between">
                      <span className="text-[11px] text-[var(--color-text-muted)]">
                        Thời điểm: {item.bestTime || "Quanh năm"}
                      </span>
                      <span
                        className={`text-xs font-bold ${isSelected ? "text-[var(--color-accent)]" : "text-[var(--color-primary-dark)]"
                          }`}
                      >
                        {isSelected ? "✓ Đang chọn" : "Chọn điểm này"}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Sticky Bottom Confirmation Bar */}
      <div className="sticky bottom-4 z-20 p-4 sm:p-5 rounded-2xl bg-[var(--color-surface)] text-[var(--color-text)] border border-[var(--color-border)] shadow-[var(--shadow-brand)] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="w-12 h-12 rounded-xl overflow-hidden bg-black/20 border border-white/20 flex-shrink-0">
            <img
              src={selectedDestination.thumbnail || `/images/destinations/${selectedDestination.id}.webp`}
              alt={selectedDestination.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                ; (e.target as HTMLImageElement).src = "/images/destinations/57.webp"
              }}
            />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[11px] text-[var(--color-accent)] font-semibold uppercase tracking-wider block">
              ĐIỂM ĐẾN BẠN ĐÃ CHỌN
            </span>
            <strong className="text-base sm:text-lg text-[var(--color-primary-dark)] font-serif block truncate">
              {selectedDestination.name} ({selectedDestination.place})
            </strong>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            type="button"
            onClick={onConfirmVote}
            className="w-full sm:w-auto px-7 py-3.5 bg-[var(--color-accent)] hover:bg-[var(--color-primary-hover)] text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 text-base cursor-pointer"
          >
            <span>Xác nhận bình chọn</span>
            <Icon name="check" size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}
