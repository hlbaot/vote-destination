"use client"

import React, { useState, useRef, useEffect, useCallback } from "react"
import Icon from "@/components/shared/Icon"
import { useAuth } from "@/context/AuthContext"
import { useAppContext } from "@/context/AppContext"
import { profileService } from "@/lib/profile/profileService"

interface AvatarCropModalProps {
  isOpen: boolean
  currentAvatar: string
  onClose: () => void
  onSuccess: (newAvatarUrl: string) => void
  triggerElementRef?: React.RefObject<HTMLElement | null>
}

const MAX_FILE_SIZE = 2 * 1024 * 1024 // 2MB
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"]

export default function AvatarCropModal({
  isOpen,
  currentAvatar,
  onClose,
  onSuccess,
  triggerElementRef,
}: AvatarCropModalProps) {
  const { user, updateCurrentUser } = useAuth()
  const appContext = useAppContext()

  const [selectedImageSrc, setSelectedImageSrc] = useState<string | null>(null)
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [isDragOver, setIsDragOver] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const modalRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imageObjRef = useRef<HTMLImageElement | null>(null)

  // Reset state when opening
  useEffect(() => {
    if (isOpen) {
      setSelectedImageSrc(null)
      setZoom(1)
      setPan({ x: 0, y: 0 })
      setErrorMessage(null)
      setIsSaving(false)
    }
  }, [isOpen])

  // Focus trap & Esc listener
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault()
        onClose()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      triggerElementRef?.current?.focus?.()
    }
  }, [isOpen, onClose, triggerElementRef])

  // Draw image to preview canvas
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current
    const img = imageObjRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const size = canvas.width // 256
    ctx.clearRect(0, 0, size, size)

    if (!img) {
      // Draw placeholder or current avatar
      return
    }

    ctx.save()
    // Circular clip
    ctx.beginPath()
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2)
    ctx.closePath()
    ctx.clip()

    // Calculate dimensions to cover square
    const imgRatio = img.width / img.height
    let drawW = size
    let drawH = size

    if (imgRatio > 1) {
      drawH = size
      drawW = size * imgRatio
    } else {
      drawW = size
      drawH = size / imgRatio
    }

    const scaledW = drawW * zoom
    const scaledH = drawH * zoom

    const centerX = size / 2 + pan.x
    const centerY = size / 2 + pan.y

    ctx.drawImage(
      img,
      centerX - scaledW / 2,
      centerY - scaledH / 2,
      scaledW,
      scaledH,
    )

    ctx.restore()
  }, [zoom, pan])

  useEffect(() => {
    drawCanvas()
  }, [drawCanvas])

  // Process chosen file
  const processFile = (file: File) => {
    setErrorMessage(null)

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setErrorMessage("Chỉ hỗ trợ file ảnh JPG, PNG hoặc WebP.")
      return
    }

    if (file.size > MAX_FILE_SIZE) {
      setErrorMessage("Dung lượng ảnh vượt quá 2MB. Vui lòng chọn ảnh nhẹ hơn.")
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const src = e.target?.result as string
      if (!src) return

      const img = new Image()
      img.onload = () => {
        imageObjRef.current = img
        setSelectedImageSrc(src)
        setZoom(1)
        setPan({ x: 0, y: 0 })
      }
      img.onerror = () => {
        setErrorMessage("Không thể đọc tệp ảnh. Vui lòng thử lại với ảnh khác.")
      }
      img.src = src
    }
    reader.readAsDataURL(file)
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) processFile(file)
    e.target.value = ""
  }

  // Drag and Drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) processFile(file)
  }

  // Mouse pan drag handlers on preview canvas
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!selectedImageSrc) return
    setIsDragging(true)
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !selectedImageSrc) return
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    })
  }

  const handleMouseUp = () => setIsDragging(false)

  // Touch pan drag handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!selectedImageSrc || e.touches.length !== 1) return
    setIsDragging(true)
    const touch = e.touches[0]
    setDragStart({ x: touch.clientX - pan.x, y: touch.clientY - pan.y })
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !selectedImageSrc || e.touches.length !== 1) return
    const touch = e.touches[0]
    setPan({
      x: touch.clientX - dragStart.x,
      y: touch.clientY - dragStart.y,
    })
  }

  const handleTouchEnd = () => setIsDragging(false)

  // Export cropped 256x256 WebP
  const handleSave = async () => {
    if (!user) return
    setIsSaving(true)
    setErrorMessage(null)

    try {
      let finalDataUrl = selectedImageSrc

      // Export canvas result if image was selected
      if (canvasRef.current && imageObjRef.current) {
        finalDataUrl = canvasRef.current.toDataURL("image/webp", 0.9)
      }

      if (!finalDataUrl) {
        setErrorMessage("Vui lòng chọn ảnh trước khi lưu.")
        setIsSaving(false)
        return
      }

      // Save via profileService.updateAvatar
      await profileService.updateAvatar(user.id, finalDataUrl)

      // Sync AuthContext immediately (Header avatar, dropdown avatar)
      updateCurrentUser({ avatarUrl: finalDataUrl })

      // Call parent onSuccess callback to sync local profile
      onSuccess(finalDataUrl)

      appContext?.addToast?.("success", "Đã cập nhật ảnh đại diện thành công! ✨")
      onClose()
    } catch {
      setErrorMessage("Không thể cập nhật ảnh đại diện. Vui lòng thử lại.")
    } finally {
      setIsSaving(false)
    }
  }

  // Restore Google account avatar
  const handleRestoreGoogleAvatar = async () => {
    if (!user) return
    setIsSaving(true)
    setErrorMessage(null)

    const googleAvatar =
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop"

    try {
      await profileService.updateAvatar(user.id, googleAvatar)
      updateCurrentUser({ avatarUrl: googleAvatar })
      onSuccess(googleAvatar)
      appContext?.addToast?.("success", "Đã khôi phục ảnh đại diện Google ban đầu.")
      onClose()
    } catch {
      setErrorMessage("Không thể khôi phục ảnh đại diện. Vui lòng thử lại.")
    } finally {
      setIsSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="avatar-crop-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="avatar-crop-title"
    >
      <div className="avatar-crop-modal" ref={modalRef}>
        {/* Header */}
        <div className="avatar-crop-header">
          <h3 id="avatar-crop-title">Đổi ảnh đại diện</h3>
          <button
            type="button"
            className="avatar-crop-close-btn"
            onClick={onClose}
            aria-label="Đóng hộp thoại"
          >
            <Icon name="x" size={18} />
          </button>
        </div>

        {/* Inline Error Message */}
        {errorMessage && (
          <div
            className="avatar-crop-error"
            role="alert"
            aria-live="polite"
          >
            <Icon name="x" size={14} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Circular Preview / Canvas Area (160px) */}
        <div className="avatar-crop-body">
          <div
            className={`avatar-crop-preview-box ${isDragOver ? "is-dragover" : ""}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={{ cursor: selectedImageSrc ? (isDragging ? "grabbing" : "grab") : "default" }}
          >
            {selectedImageSrc ? (
              <canvas
                ref={canvasRef}
                width={256}
                height={256}
                className="avatar-crop-canvas"
              />
            ) : (
              <img
                src={currentAvatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop"}
                alt="Avatar hiện tại"
                className="avatar-crop-static-img"
              />
            )}

            {/* Drag over overlay hint */}
            {isDragOver && (
              <div className="avatar-crop-drag-hint">
                <Icon name="upload" size={24} />
                <span>Thả ảnh vào đây</span>
              </div>
            )}
          </div>

          <p className="avatar-crop-hint">
            {selectedImageSrc
              ? "Kéo ảnh để căn chỉnh vị trí khung tròn."
              : "Kéo thả ảnh vào khung tròn hoặc bấm nút bên dưới."}
          </p>

          {/* Zoom Slider (When image is loaded) */}
          {selectedImageSrc && (
            <div className="avatar-crop-zoom-group">
              <label htmlFor="avatar-zoom-slider">
                <span>Thu phóng:</span>
                <strong>{Math.round(zoom * 100)}%</strong>
              </label>
              <div className="zoom-slider-row">
                <span className="zoom-icon-lbl">1x</span>
                <input
                  id="avatar-zoom-slider"
                  type="range"
                  min="1"
                  max="3"
                  step="0.05"
                  value={zoom}
                  onChange={(e) => setZoom(parseFloat(e.target.value))}
                  className="avatar-zoom-range"
                />
                <span className="zoom-icon-lbl">3x</span>
              </div>
            </div>
          )}

          {/* Choose File Button */}
          <div className="avatar-crop-select-row">
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => fileInputRef.current?.click()}
              style={{ borderRadius: 100 }}
            >
              <Icon name="upload" size={15} />
              {selectedImageSrc ? "Chọn ảnh khác" : "Chọn ảnh từ máy"}
            </button>
            <span className="avatar-file-note">JPG, PNG hoặc WebP, tối đa 2MB</span>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            style={{ display: "none" }}
            onChange={handleFileInputChange}
          />
        </div>

        {/* Modal Actions Footer */}
        <div className="avatar-crop-footer">
          <div className="avatar-footer-left">
            <button
              type="button"
              className="btn-link-restore"
              onClick={handleRestoreGoogleAvatar}
              disabled={isSaving}
              title="Khôi phục ảnh từ Google"
            >
              Dùng lại ảnh Google
            </button>
          </div>

          <div className="avatar-footer-right">
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={onClose}
              disabled={isSaving}
              style={{ borderRadius: 100 }}
            >
              Hủy
            </button>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={handleSave}
              disabled={isSaving || !selectedImageSrc}
              style={{ borderRadius: 100 }}
            >
              {isSaving ? (
                <>
                  <Icon name="spark" size={15} /> Đang lưu...
                </>
              ) : (
                <>
                  <Icon name="check" size={15} /> Lưu ảnh
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
