"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Upload, FileText, CheckCircle2, AlertTriangle, Play, HelpCircle, Loader2 } from "lucide-react"

interface ParsedProduct {
  name: string
  price: number
  stock: number
  description: string
  category: string
  image: string
}

export default function CSVImportPage() {
  const [file, setFile] = useState<File | null>(null)
  const [headers, setHeaders] = useState<string[]>([])
  const [rows, setRows] = useState<string[][]>([])
  const [mapping, setMapping] = useState<Record<string, string>>({})
  const [isParsing, setIsParsing] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [importResult, setImportResult] = useState<{
    success: boolean
    importedCount?: number
    errors?: Array<{ row: number; name?: string; error: string }>
  } | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  // Custom CSV parser handling quotes and commas
  const parseCSV = (text: string): string[][] => {
    const lines: string[][] = []
    let row: string[] = [""]
    let inQuotes = false

    for (let i = 0; i < text.length; i++) {
      const char = text[i]
      const nextChar = text[i + 1]

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          row[row.length - 1] += '"'
          i++ // skip double-quote escape
        } else {
          inQuotes = !inQuotes
        }
      } else if (char === "," && !inQuotes) {
        row.push("")
      } else if ((char === "\r" || char === "\n") && !inQuotes) {
        if (char === "\r" && nextChar === "\n") {
          i++
        }
        lines.push(row)
        row = [""]
      } else {
        row[row.length - 1] += char
      }
    }
    if (row.length > 1 || row[0] !== "") {
      lines.push(row)
    }
    return lines.filter(r => r.some(cell => cell.trim() !== ""))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return
    processFile(selectedFile)
  }

  const processFile = (selectedFile: File) => {
    setFile(selectedFile)
    setIsParsing(true)
    setImportResult(null)

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string
        const parsed = parseCSV(text)
        
        if (parsed.length < 2) {
          alert("The CSV file must contain a header row and at least one product row.")
          resetState()
          return
        }

        const fileHeaders = parsed[0].map(h => h.trim())
        const fileRows = parsed.slice(1)

        setHeaders(fileHeaders)
        setRows(fileRows)

        // Attempt smart auto-mapping of headers
        const newMapping: Record<string, string> = {}
        const fields = ["name", "price", "stock", "description", "category", "image"]

        fields.forEach(field => {
          const match = fileHeaders.find(h => {
            const normalizedH = h.toLowerCase().replace(/[^a-z0-9]/g, "")
            const normalizedF = field.toLowerCase()
            
            if (normalizedH === normalizedF) return true
            if (field === "name" && (normalizedH === "title" || normalizedH === "productname")) return true
            if (field === "price" && (normalizedH === "saleprice" || normalizedH === "mrp" || normalizedH === "value")) return true
            if (field === "stock" && (normalizedH === "qty" || normalizedH === "quantity" || normalizedH === "inventory" || normalizedH === "stocklevel")) return true
            if (field === "category" && (normalizedH === "collection" || normalizedH === "type")) return true
            if (field === "image" && (normalizedH === "imageurl" || normalizedH === "img" || normalizedH === "imagesource" || normalizedH === "images")) return true
            return false
          })
          if (match) {
            newMapping[field] = match
          } else {
            newMapping[field] = ""
          }
        })

        setMapping(newMapping)
      } catch (err) {
        alert("Failed to parse CSV file. Please make sure it's valid.")
      } finally {
        setIsParsing(false)
      }
    }
    reader.readAsText(selectedFile)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const droppedFile = e.dataTransfer.files?.[0]
    if (droppedFile && droppedFile.name.endsWith(".csv")) {
      processFile(droppedFile)
    } else {
      alert("Please upload a valid CSV file.")
    }
  }

  const handleMappingChange = (field: string, headerValue: string) => {
    setMapping(prev => ({ ...prev, [field]: headerValue }))
  }

  const resetState = () => {
    setFile(null)
    setHeaders([])
    setRows([])
    setMapping({})
    setImportResult(null)
    setProgress(0)
  }

  const handleImport = async () => {
    if (!mapping["name"]) {
      alert("Product Name column mapping is required.")
      return
    }
    if (!mapping["price"]) {
      alert("Product Price column mapping is required.")
      return
    }

    setIsImporting(true)
    setProgress(10)

    try {
      // 1. Map CSV rows to dynamic product schema objects
      const productsToImport: ParsedProduct[] = rows.map(row => {
        const getMappedValue = (field: string): string => {
          const headerName = mapping[field]
          if (!headerName) return ""
          const headerIndex = headers.indexOf(headerName)
          return headerIndex !== -1 ? row[headerIndex] : ""
        }

        return {
          name: getMappedValue("name"),
          price: parseFloat(getMappedValue("price").replace(/[^0-9.]/g, "")) || 0,
          stock: parseInt(getMappedValue("stock").replace(/[^0-9]/g, "")) || 10,
          description: getMappedValue("description"),
          category: getMappedValue("category"),
          image: getMappedValue("image")
        }
      })

      setProgress(40)

      // 2. Call our backend bulk import API route
      const res = await fetch("/api/admin/products/import", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ products: productsToImport })
      })

      setProgress(80)

      const result = await res.json()
      
      setProgress(100)

      if (res.ok) {
        setImportResult({
          success: true,
          importedCount: result.importedCount,
          errors: result.errors
        })
      } else {
        setImportResult({
          success: false,
          errors: [{ row: 0, error: result.error || "Unknown import error occurred" }]
        })
      }
    } catch (err: any) {
      setImportResult({
        success: false,
        errors: [{ row: 0, error: err.message || "Failed to submit request" }]
      })
    } finally {
      setIsImporting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Back Link */}
        <Link href="/admin/products" className="inline-flex items-center text-sm text-gray-500 hover:text-pink-600 mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to products
        </Link>

        {/* Heading */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            Bulk Product Importer <span className="text-xs bg-pink-100 text-pink-700 font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">CSV</span>
          </h1>
          <p className="text-gray-500 mt-2">
            Import bulk catalog lists directly with auto-category sorting and image syncing.
          </p>
        </div>

        {/* Upload Container */}
        {!file && (
          <div
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="bg-white rounded-3xl border-2 border-dashed border-gray-200 hover:border-pink-300 p-12 text-center cursor-pointer transition-all shadow-sm hover:shadow-md flex flex-col items-center justify-center min-h-[350px] group"
          >
            <div className="w-16 h-16 rounded-2xl bg-pink-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Upload className="w-8 h-8 text-pink-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Drag and drop your CSV file here</h3>
            <p className="text-sm text-gray-400 max-w-sm mb-6">
              Only CSV files are supported. First row will be treated as the table headers.
            </p>
            <button
              type="button"
              className="px-6 py-3 bg-pink-600 hover:bg-pink-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-pink-100"
            >
              Browse Files
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".csv"
              className="hidden"
            />
          </div>
        )}

        {/* Parsing state loader */}
        {isParsing && (
          <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-gray-100 flex flex-col items-center justify-center min-h-[300px]">
            <Loader2 className="w-10 h-10 text-pink-600 animate-spin mb-4" />
            <h3 className="text-lg font-bold text-gray-900">Parsing CSV...</h3>
            <p className="text-sm text-gray-400 mt-1">Reading headers and aligning columns.</p>
          </div>
        )}

        {/* Preview and Mapper Screen */}
        {file && !isParsing && !importResult && (
          <div className="space-y-8 animate-fadeIn">
            {/* File details card */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-pink-50 rounded-xl flex items-center justify-center text-pink-600">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">{file.name}</h4>
                  <p className="text-xs text-gray-400 mt-0.5">{(file.size / 1024).toFixed(2)} KB • {rows.length} product rows found</p>
                </div>
              </div>
              <button
                onClick={resetState}
                className="text-xs text-gray-400 hover:text-red-500 font-bold uppercase tracking-wider"
              >
                Change File
              </button>
            </div>

            {/* Column Mapper Card */}
            <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Column Mapping</h3>
              <p className="text-sm text-gray-400 mb-6">
                Align the database product fields with your CSV headers to map prices, images, and descriptions correctly.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Field Map item */}
                <div>
                  <label className="block text-xs font-bold text-gray-900 uppercase tracking-widest mb-2 flex items-center gap-1">
                    Product Name <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={mapping["name"] || ""}
                    onChange={(e) => handleMappingChange("name", e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all text-sm font-semibold text-gray-900"
                  >
                    <option value="">-- Choose CSV Column --</option>
                    {headers.map(h => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-900 uppercase tracking-widest mb-2 flex items-center gap-1">
                    Price (₹) <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={mapping["price"] || ""}
                    onChange={(e) => handleMappingChange("price", e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all text-sm font-semibold text-gray-900"
                  >
                    <option value="">-- Choose CSV Column --</option>
                    {headers.map(h => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-900 uppercase tracking-widest mb-2">
                    Category Name
                  </label>
                  <select
                    value={mapping["category"] || ""}
                    onChange={(e) => handleMappingChange("category", e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all text-sm font-semibold text-gray-900"
                  >
                    <option value="">-- Choose CSV Column (or will fallback to Uncategorized) --</option>
                    {headers.map(h => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-900 uppercase tracking-widest mb-2">
                    Stock Level
                  </label>
                  <select
                    value={mapping["stock"] || ""}
                    onChange={(e) => handleMappingChange("stock", e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all text-sm font-semibold text-gray-900"
                  >
                    <option value="">-- Choose CSV Column (or defaults to 10) --</option>
                    {headers.map(h => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-900 uppercase tracking-widest mb-2">
                    Image URLs / Source Link
                  </label>
                  <select
                    value={mapping["image"] || ""}
                    onChange={(e) => handleMappingChange("image", e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all text-sm font-semibold text-gray-900"
                  >
                    <option value="">-- Choose CSV Column (optional) --</option>
                    {headers.map(h => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-900 uppercase tracking-widest mb-2">
                    Product Description
                  </label>
                  <select
                    value={mapping["description"] || ""}
                    onChange={(e) => handleMappingChange("description", e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all text-sm font-semibold text-gray-900"
                  >
                    <option value="">-- Choose CSV Column (optional) --</option>
                    {headers.map(h => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Row Preview Table */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-8 border-b border-gray-50 bg-gray-50/50">
                <h3 className="text-lg font-bold text-gray-900">Preview Data (First 5 Rows)</h3>
                <p className="text-xs text-gray-400 mt-1">Verify that values align correctly with columns before executing import.</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="bg-gray-100 text-gray-500 font-bold border-b border-gray-200 select-none">
                      <th className="px-6 py-4">Row</th>
                      {headers.map(h => (
                        <th key={h} className="px-6 py-4 font-bold">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.slice(0, 5).map((row, idx) => (
                      <tr key={idx} className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors font-medium">
                        <td className="px-6 py-4 text-xs font-mono text-gray-400">#{idx + 2}</td>
                        {row.map((cell, cidx) => (
                          <td key={cidx} className="px-6 py-4 text-gray-900 truncate max-w-xs">{cell}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={resetState}
                disabled={isImporting}
                className="px-6 py-3.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold rounded-xl transition-all"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleImport}
                disabled={isImporting}
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-pink-600 hover:bg-pink-700 text-white font-bold rounded-xl shadow-xl shadow-pink-100 hover:-translate-y-0.5 transition-all disabled:bg-gray-400 disabled:-translate-y-0 disabled:shadow-none"
              >
                {isImporting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" /> Importing ({progress}%)...
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5" /> Import {rows.length} Products
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Import Results Screen */}
        {importResult && (
          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-xl max-w-2xl mx-auto text-center space-y-6 animate-scaleUp">
            {importResult.success ? (
              <div className="flex flex-col items-center">
                <CheckCircle2 className="w-16 h-16 text-green-500 mb-4 animate-bounce" />
                <h2 className="text-2xl font-bold text-gray-900">Import Finished Successfully!</h2>
                <p className="text-gray-500 mt-2 max-w-md">
                  Imported <span className="font-bold text-pink-600">{importResult.importedCount}</span> products into your store database.
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <AlertTriangle className="w-16 h-16 text-red-500 mb-4" />
                <h2 className="text-2xl font-bold text-gray-900">Import Completed with Errors</h2>
                <p className="text-gray-500 mt-2 max-w-md">
                  Some rows failed to import due to database validation or image fetch failures.
                </p>
              </div>
            )}

            {/* Error logs */}
            {importResult.errors && importResult.errors.length > 0 && (
              <div className="text-left bg-gray-50 p-5 rounded-2xl border border-gray-200">
                <h4 className="text-xs font-bold text-red-500 uppercase tracking-widest mb-3">Error Log Messages ({importResult.errors.length})</h4>
                <div className="space-y-2.5 max-h-48 overflow-y-auto pr-2">
                  {importResult.errors.map((err, idx) => (
                    <div key={idx} className="text-xs font-medium text-gray-600 flex gap-2">
                      <span className="text-red-500 font-bold select-none flex-shrink-0">[Row {err.row}]</span>
                      <span className="truncate">{err.name ? `"${err.name}" - ` : ""}{err.error}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-4 flex justify-center gap-3">
              <button
                type="button"
                onClick={resetState}
                className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-all text-sm"
              >
                Import Another File
              </button>
              <button
                type="button"
                onClick={() => {
                  router.push("/admin/products")
                  router.refresh()
                }}
                className="px-6 py-3 bg-pink-600 hover:bg-pink-700 text-white font-bold rounded-xl shadow-lg shadow-pink-100 transition-all text-sm"
              >
                View Catalog
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
