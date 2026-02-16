import jwt from "jsonwebtoken"
import { cookies } from "next/headers"
import { connectDB } from "./mongodb"
import User from "@/models/user"

const JWT_SECRET = process.env.JWT_SECRET!

export function signToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "7d" })
}

export function verifyToken(token: string): { userId: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string }
  } catch {
    return null
  }
}

export async function getAuthUser() {
  const cookieStore = await cookies()
  const token = cookieStore.get("token")?.value

  if (!token) return null

  const decoded = verifyToken(token)
  if (!decoded) return null

  await connectDB()
  const user = await User.findById(decoded.userId).select("-password").lean()
  return user
}

export function setAuthCookie(token: string) {
  return `token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${7 * 24 * 60 * 60}`
}
