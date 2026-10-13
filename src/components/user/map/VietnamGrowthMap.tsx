"use client"
/**
 * VietnamGrowthMap.tsx
 * Interactive SVG map with semantic zoom:
 *  - Level 1 (k < 2.2): Province choropleth
 *  - Level 2 (k ≥ 2.2): Tree layer (68 destinations)
 * d3-zoom is used only for transform calculation; React renders the SVG.
 */
import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import * as d3Zoom from "d3-zoom"
import * as d3Selection from "d3-selection"
import "d3-transition"
import { vietnamSvgPaths } from "@/data/map/vietnamSvgPaths"
import TreeIcon from "./TreeIcon"
import type { MapDestinationNode, ProvinceMapData } from "@/lib/api/mapService"
import { MAP_CONFIG } from "@/lib/api/mapService"
import { VIEWBOX, islandGroups, project } from "@/lib/map/geo"

// ─── Types ────────────────────────────────────────────────────────────────────

interface ZoomTransform { x: number; y: number; k: number }
interface HoverDestinationPreview {
  node: MapDestinationNode
  x: number
  y: number
  votes: number
  stage: 0 | 1 | 2 | 3
}

interface Props {
  destinations: MapDestinationNode[]
  provinces: ProvinceMapData[]
  selectedId: string | null
  hoveredId?: string | null
  onSelectDestination: (id: string) => void
  onDeselectAll: () => void
  onHoverDestination?: (id: string | null) => void
  filterRegion: "all" | "Bắc" | "Trung" | "Tây Nguyên" | "Nam"
  searchQuery: string
  timelineVotes?: Record<string, number>
}

// ─── Map viewBox ──────────────────────────────────────────────────────────────
// Fully framed to display all 63/64 provinces, Đất Mũi Cà Mau, and offshore archipelagos (Hoàng Sa, Trường Sa)
const VIEWBOX_X = VIEWBOX.x
const VIEWBOX_Y = VIEWBOX.y
const VIEWBOX_W = VIEWBOX.width
const VIEWBOX_H = VIEWBOX.height
const ZOOM_MIN = 1
const ZOOM_MAX = 10
const PAN_ENABLE_ZOOM = 1.08

function normName(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/đ/g,"d").replace(/[^a-z0-9]/g,"")
}

const provinceMergeAliases: Record<string, string> = {
  "Hà Giang": "Tuyên Quang",
  "Bắc Kạn": "Thái Nguyên",
  "Bắc Giang": "Bắc Ninh",
  "Hòa Bình": "Phú Thọ",
  "Vĩnh Phúc": "Phú Thọ",
  "Yên Bái": "Lào Cai",
  "Hải Dương": "Hải Phòng",
  "Thái Bình": "Hưng Yên",
  "Hà Nam": "Ninh Bình",
  "Nam Định": "Ninh Bình",
  "Quảng Bình": "Quảng Trị",
  "Thừa Thiên - Huế": "Huế",
  "Quảng Nam": "Đà Nẵng",
  "Quàng Nam": "Đà Nẵng",
  "Kon Tum": "Quảng Ngãi",
  "Bình Định": "Gia Lai",
  "Phú Yên": "Đắk Lắk",
  "Đắk Nông": "Lâm Đồng",
  "Ninh Thuận": "Khánh Hòa",
  "Bình Thuận": "Lâm Đồng",
  "Bình Phước": "Đồng Nai",
  "Bình Dương": "TP. Hồ Chí Minh",
  "Bà Rịa - Vũng Tàu": "TP. Hồ Chí Minh",
  "Bà Rịa-Vũng Tàu": "TP. Hồ Chí Minh",
  "Long An": "Tây Ninh",
  "Tiền Giang": "Đồng Tháp",
  "Bến Tre": "Vĩnh Long",
  "Trà Vinh": "Vĩnh Long",
  "Sóc Trăng": "Cần Thơ",
  "Hậu Giang": "Cần Thơ",
  "Hau Giang": "Cần Thơ",
  "Kiên Giang": "An Giang",
  "Bạc Liêu": "Cà Mau",
  "Ðong Tháp": "Đồng Tháp",
  "Đông Nam Bộ": "Đồng Nai",
  "Đông Bắc": "Tuyên Quang",
  "Đồng Bằng Sông Hồng": "Hưng Yên",
  "Son La": "Sơn La",
  "Lai Chau": "Lai Châu",
  "Ha Noi": "Hà Nội",
  "Ha Tinh": "Hà Tĩnh",
  "Hồ Chí Minh city": "TP. Hồ Chí Minh",
  "Can Tho": "Cần Thơ",
}

