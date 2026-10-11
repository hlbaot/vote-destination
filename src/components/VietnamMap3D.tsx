"use client"

import React, { useEffect, useRef, useState } from "react"
import * as THREE from "three"
import { ProvinceData, vietnamProvinces } from "../data/provinces"
import Icon from "./Icon"

// Tọa độ chuẩn hóa từ lat/lng sang tọa độ 3D
function coordsToVector3(
  lat: number,
  lng: number,
): { x: number; y: number; z: number } {
  // Lat: 8.5 (Nam) -> 23.4 (Bắc) => ánh xạ Y từ -7.0 đến +6.8
  const y = ((lat - 16.0) / 7.5) * 6.5

  // Lng: 102.0 (Tây) -> 109.8 (Đông) => ánh xạ X từ -4.5 đến +4.5
  // Với các đảo xa như Hoàng Sa (111.6) và Trường Sa (114.5), cho tọa độ X offset vừa phải để hiển thị trong khung nhìn
  let effectiveLng = lng
  if (lng > 111) {
    effectiveLng = 109.8 + (lng - 111) * 0.45
  }
  const x = ((effectiveLng - 106.0) / 4.0) * 3.8

  return { x, y, z: 0.15 }
}

export default function VietnamMap3D({
  selectedProvinceId,
  onSelectProvince,
}: {
  selectedProvinceId?: string
  onSelectProvince: (prov: ProvinceData) => void
  activeRegion?: "all" | "Bắc" | "Trung" | "Nam"
  searchKeyword?: string
}) {
  const mountRef = useRef<HTMLDivElement>(null)
  const [hoveredProvince, setHoveredProvince] = useState<ProvinceData | null>(
    null,
  )
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  })
  const [isAutoRotating, setIsAutoRotating] = useState(false)
  const autoRotateRef = useRef(false)

  // Sync ref
  useEffect(() => {
    autoRotateRef.current = isAutoRotating
  }, [isAutoRotating])

  // View reset trigger ref
  const resetCameraRef = useRef<((
    mode?: "full" | "north" | "central" | "south" | "top",
  ) => void) | null>(null)

  useEffect(() => {
    const container = mountRef.current
    if (!container) return

    const width = container.clientWidth
    const height = container.clientHeight

    // 1. Scene
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x062825)
    scene.fog = new THREE.FogExp2(0x062825, 0.022)

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100)
    camera.position.set(0, -9, 14)
    camera.lookAt(0, 0, 0)

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    container.appendChild(renderer.domElement)

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xdff4eb, 1.2)
    scene.add(ambientLight)

    const dirLight = new THREE.DirectionalLight(0xfff7e6, 2.2)
    dirLight.position.set(6, -8, 12)
    dirLight.castShadow = true
    dirLight.shadow.mapSize.width = 1024
    dirLight.shadow.mapSize.height = 1024
    scene.add(dirLight)

    const pointLight = new THREE.PointLight(0xe1644a, 2.5, 30)
    pointLight.position.set(0, 0, 4)
    scene.add(pointLight)

    // 5. 3D Map Group
    const mapGroup = new THREE.Group()
    scene.add(mapGroup)

    // Water surface / Grid plane
    const gridHelper = new THREE.GridHelper(30, 30, 0x165b53, 0x0c3c37)
    gridHelper.rotation.x = Math.PI / 2
    gridHelper.position.z = -0.05
    scene.add(gridHelper)

    // Create 3D S-shape extruded landmass of Vietnam
    const shape = new THREE.Shape()
    // Vùng Tây Bắc & Đông Bắc (Hà Giang, Cao Bằng, Lai Châu)
    shape.moveTo(-3.2, 5.8)
    shape.bezierCurveTo(-3.5, 6.2, -2.8, 6.8, -1.2, 6.8) // Hà Giang / Cao Bằng
    shape.bezierCurveTo(0.2, 6.7, 1.6, 6.2, 1.8, 5.2) // Quảng Ninh / Vịnh Bắc Bộ
    shape.bezierCurveTo(1.2, 4.3, 0.2, 3.8, 0.0, 3.2) // Nam Định / Ninh Bình

    // Miền Trung eo thon (Thanh Hóa, Nghệ An, Hà Tĩnh, Quảng Bình)
    shape.bezierCurveTo(-0.1, 2.2, -0.4, 1.4, 0.4, 0.5) // Quảng Bình / Huế
    shape.bezierCurveTo(0.9, 0.0, 1.5, -0.2, 1.7, -0.8) // Đà Nẵng / Quảng Nam

    // Nam Trung Bộ nở rộng (Bình Định, Phú Yên, Khánh Hòa)
    shape.bezierCurveTo(1.9, -1.6, 2.1, -2.6, 1.8, -3.4) // Nha Trang / Ninh Thuận
    shape.bezierCurveTo(1.5, -4.0, 0.8, -4.5, 0.4, -4.8) // Bình Thuận / Đông Nam Bộ

    // Nam Bộ & Đồng bằng sông Cửu Long (TP.HCM, Cần Thơ, Cà Mau)
    shape.bezierCurveTo(0.0, -5.2, -0.8, -5.6, -1.2, -6.2) // Bạc Liêu / Cà Mau
    shape.bezierCurveTo(-1.6, -6.6, -2.2, -6.5, -2.3, -5.8) // Mũi Cà Mau
    shape.bezierCurveTo(-2.4, -5.2, -1.8, -4.8, -1.4, -4.2) // Vịnh Thái Lan / Kiên Giang
    shape.bezierCurveTo(-1.0, -3.4, -0.6, -2.8, -0.5, -2.0) // Biên giới Tây Nam
    shape.bezierCurveTo(-0.6, -1.0, -1.0, 0.2, -1.2, 1.4) // Dãy Trường Sơn
    shape.bezierCurveTo(-1.4, 2.4, -2.0, 3.4, -2.8, 4.4) // Lào / Điện Biên
    shape.bezierCurveTo(-3.2, 4.8, -3.4, 5.3, -3.2, 5.8) // Khép vòng

    const extrudeSettings = {
      steps: 1,
      depth: 0.35,
      bevelEnabled: true,
      bevelThickness: 0.08,
      bevelSize: 0.06,
      bevelSegments: 3,
    }

    const landGeometry = new THREE.ExtrudeGeometry(shape, extrudeSettings)
    const landMaterial = new THREE.MeshStandardMaterial({
      color: 0x094843,
      roughness: 0.45,
      metalness: 0.15,
      flatShading: false,
    })
    const landMesh = new THREE.Mesh(landGeometry, landMaterial)
    landMesh.receiveShadow = true
    landMesh.castShadow = true
    mapGroup.add(landMesh)

    // Đường viền sáng cho lãnh thổ
    const edges = new THREE.EdgesGeometry(landGeometry)
    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0x5eead4,
      transparent: true,
      opacity: 0.45,
    })
    const wireframe = new THREE.LineSegments(edges, lineMaterial)
    mapGroup.add(wireframe)

    // 6. Quần đảo Hoàng Sa & Trường Sa 3D islands
    const createIsland = (x: number, y: number, name: string) => {
      const islandGeo = new THREE.CylinderGeometry(0.24, 0.28, 0.2, 8)
      const islandMat = new THREE.MeshStandardMaterial({
        color: 0x0e5d56,
        roughness: 0.3,
      })
      const island = new THREE.Mesh(islandGeo, islandMat)
      island.name = name
      island.rotation.x = Math.PI / 2
      island.position.set(x, y, 0.1)
      island.castShadow = true
      mapGroup.add(island)

      // Pulse ring for island
      const ringGeo = new THREE.RingGeometry(0.28, 0.34, 16)
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.6,
      })
      const ring = new THREE.Mesh(ringGeo, ringMat)
      ring.position.set(x, y, 0.12)
      mapGroup.add(ring)
    }

    createIsland(3.1, 0.4, "Hoàng Sa")
    createIsland(4.2, -3.2, "Trường Sa")
    createIsland(-2.3, -4.8, "Phú Quốc")
    createIsland(0.6, -5.8, "Côn Đảo")

    // 7. Provinces 3D Markers & Energy Beacons
    const markersGroup = new THREE.Group()
    mapGroup.add(markersGroup)

    const markerMeshes: {
      mesh: THREE.Mesh
      beaconMesh: THREE.Mesh
      baseMesh: THREE.Mesh
      province: ProvinceData
      origHeight: number
    }[] = []

    vietnamProvinces.forEach((p) => {
      const pos = coordsToVector3(p.lat, p.lng)

      // Chiều cao cột tỉ lệ theo số vote
      const height = Math.max(0.35, Math.min(2.4, (p.votes / 150000) * 2.2))

      // Đế tròn trên mặt đất
      const baseGeo = new THREE.CylinderGeometry(0.12, 0.14, 0.05, 12)
      const baseMat = new THREE.MeshBasicMaterial({
        color: 0x2dd4bf,
      })
      const baseMesh = new THREE.Mesh(baseGeo, baseMat)
      baseMesh.rotation.x = Math.PI / 2
      baseMesh.position.set(pos.x, pos.y, 0.38)
      markersGroup.add(baseMesh)

      // Cột phát sáng (Beacon Cylinder)
      const beaconGeo = new THREE.CylinderGeometry(0.04, 0.04, height, 8)
      const beaconMat = new THREE.MeshStandardMaterial({
        color: p.id === selectedProvinceId ? 0xe1644a : 0x38bdf8,
        emissive: p.id === selectedProvinceId ? 0xe1644a : 0x0ea5e9,
        emissiveIntensity: 0.8,
        roughness: 0.2,
      })
      const beaconMesh = new THREE.Mesh(beaconGeo, beaconMat)
      beaconMesh.rotation.x = Math.PI / 2
      beaconMesh.position.set(pos.x, pos.y, 0.38 + height / 2)
      markersGroup.add(beaconMesh)

      // Hạt sáng trên đỉnh
      const topGeo = new THREE.SphereGeometry(0.09, 12, 12)
      const topMat = new THREE.MeshBasicMaterial({
        color: p.id === selectedProvinceId ? 0xffffff : 0xbae6fd,
      })
      const topMesh = new THREE.Mesh(topGeo, topMat)
      topMesh.position.set(pos.x, pos.y, 0.38 + height)
      markersGroup.add(topMesh)

      // Gắn dữ liệu tương tác
      topMesh.userData = { province: p }
      beaconMesh.userData = { province: p }
      baseMesh.userData = { province: p }

      markerMeshes.push({
        mesh: topMesh,
        beaconMesh,
        baseMesh,
        province: p,
        origHeight: height,
      })
    })

    // 8. Raycaster & Interactivity
    const raycaster = new THREE.Raycaster()
    const mouse = new THREE.Vector2()

    const onPointerMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect()
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1

      raycaster.setFromCamera(mouse, camera)
      const interactiveTargets = markerMeshes.map((m) => m.mesh)
      const intersects = raycaster.intersectObjects(interactiveTargets, false)

      if (intersects.length > 0) {
        const hit = intersects[0].object as THREE.Mesh
        const p = hit.userData?.province as ProvinceData | undefined
        if (p) {
          setHoveredProvince(p)
          setTooltipPos({ x: e.clientX - rect.left, y: e.clientY - rect.top })
          container.style.cursor = "pointer"
          return
        }
      }
      setHoveredProvince(null)
      container.style.cursor = "grab"
    }

    const onClick = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect()
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1

      raycaster.setFromCamera(mouse, camera)
      const interactiveTargets = markerMeshes.map((m) => m.mesh)
      const intersects = raycaster.intersectObjects(interactiveTargets, false)

      if (intersects.length > 0) {
        const hit = intersects[0].object as THREE.Mesh
        const p = hit.userData?.province as ProvinceData | undefined
        if (p) {
          onSelectProvince(p)
        }
      }
    }

    container.addEventListener("mousemove", onPointerMove)
    container.addEventListener("click", onClick)

    // 9. Camera Orbit Controls (Mouse Drag & Wheel Zoom)
    let isDragging = false
    let prevMouseX = 0
    let prevMouseY = 0

    const onMouseDown = (e: MouseEvent) => {
      if (e.button === 0) {
        isDragging = true
        prevMouseX = e.clientX
        prevMouseY = e.clientY
        container.style.cursor = "grabbing"
      }
    }

    const onMouseUp = () => {
      isDragging = false
      container.style.cursor = "grab"
    }

    const onDragMove = (e: MouseEvent) => {
      if (!isDragging) return
      const deltaX = e.clientX - prevMouseX
      const deltaY = e.clientY - prevMouseY
      prevMouseX = e.clientX
      prevMouseY = e.clientY

      mapGroup.rotation.z += deltaX * 0.005
      mapGroup.rotation.x = Math.max(
        -0.6,
        Math.min(0.6, mapGroup.rotation.x + deltaY * 0.004),
      )
    }

    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      const zoomDelta = e.deltaY * 0.01
      camera.position.z = Math.max(
        7,
        Math.min(22, camera.position.z + zoomDelta),
      )
    }

    container.addEventListener("mousedown", onMouseDown)
    window.addEventListener("mouseup", onMouseUp)
    window.addEventListener("mousemove", onDragMove)
    container.addEventListener("wheel", onWheel, { passive: false })

    // 10. Preset Camera Views
    const resetCamera = (
      mode: "full" | "north" | "central" | "south" | "top" = "full",
    ) => {
      if (mode === "top") {
        camera.position.set(0, 0, 16)
        mapGroup.rotation.set(0, 0, 0)
      } else if (mode === "north") {
        camera.position.set(-0.5, -4, 11)
        mapGroup.position.set(0.5, -3.2, 0)
        mapGroup.rotation.set(0.2, 0, 0)
      } else if (mode === "central") {
        camera.position.set(0.5, -5, 11)
        mapGroup.position.set(-0.5, 0.5, 0)
        mapGroup.rotation.set(0.25, 0, 0)
      } else if (mode === "south") {
        camera.position.set(-0.5, -4, 11)
        mapGroup.position.set(0.5, 3.8, 0)
        mapGroup.rotation.set(0.2, 0, 0)
      } else {
        camera.position.set(0, -9, 14)
        mapGroup.position.set(0, 0, 0)
        mapGroup.rotation.set(0.35, 0, 0)
      }
      camera.lookAt(0, 0, 0)
    }
    resetCameraRef.current = resetCamera

    // Set initial nice 3D perspective angle
    resetCamera("full")

    // 11. Render Loop with gentle idle animation
    let animationFrameId: number
    const clock = new THREE.Clock()

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate)
      const elapsedTime = clock.getElapsedTime()

      // Auto rotation if active
      if (autoRotateRef.current) {
        mapGroup.rotation.z += 0.002
      }

      // Gentle beacon pulse animation
      pointLight.intensity = 2.2 + Math.sin(elapsedTime * 2.5) * 0.6

      renderer.render(scene, camera)
    }
    animate()

    // 12. Resize Handler
    const onResize = () => {
      if (!container) return
      const w = container.clientWidth
      const h = container.clientHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }
    window.addEventListener("resize", onResize)

    // 13. Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener("resize", onResize)
      container.removeEventListener("mousemove", onPointerMove)
      container.removeEventListener("click", onClick)
      container.removeEventListener("mousedown", onMouseDown)
      window.removeEventListener("mouseup", onMouseUp)
      window.removeEventListener("mousemove", onDragMove)
      container.removeEventListener("wheel", onWheel)
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement)
      }
      renderer.dispose()
    }
  }, [])

  return (
    <div className="vietnam-3d-wrapper">
      {/* 3D Canvas Canvas Mount */}
      <div ref={mountRef} className="vietnam-3d-canvas" />

      {/* Floating 3D Tooltip */}
      {hoveredProvince && (
        <div
          className="map-3d-tooltip"
          style={{
            left: `${tooltipPos.x + 16}px`,
            top: `${tooltipPos.y - 48}px`,
          }}
        >
          <div className="tooltip-header">
            <strong>{hoveredProvince.name}</strong>
            <span className="tooltip-region">
              Miền {hoveredProvince.region}
            </span>
          </div>
          {hoveredProvince.featuredDestination && (
            <p className="tooltip-dest">
              ★ {hoveredProvince.featuredDestination}
            </p>
          )}
          <div className="tooltip-footer">
            <span>
              {hoveredProvince.votes.toLocaleString("vi-VN")} lượt bình chọn
            </span>
            <small>Nhấn để chọn điểm đến này</small>
          </div>
        </div>
      )}

      {/* 3D Map Overlay Controls */}
      <div className="map-3d-controls">
        <div className="controls-row">
          <button
            type="button"
            className="map-control-btn"
            onClick={() => resetCameraRef.current?.("full")}
            title="Xem toàn cảnh hình chữ S"
          >
            Toàn cảnh 3D
          </button>
          <button
            type="button"
            className="map-control-btn"
            onClick={() => resetCameraRef.current?.("top")}
            title="Góc nhìn phẳng từ trên xuống"
          >
            Từ trên xuống
          </button>
          <button
            type="button"
            className={`map-control-btn ${isAutoRotating ? "active" : ""}`}
            onClick={() => setIsAutoRotating(!isAutoRotating)}
            title="Bật/Tắt xoay tự động"
          >
            {isAutoRotating ? "Dừng xoay" : "Xoay 3D"}
          </button>
        </div>

        <div className="controls-regions">
          <button
            type="button"
            className="region-chip"
            onClick={() => resetCameraRef.current?.("north")}
          >
            Bắc Bộ (25 tỉnh)
          </button>
          <button
            type="button"
            className="region-chip"
            onClick={() => resetCameraRef.current?.("central")}
          >
            Trung Bộ & Tây Nguyên (19)
          </button>
          <button
            type="button"
            className="region-chip"
            onClick={() => resetCameraRef.current?.("south")}
          >
            Nam Bộ (19)
          </button>
        </div>
      </div>

      {/* Map Legend Overlay */}
      <div className="map-3d-legend">
        <div className="legend-item">
          <span className="dot dot-cyan" /> 63 Tỉnh Thành & Đảo
        </div>
        <div className="legend-item">
          <span className="dot dot-coral" /> Cột sáng = Số lượt Vote
        </div>
        <div className="legend-hint">
          <Icon name="spark" size={13} /> Kéo chuột để xoay 360° • Lăn chuột để
          phóng to
        </div>
      </div>
    </div>
  )
}
