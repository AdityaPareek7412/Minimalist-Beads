"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Upload, Image as ImageIcon, X } from "lucide-react"
import Link from "next/link"

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
  const router = useRouter()

  useEffect(() => {
    fetch("/api/categories")
      .then(res => res.json())
      .then(data => setCategories(data))
  }, [])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      const filesArray = Array.from(files);
      const maxRemaining = 10 - images.length;
      const filesToProcess = filesArray.slice(0, maxRemaining);

      filesToProcess.forEach(file => {
        const reader = new FileReader()
        reader.onloadend = () => {
          setImages(prev => {
            if (prev.length >= 10) return prev;
            return [...prev, reader.result as string];
          })
        }
        reader.readAsDataURL(file)
      })
    }
  }

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (images.length === 0) return alert("Please select at least one image")
    
    setLoading(true)
    try {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name, 
          price, 
          stock,
          description, 
          categoryId, 
          imagesBase64: images, 
          featured: isFeatured 
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
            <p className="text-gray-500">Add up to 10 photos to showcase your piece in detail.</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              {/* Image Upload Area */}
              <div className="lg:col-span-5 space-y-6">
                <label className="block text-sm font-bold text-gray-700 flex items-center justify-between">
                  Product Gallery
                  <span className="text-[10px] font-bold text-pink-500 uppercase tracking-widest">{images.length}/10 Photos</span>
                </label>
                
                <div className="grid grid-cols-2 gap-4">
                   {images.map((img, idx) => (
                     <div key={idx} className="relative aspect-square group">
                        <img src={img} alt="" className="w-full h-full object-cover rounded-xl border border-pink-100" />
                        {idx === 0 && (
                          <span className="absolute top-2 left-2 bg-pink-500 text-white text-[8px] font-bold px-2 py-0.5 rounded-full shadow-lg">MAIN</span>
                        )}
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="absolute -top-2 -right-2 bg-white text-gray-500 hover:text-red-500 rounded-full p-1 shadow-lg border border-gray-100 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={12} />
                        </button>
                     </div>
                   ))}
                   
                   {images.length < 10 && (
                     <div className="relative aspect-square">
                        <div className="w-full h-full rounded-xl border-2 border-dashed border-gray-200 hover:border-pink-300 bg-gray-50 flex flex-col items-center justify-center transition-all">
                           <Upload className="w-6 h-6 text-gray-400 mb-2" />
                           <span className="text-[10px] font-bold text-gray-400 uppercase">Add Photo</span>
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
                
                <p className="text-[10px] text-gray-400 italic">✨ Use high-quality photos for a premium look.</p>
              </div>

              {/* Basic Info */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Product Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Vintage Resin Frame"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Price (₹)</label>
                    <input
                      type="number"
                      required
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="499"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Stock Level</label>
                    <input
                      type="number"
                      required
                      value={stock}
                      onChange={(e) => setStock(e.target.value)}
                      placeholder="10"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Category</label>
                  <select
                    required
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all appearance-none"
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
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
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all resize-none"
              ></textarea>
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
                disabled={loading}
                className={`w-full py-4 rounded-xl text-white font-bold text-lg shadow-xl transition-all ${
                  loading ? "bg-gray-400" : "bg-pink-600 hover:bg-pink-700 shadow-pink-200 hover:-translate-y-1"
                }`}
              >
                {loading ? "Adding Product..." : "Launch Product 🚀"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
