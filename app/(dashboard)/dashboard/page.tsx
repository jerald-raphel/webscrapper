"use client"

import { useState } from "react"
import useSWR from "swr"
import { useRouter } from "next/navigation"
import {
  Bar,
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"
import {
  Globe,
  ArrowRight,
  ExternalLink,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { StatsCards } from "@/components/stats-cards"
import { toast } from "sonner"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function DashboardPage() {
  const router = useRouter()
  const { data, isLoading } = useSWR("/api/scrape/stats", fetcher, {
    refreshInterval: 30000,
  })
  const [quickUrl, setQuickUrl] = useState("")
  const [quickLoading, setQuickLoading] = useState(false)

  async function handleQuickScrape(e: React.FormEvent) {
    e.preventDefault()
    if (!quickUrl.trim()) return

    try {
      new URL(quickUrl)
    } catch {
      toast.error("Please enter a valid URL")
      return
    }

    setQuickLoading(true)
    try {
      const res = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: quickUrl, renderJs: true }),
      })
      const json = await res.json()

      if (!res.ok) {
        toast.error(json.error || "Failed to scrape")
        return
      }

      toast.success(`Scraped "${json.title}" in ${json.duration}ms`)
      setQuickUrl("")
      // Refresh stats
      window.location.reload()
    } catch {
      toast.error("Network error")
    } finally {
      setQuickLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-balance">
            Dashboard
          </h1>
          <p className="text-muted-foreground">
            Overview of your web scraping activity.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-3 w-32 mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Skeleton className="h-[300px] w-full rounded-lg" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-balance">
            Dashboard
          </h1>
          <p className="text-muted-foreground">
            Overview of your web scraping activity.
          </p>
        </div>
        <Button onClick={() => router.push("/scraper")}>
          <Globe className="mr-2 h-4 w-4" />
          New Scrape
        </Button>
      </div>

      <StatsCards
        totalScrapes={data?.totalScrapes || 0}
        successScrapes={data?.successScrapes || 0}
        failedScrapes={data?.failedScrapes || 0}
        avgDuration={data?.avgDuration || 0}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Scraping Activity</CardTitle>
            <CardDescription>Daily scrapes over the last 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            {data?.dailyStats?.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={data.dailyStats}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-border"
                  />
                  <XAxis
                    dataKey="date"
                    className="text-xs"
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                  />
                  <YAxis
                    className="text-xs"
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      color: "hsl(var(--card-foreground))",
                    }}
                  />
                  <Legend />
                  <Bar
                    dataKey="success"
                    name="Successful"
                    fill="hsl(var(--chart-2))"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="failed"
                    name="Failed"
                    fill="hsl(var(--chart-1))"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[260px] items-center justify-center text-muted-foreground text-sm">
                No scraping activity yet. Start by scraping a URL!
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Scrape */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Quick Scrape</CardTitle>
            <CardDescription>
              Fast scrape with default settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleQuickScrape} className="flex flex-col gap-3">
              <Input
                placeholder="https://example.com"
                value={quickUrl}
                onChange={(e) => setQuickUrl(e.target.value)}
                disabled={quickLoading}
              />
              <Button
                type="submit"
                disabled={quickLoading || !quickUrl.trim()}
                className="w-full"
              >
                {quickLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <ArrowRight className="mr-2 h-4 w-4" />
                )}
                {quickLoading ? "Scraping..." : "Scrape Now"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Recent Scrapes */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base">Recent Scrapes</CardTitle>
            <CardDescription>Your latest scraping results</CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/history")}
          >
            View All
            <ArrowRight className="ml-2 h-3.5 w-3.5" />
          </Button>
        </CardHeader>
        <CardContent>
          {data?.recentScrapes?.length > 0 ? (
            <div className="flex flex-col gap-2">
              {data.recentScrapes.map(
                (scrape: {
                  _id: string
                  url: string
                  title: string
                  status: string
                  scrapedAt: string
                  duration: number
                }) => (
                  <div
                    key={scrape._id}
                    className="flex items-center justify-between gap-4 rounded-lg border border-border p-3"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {scrape.status === "success" ? (
                        <CheckCircle className="h-4 w-4 shrink-0 text-chart-2" />
                      ) : (
                        <XCircle className="h-4 w-4 shrink-0 text-destructive" />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">
                          {scrape.title || scrape.url}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {scrape.url}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {scrape.duration}ms
                      </div>
                      <Badge
                        variant={
                          scrape.status === "success" ? "secondary" : "destructive"
                        }
                        className="text-xs"
                      >
                        {scrape.status}
                      </Badge>
                    </div>
                  </div>
                )
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 py-8 text-center">
              <Globe className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                No scrapes yet. Start scraping to see results here!
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/scraper")}
              >
                Go to Scraper
                <ExternalLink className="ml-2 h-3.5 w-3.5" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
