'use client'

import React, {
  useRef,
  useEffect,
  useState,
  useCallback,
  ReactNode,
  PointerEvent as ReactPointerEvent,
  MouseEvent as ReactMouseEvent,
} from "react"

export interface MarqueeCardsProps<T = any> {
  /** Danh sách dữ liệu các card */
  items?: T[]
  /** Hàm render item cho từng phần tử */
  renderItem?: (item: T, index: number, copyIndex: number) => ReactNode
  /** Lấy ID định danh duy nhất cho từng item */
  keyExtractor?: (item: T, index: number) => string | number
  /** Hoặc truyền trực tiếp React children nếu không dùng items */
  children?: ReactNode
  /** Tốc độ chạy (pixel mỗi khung hình chuẩn ~16.7ms). Mặc định: 1.2 */
  speed?: number
  /** Hướng chạy ("left" hoặc "right"). Mặc định: "left" */
  direction?: "left" | "right"
  /** Cho phép tương tác kéo thả bằng chuột/cảm ứng. Mặc định: true */
  interactive?: boolean
  /** Tạm dừng khi rê chuột vào marquee. Mặc định: true */
  pauseOnHover?: boolean
  /** Khoảng cách giữa các card (px). Mặc định: 24 */
  gap?: number
  /** Lớp CSS bổ sung cho container */
  className?: string
  /** Bật gradient làm mờ hai mép container. Mặc định: true */
  fadeEdges?: boolean
  /** Chiều rộng của vùng làm mờ hai mép (px). Mặc định: 56 */
  fadeWidth?: number
}

/**
 * Component Marquee Cards hiển thị danh sách Card chạy ngang vô hạn mượt mà.
 * Hỗ trợ kéo thả (drag/swipe), flick đổi hướng, dừng khi hover, tự đồng bộ bản sao,
 * phân biệt kéo vs click để không bấm nhầm nút Vote/Tim.
 */
