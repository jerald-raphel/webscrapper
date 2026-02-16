"use client"

import { Globe, CheckCircle, XCircle, Timer } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface StatsCardsProps {
  totalScrapes: number
  successScrapes: number
  failedScrapes: number
  avgDuration: number
}

export function StatsCards({
  totalScrapes,
  successScrapes,
  failedScrapes,
  avgDuration,
}: StatsCardsProps) {
  const cards = [
    {
      title: "Total Scrapes",
      value: totalScrapes,
      icon: Globe,
      description: "All time scraping jobs",
    },
    {
      title: "Successful",
      value: successScrapes,
      icon: CheckCircle,
      description: `${totalScrapes > 0 ? Math.round((successScrapes / totalScrapes) * 100) : 0}% success rate`,
    },
    {
      title: "Failed",
      value: failedScrapes,
      icon: XCircle,
      description: `${totalScrapes > 0 ? Math.round((failedScrapes / totalScrapes) * 100) : 0}% failure rate`,
    },
    {
      title: "Avg Response",
      value: `${avgDuration}ms`,
      icon: Timer,
      description: "Average scrape duration",
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {card.title}
            </CardTitle>
            <card.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {card.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
