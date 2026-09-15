"use client"

import { useState, useRef, useEffect } from "react"
import { X, Check, RotateCw, ZoomIn, ZoomOut, Crop, RefreshCw, FlipHorizontal, Sparkles } from "lucide-react"

interface ImageCropModalProps {
  isOpen: boolean
  imageSrc: string
  onClose: () => void
  onCropComplete: (croppedBase64: string) => void
}

type AspectRatioOption = "1:1" | "4:5" | "3:4" | "free"

export default function ImageCropModal({
  isOpen,
  imageSrc,
  onClose,
  onCropComplete,
}: ImageCropModalProps) {
  const [aspectRatio, setAspectRatio] = useState<AspectRatioOption>("1:1")
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0) // 0, 90, 180, 270
  const [isFlipped, setIsFlipped] = useState(false)
  
  // Crop box in percentage of visible container: x, y, width, height (0 to 100)
  const [cropBox, setCropBox] = useState({ x: 10, y: 10, width: 80, height: 80 })
  const [isDraggingBox, setIsDraggingBox] = useState(false)
  const [isResizingCorner, setIsResizingCorner] = useState<string | null>(null)
  const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 })
  const [initialCropBox, setInitialCropBox] = useState({ x: 10, y: 10, width: 80, height: 80 })

  const imageRef = useRef<HTMLImageElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [activeSrc, setActiveSrc] = useState(imageSrc)

  // Reset controls when modal opens with new image
  useEffect(() => {
    let objectUrlToRevoke: string | null = null

    if (isOpen) {
      setZoom(1)
      setRotation(0)
      setIsFlipped(false)
      setAspectRatio("1:1")
      setCropBox({ x: 10, y: 10, width: 80, height: 80 })
      setImageLoaded(false)

      if (imageSrc.startsWith("http")) {
        // Fetch as blob to prevent tainted canvas SecurityError
        fetch(imageSrc)
          .then(res => res.blob())
          .then(blob => {
            const blobUrl = URL.createObjectURL(blob)
            objectUrlToRevoke = blobUrl
            setActiveSrc(blobUrl)
          })
          .catch(err => {
            console.warn("Could not load image as blob, falling back to direct URL:", err)
            setActiveSrc(imageSrc)
          })
      } else {
        setActiveSrc(imageSrc)
      }
    }

    return () => {
      if (objectUrlToRevoke) {
        URL.revokeObjectURL(objectUrlToRevoke)
      }
    }
  }, [isOpen, imageSrc])

  // Adjust crop box when aspect ratio changes
  const applyAspectRatio = (ratio: AspectRatioOption) => {
    setAspectRatio(ratio)
    if (!containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    const containerW = rect.width
    const containerH = rect.height

    let targetRatio = 1 // default 1:1
    if (ratio === "1:1") targetRatio = 1
    else if (ratio === "4:5") targetRatio = 4 / 5
    else if (ratio === "3:4") targetRatio = 3 / 4
    else return // freeform

    // Calculate crop box in pixels, then convert to %
    let boxW = containerW * 0.75
    let boxH = boxW / targetRatio

    if (boxH > containerH * 0.85) {
      boxH = containerH * 0.85
      boxW = boxH * targetRatio
    }

    const boxWPercent = (boxW / containerW) * 100
    const boxHPercent = (boxH / containerH) * 100
    const boxXPercent = (100 - boxWPercent) / 2
    const boxYPercent = (100 - boxHPercent) / 2

    setCropBox({
      x: Math.max(0, boxXPercent),
      y: Math.max(0, boxYPercent),
      width: Math.min(100, boxWPercent),
      height: Math.min(100, boxHPercent),
    })
  }

  // Handle Box Dragging & Resizing
  const handleMouseDown = (e: React.MouseEvent, corner?: string) => {
    e.preventDefault()
    e.stopPropagation()
    setDragStartPos({ x: e.clientX, y: e.clientY })
    setInitialCropBox({ ...cropBox })
    if (corner) {
      setIsResizingCorner(corner)
    } else {
      setIsDraggingBox(true)
    }
  }

  const handleTouchStart = (e: React.TouchEvent, corner?: string) => {
    if (e.touches.length !== 1) return
    const touch = e.touches[0]
    setDragStartPos({ x: touch.clientX, y: touch.clientY })
    setInitialCropBox({ ...cropBox })
    if (corner) {
      setIsResizingCorner(corner)
    } else {
      setIsDraggingBox(true)
    }
  }

  useEffect(() => {
    const handleMove = (clientX: number, clientY: number) => {
      if (!isDraggingBox && !isResizingCorner) return
      if (!containerRef.current) return

      const rect = containerRef.current.getBoundingClientRect()
      const deltaXPercent = ((clientX - dragStartPos.x) / rect.width) * 100
      const deltaYPercent = ((clientY - dragStartPos.y) / rect.height) * 100

      if (isDraggingBox) {
        let newX = initialCropBox.x + deltaXPercent
        let newY = initialCropBox.y + deltaYPercent

        // Clamp inside container
        newX = Math.max(0, Math.min(100 - initialCropBox.width, newX))
        newY = Math.max(0, Math.min(100 - initialCropBox.height, newY))

        setCropBox(prev => ({ ...prev, x: newX, y: newY }))
      } else if (isResizingCorner) {
        let { x, y, width, height } = initialCropBox

        if (isResizingCorner === "se") {
          width = Math.max(20, Math.min(100 - x, width + deltaXPercent))
          height = aspectRatio === "1:1" ? width : Math.max(20, Math.min(100 - y, height + deltaYPercent))
        } else if (isResizingCorner === "sw") {
          const maxDeltaLeft = x
          const actualDeltaX = Math.max(-maxDeltaLeft, Math.min(width - 20, deltaXPercent))
          x += actualDeltaX
          width -= actualDeltaX
          height = aspectRatio === "1:1" ? width : Math.max(20, Math.min(100 - y, height + deltaYPercent))
        } else if (isResizingCorner === "ne") {
          width = Math.max(20, Math.min(100 - x, width + deltaXPercent))
          const maxDeltaTop = y
          const actualDeltaY = Math.max(-maxDeltaTop, Math.min(height - 20, deltaYPercent))
          y += actualDeltaY
          height -= actualDeltaY
          if (aspectRatio === "1:1") height = width
        } else if (isResizingCorner === "nw") {
          const maxDeltaLeft = x
          const actualDeltaX = Math.max(-maxDeltaLeft, Math.min(width - 20, deltaXPercent))
          x += actualDeltaX
          width -= actualDeltaX
          const maxDeltaTop = y
          const actualDeltaY = Math.max(-maxDeltaTop, Math.min(height - 20, deltaYPercent))
          y += actualDeltaY
          height -= actualDeltaY
          if (aspectRatio === "1:1") height = width
        }

        setCropBox({
          x: Math.max(0, Math.min(100 - width, x)),
          y: Math.max(0, Math.min(100 - height, y)),
          width: Math.min(100 - x, width),
          height: Math.min(100 - y, height),
        })
      }
    }

    const onMouseMove = (e: MouseEvent) => handleMove(e.clientX, e.clientY)
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 1) handleMove(e.touches[0].clientX, e.touches[0].clientY)
    }

    const onEnd = () => {
      setIsDraggingBox(false)
      setIsResizingCorner(null)
    }

    if (isDraggingBox || isResizingCorner) {
      window.addEventListener("mousemove", onMouseMove)
      window.addEventListener("mouseup", onEnd)
      window.addEventListener("touchmove", onTouchMove)
      window.addEventListener("touchend", onEnd)
    }

    return () => {
      window.removeEventListener("mousemove", onMouseMove)
      window.removeEventListener("mouseup", onEnd)
      window.removeEventListener("touchmove", onTouchMove)
      window.removeEventListener("touchend", onEnd)
    }
  }, [isDraggingBox, isResizingCorner, dragStartPos, initialCropBox, aspectRatio])

  // Final Canvas Generation & Crop Export
  const handleCrop = () => {
    if (!imageRef.current || !containerRef.current) return

    const img = imageRef.current
    const containerRect = containerRef.current.getBoundingClientRect()
    const imgRect = img.getBoundingClientRect()

    // Create an offscreen canvas
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Crop box in container pixels
    const cropBoxPixels = {
      x: containerRect.left + (cropBox.x / 100) * containerRect.width,
      y: containerRect.top + (cropBox.y / 100) * containerRect.height,
      width: (cropBox.width / 100) * containerRect.width,
      height: (cropBox.height / 100) * containerRect.height,
    }

    // Map crop box relative to the rendered image element
    const relX = (cropBoxPixels.x - imgRect.left) / imgRect.width
    const relY = (cropBoxPixels.y - imgRect.top) / imgRect.height
    const relW = cropBoxPixels.width / imgRect.width
    const relH = cropBoxPixels.height / imgRect.height

    // Natural dimensions of the image
    const natW = img.naturalWidth
    const natH = img.naturalHeight

    // Target crop dimension on natural image
    const sourceX = Math.max(0, relX * natW)
    const sourceY = Math.max(0, relY * natH)
    const sourceW = Math.min(natW - sourceX, relW * natW)
    const sourceH = Math.min(natH - sourceY, relH * natH)

    // Desired output size (high resolution, max 1200px)
    const outputMax = 1200
    let outW = Math.round(sourceW)
    let outH = Math.round(sourceH)

    if (outW > outputMax || outH > outputMax) {
      if (outW > outH) {
        outH = Math.round((outH * outputMax) / outW)
        outW = outputMax
      } else {
        outW = Math.round((outW * outputMax) / outH)
        outH = outputMax
      }
    }

    // Account for 90 or 270 degree rotation in output dimensions
    const isRotatedSideways = rotation === 90 || rotation === 270
    canvas.width = isRotatedSideways ? outH : outW
    canvas.height = isRotatedSideways ? outW : outH

    ctx.save()

    // Move to canvas center to apply rotation/flip
    ctx.translate(canvas.width / 2, canvas.height / 2)
    if (rotation !== 0) {
      ctx.rotate((rotation * Math.PI) / 180)
    }
    if (isFlipped) {
      ctx.scale(-1, 1)
    }

    // Draw image cropped
    ctx.drawImage(
      img,
      sourceX,
      sourceY,
      sourceW,
      sourceH,
      -outW / 2,
      -outH / 2,
      outW,
      outH
    )

    ctx.restore()

    // Export high-quality compressed JPEG base64
    try {
      const croppedDataUrl = canvas.toDataURL("image/jpeg", 0.85)
      onCropComplete(croppedDataUrl)
      onClose()
    } catch (err: any) {
      console.error("Canvas export error:", err)
      alert("Browser cross-origin security prevented exporting this image crop. Try uploading the image directly.")
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-gray-900 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl border border-gray-800 flex flex-col max-h-[95vh]">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between text-white bg-gray-900/90">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-pink-500/20 text-pink-400">
              <Crop size={18} />
            </div>
            <div>
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                Crop & Adjust Photo
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-pink-600/30 text-pink-300 border border-pink-500/30">
                  {aspectRatio === "1:1" ? "1:1 Square" : aspectRatio === "4:5" ? "4:5 Portrait" : aspectRatio}
                </span>
              </h3>
              <p className="text-xs text-gray-400">Drag to move crop area, use corners to resize</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white rounded-xl hover:bg-gray-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Aspect Ratio Tabs */}
        <div className="px-6 py-2.5 bg-gray-950 border-b border-gray-800/80 flex items-center justify-between gap-2 overflow-x-auto">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mr-2 hidden sm:inline">
              Aspect Ratio:
            </span>
            <button
              type="button"
              onClick={() => applyAspectRatio("1:1")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                aspectRatio === "1:1"
                  ? "bg-pink-600 text-white shadow-lg shadow-pink-600/20"
                  : "bg-gray-800/80 text-gray-300 hover:bg-gray-800"
              }`}
            >
              1:1 Square (Best)
            </button>
            <button
              type="button"
              onClick={() => applyAspectRatio("4:5")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                aspectRatio === "4:5"
                  ? "bg-pink-600 text-white shadow-lg shadow-pink-600/20"
                  : "bg-gray-800/80 text-gray-300 hover:bg-gray-800"
              }`}
            >
              4:5 Portrait
            </button>
            <button
              type="button"
              onClick={() => applyAspectRatio("3:4")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                aspectRatio === "3:4"
                  ? "bg-pink-600 text-white shadow-lg shadow-pink-600/20"
                  : "bg-gray-800/80 text-gray-300 hover:bg-gray-800"
              }`}
            >
              3:4 Shoot
            </button>
            <button
              type="button"
              onClick={() => setAspectRatio("free")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                aspectRatio === "free"
                  ? "bg-pink-600 text-white shadow-lg shadow-pink-600/20"
                  : "bg-gray-800/80 text-gray-300 hover:bg-gray-800"
              }`}
            >
              Free
            </button>
          </div>

          {/* Quick Transform Controls */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setRotation(r => (r + 90) % 360)}
              className="p-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white transition-colors"
              title="Rotate 90°"
            >
              <RotateCw size={15} />
            </button>
            <button
              type="button"
              onClick={() => setIsFlipped(f => !f)}
              className="p-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white transition-colors"
              title="Flip Horizontal"
            >
              <FlipHorizontal size={15} />
            </button>
            <button
              type="button"
              onClick={() => {
                setZoom(1)
                setRotation(0)
                setIsFlipped(false)
                applyAspectRatio("1:1")
              }}
              className="p-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
              title="Reset Adjustments"
            >
              <RefreshCw size={14} />
            </button>
          </div>
        </div>

        {/* Cropper Canvas Workspace */}
        <div className="relative flex-1 min-h-[320px] sm:min-h-[380px] max-h-[480px] bg-black/90 p-4 sm:p-6 flex items-center justify-center overflow-hidden select-none">
          <div 
            ref={containerRef}
            className="relative w-full h-full max-w-[420px] max-h-[420px] flex items-center justify-center overflow-hidden rounded-2xl border border-gray-800 shadow-inner"
          >
            {/* The Image */}
            <img
              ref={imageRef}
              src={activeSrc}
              alt="Crop target"
              crossOrigin="anonymous"
              onLoad={() => setImageLoaded(true)}
              style={{
                transform: `scale(${zoom}) rotate(${rotation}deg) scaleX(${isFlipped ? -1 : 1})`,
                transition: isDraggingBox || isResizingCorner ? "none" : "transform 0.15s ease",
              }}
              className="max-w-full max-h-full object-contain pointer-events-none"
            />

            {/* Dark Mask outside Crop Box */}
            <div className="absolute inset-0 pointer-events-none">
              {/* Top overlay */}
              <div 
                className="absolute top-0 left-0 right-0 bg-black/60 backdrop-blur-[1px]"
                style={{ height: `${cropBox.y}%` }}
              />
              {/* Bottom overlay */}
              <div 
                className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-[1px]"
                style={{ height: `${100 - (cropBox.y + cropBox.height)}%` }}
              />
              {/* Left overlay */}
              <div 
                className="absolute left-0 bg-black/60 backdrop-blur-[1px]"
                style={{
                  top: `${cropBox.y}%`,
                  height: `${cropBox.height}%`,
                  width: `${cropBox.x}%`,
                }}
              />
              {/* Right overlay */}
              <div 
                className="absolute right-0 bg-black/60 backdrop-blur-[1px]"
                style={{
                  top: `${cropBox.y}%`,
                  height: `${cropBox.height}%`,
                  width: `${100 - (cropBox.x + cropBox.width)}%`,
                }}
              />
            </div>

            {/* Interactive Crop Box */}
            <div
              onMouseDown={(e) => handleMouseDown(e)}
              onTouchStart={(e) => handleTouchStart(e)}
              style={{
                top: `${cropBox.y}%`,
                left: `${cropBox.x}%`,
                width: `${cropBox.width}%`,
                height: `${cropBox.height}%`,
              }}
              className="absolute border-2 border-pink-400 rounded-xl cursor-move shadow-2xl shadow-pink-500/20"
            >
              {/* Rule of Thirds Grid Lines */}
              <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none opacity-40">
                <div className="border-r border-b border-pink-200/50" />
                <div className="border-r border-b border-pink-200/50" />
                <div className="border-b border-pink-200/50" />
                <div className="border-r border-b border-pink-200/50" />
                <div className="border-r border-b border-pink-200/50" />
                <div className="border-b border-pink-200/50" />
                <div className="border-r border-pink-200/50" />
                <div className="border-r border-pink-200/50" />
                <div />
              </div>

              {/* Corner Handles */}
              <div 
                onMouseDown={(e) => handleMouseDown(e, "nw")}
                onTouchStart={(e) => handleTouchStart(e, "nw")}
                className="absolute -top-1.5 -left-1.5 w-4 h-4 bg-white border-2 border-pink-500 rounded-full cursor-nwse-resize shadow-md hover:scale-125 transition-transform"
              />
              <div 
                onMouseDown={(e) => handleMouseDown(e, "ne")}
                onTouchStart={(e) => handleTouchStart(e, "ne")}
                className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-white border-2 border-pink-500 rounded-full cursor-nesw-resize shadow-md hover:scale-125 transition-transform"
              />
              <div 
                onMouseDown={(e) => handleMouseDown(e, "sw")}
                onTouchStart={(e) => handleTouchStart(e, "sw")}
                className="absolute -bottom-1.5 -left-1.5 w-4 h-4 bg-white border-2 border-pink-500 rounded-full cursor-nesw-resize shadow-md hover:scale-125 transition-transform"
              />
              <div 
                onMouseDown={(e) => handleMouseDown(e, "se")}
                onTouchStart={(e) => handleTouchStart(e, "se")}
                className="absolute -bottom-1.5 -right-1.5 w-4 h-4 bg-white border-2 border-pink-500 rounded-full cursor-nwse-resize shadow-md hover:scale-125 transition-transform"
              />
            </div>
          </div>
        </div>

        {/* Zoom Slider Control */}
        <div className="px-6 py-3 bg-gray-950 border-t border-gray-800 flex items-center gap-3">
          <button 
            type="button"
            onClick={() => setZoom(z => Math.max(0.8, z - 0.1))} 
            className="text-gray-400 hover:text-white p-1"
          >
            <ZoomOut size={16} />
          </button>
          <input
            type="range"
            min="0.8"
            max="2.5"
            step="0.05"
            value={zoom}
            onChange={(e) => setZoom(parseFloat(e.target.value))}
            className="flex-1 accent-pink-500 h-1.5 bg-gray-800 rounded-lg cursor-pointer"
          />
          <button 
            type="button"
            onClick={() => setZoom(z => Math.min(2.5, z + 0.1))} 
            className="text-gray-400 hover:text-white p-1"
          >
            <ZoomIn size={16} />
          </button>
          <span className="text-[11px] font-mono font-bold text-gray-400 w-10 text-right">
            {Math.round(zoom * 100)}%
          </span>
        </div>

        {/* Modal Footer Buttons */}
        <div className="px-6 py-4 bg-gray-900 border-t border-gray-800 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-gray-700 text-gray-300 hover:text-white hover:bg-gray-800 text-sm font-semibold transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleCrop}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-pink-500 hover:from-pink-500 hover:to-pink-600 text-white font-bold text-sm shadow-lg shadow-pink-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Check size={16} />
            Apply & Use Cropped Photo
          </button>
        </div>

      </div>
    </div>
  )
}