export const MarqueeCards = <T,>({
  items,
  renderItem,
  keyExtractor,
  children,
  speed = 1.2,
  direction = "left",
  interactive = true,
  pauseOnHover = true,
  gap = 24,
  className = "",
  fadeEdges = true,
  fadeWidth = 56,
}: MarqueeCardsProps<T>) => {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const trackRef = useRef<HTMLDivElement | null>(null)
  const firstSetRef = useRef<HTMLDivElement | null>(null)

  // Số lượng bản sao cần render để đảm bảo luôn lấp đầy màn hình và wrap liền mạch
  const [numCopies, setNumCopies] = useState<number>(2)
  const [isReducedMotion, setIsReducedMotion] = useState<boolean>(false)
  const [isDragging, setIsDragging] = useState<boolean>(false)

  // Các biến tham chiếu phục vụ animation & tương tác
  const offsetRef = useRef<number>(0)
  const singleSetWidthRef = useRef<number>(0)
  const dirRef = useRef<"left" | "right">(direction)
  const isHoveredRef = useRef<boolean>(false)
  const isPointerDownRef = useRef<boolean>(false)
  const isDraggingRef = useRef<boolean>(false)
  const startXRef = useRef<number>(0)
  const startYRef = useRef<number>(0)
  const lastXRef = useRef<number>(0)
  const dragDistanceRef = useRef<number>(0)
  const velRef = useRef<number>(0)
  const preventNextClickRef = useRef<boolean>(false)

  // Cập nhật hướng chạy khi prop direction thay đổi
  useEffect(() => {
    dirRef.current = direction
  }, [direction])

  // Kiểm tra cài đặt prefers-reduced-motion của hệ điều hành
  useEffect(() => {
    if (typeof window === "undefined") return
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
    setIsReducedMotion(mediaQuery.matches)

    const handleChange = (e: MediaQueryListEvent) => {
      setIsReducedMotion(e.matches)
    }

    mediaQuery.addEventListener("change", handleChange)
    return () => mediaQuery.removeEventListener("change", handleChange)
  }, [])

  // Đo chiều rộng của 1 bộ item và container để tính số bản sao cần thiết
  const measureDimensions = useCallback(() => {
    if (!firstSetRef.current || !containerRef.current) return

    const setWidth = firstSetRef.current.offsetWidth
    const containerWidth = containerRef.current.clientWidth

    if (setWidth > 0) {
      singleSetWidthRef.current = setWidth

      // Cần tối thiểu 2 bộ; nếu 1 bộ ngắn hơn container thì nhân bản đủ để phủ kín
      const neededCopies = Math.max(2, Math.ceil((containerWidth * 1.5) / setWidth) + 1)
      setNumCopies((prev) => (prev !== neededCopies ? neededCopies : prev))
    }
  }, [])

  // ResizeObserver theo dõi kích thước
  useEffect(() => {
    measureDimensions()

    const observer = new ResizeObserver(() => {
      measureDimensions()
    })

    if (firstSetRef.current) observer.observe(firstSetRef.current)
    if (containerRef.current) observer.observe(containerRef.current)

    return () => observer.disconnect()
  }, [measureDimensions, items, children])

  // Reset offset về 0 khi items thay đổi (ví dụ đổi bộ lọc)
  useEffect(() => {
    offsetRef.current = 0
    if (trackRef.current) {
      trackRef.current.style.transform = "translate3d(0, 0, 0)"
    }
  }, [items])

  // Vòng lặp animation requestAnimationFrame sử dụng delta time
  useEffect(() => {
    if (isReducedMotion) return

    let animationFrameId: number
    let lastTimestamp = performance.now()

    const step = (timestamp: DOMHighResTimeStamp) => {
      // Giới hạn max delta để tránh nhảy giật nếu tab bị đóng băng tạm thời
      const elapsed = Math.min(timestamp - lastTimestamp, 100)
      lastTimestamp = timestamp

      const singleW = singleSetWidthRef.current

      // Tự động chạy khi: không bị hover (nếu pauseOnHover), không đang kéo chuột,
      // đã đo được chiều rộng và tab đang hiển thị
      if (
        !(pauseOnHover && isHoveredRef.current) &&
        !isPointerDownRef.current &&
        singleW > 0 &&
        !document.hidden
      ) {
        // Tốc độ chuẩn hóa theo tần số 60 FPS (16.667ms)
        const delta = (elapsed / 16.667) * Math.abs(speed)

        if (dirRef.current === "left") {
          offsetRef.current -= delta
        } else {
          offsetRef.current += delta
        }

        // Wrap vô hạn: giữ offset luôn nằm trong khoảng (-singleW, 0]
        while (offsetRef.current <= -singleW) {
          offsetRef.current += singleW
        }
        while (offsetRef.current > 0) {
          offsetRef.current -= singleW
        }

        if (trackRef.current) {
          trackRef.current.style.transform = `translate3d(${offsetRef.current}px, 0, 0)`
        }
      }

      animationFrameId = requestAnimationFrame(step)
    }

    animationFrameId = requestAnimationFrame(step)

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        lastTimestamp = performance.now()
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)

    return () => {
      cancelAnimationFrame(animationFrameId)
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [speed, pauseOnHover, isReducedMotion])

  // ============================================================
  // XỬ LÝ POINTER EVENTS (KÉO/VUỐT, FLICK & PHÂN BIỆT CLICK)
  // ============================================================

  const handlePointerDown = (e: ReactPointerEvent) => {
    if (!interactive || e.button !== 0) return
    isPointerDownRef.current = true
    isDraggingRef.current = false
    dragDistanceRef.current = 0
    startXRef.current = e.clientX
    startYRef.current = e.clientY
    lastXRef.current = e.clientX
    velRef.current = 0
    // Chưa capture pointer ngay để các nút con nhận click bình thường nếu chỉ nhấn thả
  }

  const handlePointerMove = (e: ReactPointerEvent) => {
    if (!interactive || !isPointerDownRef.current) return

    const currentX = e.clientX
    const dx = currentX - lastXRef.current
    const totalDx = Math.abs(currentX - startXRef.current)

    // Nếu chưa vào trạng thái kéo, kiểm tra ngưỡng di chuyển 5px
    if (!isDraggingRef.current) {
      if (totalDx > 5) {
        isDraggingRef.current = true
        setIsDragging(true)
        try {
          ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
        } catch (_) {}
      } else {
        lastXRef.current = currentX
        return
      }
    }

    // Đang kéo: cập nhật vị trí tức thì
    dragDistanceRef.current += Math.abs(dx)
    lastXRef.current = currentX
    velRef.current = dx

    const singleW = singleSetWidthRef.current
    offsetRef.current += dx

    if (singleW > 0) {
      while (offsetRef.current <= -singleW) {
        offsetRef.current += singleW
      }
      while (offsetRef.current > 0) {
        offsetRef.current -= singleW
      }
    }

    if (trackRef.current) {
      trackRef.current.style.transform = `translate3d(${offsetRef.current}px, 0, 0)`
    }
  }

  const handlePointerUp = (e: ReactPointerEvent) => {
    if (!isPointerDownRef.current) return
    isPointerDownRef.current = false

    if (isDraggingRef.current) {
      // Đã kéo: chặn click vô tình trên các card con (nút Bình chọn, tim, link)
      preventNextClickRef.current = true
      setTimeout(() => {
        preventNextClickRef.current = false
      }, 70)

      // Đổi hướng chạy nếu có lực vuốt nhanh (flick)
      if (Math.abs(velRef.current) > 1.2) {
        dirRef.current = velRef.current > 0 ? "right" : "left"
      }

      try {
        if ((e.currentTarget as HTMLElement).hasPointerCapture(e.pointerId)) {
          ;(e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId)
        }
      } catch (_) {}

      isDraggingRef.current = false
      setIsDragging(false)
    }
  }

  const handlePointerCancel = (e: ReactPointerEvent) => {
    handlePointerUp(e)
  }

  // Chặn sự kiện click ở capture phase nếu người dùng vừa thực hiện kéo thả
  const handleClickCapture = (e: ReactMouseEvent) => {
    if (preventNextClickRef.current) {
      e.preventDefault()
      e.stopPropagation()
    }
  }

  // Kiểu cursor cho container
  const cursorStyle = interactive
    ? isDragging
      ? "grabbing"
      : "grab"
    : "default"

  // Hiệu ứng mờ 2 mép gradient
  const maskStyle: React.CSSProperties =
    fadeEdges && !isReducedMotion
      ? {
          maskImage: `linear-gradient(to right, transparent 0%, black ${fadeWidth}px, black calc(100% - ${fadeWidth}px), transparent 100%)`,
          WebkitMaskImage: `linear-gradient(to right, transparent 0%, black ${fadeWidth}px, black calc(100% - ${fadeWidth}px), transparent 100%)`,
        }
      : {}

  // Render các item cho một bộ (set)
  const renderSingleSet = (copyIndex: number) => {
    if (items && renderItem) {
      return items.map((item, index) => {
        const baseKey = keyExtractor ? keyExtractor(item, index) : index
        const itemKey = `${baseKey}-copy-${copyIndex}`
        return (
          <React.Fragment key={itemKey}>
            {renderItem(item, index, copyIndex)}
          </React.Fragment>
        )
      })
    }

    if (children) {
      return React.Children.map(children, (child, index) => (
        <React.Fragment key={`child-${index}-copy-${copyIndex}`}>
          {child}
        </React.Fragment>
      ))
    }

    return null
  }

  // Trường hợp người dùng bật prefers-reduced-motion: cho phép cuộn ngang thông thường
  if (isReducedMotion) {
    return (
      <div
        className={`marquee-cards-container ${className}`}
        style={{
          overflowX: "auto",
          width: "100%",
          padding: "12px 0 24px",
          scrollbarWidth: "thin",
          ...maskStyle,
        }}
      >
        <div
          style={{
            display: "inline-flex",
            gap: `${gap}px`,
            paddingRight: `${gap}px`,
          }}
        >
          {renderSingleSet(0)}
        </div>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className={`marquee-cards-container ${className}`}
      style={{
        position: "relative",
        width: "100%",
        overflow: "hidden",
        cursor: cursorStyle,
        userSelect: "none",
        WebkitUserSelect: "none",
        touchAction: "pan-y",
        padding: "14px 0 24px",
        marginTop: "-14px",
        marginBottom: "-24px",
        ...maskStyle,
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      onClickCapture={handleClickCapture}
      onMouseEnter={() => {
        if (pauseOnHover) isHoveredRef.current = true
      }}
      onMouseLeave={(e) => {
        isHoveredRef.current = false
        if (isPointerDownRef.current) {
          handlePointerUp(e as unknown as ReactPointerEvent)
        }
      }}
    >
      <div
        ref={trackRef}
        className="marquee-cards-track"
        style={{
          display: "flex",
          width: "max-content",
          willChange: "transform",
        }}
      >
        {/* Bản chính đầu tiên (dùng để đo kích thước lặp) */}
        <div
          ref={firstSetRef}
          className="marquee-cards-set"
          style={{
            display: "flex",
            gap: `${gap}px`,
            paddingRight: `${gap}px`,
            flexShrink: 0,
          }}
        >
          {renderSingleSet(0)}
        </div>

        {/* Các bản sao tiếp theo để tạo vòng lặp vô hạn liền mạch */}
        {Array.from({ length: Math.max(1, numCopies - 1) }).map((_, copyIndex) => (
          <div
            key={`marquee-copy-set-${copyIndex + 1}`}
            className="marquee-cards-set"
            aria-hidden="true"
            style={{
              display: "flex",
              gap: `${gap}px`,
              paddingRight: `${gap}px`,
              flexShrink: 0,
            }}
          >
            {renderSingleSet(copyIndex + 1)}
          </div>
        ))}
      </div>
    </div>
  )
}

export default MarqueeCards
