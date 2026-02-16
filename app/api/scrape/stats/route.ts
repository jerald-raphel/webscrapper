import { NextResponse } from "next/server"
import { getAuthUser } from "@/lib/auth"
import { connectDB } from "@/lib/mongodb"
import ScrapeResult from "@/models/scrape-result"

export async function GET() {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()
    const userId = (user as { _id: string })._id

    const [totalScrapes, successScrapes, failedScrapes, avgDurationResult, recentScrapes, dailyStats] =
      await Promise.all([
        ScrapeResult.countDocuments({ userId }),
        ScrapeResult.countDocuments({ userId, status: "success" }),
        ScrapeResult.countDocuments({ userId, status: "error" }),
        ScrapeResult.aggregate([
          { $match: { userId, status: "success" } },
          { $group: { _id: null, avgDuration: { $avg: "$duration" } } },
        ]),
        ScrapeResult.find({ userId })
          .sort({ scrapedAt: -1 })
          .limit(5)
          .select("url title status scrapedAt duration")
          .lean(),
        ScrapeResult.aggregate([
          {
            $match: {
              userId,
              scrapedAt: {
                $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
              },
            },
          },
          {
            $group: {
              _id: {
                $dateToString: { format: "%Y-%m-%d", date: "$scrapedAt" },
              },
              count: { $sum: 1 },
              success: {
                $sum: { $cond: [{ $eq: ["$status", "success"] }, 1, 0] },
              },
              failed: {
                $sum: { $cond: [{ $eq: ["$status", "error"] }, 1, 0] },
              },
            },
          },
          { $sort: { _id: 1 } },
        ]),
      ])

    const avgDuration =
      avgDurationResult.length > 0
        ? Math.round(avgDurationResult[0].avgDuration)
        : 0

    // Fill missing days in the last 7 days
    const days: { date: string; count: number; success: number; failed: number }[] = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
      const dateStr = date.toISOString().split("T")[0]
      const existing = dailyStats.find(
        (d: { _id: string }) => d._id === dateStr
      )
      days.push({
        date: date.toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
        }),
        count: existing ? existing.count : 0,
        success: existing ? existing.success : 0,
        failed: existing ? existing.failed : 0,
      })
    }

    return NextResponse.json({
      totalScrapes,
      successScrapes,
      failedScrapes,
      avgDuration,
      recentScrapes: recentScrapes.map((s: Record<string, unknown>) => ({
        ...s,
        _id: String(s._id),
      })),
      dailyStats: days,
    })
  } catch (error) {
    console.error("Stats error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
