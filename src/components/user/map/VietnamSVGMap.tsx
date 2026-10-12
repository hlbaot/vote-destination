"use client"

import React, { useState, useRef, useMemo } from "react"
import { vietnamSvgPaths, SvgProvincePath } from "@/data/map/vietnamSvgPaths"
import { vietnamProvinces, ProvinceData } from "@/data/provinces"
import { provinceImages } from "@/data/provinceImages"
import Icon from "@/components/shared/Icon"

// Helper chuẩn hóa chuỗi tiếng Việt
function normalizeName(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]/g, "")
}

export interface SelectedProvincePayload {
  id: string
  name: string
  votes: number
  region: string
  featuredDestination: string
  image: string
  tag: string
}

export default function VietnamSVGMap({
  selectedProvinceName,
  onSelectProvince,
  onDirectVote,
  activeRegion,
  searchQuery,
  voterPhone,
  voterName,
}: {
  selectedProvinceName?: string
  onSelectProvince: (prov: SelectedProvincePayload) => void
  onDirectVote?: (prov: SelectedProvincePayload) => void
  activeRegion: "all" | "Bắc" | "Trung" | "Tây Nguyên" | "Nam"
  searchQuery?: string
  voterPhone?: string
  voterName?: string
}) {
  const [hoveredPath, setHoveredPath] = useState<SvgProvincePath | null>(null)
  const [isHoveringCard, setIsHoveringCard] = useState(false)
  const leaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  })
  const [pinnedProvince, setPinnedProvince] =
    useState<SelectedProvincePayload | null>(null)
  const [zoomLevel, setZoomLevel] = useState<number>(1)
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  })
  const [isDragging, setIsDragging] = useState(false)
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 })
  const mapContainerRef = useRef<HTMLDivElement>(null)

  // Lookup provinces
  const provinceLookup = useMemo(() => {
    const map = new Map<string, ProvinceData>()
    vietnamProvinces.forEach((p) => {
      map.set(normalizeName(p.name), p)
    })
    return map
  }, [])

  // Lấy dữ liệu chi tiết kèm ảnh của tỉnh thành
  const getProvinceDetails = (pathName: string): SelectedProvincePayload => {
    const key = normalizeName(pathName)

    // 1. Tìm trong provinces dataset
    let found = provinceLookup.get(key)
    if (!found) {
      for (const [k, v] of provinceLookup.entries()) {
        if (key.includes(k) || k.includes(key)) {
          found = v
          break
        }
      }
    }

    const standardName = found ? found.name : pathName

    // 2. Tìm ảnh trong provinceImages
    let imgData = provinceImages[standardName]
    if (!imgData) {
      // Fuzzy match in provinceImages
      for (const [pName, data] of Object.entries(provinceImages)) {
        if (
          normalizeName(pName).includes(key) ||
          key.includes(normalizeName(pName))
        ) {
          imgData = data
          break
        }
      }
    }

    const defaultImg =
      "https://images.unsplash.com/photo-1528127269322-539801943592?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=80&w=800"

    return {
      id: found ? found.id : "p-custom",
      name: standardName,
      region: found ? found.region : "Bắc",
      votes: found ? found.votes : 31200,
      featuredDestination:
        (imgData && imgData.destination) ||
        (found && found.featuredDestination) ||
        `Kỳ quan ${standardName}`,
      image: (imgData && imgData.image) || defaultImg,
      tag:
        (imgData && imgData.tag) || (found && found.tag) || "Cảnh quan kỳ vĩ",
    }
  }

  const handleMouseMove = (e: React.MouseEvent, path: SvgProvincePath) => {
    if (leaveTimerRef.current) {
      clearTimeout(leaveTimerRef.current)
      leaveTimerRef.current = null
    }
    if (mapContainerRef.current) {
      const rect = mapContainerRef.current.getBoundingClientRect()
      setTooltipPos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      })
    }
    setHoveredPath(path)
  }

  const handleMouseLeave = () => {
    leaveTimerRef.current = setTimeout(() => {
      if (!isHoveringCard) {
        setHoveredPath(null)
      }
    }, 120)
  }

  const handleClickPath = (path: SvgProvincePath) => {
    const details = getProvinceDetails(path.name)
    setPinnedProvince(details)
    onSelectProvince(details)
  }

  // Zoom controls
  const handleZoomIn = () => setZoomLevel((z) => Math.min(2.5, z + 0.25))
  const handleZoomOut = () => setZoomLevel((z) => Math.max(0.8, z - 0.25))
  const handleResetZoom = () => {
    setZoomLevel(1)
    setPanOffset({ x: 0, y: 0 })
    setPinnedProvince(null)
  }

  // Pan controls
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) {
      setIsDragging(true)
      dragStartRef.current = {
        x: e.clientX - panOffset.x,
        y: e.clientY - panOffset.y,
      }
    }
  }

  const handleContainerMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPanOffset({
        x: e.clientX - dragStartRef.current.x,
        y: e.clientY - dragStartRef.current.y,
      })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const normalizedSelected = selectedProvinceName
    ? normalizeName(selectedProvinceName)
    : ""

  // Data for active hover card
  const activeHoverData = hoveredPath
    ? getProvinceDetails(hoveredPath.name)
    : null

  // Tính toán vị trí tooltip thông minh tránh bị tràn màn hình
  const calculateCardPosition = () => {
    const containerW = 1000
    const containerH = 750
    const cardW = 290
    const cardH = 340

    let posX = tooltipPos.x + 22
    let posY = tooltipPos.y - 120

    if (posX + cardW > containerW - 20) {
      posX = tooltipPos.x - cardW - 22
    }
    if (posY + cardH > containerH - 20) {
      posY = containerH - cardH - 20
    }
    if (posY < 20) {
      posY = 20
    }

    return { x: Math.max(16, posX), y: posY }
  }

  const cardPos = calculateCardPosition()

  return (
    <div
      ref={mapContainerRef}
      className={`vietnam-svg-map-wrapper ${isDragging ? "dragging" : ""}`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleContainerMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* SVG Canvas Map */}
      <div
        className="svg-zoom-container"
        style={{
          transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`,
          transformOrigin: "center center",
          transition: isDragging ? "none" : "transform 0.25s ease-out",
        }}
      >
        <svg
          viewBox="0 0 1000 1000"
          className="vietnam-svg-element"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="seaGrid"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke="rgba(255, 255, 255, 0.04)"
                strokeWidth="1"
              />
            </pattern>
          </defs>

          <rect width="1000" height="1000" fill="url(#seaGrid)" />

          {/* 63 PROVINCES SVG PATHS */}
          <g id="vietnam-provinces" className="provinces-group">
            {vietnamSvgPaths.map((path) => {
              const details = getProvinceDetails(path.name)
              const normName = normalizeName(path.name)

              const isSelected =
                normalizedSelected &&
                (normName.includes(normalizedSelected) ||
                  normalizedSelected.includes(normName))

              const isRegionMatch =
                activeRegion === "all" || details.region === activeRegion
              const isSearchMatch =
                !searchQuery ||
                normName.includes(normalizeName(searchQuery)) ||
                normalizeName(details.featuredDestination).includes(
                  normalizeName(searchQuery),
                )

              const isDimmed = !isRegionMatch || !isSearchMatch

              return (
                <path
                  key={path.id}
                  id={path.id}
                  d={path.d}
                  data-name={path.name}
                  className={`province-svg-path ${
                    isSelected ? "is-selected" : ""
                  } ${isDimmed ? "is-dimmed" : ""}`}
                  onMouseMove={(e) => handleMouseMove(e, path)}
                  onMouseLeave={handleMouseLeave}
                  onClick={() => handleClickPath(path)}
                />
              )
            })}
          </g>

          {/* QUẦN ĐẢO HOÀNG SA */}
          <g
            className="island-group hoang-sa-group"
            transform="translate(680, 420)"
            onClick={() => {
              const d = getProvinceDetails("Quần đảo Hoàng Sa")
              setPinnedProvince(d)
              onSelectProvince(d)
            }}
          >
            <rect
              x="-10"
              y="-10"
              width="150"
              height="85"
              rx="6"
              className="island-box-bg"
            />
            <circle cx="20" cy="18" r="4.5" className="island-dot" />
            <circle cx="36" cy="14" r="3.5" className="island-dot" />
            <circle cx="48" cy="24" r="3" className="island-dot" />
            <circle cx="32" cy="32" r="3.5" className="island-dot" />
            <circle cx="58" cy="18" r="4" className="island-dot" />
            <text x="14" y="58" className="island-label-title">
              QUẦN ĐẢO HOÀNG SA
            </text>
            <text x="14" y="70" className="island-label-sub">
              (TP. Đà Nẵng)
            </text>
          </g>

          {/* QUẦN ĐẢO TRƯỜNG SA */}
          <g
            className="island-group truong-sa-group"
            transform="translate(710, 680)"
            onClick={() => {
              const d = getProvinceDetails("Quần đảo Trường Sa")
              setPinnedProvince(d)
              onSelectProvince(d)
            }}
          >
            <rect
              x="-10"
              y="-10"
              width="165"
              height="95"
              rx="6"
              className="island-box-bg"
            />
            <circle cx="25" cy="18" r="4.5" className="island-dot" />
            <circle cx="42" cy="14" r="3.5" className="island-dot" />
            <circle cx="60" cy="28" r="4.5" className="island-dot" />
            <circle cx="35" cy="36" r="3.5" className="island-dot" />
            <circle cx="55" cy="42" r="3" className="island-dot" />
            <circle cx="75" cy="34" r="3.5" className="island-dot" />
            <text x="14" y="66" className="island-label-title">
              QUẦN ĐẢO TRƯỜNG SA
            </text>
            <text x="14" y="78" className="island-label-sub">
              (Khánh Hòa)
            </text>
          </g>

          {/* ĐẢO PHÚ QUỐC */}
          <g
            className="island-label-standalone"
            transform="translate(420, 840)"
            onClick={() => {
              const d = getProvinceDetails("Kiên Giang")
              setPinnedProvince(d)
              onSelectProvince(d)
            }}
          >
            <circle cx="0" cy="0" r="5" className="island-dot-active" />
            <text x="10" y="4" className="standalone-text">
              ĐẢO PHÚ QUỐC
            </text>
          </g>

          {/* CÔN ĐẢO */}
          <g
            className="island-label-standalone"
            transform="translate(580, 895)"
            onClick={() => {
              const d = getProvinceDetails("Bà Rịa - Vũng Tàu")
              setPinnedProvince(d)
              onSelectProvince(d)
            }}
          >
            <circle cx="0" cy="0" r="4.5" className="island-dot-active" />
            <text x="10" y="4" className="standalone-text">
              CÔN ĐẢO
            </text>
          </g>

          {/* LA BÀN HƯỚNG BẮC */}
          <g className="compass-rose" transform="translate(100, 100)">
            <circle cx="0" cy="0" r="32" className="compass-bg" />
            <path d="M 0 -24 L 5 -5 L 0 0 L -5 -5 Z" fill="var(--color-accent)" />
            <path
              d="M 0 24 L 5 5 L 0 0 L -5 5 Z"
              fill="rgba(255,255,255,0.4)"
            />
            <path
              d="M -24 0 L -5 -5 L 0 0 L -5 5 Z"
              fill="rgba(255,255,255,0.3)"
            />
            <path
              d="M 24 0 L 5 -5 L 0 0 L 5 5 Z"
              fill="rgba(255,255,255,0.3)"
            />
            <text x="0" y="-28" textAnchor="middle" className="compass-letter">
              N
            </text>
          </g>
        </svg>
      </div>

      {/* =========================================================================
          RICH FLOATING PREVIEW CARD ON HOVER (HIỆN HÌNH ẢNH TRỰC TIẾP TRÊN BẢN ĐỒ)
         ========================================================================= */}
      {activeHoverData && (
        <div
          className="map-rich-hover-card"
          style={{
            left: `${cardPos.x}px`,
            top: `${cardPos.y}px`,
          }}
          onMouseEnter={() => {
            if (leaveTimerRef.current) {
              clearTimeout(leaveTimerRef.current)
              leaveTimerRef.current = null
            }
            setIsHoveringCard(true)
          }}
          onMouseLeave={() => {
            setIsHoveringCard(false)
            setHoveredPath(null)
          }}
        >
          {/* Ảnh danh thắng của tỉnh */}
          <div className="card-thumb-banner">
            <img
              src={activeHoverData.image}
              alt={activeHoverData.featuredDestination}
            />
            <span className="card-tag-pill">{activeHoverData.tag}</span>
            <span className="card-region-pill">
              Miền {activeHoverData.region}
            </span>
          </div>

          {/* Thông tin chi tiết */}
          <div className="card-body-content">
            <div className="card-title-group">
              <strong className="card-destination-name">
                {activeHoverData.featuredDestination}
              </strong>
              <p className="card-place-name">
                <Icon name="map" size={13} /> {activeHoverData.name}
              </p>
            </div>

            <div className="card-votes-line">
              <strong>{activeHoverData.votes.toLocaleString("vi-VN")}</strong>
              <span>lượt bình chọn</span>
            </div>

            {/* Nút bình chọn trực tiếp trên thẻ */}
            <button
              type="button"
              className="card-vote-cta-btn"
              onClick={() => {
                onSelectProvince(activeHoverData)
                if (onDirectVote) onDirectVote(activeHoverData)
              }}
            >
              Bình chọn ngay <Icon name="arrow" size={15} />
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          PINNED CONFIRMATION CARD ON CLICK (KHI ĐÃ NHẤP CHỌN TỈNH THÀNH)
         ========================================================================= */}
      {pinnedProvince && (
        <div className="map-pinned-overlay-card">
          <div className="pinned-header">
            <span className="eyebrow">ĐIỂM ĐẾN ĐÃ CHỌN BÌNH CHỌN</span>
            <button
              type="button"
              className="close-pinned-btn"
              onClick={() => setPinnedProvince(null)}
              aria-label="Đóng"
            >
              <Icon name="x" size={16} />
            </button>
          </div>

          <div className="pinned-content-row">
            <img
              src={pinnedProvince.image}
              alt={pinnedProvince.featuredDestination}
            />
            <div className="pinned-meta">
              <span className="pinned-tag">{pinnedProvince.tag}</span>
              <h3>{pinnedProvince.featuredDestination}</h3>
              <p>
                <Icon name="map" size={13} /> {pinnedProvince.name} (Miền{" "}
                {pinnedProvince.region})
              </p>
              <div className="pinned-votes">
                <strong>{pinnedProvince.votes.toLocaleString("vi-VN")}</strong>
                <span>lượt bình chọn</span>
              </div>
            </div>
          </div>

          {voterPhone && (
            <div className="pinned-voter-info">
              <span>Cử tri bình chọn:</span>
              <strong>
                {voterName ? `${voterName} (${voterPhone})` : voterPhone}
              </strong>
            </div>
          )}

          <button
            type="button"
            className="btn btn-primary w-full pinned-submit-btn"
            onClick={() => {
              if (onDirectVote) onDirectVote(pinnedProvince)
            }}
          >
            Xác nhận gửi phiếu bình chọn cho{" "}
            {pinnedProvince.featuredDestination} <Icon name="arrow" size={17} />
          </button>
        </div>
      )}

      {/* Map Interactive Toolbar */}
      <div className="svg-map-toolbar">
        <div className="toolbar-group">
          <button
            type="button"
            className="toolbar-btn"
            onClick={handleZoomIn}
            title="Phóng to"
          >
            +
          </button>
          <button
            type="button"
            className="toolbar-btn"
            onClick={handleZoomOut}
            title="Thu nhỏ"
          >
            −
          </button>
          <button
            type="button"
            className="toolbar-btn"
            onClick={handleResetZoom}
            title="Khôi phục góc nhìn"
          >
            <Icon name="refresh" size={14} />
          </button>
        </div>
        <div className="toolbar-hint">
          <Icon name="spark" size={13} /> Rê chuột vào tỉnh để xem hình ảnh •
          Nhấp để xác nhận bình chọn
        </div>
      </div>
    </div>
  )
}
