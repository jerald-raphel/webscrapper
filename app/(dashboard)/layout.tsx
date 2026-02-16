import { redirect } from "next/navigation"
import { getAuthUser } from "@/lib/auth"
import { DashboardShell } from "@/components/dashboard-shell"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getAuthUser()

  if (!user) {
    redirect("/login")
  }

  const serializedUser = {
    id: (user as { _id: { toString(): string } })._id.toString(),
    name: (user as { name: string }).name,
    email: (user as { email: string }).email,
  }

  return <DashboardShell user={serializedUser}>{children}</DashboardShell>
}
