"use client"

import React, { useState, useRef } from "react"
import { Destination, Region } from "../types"
import Icon from "./Icon"

interface UploadedImageItem {
  id: string
  url: string
  name: string
  size?: string
}

export default function AddDestinationModal({
  isOpen,
  onClose,
  onSave,
}: {
  isOpen: boolean
  onClose: () => void
  onSave: (newDest: Destination) => void
}) {
  const [name, setName] = useState("")
  const [place, setPlace] = useState("")
  const [region, setRegion] = useState<Region>("Bắc")
  const [tag, setTag] = useState<Destination["tag"]>("Cảnh quan")
  const [images, setImages] = useState<UploadedImageItem[]>([])
  const [urlInput, setUrlInput] = useState("")
  const [uploadMode, setUploadMode] = useState<"file" | "url">("file")
  const [isDragging, setIsDragging] = useState(false)
  const [lead, setLead] = useState("")
  const [description, setDescription] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!isOpen) return null

  // Xử lý nạp nhiều file ảnh từ máy
  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith("image/")) return

      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        if (result) {
          const sizeKb = Math.round(file.size / 1024)
          const sizeStr =
            sizeKb > 1024 ? `${(sizeKb / 1024).toFixed(1)} MB` : `${sizeKb} KB`
          setImages((prev) => [
            ...prev,
            {
              id: "img-" + Math.random().toString(36).substring(2, 9),
              url: result,
              name: file.name,
              size: sizeStr,
            },
          ])
        }
      }
      reader.readAsDataURL(file)
    })
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    handleFiles(e.dataTransfer.files)
  }

  const handleRemoveImage = (id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id))
  }

  const handleSetCover = (id: string) => {
    setImages((prev) => {
      const target = prev.find((img) => img.id === id)
      if (!target) return prev
      return [target, ...prev.filter((img) => img.id !== id)]
    })
  }

  const handleAddUrl = (e: React.FormEvent) => {
    e.preventDefault()
    if (!urlInput.trim()) return
    setImages((prev) => [
      ...prev,
      {
        id: "img-" + Math.random().toString(36).substring(2, 9),
        url: urlInput.trim(),
        name: `Ảnh trực tuyến #${prev.length + 1}`,
        size: "URL",
      },
    ])
    setUrlInput("")
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !place.trim()) return

    const fallbackImg =
      "https://images.unsplash.com/photo-1528127269322-539801943592?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=1200"

    const primaryImage = images[0]?.url || fallbackImg
    const secondaryImage = images[1]?.url || primaryImage
    const allGallery = images.map((i) => i.url)

    const newDest: Destination = {
      id: Math.floor(10 + Math.random() * 89).toString(),
      name: name.trim(),
      place: place.trim(),
      region,
      image: primaryImage,
      secondaryImage: secondaryImage,
      gallery:
        allGallery.length > 0 ? allGallery : [primaryImage, secondaryImage],
      votes: "1.000",
      rawVotes: 1000,
      tag,
      lead:
        lead.trim() ||
        `Điểm đến đặc sắc tại ${place.trim()} với cảnh quan thiên nhiên và bản sắc văn hóa nổi bật.`,
      description:
        description.trim() ||
        `Được đề cử vào danh sách 68 kỳ quan tiêu biểu của Việt Nam trong năm 2025.`,
      facts: [
        { label: "Khu vực", value: `Miền ${region}` },
        { label: "Trạng thái", value: "Đề cử mới" },
        {
          label: "Số lượng ảnh",
          value: `${Math.max(1, images.length)} bức ảnh`,
        },
        { label: "Năm đề cử", value: "2025" },
      ],
      isVisible: true,
    }

    onSave(newDest)
    onClose()
  }

  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <div className="modal-header">
          <div>
            <span className="eyebrow">HỒ SƠ ĐỀ CỬ MỚI</span>
            <h2>Thêm Điểm Đến Mới</h2>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Đóng">
            <Icon name="x" size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label>Tên điểm đến *</label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ví dụ: Đỉnh Mẫu Sơn, Thác Dray Nur..."
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Tỉnh / Thành phố *</label>
              <input
                required
                value={place}
                onChange={(e) => setPlace(e.target.value)}
                placeholder="Ví dụ: Lạng Sơn, Đắk Lắk..."
              />
            </div>

            <div className="form-group">
              <label>Vùng miền</label>
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value as Region)}
              >
                <option value="Bắc">Miền Bắc</option>
                <option value="Trung">Miền Trung</option>
                <option value="Tây Nguyên">Tây Nguyên</option>
                <option value="Nam">Miền Nam</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Phân loại di sản / Cảnh quan</label>
            <select
              value={tag}
              onChange={(e) => setTag(e.target.value as Destination["tag"])}
            >
              <option value="Di sản thiên nhiên">Di sản thiên nhiên</option>
              <option value="Di sản văn hóa">Di sản văn hóa</option>
              <option value="Cảnh quan">Cảnh quan</option>
              <option value="Danh thắng">Danh thắng</option>
            </select>
          </div>

          {/* =========================================================================
              KHU VỰC TẢI HÌNH ẢNH (HỖ TRỢ TẢI NHIỀU ẢNH TỪ MÁY HOẶC URL)
             ========================================================================= */}
          <div className="form-group image-upload-group">
            <div className="image-upload-header">
              <label>
                <Icon name="image" size={15} /> Hình ảnh điểm đến *{" "}
                <span className="label-sub">
                  (Tải ảnh từ máy lên, hỗ trợ tải nhiều ảnh cùng lúc)
                </span>
              </label>

              <div className="upload-tabs">
                <button
                  type="button"
                  className={`upload-tab-btn ${
                    uploadMode === "file" ? "active" : ""
                  }`}
                  onClick={() => setUploadMode("file")}
                >
                  <Icon name="upload" size={13} /> Tải từ máy tính
                </button>
                <button
                  type="button"
                  className={`upload-tab-btn ${
                    uploadMode === "url" ? "active" : ""
                  }`}
                  onClick={() => setUploadMode("url")}
                >
                  <Icon name="share" size={13} /> Nhập link URL
                </button>
              </div>
            </div>

            {/* Chế độ 1: Tải file từ máy tính */}
            {uploadMode === "file" && (
              <div
                className={`file-dropzone ${
                  isDragging ? "dropzone-dragging" : ""
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileChange}
                  style={{ display: "none" }}
                />
                <div className="dropzone-icon-wrap">
                  <Icon name="upload" size={26} />
                </div>
                <div className="dropzone-text">
                  <strong>
                    Kéo thả nhiều ảnh vào đây hoặc nhấp để duyệt tệp từ máy
                  </strong>
                  <p>
                    Hỗ trợ JPG, PNG, WEBP, GIF. Bạn có thể chọn nhiều ảnh cùng
                    lúc.
                  </p>
                </div>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm dropzone-btn"
                  onClick={(e) => {
                    e.stopPropagation()
                    fileInputRef.current?.click()
                  }}
                >
                  <Icon name="plus" size={14} /> Chọn ảnh từ thiết bị
                </button>
              </div>
            )}

            {/* Chế độ 2: Nhập đường dẫn URL */}
            {uploadMode === "url" && (
              <div className="url-input-row">
                <input
                  type="url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="Dán link ảnh (Ví dụ: https://images.unsplash.com/...)"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      handleAddUrl(e)
                    }
                  }}
                />
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleAddUrl}
                  disabled={!urlInput.trim()}
                >
                  <Icon name="plus" size={14} /> Thêm ảnh
                </button>
              </div>
            )}

            {/* LƯỚI DANH SÁCH ẢNH ĐÃ TẢI LÊN */}
            {images.length > 0 && (
              <div className="uploaded-gallery-section">
                <div className="gallery-status-bar">
                  <span>
                    Đã tải lên <strong>{images.length} hình ảnh</strong>
                  </span>
                  <small>
                    Ảnh đầu tiên sẽ là ảnh đại diện chính của điểm đến
                  </small>
                </div>

                <div className="uploaded-thumbnails-grid">
                  {images.map((img, index) => (
                    <div
                      key={img.id}
                      className={`thumbnail-card ${
                        index === 0 ? "is-cover" : ""
                      }`}
                    >
                      <div className="thumb-img-wrapper">
                        <img src={img.url} alt={img.name} />
                        {index === 0 ? (
                          <span className="cover-badge">⭐ Ảnh đại diện</span>
                        ) : (
                          <button
                            type="button"
                            className="set-cover-btn"
                            onClick={() => handleSetCover(img.id)}
                            title="Đặt ảnh này làm ảnh đại diện chính"
                          >
                            Làm ảnh bìa
                          </button>
                        )}
                        <button
                          type="button"
                          className="remove-thumb-btn"
                          onClick={() => handleRemoveImage(img.id)}
                          title="Xóa ảnh này"
                          aria-label="Xóa ảnh"
                        >
                          <Icon name="x" size={13} />
                        </button>
                      </div>
                      <div className="thumb-info">
                        <span className="thumb-name" title={img.name}>
                          {img.name}
                        </span>
                        {img.size && (
                          <small className="thumb-size">{img.size}</small>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Nút thêm ảnh vào album */}
                  <button
                    type="button"
                    className="add-more-thumb-box"
                    onClick={() => fileInputRef.current?.click()}
                    title="Tải thêm ảnh từ máy"
                  >
                    <Icon name="plus" size={22} />
                    <span>Thêm ảnh</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="form-group">
            <label>Lời dẫn mở đầu (Lead)</label>
            <textarea
              rows={2}
              value={lead}
              onChange={(e) => setLead(e.target.value)}
              placeholder="Mô tả ngắn gọn truyền cảm hứng..."
            />
          </div>

          <div className="form-group">
            <label>Mô tả chi tiết</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Giới thiệu về cảnh sắc, lịch sử, văn hóa và điểm nhấn nổi bật..."
            />
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              Hủy bỏ
            </button>
            <button type="submit" className="btn btn-primary">
              <Icon name="plus" size={16} /> Lưu hồ sơ điểm đến
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
