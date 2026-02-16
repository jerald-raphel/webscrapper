import { NextRequest, NextResponse } from "next/server"
import { getAuthUser } from "@/lib/auth"
import { connectDB } from "@/lib/mongodb"
import User from "@/models/user"

export async function GET() {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()
    const fullUser = await User.findById((user as { _id: string })._id)
      .select("defaultSettings name email")
      .lean()

    return NextResponse.json(fullUser)
  } catch (error) {
    console.error("Settings GET error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { defaultSettings } = body

    await connectDB()
    await User.findByIdAndUpdate((user as { _id: string })._id, {
      defaultSettings: {
        jsRendering: !!defaultSettings?.jsRendering,
        screenshot: !!defaultSettings?.screenshot,
        premiumProxy: !!defaultSettings?.premiumProxy,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Settings PUT error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
