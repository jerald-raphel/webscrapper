"use client"

import { useState } from "react"
import { ScraperForm, type ScrapeResultData } from "@/components/scraper-form"
import { ScrapeResults } from "@/components/scrape-results"
import { ScrapingProgress } from "@/components/scraping-progress"

export default function ScraperPage() {
  const [result, setResult] = useState<ScrapeResultData | null>(null)
  const [loading, setLoading] = useState(false)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-balance">Scraper</h1>
        <p className="text-muted-foreground">
          Enter a URL to extract structured data from any website.
        </p>
      </div>

      <ScraperForm onResult={setResult} onLoading={setLoading} />

      {loading && <ScrapingProgress />}

      {result && !loading && <ScrapeResults result={result} />}
    </div>
  )
}
