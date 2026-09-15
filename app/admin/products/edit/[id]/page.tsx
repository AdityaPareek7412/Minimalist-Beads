"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter, useParams } from "next/navigation"
import { 
  ArrowLeft, 
  Save, 
  Loader2, 
  Plus, 
  Trash2, 
  Image as ImageIcon, 
  Upload, 
  Star, 
  MoveLeft, 
  MoveRight,
  Crop,
  GripVertical,
  Sparkles
} from "lucide-react"
import Link from "next/link"
import { getImageUrl } from "@/lib/utils/helpers"
import ImageCropModal from "@/components/admin/ImageCropModal"

export default function EditProductPage() {
  const { id } = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [product, setProduct] = useState<any>(null)
  const [name, setName] = useState("")
  const [stock, setStock] = useState("0")
  const [price, setPrice] = useState("0")
  const [originalPrice, setOriginalPrice] = useState("")
  const [variants, setVariants] = useState<any[]>([])

  // Image Management State
  const [images, setImages] = useState<any[]>([])
  const [compressingCount, setCompressingCount] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Drag & Drop Reordering State
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

  // Crop Modal State
  const [cropModalOpen, setCropModalOpen] = useState(false)
  const [cropTargetIndex, setCropTargetIndex] = useState<number | null>(null)

  const compressImage = (base64Str: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image()
      img.src = base64Str
      img.onload = () => {
        const canvas = document.createElement("canvas")
        const MAX_WIDTH = 1000
        const MAX_HEIGHT = 1000
        let width = img.width
        let height = img.height

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width
            width = MAX_WIDTH
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height
            height = MAX_HEIGHT
          }
        }

        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext("2d")
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height)
          // Compress quality to 70% as JPEG to minimize payload size
          const compressedBase64 = canvas.toDataURL("image/jpeg", 0.7)
          resolve(compressedBase64)
        } else {
          resolve(base64Str)
        }
      }
      img.onerror = () => {
        resolve(base64Str)
      }
    })
  }

  useEffect(() => {
    if (id) {
      fetch(`/api/admin/products?id=${id}`, { cache: "no-store" })
        .then(res => {
          if (!res.ok) throw new Error("Failed to fetch product details")
          return res.json()
        })
        .then(data => {
          if (data && !data.error) {
            setProduct(data)
            setName(data.name || "")
            setStock(data.stock?.toString() || "0")
            setPrice(data.price?.toString() || "0")
            setOriginalPrice(data.originalPrice ? data.originalPrice.toString() : "")
            setVariants(data.variants || [])
            setImages(data.images || [])
          } else {
            console.error("Product fetch returned error:", data)
          }
          setLoading(false)
        })
        .catch((err) => {
          console.error("Fetch product details error:", err)
          setLoading(false)
        })
    }
  }, [id])

  // Image Reordering & Management
  const moveImage = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= images.length || fromIndex === toIndex) return
    const newImages = [...images]
    const [moved] = newImages.splice(fromIndex, 1)
    newImages.splice(toIndex, 0, moved)
    setImages(newImages)
  }

  const setAsCover = (index: number) => {
    if (index === 0) return
    moveImage(index, 0)
  }

  const handlePositionPrompt = (currentIndex: number) => {
    const input = prompt(
      `Enter position for this photo (1 to ${images.length}):\n• #1 will be the Main Cover Photo\n• #2 will be the second photo, etc.`,
      (currentIndex + 1).toString()
    )
    if (input) {
      const targetPos = parseInt(input.trim(), 10)
      if (!isNaN(targetPos) && targetPos >= 1 && targetPos <= images.length) {
        moveImage(currentIndex, targetPos - 1)
      } else {
        alert(`Please enter a valid number between 1 and ${images.length}`)
      }
    }
  }

  const removeImage = (index: number) => {
    if (images.length <= 1) {
      if (!confirm("This is the only photo for this product. Removing it will leave the product with no pictures. Continue?")) {
        return
      }
    }
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  // HTML5 Drag & Drop handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = "move"
    e.dataTransfer.setData("text/plain", index.toString())
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
    if (dragOverIndex !== index) {
      setDragOverIndex(index)
    }
  }

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === targetIndex) {
      setDraggedIndex(null)
      setDragOverIndex(null)
      return
    }
    moveImage(draggedIndex, targetIndex)
    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  // Crop Modal handlers
  const openCropModal = (index: number) => {
    setCropTargetIndex(index)
    setCropModalOpen(true)
  }

  const handleCropComplete = (croppedBase64: string) => {
    if (cropTargetIndex !== null) {
      setImages(prev => {
        const updated = [...prev]
        updated[cropTargetIndex] = {
          ...updated[cropTargetIndex],
          url: croppedBase64,
          base64: croppedBase64,
          isNew: true
        }
        return updated
      })
    }
    setCropModalOpen(false)
    setCropTargetIndex(null)
  }

  const handleAddImages = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const filesArray = Array.from(files)
    const maxRemaining = 12 - images.length
    if (maxRemaining <= 0) {
      alert("Maximum 12 photos allowed per product.")
      return
    }

    const filesToProcess = filesArray.slice(0, maxRemaining)

    for (const file of filesToProcess) {
      setCompressingCount(prev => prev + 1)
      const reader = new FileReader()
      reader.onloadend = async () => {
        try {
          const rawBase64 = reader.result as string
          const compressed = await compressImage(rawBase64)
          setImages(prev => [
            ...prev,
            {
              url: compressed,
              base64: compressed,
              alt: name || "Product image",
              isNew: true,
            }
          ])
        } catch (err) {
          console.error("Compression error:", err)
        } finally {
          setCompressingCount(prev => Math.max(0, prev - 1))
        }
      }
      reader.readAsDataURL(file)
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  // Variant Management
  const addVariant = () => {
    setVariants(prev => [...prev, { name: "", price: "", stock: "10" }])
  }

  const updateVariant = (index: number, field: string, value: string) => {
    setVariants(prev => prev.map((v, i) => i === index ? { ...v, [field]: value } : v))
  }

  const removeVariant = (index: number) => {
    setVariants(prev => prev.filter((_, i) => i !== index))
  }

  // Save All Changes
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const formattedVariants = variants
        .filter(v => v.name.trim() !== "")
        .map(v => ({
          name: v.name.trim(),
          price: v.price ? parseFloat(v.price) : null,
          stock: parseInt(v.stock) || 0
        }))

      const formattedImages = images.map((img, idx) => ({
        url: img.url,
        base64: img.base64 || (typeof img.url === "string" && img.url.startsWith("data:") ? img.url : undefined),
        alt: name.trim() || img.alt || "Product image",
        order: idx
      }))

      const res = await fetch("/api/admin/products", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          id, 
          name: name.trim(),
          stock: parseInt(stock) || 0,
          price: parseFloat(price) || 0,
          originalPrice: originalPrice ? parseFloat(originalPrice) : null,
          variants: formattedVariants,
          images: formattedImages
        }),
      })

      if (res.ok) {
        alert("✅ Product details and photos successfully updated!")
        router.push("/admin/products")
        router.refresh()
      } else {
        const errData = await res.json().catch(() => ({}))
        alert("Failed to update product details: " + (errData.error || "Unknown error"))
      }
    } catch (err: any) {
      alert("Something went wrong: " + (err.message || err))
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-pink-600" />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500 font-bold">Product not found.</p>
      </div>
    )
  }

  const headerCoverPhoto = images?.[0] ? (images[0].base64 || getImageUrl(images[0].url)) : null

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <Link href="/admin/products" className="inline-flex items-center text-sm text-gray-500 hover:text-pink-600 mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to inventory
        </Link>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Header Bar with Live Cover Photo */}
          <div className="p-6 sm:p-8 border-b border-gray-100 bg-gray-50/50 flex items-center gap-5 sm:gap-6">
            <div className="w-20 h-20 rounded-xl bg-gray-200 overflow-hidden flex-shrink-0 border-2 border-pink-200 shadow-sm relative">
              {headerCoverPhoto ? (
                <img src={headerCoverPhoto} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <ImageIcon size={24} />
                </div>
              )}
              <span className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-pink-600 text-white text-[8px] font-bold rounded">
                #1 Cover
              </span>
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{name || product.name}</h1>
              <p className="text-gray-500 text-xs sm:text-sm">Manage product photos, order, stock, and variations</p>
            </div>
          </div>

          <form onSubmit={handleSaveProduct} className="p-6 sm:p-8 space-y-8">
            {/* 1. Product Photos & Gallery Management Section */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-gray-100">
                <div>
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                    <ImageIcon className="w-4.5 h-4.5 text-pink-500" />
                    Product Photos & Gallery Order
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Position <span className="font-bold text-pink-600">#1</span> is the Main Cover photo shown in the shop and collection cards!
                  </p>
                </div>
                
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleAddImages}
                    className="hidden"
                    id="product-image-upload-input"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={compressingCount > 0}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-pink-50 hover:bg-pink-100 text-pink-700 rounded-xl text-xs font-bold transition-all border border-pink-200 shadow-sm w-full sm:w-auto justify-center"
                  >
                    {compressingCount > 0 ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" /> Processing ({compressingCount})...
                      </>
                    ) : (
                      <>
                        <Upload className="w-3.5 h-3.5 text-pink-600" /> + Add More Photos
                      </>
                    )}
                  </button>
                </div>
              </div>

              {images.length === 0 ? (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="p-8 text-center bg-pink-50/20 rounded-2xl border-2 border-dashed border-pink-200 cursor-pointer hover:bg-pink-50/40 transition-all"
                >
                  <Upload className="w-8 h-8 text-pink-400 mx-auto mb-2" />
                  <p className="text-xs font-bold text-gray-700">No photos added yet</p>
                  <p className="text-xs text-gray-400 mt-1">Click to upload pictures for this product</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {images.map((img, index) => {
                      const isCover = index === 0
                      const displaySrc = img.base64 || getImageUrl(img.url)
                      const isDragging = draggedIndex === index
                      const isOver = dragOverIndex === index

                      return (
                        <div 
                          key={img.id || index}
                          draggable
                          onDragStart={(e) => handleDragStart(e, index)}
                          onDragOver={(e) => handleDragOver(e, index)}
                          onDrop={(e) => handleDrop(e, index)}
                          onDragEnd={handleDragEnd}
                          className={`group relative rounded-2xl overflow-hidden border-2 transition-all shadow-sm bg-white flex flex-col cursor-grab active:cursor-grabbing select-none ${
                            isDragging ? 'opacity-40 scale-95 border-dashed border-pink-400' : ''
                          } ${
                            isOver ? 'ring-4 ring-pink-400 scale-[1.03] border-pink-500 shadow-xl' : isCover ? 'border-pink-500 ring-2 ring-pink-200 shadow-pink-50' : 'border-gray-200 hover:border-pink-300'
                          }`}
                        >
                          {/* Image Preview Card */}
                          <div className="relative aspect-square w-full bg-gray-100 overflow-hidden">
                            <img 
                              src={displaySrc} 
                              alt={`Product photo ${index + 1}`} 
                              className="w-full h-full object-cover pointer-events-none"
                            />
                            
                            {/* Position Badge */}
                            <div className="absolute top-2 left-2 z-10">
                              {isCover ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-pink-600 text-white shadow-md">
                                  <Star size={11} className="fill-white" /> #1 Cover
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handlePositionPrompt(index)}
                                  className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-900/80 hover:bg-pink-600 text-white backdrop-blur-sm transition-colors shadow"
                                  title="Click to jump to another position"
                                >
                                  #{index + 1}
                                </button>
                              )}
                            </div>

                            {/* Drag Grip Indicator */}
                            <div className="absolute top-2 right-9 z-10 opacity-70 group-hover:opacity-100 transition-opacity">
                              <span className="inline-flex items-center p-1 rounded-md bg-black/40 text-white backdrop-blur-sm shadow text-[10px]" title="Drag to reorder">
                                <GripVertical size={13} />
                              </span>
                            </div>

                            {/* Delete Button */}
                            <div className="absolute top-2 right-2 z-10">
                              <button
                                type="button"
                                onClick={() => removeImage(index)}
                                className="w-7 h-7 rounded-full bg-red-600/90 hover:bg-red-700 text-white flex items-center justify-center transition-all shadow-sm"
                                title="Remove this photo"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>

                            {/* Crop Button Overlay */}
                            <div className="absolute bottom-2 left-2 right-2 z-10 flex items-center justify-center">
                              <button
                                type="button"
                                onClick={() => openCropModal(index)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-900/85 hover:bg-pink-600 text-white rounded-lg text-[10px] font-bold backdrop-blur-md shadow-md transition-all hover:scale-105 active:scale-95"
                                title="Crop & adjust this photo"
                              >
                                <Crop size={11} />
                                ✂️ Crop
                              </button>
                            </div>

                            {img.isNew && (
                              <div className="absolute top-9 left-2 z-10">
                                <span className="px-2 py-0.5 bg-green-600 text-white text-[9px] font-bold rounded-full shadow">
                                  New / Edited
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Position Action Controls */}
                          <div className="p-2 bg-gray-50 flex items-center justify-between gap-1 border-t border-gray-100">
                            {/* Shift Left */}
                            <button
                              type="button"
                              onClick={() => moveImage(index, index - 1)}
                              disabled={index === 0}
                              className="p-1.5 rounded-lg bg-white border border-gray-200 hover:bg-pink-50 hover:text-pink-600 text-gray-600 disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-gray-600 transition-colors"
                              title="Move Left / Earlier"
                            >
                              <MoveLeft size={14} />
                            </button>

                            {/* 1-Click Set as Cover Photo */}
                            {!isCover ? (
                              <button
                                type="button"
                                onClick={() => setAsCover(index)}
                                className="px-2 py-1 bg-white hover:bg-pink-50 border border-gray-200 hover:border-pink-300 text-pink-600 rounded-lg text-[10px] font-bold transition-all truncate"
                                title="Make this photo #1 Cover"
                              >
                                Make #1
                              </button>
                            ) : (
                              <span className="text-[10px] font-bold text-pink-600 font-mono">
                                Main
                              </span>
                            )}

                            {/* Position Number Jumper */}
                            <button
                              type="button"
                              onClick={() => handlePositionPrompt(index)}
                              className="px-2 py-1 bg-white hover:bg-pink-50 border border-gray-200 hover:border-pink-300 text-gray-700 rounded-lg text-[10px] font-mono font-bold transition-all"
                              title="Click to jump to any position (e.g. 1 or 2)"
                            >
                              #{index + 1}
                            </button>

                            {/* Shift Right */}
                            <button
                              type="button"
                              onClick={() => moveImage(index, index + 1)}
                              disabled={index === images.length - 1}
                              className="p-1.5 rounded-lg bg-white border border-gray-200 hover:bg-pink-50 hover:text-pink-600 text-gray-600 disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-gray-600 transition-colors"
                              title="Move Right / Later"
                            >
                              <MoveRight size={14} />
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}

                {images.length > 0 && (
                  <div className="p-3 bg-pink-50/50 rounded-xl border border-pink-100 text-[11px] text-pink-800 flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-pink-500 flex-shrink-0 mt-0.5" />
                    <span>
                      <strong>Photo Management:</strong> Drag and drop any card to reorder (#1 is Main Cover). Click <strong>✂️ Crop</strong> on any picture (including existing ones) to crop, zoom, or rotate!
                    </span>
                  </div>
                )}
            </div>

            {/* 2. Product Name Field */}
            <div className="space-y-2 border-t border-gray-100 pt-6">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest">Product Title / Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Pink Beaded Necklace"
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-lg font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all shadow-sm"
              />
              <p className="text-xs text-gray-400">Updates the visible title across store and catalog.</p>
            </div>

            {/* 3. Price & Inventory Management */}
            <div className="space-y-4 border-t border-gray-100 pt-6">
              <label className="block text-sm font-bold text-gray-700">Price & Inventory Management</label>
              <div className="p-6 bg-pink-50/50 rounded-2xl border border-pink-100 space-y-6">
                {/* Price Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-pink-100/50">
                  <div>
                    <label className="block text-xs font-bold text-pink-500 uppercase tracking-widest mb-2">Base Price (₹)</label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-full px-4 py-3 bg-white border border-pink-100 rounded-xl text-lg font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all shadow-sm"
                    />
                    <p className="text-xs text-gray-400 mt-1">The main selling price of the product.</p>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-pink-500 uppercase tracking-widest mb-2">Original Price (₹) - Optional</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={originalPrice}
                      onChange={(e) => setOriginalPrice(e.target.value)}
                      placeholder="e.g. 999"
                      className="w-full px-4 py-3 bg-white border border-pink-100 rounded-xl text-lg font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all shadow-sm"
                    />
                    <p className="text-xs text-gray-400 mt-1">For strike-through discount comparison.</p>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-pink-500 uppercase tracking-widest mb-2">Base Stock Level</label>
                  <div className="flex items-center gap-4">
                    <input
                      type="number"
                      required
                      min="0"
                      value={stock}
                      onChange={(e) => setStock(e.target.value)}
                      className="w-32 px-4 py-3 bg-white border border-pink-100 rounded-xl text-lg font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all shadow-sm"
                    />
                    <div className="flex flex-col">
                       <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded w-fit ${parseInt(stock) === 0 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                          {parseInt(stock) === 0 ? 'Out of Stock' : 'Available'}
                       </span>
                       <p className="text-xs text-gray-400 mt-1">Base stock when no variant is selected.</p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-pink-100/50">
                  <p className="text-[11px] text-gray-500 font-medium leading-relaxed">
                    🌟 <span className="font-bold">Pro Tip:</span> Setting stock to <span className="text-red-500 font-bold">0</span> will mark the product as <span className="font-bold">SOLD OUT</span> if it has no variants or if selected variants are also out of stock.
                  </p>
                </div>
              </div>
            </div>

            {/* 4. Product Variants Section */}
            <div className="border-t border-gray-100 pt-8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Product Variations</h3>
                  <p className="text-xs text-gray-500">Define colors, sizes, or styles. Leave variant price empty to inherit the base price.</p>
                </div>
                <button
                  type="button"
                  onClick={addVariant}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-pink-50 text-pink-600 hover:bg-pink-100 rounded-xl text-xs font-bold transition-all"
                >
                  <Plus size={16} /> Add Variant Option
                </button>
              </div>

              {variants.length === 0 ? (
                <div className="p-8 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                  <span className="text-2xl">✨</span>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-2">No Variations Added</p>
                  <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">This product only has one default option. Click above to add choices like color overrides.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {variants.map((variant, index) => (
                    <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-5 bg-pink-50/20 border border-pink-100 rounded-2xl">
                      <div className="flex-1 w-full">
                        <label className="block text-[10px] font-bold text-pink-500 uppercase tracking-widest mb-1">Variant Name (e.g. Red, Blue, Large)</label>
                        <input
                          type="text"
                          required
                          value={variant.name}
                          onChange={(e) => updateVariant(index, "name", e.target.value)}
                          placeholder="e.g. Ocean Blue"
                          className="w-full px-4 py-2.5 bg-white border border-pink-100 rounded-xl text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                        />
                      </div>
                      <div className="w-full sm:w-36">
                        <label className="block text-[10px] font-bold text-pink-500 uppercase tracking-widest mb-1">Price Override (₹)</label>
                        <input
                          type="number"
                          value={variant.price || ""}
                          onChange={(e) => updateVariant(index, "price", e.target.value)}
                          placeholder="Optional"
                          className="w-full px-4 py-2.5 bg-white border border-pink-100 rounded-xl text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                        />
                      </div>
                      <div className="w-full sm:w-28">
                        <label className="block text-[10px] font-bold text-pink-500 uppercase tracking-widest mb-1">Stock Level</label>
                        <input
                          type="number"
                          required
                          value={variant.stock}
                          onChange={(e) => updateVariant(index, "stock", e.target.value)}
                          placeholder="10"
                          className="w-full px-4 py-2.5 bg-white border border-pink-100 rounded-xl text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeVariant(index)}
                        className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all self-end sm:self-center"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={saving || compressingCount > 0}
                className={`w-full py-4 rounded-xl text-white font-bold text-lg shadow-xl transition-all flex items-center justify-center gap-3 ${
                  saving || compressingCount > 0
                    ? "bg-gray-400 cursor-not-allowed" 
                    : "bg-gray-900 hover:bg-pink-600 shadow-gray-200 hover:shadow-pink-100 hover:-translate-y-1"
                }`}
              >
                {saving ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Saving Photos & Details...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Save Product Details
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Image Crop Modal */}
      {cropModalOpen && cropTargetIndex !== null && images[cropTargetIndex] && (
        <ImageCropModal
          isOpen={cropModalOpen}
          imageSrc={images[cropTargetIndex].base64 || getImageUrl(images[cropTargetIndex].url)}
          onClose={() => {
            setCropModalOpen(false)
            setCropTargetIndex(null)
          }}
          onCropComplete={handleCropComplete}
        />
      )}
    </div>
  )
}
