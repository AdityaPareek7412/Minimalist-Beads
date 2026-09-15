"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Upload, Image as ImageIcon, X, Plus, Trash2, Crop, Star, MoveLeft, MoveRight, GripVertical, Sparkles } from "lucide-react"
import Link from "next/link"
import ImageCropModal from "@/components/admin/ImageCropModal"

export default function AddProductPage() {
  const [name, setName] = useState("")
  const [price, setPrice] = useState("")
  const [stock, setStock] = useState("0")
  const [description, setDescription] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [categories, setCategories] = useState<any[]>([])
  const [images, setImages] = useState<string[]>([])
  const [isFeatured, setIsFeatured] = useState(false)
  const [loading, setLoading] = useState(false)
  const [compressingCount, setCompressingCount] = useState(0)
  
  // Cropping State
  const [cropModalOpen, setCropModalOpen] = useState(false)
  const [cropTargetIndex, setCropTargetIndex] = useState<number | null>(null)

  // Drag-and-drop Reordering State
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

  // Variants State
  const [variants, setVariants] = useState<any[]>([])

  const router = useRouter()

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
    fetch("/api/categories")
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch categories")
        return res.json()
      })
      .then(data => {
        if (Array.isArray(data)) {
          setCategories(data)
        } else {
          console.error("Categories is not an array:", data)
          setCategories([])
        }
      })
      .catch(err => {
        console.error("Fetch categories error:", err)
        setCategories([])
      })
  }, [])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      const filesArray = Array.from(files)
      const maxRemaining = 10 - images.length
      const filesToProcess = filesArray.slice(0, maxRemaining)

      filesToProcess.forEach(file => {
        setCompressingCount(prev => prev + 1)
        const reader = new FileReader()
        reader.onloadend = async () => {
          try {
            const base64 = reader.result as string
            const compressed = await compressImage(base64)
            setImages(prev => {
              if (prev.length >= 10) return prev
              return [...prev, compressed]
            })
          } catch (err) {
            console.error("Image compression failed:", err)
          } finally {
            setCompressingCount(prev => Math.max(0, prev - 1))
          }
        }
        reader.readAsDataURL(file)
      })
    }
  }

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  // Reordering & Position management
  const moveImage = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= images.length || fromIndex === toIndex) return
    setImages(prev => {
      const updated = [...prev]
      const [moved] = updated.splice(fromIndex, 1)
      updated.splice(toIndex, 0, moved)
      return updated
    })
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

  // Cropping Modal handlers
  const openCropModal = (index: number) => {
    setCropTargetIndex(index)
    setCropModalOpen(true)
  }

  const handleCropComplete = (croppedBase64: string) => {
    if (cropTargetIndex !== null) {
      setImages(prev => {
        const updated = [...prev]
        updated[cropTargetIndex] = croppedBase64
        return updated
      })
    }
    setCropModalOpen(false)
    setCropTargetIndex(null)
  }

  const addVariant = () => {
    setVariants(prev => [...prev, { name: "", price: "", stock: "10" }])
  }

  const updateVariant = (index: number, field: string, value: string) => {
    setVariants(prev => prev.map((v, i) => i === index ? { ...v, [field]: value } : v))
  }

  const removeVariant = (index: number) => {
    setVariants(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (images.length === 0) return alert("Please select at least one image")
    
    setLoading(true)
    try {
      const formattedVariants = variants
        .filter(v => v.name.trim() !== "")
        .map(v => ({
          name: v.name.trim(),
          price: v.price ? parseFloat(v.price) : null,
          stock: parseInt(v.stock) || 0
        }))

      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name, 
          price: parseFloat(price), 
          stock: parseInt(stock) || 0,
          description, 
          categoryId, 
          imagesBase64: images, 
          featured: isFeatured,
          variants: formattedVariants
        }),
      })

      const data = await res.json()
      if (res.ok) {
        router.push("/admin/products")
        router.refresh()
      } else {
        alert(data.error || "Failed to add product")
      }
    } catch (err) {
      alert("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Link href="/admin/products" className="inline-flex items-center text-sm text-gray-500 hover:text-pink-600 mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to products
        </Link>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="p-8 border-b border-gray-100 bg-gray-50/50">
            <h1 className="text-2xl font-bold text-gray-900">Add New Aesthetic Piece</h1>
            <p className="text-gray-500 text-sm mt-1">Add up to 10 photos to showcase your piece in detail.</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              {/* Image Upload Area */}
              <div className="lg:col-span-5 space-y-4">
                <div className="flex items-center justify-between pb-1 border-b border-gray-100">
                  <div>
                    <label className="block text-sm font-bold text-gray-800">
                      Product Gallery
                    </label>
                    <p className="text-[11px] text-gray-400">
                      Drag to reorder • Position #1 is Main Cover
                    </p>
                  </div>
                  <span className="text-[10px] font-bold text-pink-600 bg-pink-50 border border-pink-200 px-2 py-0.5 rounded-full uppercase tracking-wider">
                    {images.length}/10 Photos
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                   {images.map((img, idx) => {
                     const isCover = idx === 0
                     const isDragging = draggedIndex === idx
                     const isOver = dragOverIndex === idx

                     return (
                       <div 
                         key={idx}
                         draggable
                         onDragStart={(e) => handleDragStart(e, idx)}
                         onDragOver={(e) => handleDragOver(e, idx)}
                         onDrop={(e) => handleDrop(e, idx)}
                         onDragEnd={handleDragEnd}
                         className={`group relative rounded-2xl overflow-hidden border-2 transition-all shadow-sm bg-white flex flex-col cursor-grab active:cursor-grabbing select-none ${
                           isDragging ? "opacity-40 scale-95 border-dashed border-pink-400" : ""
                         } ${
                           isOver ? "ring-4 ring-pink-400 scale-[1.03] border-pink-500 shadow-xl" : isCover ? "border-pink-500 ring-2 ring-pink-200 shadow-pink-50" : "border-gray-200 hover:border-pink-300"
                         }`}
                       >
                          {/* Image Box */}
                          <div className="relative aspect-square w-full bg-gray-100 overflow-hidden">
                            <img 
                              src={img} 
                              alt={`Photo ${idx + 1}`} 
                              className="w-full h-full object-cover pointer-events-none" 
                            />
                            
                            {/* Position Badge */}
                            <div className="absolute top-2 left-2 z-10">
                              {isCover ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-pink-600 text-white shadow-md">
                                  <Star size={10} className="fill-white" /> #1 Cover
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handlePositionPrompt(idx)}
                                  className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold bg-gray-900/80 hover:bg-pink-600 text-white backdrop-blur-sm transition-colors shadow"
                                  title="Click to jump to another position"
                                >
                                  #{idx + 1}
                                </button>
                              )}
                            </div>

                            {/* Drag Grip Icon */}
                            <div className="absolute top-2 right-8 z-10 opacity-70 group-hover:opacity-100 transition-opacity">
                              <span className="inline-flex items-center p-1 rounded-md bg-black/40 text-white backdrop-blur-sm shadow text-[10px]" title="Drag to reorder">
                                <GripVertical size={12} />
                              </span>
                            </div>

                            {/* Delete Button */}
                            <div className="absolute top-2 right-2 z-10">
                              <button
                                type="button"
                                onClick={() => removeImage(idx)}
                                className="w-5 h-5 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center transition-all shadow"
                                title="Remove photo"
                              >
                                <X size={11} />
                              </button>
                            </div>

                            {/* Crop Button Overlay */}
                            <div className="absolute bottom-2 left-2 right-2 z-10 flex items-center justify-center">
                              <button
                                type="button"
                                onClick={() => openCropModal(idx)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-900/85 hover:bg-pink-600 text-white rounded-lg text-[10px] font-bold backdrop-blur-md shadow-md transition-all hover:scale-105 active:scale-95"
                                title="Crop & adjust this photo"
                              >
                                <Crop size={11} />
                                ✂️ Crop
                              </button>
                            </div>
                          </div>

                          {/* Action Controls */}
                          <div className="p-1.5 bg-gray-50 flex items-center justify-between gap-1 border-t border-gray-100 text-[10px]">
                            <button
                              type="button"
                              onClick={() => moveImage(idx, idx - 1)}
                              disabled={idx === 0}
                              className="p-1 rounded bg-white border border-gray-200 hover:bg-pink-50 hover:text-pink-600 text-gray-600 disabled:opacity-20 transition-colors"
                              title="Move Earlier"
                            >
                              <MoveLeft size={11} />
                            </button>

                            {!isCover ? (
                              <button
                                type="button"
                                onClick={() => setAsCover(idx)}
                                className="px-1.5 py-0.5 bg-white hover:bg-pink-50 border border-gray-200 hover:border-pink-300 text-pink-600 rounded text-[9px] font-bold transition-all truncate"
                                title="Set as Main Cover"
                              >
                                Make #1
                              </button>
                            ) : (
                              <span className="text-[9px] font-bold text-pink-600 font-mono">
                                Cover
                              </span>
                            )}

                            <button
                              type="button"
                              onClick={() => moveImage(idx, idx + 1)}
                              disabled={idx === images.length - 1}
                              className="p-1 rounded bg-white border border-gray-200 hover:bg-pink-50 hover:text-pink-600 text-gray-600 disabled:opacity-20 transition-colors"
                              title="Move Later"
                            >
                              <MoveRight size={11} />
                            </button>
                          </div>
                       </div>
                     )
                   })}
                   
                   {images.length < 10 && (
                     <div className="relative aspect-square">
                        <div className="w-full h-full rounded-2xl border-2 border-dashed border-gray-200 hover:border-pink-400 bg-pink-50/20 hover:bg-pink-50/40 flex flex-col items-center justify-center transition-all cursor-pointer">
                           <Upload className="w-6 h-6 text-pink-500 mb-1.5" />
                           <span className="text-[10px] font-bold text-gray-600 uppercase tracking-wider">Add Photo</span>
                           <span className="text-[9px] text-gray-400">or multiple</span>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleImageChange}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                     </div>
                   )}
                </div>
                
                <div className="p-3 bg-pink-50/50 rounded-xl border border-pink-100 text-[11px] text-pink-800 flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-pink-500 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Photo Tips:</strong> Drag & drop cards to reorder. Click <strong>✂️ Crop</strong> on any picture to crop to square (1:1), rotate, or zoom before launching!
                  </span>
                </div>
              </div>

              {/* Basic Info */}
              <div className="lg:col-span-7 space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Product Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Vintage Resin Frame"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all text-gray-900"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Base Price (₹)</label>
                    <input
                      type="number"
                      required
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="499"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Base Stock Level</label>
                    <input
                      type="number"
                      required
                      value={stock}
                      onChange={(e) => setStock(e.target.value)}
                      placeholder="10"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all text-gray-900"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Category</label>
                  <select
                    required
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all appearance-none text-gray-900"
                  >
                    <option value="">Select Category</option>
                    {Array.isArray(categories) && categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Description (Optional)</label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tell your customers about this aesthetic piece..."
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all resize-none text-gray-900"
              ></textarea>
            </div>

            {/* Product Variants Section */}
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
                          value={variant.price}
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
            
            <div className="flex items-center gap-3 p-4 bg-pink-50/50 rounded-xl border border-pink-100">
              <input
                type="checkbox"
                id="isFeatured"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="w-5 h-5 rounded border-gray-300 text-pink-600 focus:ring-pink-500"
              />
              <label htmlFor="isFeatured" className="text-sm font-medium text-gray-900 cursor-pointer">
                Mark as <span className="text-pink-600 font-bold uppercase tracking-wider">Featured</span> (Shows at the top of the store)
              </label>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading || compressingCount > 0}
                className={`w-full py-4 rounded-xl text-white font-bold text-lg shadow-xl transition-all ${
                  (loading || compressingCount > 0) ? "bg-gray-400 cursor-not-allowed" : "bg-pink-600 hover:bg-pink-700 shadow-pink-200 hover:-translate-y-1"
                }`}
              >
                {compressingCount > 0 
                  ? `Compressing Photos (${compressingCount} remaining)...` 
                  : loading 
                    ? "Adding Product..." 
                    : "Launch Product 🚀"
                }
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Image Crop Modal */}
      {cropModalOpen && cropTargetIndex !== null && images[cropTargetIndex] && (
        <ImageCropModal
          isOpen={cropModalOpen}
          imageSrc={images[cropTargetIndex]}
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
