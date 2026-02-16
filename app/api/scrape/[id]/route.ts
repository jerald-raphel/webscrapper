import { NextRequest, NextResponse } from "next/server"
import { getAuthUser } from "@/lib/auth"
import { connectDB } from "@/lib/mongodb"
import ScrapeResult from "@/models/scrape-result"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    await connectDB()
    const userId = (user as { _id: string })._id

    const result = await ScrapeResult.findOne({ _id: id, userId }).lean()

    if (!result) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    return NextResponse.json({
      ...result,
      _id: String((result as Record<string, unknown>)._id),
      userId: String((result as Record<string, unknown>).userId),
    })
  } catch (error) {
    console.error("Scrape detail error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
