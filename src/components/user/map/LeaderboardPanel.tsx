"use client"
/**
 * LeaderboardPanel – "Vườn cây nổi bật" leaderboard.
 * Tabs: Điểm đến / Tỉnh·Thành. Live updates via parent polling.
 */
import React, { useState } from "react"
import type { LeaderboardEntry } from "@/lib/api/mapService"
import TreeIcon from "./TreeIcon"

interface ProvinceEntry {
  name: string; totalVotes: number; rank: number; destinationCount: number; region: string;
}

interface Props {
  entries: LeaderboardEntry[]
  provinceEntries: ProvinceEntry[]
  selectedId: string | null
  onSelect: (id: string) => void
  flashIds: Set<string>
}

const RANK_COLORS = ["#F6B93B", "#C0C0C0", "#CD7F32"]
const RANK_EMOJI = ["🥇", "🥈", "🥉"]

export default function LeaderboardPanel({ entries, provinceEntries, selectedId, onSelect, flashIds }: Props) {
  const [tab, setTab] = useState<"dest" | "province">("dest")

  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-[#E0D5C5] overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="px-4 pt-4 pb-0">
        <h3 className="font-serif text-[#0F3D34] text-base font-bold mb-3">🌲 Vườn cây nổi bật</h3>
        {/* Tabs */}
        <div className="flex rounded-lg overflow-hidden border border-[#E0D5C5] mb-3">
          <button onClick={() => setTab("dest")}
            className={`flex-1 py-1.5 text-xs font-semibold transition-colors ${tab==="dest" ? "bg-[#0F3D34] text-white" : "bg-transparent text-[#556963] hover:bg-[#E8F5E4]"}`}>
            Điểm đến
          </button>
          <button onClick={() => setTab("province")}
            className={`flex-1 py-1.5 text-xs font-semibold transition-colors ${tab==="province" ? "bg-[#0F3D34] text-white" : "bg-transparent text-[#556963] hover:bg-[#E8F5E4]"}`}>
            Tỉnh/Thành
          </button>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-2 pb-2">
        {tab === "dest" ? (
          <div className="space-y-0.5">
            {entries.map((entry) => {
              const isSelected = entry.id === selectedId
              const isFlash = flashIds.has(entry.id)
              return (
                <button key={entry.id} onClick={() => onSelect(entry.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left transition-all duration-200
                    ${isSelected ? "bg-[#E8F5E4] border border-[#4A8A3F]" : "hover:bg-[#F4EFE6] border border-transparent"}
                    ${isFlash ? "animate-pulse" : ""}`}>
                  {/* Rank badge */}
                  <div className="flex-shrink-0 w-6 text-center">
                    {entry.rank <= 3 ? (
                      <span className="text-base">{RANK_EMOJI[entry.rank - 1]}</span>
                    ) : (
                      <span className="text-xs font-bold text-[#556963]">{entry.rank}</span>
                    )}
                  </div>
                  {/* Tree icon */}
                  <div className="flex-shrink-0">
                    <TreeIcon stage={entry.stage} size={20} />
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className={`text-xs font-semibold truncate ${isSelected ? "text-[#0F3D34]" : "text-[#1E2927]"}`}>
                        {entry.name}
                      </span>
                      {entry.isTrending && (
                        <span className="flex-shrink-0 text-[10px] bg-[#E05A36]/10 text-[#E05A36] px-1.5 py-0.5 rounded-full font-medium">
                          🔥
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-[#556963] truncate block">{entry.province}</span>
                  </div>
                  {/* Votes */}
                  <span className={`text-xs font-bold flex-shrink-0 ${isFlash ? "text-[#E05A36]" : "text-[#0F3D34]"} transition-colors`}>
                    {entry.rawVotes >= 1000 ? `${(entry.rawVotes/1000).toFixed(1)}K` : entry.rawVotes.toLocaleString("vi-VN")}
                  </span>
                </button>
              )
            })}
          </div>
        ) : (
          <div className="space-y-0.5">
            {provinceEntries.map((p) => (
              <div key={p.name}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-[#F4EFE6] transition-colors"
                title={`${p.name}: ${p.destinationCount} điểm đến`}>
                <div className="w-6 text-center">
                  {p.rank <= 3 ? (
                    <span className="text-base">{RANK_EMOJI[p.rank - 1]}</span>
                  ) : (
                    <span className="text-xs font-bold text-[#556963]">{p.rank}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-[#1E2927] truncate">{p.name}</div>
                  <div className="text-[10px] text-[#556963]">{p.destinationCount} điểm đến · {p.region}</div>
                </div>
                <span className="text-xs font-bold text-[#0F3D34]">
                  {p.totalVotes >= 1000 ? `${(p.totalVotes/1000).toFixed(1)}K` : p.totalVotes.toLocaleString("vi-VN")}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer disclaimer */}
      <div className="px-4 py-2 border-t border-[#E0D5C5] bg-[#F9F6F0]">
        <p className="text-[10px] text-[#8B9E8A] text-center italic">
          Chỉ tính phiếu hợp lệ đã qua xác minh
        </p>
      </div>
    </div>
  )
}
