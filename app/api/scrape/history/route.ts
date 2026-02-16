import { NextRequest, NextResponse } from "next/server"
import { getAuthUser } from "@/lib/auth"
import { connectDB } from "@/lib/mongodb"
import ScrapeResult from "@/models/scrape-result"

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const search = searchParams.get("search") || ""
    const status = searchParams.get("status") || ""

    await connectDB()
    const userId = (user as { _id: string })._id

    const query: Record<string, unknown> = { userId }
    if (search) {
      query.$or = [
        { url: { $regex: search, $options: "i" } },
        { title: { $regex: search, $options: "i" } },
      ]
    }
    if (status && (status === "success" || status === "error")) {
      query.status = status
    }

    const [results, total] = await Promise.all([
      ScrapeResult.find(query)
        .sort({ scrapedAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .select("-rawHtml -screenshotUrl")
        .lean(),
      ScrapeResult.countDocuments(query),
    ])

    return NextResponse.json({
      results: results.map((r: Record<string, unknown>) => ({
        ...r,
        _id: String(r._id),
        userId: String(r.userId),
      })),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error("History error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 })
    }

    await connectDB()
    const userId = (user as { _id: string })._id

    const result = await ScrapeResult.findOneAndDelete({ _id: id, userId })

    if (!result) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
