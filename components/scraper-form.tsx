"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Globe, Loader2, Camera, Zap, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { toast } from "sonner"

const scrapeSchema = z.object({
  url: z.string().url("Please enter a valid URL"),
})

type ScrapeValues = z.infer<typeof scrapeSchema>

export interface ScrapeResultData {
  id: string
  url: string
  title: string
  headings: { tag: string; text: string }[]
  links: { text: string; href: string }[]
  images: { alt: string; src: string }[]
  metadata: { description: string; keywords: string }
  smartData: { emails: string[]; phones: string[]; prices: string[] }
  screenshotUrl: string
  status: string
  duration: number
  scrapedAt: string
}

interface ScraperFormProps {
  onResult: (result: ScrapeResultData) => void
  onLoading: (loading: boolean) => void
}

export function ScraperForm({ onResult, onLoading }: ScraperFormProps) {
  const [loading, setLoading] = useState(false)
  const [renderJs, setRenderJs] = useState(true)
  const [screenshot, setScreenshot] = useState(false)
  const [premiumProxy, setPremiumProxy] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ScrapeValues>({
    resolver: zodResolver(scrapeSchema),
    defaultValues: { url: "" },
  })

  async function onSubmit(data: ScrapeValues) {
    setLoading(true)
    onLoading(true)
    try {
      const res = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: data.url,
          renderJs,
          screenshot,
          premiumProxy,
        }),
      })

      const json = await res.json()

      if (!res.ok) {
        toast.error(json.error || "Failed to scrape URL")
        return
      }

      toast.success(`Scraped in ${json.duration}ms`)
      onResult(json)
    } catch {
      toast.error("Network error. Please try again.")
    } finally {
      setLoading(false)
      onLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Globe className="h-5 w-5" />
          Scrape a Website
        </CardTitle>
        <CardDescription>
          Enter a URL to extract data, links, images, and more.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <Label htmlFor="url">Target URL</Label>
            <div className="flex gap-2">
              <Input
                id="url"
                placeholder="https://example.com"
                className="flex-1"
                {...register("url")}
                disabled={loading}
              />
              <Button type="submit" disabled={loading} className="shrink-0">
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Globe className="mr-2 h-4 w-4" />
                )}
                {loading ? "Scraping..." : "Scrape"}
              </Button>
            </div>
            {errors.url && (
              <p className="text-sm text-destructive">{errors.url.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="flex items-center justify-between rounded-lg border border-border p-3">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-muted-foreground" />
                <Label htmlFor="renderJs" className="text-sm cursor-pointer">
                  JS Rendering
                </Label>
              </div>
              <Switch
                id="renderJs"
                checked={renderJs}
                onCheckedChange={setRenderJs}
                disabled={loading}
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border p-3">
              <div className="flex items-center gap-2">
                <Camera className="h-4 w-4 text-muted-foreground" />
                <Label htmlFor="screenshot" className="text-sm cursor-pointer">
                  Screenshot
                </Label>
              </div>
              <Switch
                id="screenshot"
                checked={screenshot}
                onCheckedChange={setScreenshot}
                disabled={loading}
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border p-3">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <Label
                  htmlFor="premiumProxy"
                  className="text-sm cursor-pointer"
                >
                  Premium Proxy
                </Label>
              </div>
              <Switch
                id="premiumProxy"
                checked={premiumProxy}
                onCheckedChange={setPremiumProxy}
                disabled={loading}
              />
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
