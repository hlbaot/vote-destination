"use client"
import React from "react"

/**
 * TreeIcon – renders an inline SVG tree in one of 4 growth stages.
 * Stage 0 = Mầm, 1 = Cây non, 2 = Cây lớn, 3 = Nở hoa
 * Designed to be composed inside a <symbol>/<use> pattern in VietnamGrowthMap.
 */
export type TreeStage = 0 | 1 | 2 | 3

interface TreeIconProps {
  stage: TreeStage
  size?: number
  isSelected?: boolean
  isNational1st?: boolean
  isProvince1st?: boolean
  className?: string
  dimmed?: boolean
}

const STAGE_COLORS = {
  trunk: ["var(--color-tree-trunk)", "var(--color-tree-trunk)", "var(--color-tree-trunk)", "var(--color-tree-trunk)"],
  canopy: ["var(--color-secondary)", "var(--color-primary)", "var(--color-primary-hover)", "var(--color-primary)"],
  flower: "var(--color-flower-peach)",
  glow: "var(--color-tree-glow)",
} as const

export default function TreeIcon({
  stage, size = 40, isSelected = false, isNational1st = false, isProvince1st = false, className = "", dimmed = false,
}: TreeIconProps) {
  const scale = [0.45, 0.65, 0.85, 1.0][stage]
  const opacity = dimmed ? 0.35 : 1

  return (
    <svg
      width={size} height={size * 1.25}
      viewBox="0 0 40 50"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ opacity, display: "block" }}
      aria-hidden="true"
    >
      {/* Glow ring for national #1 */}
      {isNational1st && (
        <circle cx="20" cy="22" r="18" fill="none" stroke={STAGE_COLORS.glow} strokeWidth="2.5" strokeDasharray="4 2" opacity="0.9" />
      )}
      {/* Province #1 thin golden border */}
      {isProvince1st && !isNational1st && (
        <circle cx="20" cy="22" r="17" fill="none" stroke={STAGE_COLORS.glow} strokeWidth="1.2" opacity="0.8" />
      )}
      {/* Selected glow */}
      {isSelected && (
        <circle cx="20" cy="22" r="19" fill={STAGE_COLORS.glow} opacity="0.25" />
      )}

      {/* Trunk */}
      <rect
        x={20 - scale * 3}
        y={50 - scale * 20}
        width={scale * 6}
        height={scale * 20}
        rx={scale * 2}
        fill={STAGE_COLORS.trunk[stage]}
      />

      {/* Stage 0: seedling sprout */}
      {stage === 0 && (
        <ellipse cx="20" cy="33" rx="5" ry="7" fill={STAGE_COLORS.canopy[0]} />
      )}

      {/* Stage 1: small round canopy */}
      {stage === 1 && (
        <ellipse cx="20" cy="27" rx="8" ry="9" fill={STAGE_COLORS.canopy[1]} />
      )}

      {/* Stage 2: layered full tree */}
      {stage === 2 && (
        <>
          <ellipse cx="20" cy="30" rx="12" ry="8" fill={STAGE_COLORS.canopy[2]} opacity="0.8" />
          <ellipse cx="20" cy="23" rx="10" ry="9" fill={STAGE_COLORS.canopy[2]} />
          <ellipse cx="20" cy="17" rx="7" ry="7" fill="var(--color-primary-hover)" />
        </>
      )}

      {/* Stage 3: blooming tree */}
      {stage === 3 && (
        <>
          <ellipse cx="20" cy="30" rx="13" ry="8" fill={STAGE_COLORS.canopy[3]} opacity="0.8" />
          <ellipse cx="20" cy="22" rx="11" ry="10" fill={STAGE_COLORS.canopy[3]} />
          <ellipse cx="20" cy="14" rx="8" ry="8" fill="var(--color-primary-hover)" />
          {/* Flowers */}
          {[[-5,-4],[5,-4],[0,-10],[-8,-1],[8,-1]].map(([dx,dy],i) => (
            <circle key={i} cx={20+dx} cy={14+dy} r="2.5" fill={STAGE_COLORS.flower} opacity="0.9" />
          ))}
        </>
      )}

      {/* Crown for national #1 */}
      {isNational1st && (
        <g transform="translate(14, 1)">
          <polygon points="6,0 0,8 12,8" fill={STAGE_COLORS.glow} />
          <polygon points="0,8 -2,6 1,4" fill={STAGE_COLORS.glow} />
          <polygon points="12,8 14,6 11,4" fill={STAGE_COLORS.glow} />
        </g>
      )}
    </svg>
  )
}
