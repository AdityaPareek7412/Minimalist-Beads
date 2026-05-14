import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const categories = await prisma.category.findMany()
    return NextResponse.json(categories)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
