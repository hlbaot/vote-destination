"use client"
/**
 * DestinationDock – side panel shown when a tree/destination is selected on the map.
 * Displays image, category, vote count, progress bar, action buttons.
 */
import React from "react"
import Image from "next/image"
import type { MapDestinationNode } from "@/lib/api/mapService"
import { MAP_CONFIG } from "@/lib/api/mapService"
import TreeIcon from "./TreeIcon"

interface Props {
  node: MapDestinationNode | null
  votedToday: boolean
  hasVotesLeft: boolean
  onVote: (id: string) => void
  onClose: () => void
  onViewProfile: (id: string) => void
  onShare: (id: string) => void
  currentVotes?: number // for timeline override
}

export default function DestinationDock({ node, votedToday, hasVotesLeft, onVote, onClose, onViewProfile, onShare, currentVotes }: Props) {
  if (!node) return null

  const votes = currentVotes ?? node.rawVotes
  const [, t1, t2, t3] = MAP_CONFIG.treeStageThresholds
  const stages = [t1, t2, t3, t3 * 2]
  const nextThreshold = stages.find(s => votes < s) ?? t3
  const progressPct = Math.min(100, (votes / nextThreshold) * 100)
  const remaining = Math.max(0, nextThreshold - votes)

  const stageName = ["Mầm", "Cây non", "Cây lớn", "Nở hoa"][node.stage]
  const stageColor = ["#7BAD69", "#4A8A3F", "#2E8B28", "#E05A36"][node.stage]

  return (
    <div className="flex flex-col h-full bg-[#F4EFE6] border-l border-[#E0D5C5] overflow-hidden">
      {/* Image */}
      <div className="relative h-44 flex-shrink-0 bg-gradient-to-br from-[#2E7D32] to-[#1B5E20]">
        {node.thumbnail ? (
          <Image src={node.thumbnail} alt={node.name} fill className="object-cover" sizes="340px" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5">
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </div>
        )}
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        {/* Category badge */}
        <div className="absolute top-3 left-3">
          <span className="bg-[#E05A36]/90 text-white text-[11px] font-semibold px-2.5 py-1 rounded-full backdrop-blur-sm">
            {node.tag}
          </span>
        </div>
        {/* Close button */}
        <button onClick={onClose}
          className="absolute top-3 right-3 w-7 h-7 bg-black/40 hover:bg-black/60 rounded-full flex items-center justify-center text-white transition-colors"
          aria-label="Đóng panel">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
        {/* Tree stage badge */}
        <div className="absolute bottom-2 right-3 flex items-center gap-1.5 bg-black/40 backdrop-blur-sm rounded-full px-2 py-1">
          <TreeIcon stage={node.stage} size={16} />
          <span className="text-white text-[11px] font-semibold">{stageName}</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Name & Province */}
        <div>
          <h3 className="font-serif text-[#0F3D34] text-xl font-bold leading-snug">{node.name}</h3>
          <p className="text-[#556963] text-sm mt-0.5 flex items-center gap-1.5">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
            </svg>
            {node.province}
          </p>
        </div>

        {/* Vote count */}
        <div className="bg-white/70 rounded-xl p-3 border border-[#E0D5C5]">
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-bold text-[#0F3D34]">{votes.toLocaleString("vi-VN")}</span>
            <span className="text-sm text-[#556963]">phiếu bình chọn</span>
          </div>
          {/* Progress bar */}
          <div className="mt-2.5">
            <div className="flex justify-between text-[11px] text-[#556963] mb-1.5">
              <span>Còn {remaining.toLocaleString("vi-VN")} phiếu để {node.stage < 3 ? "lên giai đoạn tiếp" : "duy trì nở hoa"}</span>
              <span className="font-semibold" style={{ color: stageColor }}>{progressPct.toFixed(0)}%</span>
            </div>
            <div className="h-2 bg-[#E0D5C5] rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-700"
                style={{ width: `${progressPct}%`, background: stageColor }} />
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="space-y-2">
          <button
            onClick={() => !votedToday && hasVotesLeft && onVote(node.id)}
            disabled={votedToday || !hasVotesLeft}
            className={`w-full py-3 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2
              ${votedToday ? "bg-green-100 text-green-700 border border-green-300 cursor-default"
                : !hasVotesLeft ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-[#E05A36] hover:bg-[#C44A28] text-white shadow-md hover:shadow-lg active:scale-[0.98]"}`}>
            {votedToday ? (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="m5 12 4 4L19 6"/>
                </svg>
                Đã bình chọn hôm nay
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M20.8 5.8a5.5 5.5 0 0 0-7.8 0L12 6.9l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 22l8.8-8.4a5.5 5.5 0 0 0 0-7.8Z"/>
                </svg>
                Bình chọn ngay
              </>
            )}
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => onViewProfile(node.id)}
              className="py-2.5 rounded-xl border border-[#0F3D34] text-[#0F3D34] text-sm font-medium hover:bg-[#0F3D34] hover:text-white transition-all duration-200">
              Xem hồ sơ
            </button>
            <button onClick={() => onShare(node.id)}
              className="py-2.5 rounded-xl border border-[#E0D5C5] text-[#556963] text-sm font-medium hover:bg-[#E8F5E4] transition-all duration-200 flex items-center justify-center gap-1.5">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
              </svg>
              Chia sẻ
            </button>
          </div>
        </div>

        {/* Category info */}
        <div className="text-xs text-[#556963] bg-[#EBE6DC]/60 rounded-lg px-3 py-2 border border-[#E0D5C5]">
          <span className="font-medium text-[#0F3D34]">Loại hình:</span> {node.category}
        </div>
      </div>
    </div>
  )
}
