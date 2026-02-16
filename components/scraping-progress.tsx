"use client"

import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"

const stages = [
  "Connecting to proxy...",
  "Loading page...",
  "Rendering JavaScript...",
  "Extracting data...",
  "Processing results...",
]

export function ScrapingProgress() {
  const [progress, setProgress] = useState(0)
  const [stage, setStage] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return prev
        const increment = Math.random() * 15 + 5
        return Math.min(prev + increment, 90)
      })
    }, 800)

    const stageInterval = setInterval(() => {
      setStage((prev) => (prev < stages.length - 1 ? prev + 1 : prev))
    }, 2000)

    return () => {
      clearInterval(interval)
      clearInterval(stageInterval)
    }
  }, [])

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <p className="text-sm font-medium">{stages[stage]}</p>
          </div>
          <Progress value={progress} className="h-2" />
          <div className="flex flex-col gap-3">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-2/3" />
            <div className="grid grid-cols-3 gap-3">
              <Skeleton className="h-20" />
              <Skeleton className="h-20" />
              <Skeleton className="h-20" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
