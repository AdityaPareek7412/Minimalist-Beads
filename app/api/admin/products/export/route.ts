import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { requireAdmin } from "@/lib/auth"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  // 🔒 Admin authorization check
  const authError = requireAdmin(req)
  if (authError) return authError

  try {
    // Fetch all products with their categories and images
    const products = await prisma.product.findMany({
      include: {
        category: true,
        images: {
          orderBy: { order: "asc" }
        }
      },
      orderBy: { createdAt: "desc" }
    })

    // Helper to escape values for CSV
    const escapeCsv = (val: any) => {
      if (val === null || val === undefined) return ""
      let str = String(val).trim()
      // Replace double quotes with two double quotes
      str = str.replace(/"/g, '""')
      // Wrap in quotes if it contains comma, newline or quotes
      if (str.includes(",") || str.includes("\n") || str.includes("\r") || str.includes('"')) {
        str = `"${str}"`
      }
      return str
    }

    // CSV Headers
    const headers = ["Name", "Price", "Stock", "Description", "Category", "Image"]
    const rows = [headers.join(",")]

    // Generate CSV Rows
    products.forEach((p) => {
      const name = escapeCsv(p.name)
      const price = escapeCsv(p.price)
      const stock = escapeCsv(p.stock)
      const description = escapeCsv(p.description)
      const category = escapeCsv(p.category?.name || "Uncategorized")
      const image = escapeCsv(p.images?.[0]?.url || "/placeholder.jpg")

      rows.push([name, price, stock, description, category, image].join(","))
    })

    const csvContent = rows.join("\n")

    // Return the response as a downloadable attachment
    return new Response(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="minimalist-beads-products-export.csv"',
        "Cache-Control": "no-store, must-revalidate"
      }
    })

  } catch (error: any) {
    console.error("Export CSV failed:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