function displayProvinceName(svgName: string) {
  return provinceMergeAliases[svgName] ?? svgName
}

function getStageFromVotes(votes: number): 0 | 1 | 2 | 3 {
  const [, t1, t2, t3] = MAP_CONFIG.treeStageThresholds
  if (votes >= t3) return 3
  if (votes >= t2) return 2
  if (votes >= t1) return 1
  return 0
}

function stageName(stage: 0 | 1 | 2 | 3) {
  return ["Mầm", "Cây non", "Cây lớn", "Nở hoa"][stage]
}

function provinceRankColor(province?: ProvinceMapData) {
  if (!province || province.totalVotes <= 0) return MAP_CONFIG.provinceRankColors.empty
  if (province.rank <= 5) return MAP_CONFIG.provinceRankColors.top5
  if (province.rank <= 15) return MAP_CONFIG.provinceRankColors.top15
  if (province.rank <= 25) return MAP_CONFIG.provinceRankColors.top25
  return MAP_CONFIG.provinceRankColors.rest
}

export default function VietnamGrowthMap({
  destinations, provinces, selectedId, hoveredId, onSelectDestination, onDeselectAll,
  onHoverDestination, filterRegion, searchQuery, timelineVotes,
}: Props) {
  const svgRef = useRef<SVGSVGElement>(null)
  const gRef = useRef<SVGGElement>(null)
  const zoomBehaviorRef = useRef<d3Zoom.ZoomBehavior<SVGSVGElement, unknown> | null>(null)
  const [transform, setTransform] = useState<ZoomTransform>({ x: 0, y: 0, k: 1 })
  const [tooltip, setTooltip] = useState<{ x: number; y: number; content: string } | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({ width: 0, height: 0 })
  const [hoveredProvinceId, setHoveredProvinceId] = useState<string | null>(null)
  const [hoverDestination, setHoverDestination] = useState<HoverDestinationPreview | null>(null)
  const [isDebugMode, setIsDebugMode] = useState(false)
  const [provinceLabelPositions, setProvinceLabelPositions] = useState<Record<string, { x: number; y: number }>>({})

  const isLevel2 = transform.k >= MAP_CONFIG.semanticZoomThreshold

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect
        if (width > 0 && height > 0) {
          setDimensions({ width: Math.round(width), height: Math.round(height) })
        }
      }
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") return
    setIsDebugMode(new URLSearchParams(window.location.search).get("debug") === "1")
  }, [])

  // Province vote lookup by name
  const provinceMap = useMemo(() => {
    const m: Record<string, ProvinceMapData> = {}
    for (const p of provinces) m[normName(p.name)] = p
    return m
  }, [provinces])

  // Effective votes (timeline override)
  const effectiveVotes = useCallback((node: MapDestinationNode) => {
    return timelineVotes ? (timelineVotes[node.id] ?? node.rawVotes) : node.rawVotes
  }, [timelineVotes])

  // Filtered destinations
  const filteredDests = useMemo(() => {
    const q = normName(searchQuery.trim())
    return destinations.filter(d => {
      if (filterRegion !== "all" && d.region !== filterRegion) return false
      if (q && !normName(d.name).includes(q) && !normName(d.province).includes(q)) return false
      return true
    })
  }, [destinations, filterRegion, searchQuery])

  const filteredIds = useMemo(() => new Set(filteredDests.map(d => d.id)), [filteredDests])

  useLayoutEffect(() => {
    if (!gRef.current) return

    const groupedBounds = new Map<string, { x1: number; y1: number; x2: number; y2: number }>()
    gRef.current.querySelectorAll<SVGPathElement>("[data-province-label-key]").forEach((path) => {
      const key = path.dataset.provinceLabelKey
      if (!key) return

      const box = path.getBBox()
      const current = groupedBounds.get(key)
      if (current) {
        current.x1 = Math.min(current.x1, box.x)
        current.y1 = Math.min(current.y1, box.y)
        current.x2 = Math.max(current.x2, box.x + box.width)
        current.y2 = Math.max(current.y2, box.y + box.height)
      } else {
        groupedBounds.set(key, {
          x1: box.x,
          y1: box.y,
          x2: box.x + box.width,
          y2: box.y + box.height,
        })
      }
    })

    const nextPositions: Record<string, { x: number; y: number }> = {}
    groupedBounds.forEach((box, key) => {
      nextPositions[key] = {
        x: (box.x1 + box.x2) / 2,
        y: (box.y1 + box.y2) / 2,
      }
    })
    setProvinceLabelPositions(nextPositions)
  }, [])

  // Init d3-zoom
  useLayoutEffect(() => {
    if (!svgRef.current) return
    const zoom = d3Zoom.zoom<SVGSVGElement, unknown>()
      .scaleExtent([ZOOM_MIN, ZOOM_MAX])
      .translateExtent([[VIEWBOX_X - VIEWBOX_W * 0.5, VIEWBOX_Y - VIEWBOX_H * 0.5], [VIEWBOX_X + VIEWBOX_W * 1.5, VIEWBOX_Y + VIEWBOX_H * 1.5]])
      .filter((event: Event) => {
        if (event.type === "wheel" || event.type === "dblclick") return true
        if (event.type === "mousedown" || event.type === "touchstart") {
          const current = svgRef.current ? d3Zoom.zoomTransform(svgRef.current) : d3Zoom.zoomIdentity
          return current.k > PAN_ENABLE_ZOOM
        }
        return true
      })
      .on("zoom", (event: d3Zoom.D3ZoomEvent<SVGSVGElement, unknown>) => {
        const { x, y, k } = event.transform
        if (k <= ZOOM_MIN + 0.001) {
          setTransform({ x: 0, y: 0, k: ZOOM_MIN })
          return
        }
        setTransform({ x, y, k })
      })
    zoomBehaviorRef.current = zoom
    const sel = d3Selection.select(svgRef.current)
    sel.call(zoom)
    return () => { sel.on(".zoom", null) }
  }, [])

  const handleZoomIn = () => {
    if (!svgRef.current || !zoomBehaviorRef.current) return
    d3Selection.select(svgRef.current).transition().duration(300).call(zoomBehaviorRef.current.scaleBy, 1.6)
  }
  const handleZoomOut = () => {
    if (!svgRef.current || !zoomBehaviorRef.current) return
    d3Selection.select(svgRef.current).transition().duration(300).call(zoomBehaviorRef.current.scaleBy, 0.625)
  }
  const handleReset = () => {
    if (!svgRef.current || !zoomBehaviorRef.current) return
    d3Selection.select(svgRef.current).transition().duration(400).call(zoomBehaviorRef.current.transform, d3Zoom.zoomIdentity)
  }
  const handleForceLevel2 = () => {
    if (!svgRef.current || !zoomBehaviorRef.current) return
    d3Selection.select(svgRef.current).transition().duration(400).call(zoomBehaviorRef.current.scaleTo, MAP_CONFIG.semanticZoomThreshold + 0.3)
  }
  const handleForceLevel1 = () => {
    if (!svgRef.current || !zoomBehaviorRef.current) return
    d3Selection.select(svgRef.current).transition().duration(400).call(zoomBehaviorRef.current.transform, d3Zoom.zoomIdentity)
  }

  const handleFullscreen = () => {
    if (!containerRef.current) return
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  // Zoom to a specific destination
  const zoomToDestination = useCallback((node: MapDestinationNode) => {
    if (!svgRef.current || !zoomBehaviorRef.current || !containerRef.current) return
    const k = 4
    const cx = VIEWBOX_X + VIEWBOX_W / 2
    const cy = VIEWBOX_Y + VIEWBOX_H / 2
    const x = cx - node.mapX * k
    const y = cy - node.mapY * k
    d3Selection.select(svgRef.current)
      .transition().duration(600)
      .call(zoomBehaviorRef.current.transform, d3Zoom.zoomIdentity.translate(x, y).scale(k))
  }, [])

  useEffect(() => {
    if (selectedId) {
      const node = destinations.find(d => d.id === selectedId)
      if (node) zoomToDestination(node)
    }
  }, [selectedId, destinations, zoomToDestination])

  // Province hover tooltip
  const handleProvinceHover = (e: React.MouseEvent<SVGPathElement>, provinceName: string) => {
    const displayName = displayProvinceName(provinceName)
    const pData = provinceMap[normName(displayName)]
    const votes = pData?.totalVotes ?? 0
    setTooltip({
      x: e.nativeEvent.offsetX,
      y: e.nativeEvent.offsetY,
      content: `${displayName}\n${votes.toLocaleString("vi-VN")} phiếu${pData ? ` · Hạng ${pData.rank} · ${pData.destinationCount} điểm đến` : ""}`
    })
  }
  const handleProvinceLeave = () => { setTooltip(null); setHoveredProvinceId(null) }

  const updateDestinationHover = useCallback((node: MapDestinationNode, event: React.MouseEvent<SVGGElement>) => {
    const rect = containerRef.current?.getBoundingClientRect()
    const votes = effectiveVotes(node)
    const previewWidth = 248
    const previewHeight = 142
    const rawX = rect ? event.clientX - rect.left : event.nativeEvent.offsetX
    const rawY = rect ? event.clientY - rect.top : event.nativeEvent.offsetY
    const rightSideFits = !rect || rawX + previewWidth + 22 < rect.width
    const x = rightSideFits ? rawX + 16 : rawX - previewWidth - 16
    const maxY = rect ? Math.max(12, rect.height - previewHeight - 12) : rawY

    setHoverDestination({
      node,
      x: Math.max(12, x),
      y: Math.min(Math.max(12, rawY - 52), maxY),
      votes,
      stage: getStageFromVotes(votes),
    })
  }, [effectiveVotes])

  const updateDestinationFocus = useCallback((node: MapDestinationNode) => {
    const rect = containerRef.current?.getBoundingClientRect()
    const votes = effectiveVotes(node)
    const projectedX = node.mapX * transform.k + transform.x
    const projectedY = node.mapY * transform.k + transform.y
    const previewWidth = 248
    const previewHeight = 142
    const rightSideFits = !rect || projectedX + previewWidth + 22 < rect.width
    const x = rightSideFits ? projectedX + 16 : projectedX - previewWidth - 16
    const maxY = rect ? Math.max(12, rect.height - previewHeight - 12) : projectedY

    setHoverDestination({
      node,
      x: Math.max(12, x),
      y: Math.min(Math.max(12, projectedY - 62), maxY),
      votes,
      stage: getStageFromVotes(votes),
    })
  }, [effectiveVotes, transform.k, transform.x, transform.y])

  const gTransform = `translate(${transform.x},${transform.y}) scale(${transform.k})`

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full bg-linear-to-br from-[#F4FBF0] to-[#E3F4FB] rounded-2xl overflow-hidden select-none"
      style={{ overscrollBehavior: "contain" }}
      onWheel={(e) => e.stopPropagation()}
    >
      {/* Map controls */}
      <div className="absolute top-3 left-3 z-20 flex flex-col gap-1.5">
        {/* Level toggle */}
        <div className="flex rounded-xl overflow-hidden shadow-md border border-(--color-border)">
          <button onClick={handleForceLevel1}
            className={`px-3 py-1.5 text-xs font-semibold transition-colors duration-200 ${!isLevel2 ? "bg-(--color-primary) text-white" : "bg-white/80 text-(--color-primary-dark) hover:bg-(--color-surface-tint)"}`}
            title="Xem theo tỉnh/thành">Tỉnh</button>
          <button onClick={handleForceLevel2}
            className={`px-3 py-1.5 text-xs font-semibold transition-colors duration-200 ${isLevel2 ? "bg-(--color-primary) text-white" : "bg-white/80 text-(--color-primary-dark) hover:bg-(--color-surface-tint)"}`}
            title="Xem theo cây điểm đến">Cây</button>
        </div>
        {/* Zoom buttons */}
        <div className="flex flex-col rounded-xl overflow-hidden shadow-md border border-(--color-border)">
          <button onClick={handleZoomIn} className="bg-white/90 hover:bg-(--color-surface-tint) text-(--color-primary-dark) p-2 text-sm font-bold leading-none transition-colors" title="Phóng to">+</button>
          <div className="h-px bg-(--color-border)" />
          <button onClick={handleZoomOut} className="bg-white/90 hover:bg-(--color-surface-tint) text-(--color-primary-dark) p-2 text-sm font-bold leading-none transition-colors" title="Thu nhỏ">−</button>
        </div>
        <button onClick={handleReset} className="bg-white/90 hover:bg-(--color-surface-tint) text-(--color-primary-dark) rounded-xl shadow-md border border-(--color-border) p-2 text-xs font-medium transition-colors" title="Đặt lại">↺</button>
        <button onClick={handleFullscreen} className="bg-white/90 hover:bg-(--color-surface-tint) text-(--color-primary-dark) rounded-xl shadow-md border border-(--color-border) p-2 text-xs transition-colors" title="Toàn màn hình">
          {isFullscreen ? "⊡" : "⊞"}
        </button>
      </div>

      {/* Legend */}
      <div className="absolute bottom-3 left-3 z-20 bg-white/85 backdrop-blur-sm rounded-xl px-3 py-2 shadow-md border border-(--color-border) text-xs text-(--color-primary-dark)">
        <div className="font-semibold mb-1.5 text-[11px] uppercase tracking-wide">Chú giải</div>
        <div className="flex items-center gap-1.5 mb-1">
          <div className="flex gap-0.5">
            {[
              MAP_CONFIG.provinceRankColors.rest,
              MAP_CONFIG.provinceRankColors.top25,
              MAP_CONFIG.provinceRankColors.top15,
              MAP_CONFIG.provinceRankColors.top5,
            ].map((c,i) => (
              <div key={i} style={{background:c}} className="w-4 h-3 rounded-sm" />
            ))}
          </div>
          <span className="text-[10px] text-(--color-text-muted)">Hạng thấp → Top 1-5</span>
        </div>
        {isLevel2 && (
          <div className="flex items-center gap-2 flex-wrap mt-1">
            {["Mầm","Cây non","Cây lớn","Nở hoa"].map((label, i) => (
              <div key={i} className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full" style={{background:["var(--color-map-rank-top25)","var(--color-secondary)","var(--color-primary)","var(--color-primary-hover)"][i]}} />
                <span className="text-[10px]">{label}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SVG */}
      <svg ref={svgRef} width="100%" height="100%" viewBox={`${VIEWBOX_X} ${VIEWBOX_Y} ${VIEWBOX_W} ${VIEWBOX_H}`}
        preserveAspectRatio="xMidYMid meet"
        style={{ cursor: transform.k > PAN_ENABLE_ZOOM ? "grab" : "default", touchAction: transform.k > PAN_ENABLE_ZOOM ? "none" : "pan-y" }}
        onClick={() => { if (!selectedId) return; onDeselectAll() }}>
        <g ref={gRef} transform={gTransform}>
          {/* Province layer */}
          <g style={{ opacity: isLevel2 ? 0.35 : 1, transition: "opacity 0.5s ease" }}>
            {vietnamSvgPaths.map((path) => {
              const displayName = displayProvinceName(path.name)
              const pData = provinceMap[normName(displayName)]
              const voteCount = pData?.totalVotes ?? 0
              const fillColor = provinceRankColor(pData)
              const isFiltered = filterRegion !== "all"
              const dim = isFiltered && (() => {
                return pData && pData.region !== filterRegion
              })()
              return (
                <path
                  key={path.id}
                  d={path.d}
                  data-province-label-key={normName(displayName)}
                  fill={fillColor}
                  stroke="#FFFFFF"
                  strokeWidth={0.6 / transform.k}
                  opacity={dim ? 0.3 : 1}
                  className="transition-opacity duration-300 cursor-pointer"
                  onMouseMove={(e) => handleProvinceHover(e, path.name)}
                  onMouseLeave={handleProvinceLeave}
                  onMouseEnter={() => setHoveredProvinceId(path.id)}
                  style={{ filter: hoveredProvinceId === path.id && !isLevel2 ? "brightness(1.12)" : undefined }}
                  role="button"
                  aria-label={`${displayName} – ${voteCount.toLocaleString("vi-VN")} phiếu${pData ? `, hạng ${pData.rank}, ${pData.destinationCount} điểm đến` : ""}`}
                />
              )
            })}
            {!isLevel2 && transform.k <= 1.45 && provinces.map((p) => (
              p.rank <= 18 ? (
                <text
                  key={`label-${p.name}`}
                  x={provinceLabelPositions[normName(p.name)]?.x ?? p.labelX}
                  y={provinceLabelPositions[normName(p.name)]?.y ?? p.labelY}
                  textAnchor="middle"
                  fontSize={p.rank <= 10 ? 9 : 7}
                  fontWeight={p.rank <= 10 ? 700 : 600}
                  fill="var(--color-primary-dark)"
                  paintOrder="stroke"
                  stroke="var(--color-bg)"
                  strokeWidth={3 / transform.k}
                  style={{ pointerEvents: "none" }}
                >
                  {p.name}
                </text>
              ) : null
            ))}

            <g aria-label="Quần đảo Hoàng Sa và Trường Sa thuộc Việt Nam" style={{ pointerEvents: "none" }}>
              {islandGroups.map((group) => {
                const [labelX, labelY] = project(group.labelAt[0], group.labelAt[1])
                return (
                  <g key={group.id}>
                    {group.points.map(([lng, lat], index) => {
                      const [x, y] = project(lng, lat)
                      return <circle key={`${group.id}-${index}`} cx={x} cy={y} r={2.2 / transform.k} fill="var(--color-primary)" stroke="var(--color-bg)" strokeWidth={0.8 / transform.k} />
                    })}
                    <text x={labelX} y={labelY} textAnchor="middle" fontSize={8 / transform.k} fontWeight={800} fill="var(--color-primary-dark)" paintOrder="stroke" stroke="var(--color-bg)" strokeWidth={2.4 / transform.k}>{group.label}</text>
                    <text x={labelX} y={labelY + 10 / transform.k} textAnchor="middle" fontSize={6.5 / transform.k} fontWeight={700} fill="var(--color-primary-dark)" paintOrder="stroke" stroke="var(--color-bg)" strokeWidth={2 / transform.k}>{group.sublabel}</text>
                  </g>
                )
              })}
            </g>
          </g>

          {/* Tree layer */}
          {isLevel2 && (
            <g style={{ opacity: 1, transition: "opacity 0.5s ease" }}>
              {filteredDests.map((node) => {
                const votes = effectiveVotes(node)
                const stageCur = getStageFromVotes(votes)
                const isSelected = selectedId === node.id
                const isHovered = hoverDestination?.node.id === node.id || hoveredId === node.id
                const isDimmed = selectedId !== null && !isSelected
                const tSize = [18, 24, 30, 38][stageCur]
                const markerScale = 1 / transform.k
                return (
                  <g
                    key={node.id}
                    transform={`translate(${node.mapX}, ${node.mapY}) scale(${markerScale}) translate(${-tSize / 2}, ${-tSize * 1.18})`}
                    style={{
                      cursor: "pointer",
                      transformBox: "fill-box",
                      transformOrigin: "center bottom",
                      transition: "filter 180ms ease, opacity 180ms ease",
                      filter: isHovered ? "drop-shadow(0 4px 8px rgba(15,61,52,0.28))" : undefined,
                    }}
                    onMouseEnter={(e) => {
                      updateDestinationHover(node, e)
                      onHoverDestination?.(node.id)
                    }}
                    onMouseMove={(e) => updateDestinationHover(node, e)}
                    onMouseLeave={() => {
                      setHoverDestination((current) => current?.node.id === node.id ? null : current)
                      onHoverDestination?.(null)
                    }}
                    onFocus={() => {
                      updateDestinationFocus(node)
                      onHoverDestination?.(node.id)
                    }}
                    onBlur={() => {
                      setHoverDestination((current) => current?.node.id === node.id ? null : current)
                      onHoverDestination?.(null)
                    }}
                    onClick={(e) => { e.stopPropagation(); onSelectDestination(node.id) }}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === "Enter" && onSelectDestination(node.id)}
                    aria-label={`${node.name}, ${node.province}, ${votes.toLocaleString("vi-VN")} phiếu, ${stageName(stageCur)}`}
                  >
                    <TreeIcon stage={stageCur} size={isHovered ? tSize + 6 : tSize} isSelected={isSelected || isHovered}
                      isNational1st={node.isNational1st} isProvince1st={node.isProvince1st} dimmed={isDimmed} />
                    {/* Vote count label — only for high-vote trees */}
                    {votes >= MAP_CONFIG.treeStageThresholds[2] && !isDimmed && transform.k >= 2.8 && (
                      <text x={tSize/2} y={tSize + 6} textAnchor="middle"
                        fontSize={11} fill="var(--color-primary-dark)" fontWeight="600"
                        style={{ pointerEvents: "none" }}>
                        {votes >= 1000 ? `${(votes/1000).toFixed(1)}K` : votes}
                      </text>
                    )}
                  </g>
                )
              })}
            </g>
          )}
          {isDebugMode && (
            <g aria-label="Debug destination coordinates" pointerEvents="none">
              {filteredDests.map((node) => (
                <circle
                  key={`debug-${node.id}`}
                  cx={node.mapX}
                  cy={node.mapY}
                  r={3 / transform.k}
                  fill="#E10000"
                  stroke="#FFFFFF"
                  strokeWidth={1 / transform.k}
                />
              ))}
            </g>
          )}
        </g>
      </svg>

      {/* Tooltip */}
      {tooltip && !isLevel2 && (
        <div
          className="absolute z-30 bg-(--color-primary) text-white text-xs rounded-lg px-3 py-2 pointer-events-none shadow-xl whitespace-pre"
          style={{ left: tooltip.x + 12, top: tooltip.y - 10, maxWidth: 180 }}>
          {tooltip.content}
        </div>
      )}

      {/* Destination hover preview */}
      {hoverDestination && isLevel2 && (
        <div
          className="absolute z-40 w-62 overflow-hidden rounded-2xl border border-(--color-border) bg-(--color-surface)/95 text-(--color-text) shadow-2xl backdrop-blur-md pointer-events-none"
          style={{
            left: hoverDestination.x,
            top: hoverDestination.y,
            animation: "mapPreviewIn 160ms ease-out",
          }}
          role="status"
          aria-live="polite"
        >
          <div className="flex gap-3 p-2.5">
            <div className="relative h-22 w-23 shrink-0 overflow-hidden rounded-xl bg-linear-to-br from-(--color-surface-tint) to-(--color-primary)">
              {hoverDestination.node.thumbnail ? (
                <img
                  src={hoverDestination.node.thumbnail}
                  alt={hoverDestination.node.name}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.72)" strokeWidth="1.7">
                    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
                    <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
                  </svg>
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1 py-0.5">
              <div className="mb-1 flex items-center gap-1.5">
                <span className="rounded-full bg-(--color-accent)/15 px-2 py-0.5 text-[10px] font-bold text-(--color-primary-dark)">
                  {hoverDestination.node.tag}
                </span>
                <span className="text-[10px] font-semibold text-(--color-primary)">
                  {stageName(hoverDestination.stage)}
                </span>
              </div>
              <div className="truncate font-serif text-base font-bold leading-tight text-(--color-primary-dark)">
                {hoverDestination.node.name}
              </div>
              <div className="mt-0.5 truncate text-xs text-(--color-text-muted)">
                {hoverDestination.node.province} · {hoverDestination.node.category}
              </div>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-lg font-black text-(--color-primary-dark)">
                  {hoverDestination.votes.toLocaleString("vi-VN")}
                </span>
                <span className="text-[11px] text-(--color-text-muted)">phiếu</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Zoom level badge */}
      <div className="absolute top-3 right-3 z-10 bg-white/70 backdrop-blur-sm rounded-lg px-2 py-1 text-[10px] text-(--color-text-muted) font-mono border border-(--color-border)">
        {transform.k.toFixed(1)}×
      </div>
      {isDebugMode && (
        <div className={`absolute bottom-3 right-3 z-10 max-w-52.5 rounded-xl border border-(--color-border) bg-(--color-bg)/90 px-3 py-2 text-[10px] leading-snug text-(--color-text-muted) shadow-sm transition-all duration-200 ${
          dimensions.height > 0 && dimensions.height < 460 ? "hidden" : "block"
        }`}>
          Vị trí cây/đảo đang dùng dữ liệu mock tối ưu giao diện; cần duyệt GIS trước khi nối backend chính thức.
        </div>
      )}
      <style>{`
        @keyframes mapPreviewIn {
          from { opacity: 0; transform: translateY(4px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @media (prefers-reduced-motion: reduce) {
          .map-preview, .map-preview * { animation: none !important; transition: none !important; }
        }
      `}</style>
    </div>
  )
}
