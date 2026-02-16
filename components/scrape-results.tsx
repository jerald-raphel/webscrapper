"use client"

import { useState } from "react"
import {
  FileText,
  Link2,
  Image as ImageIcon,
  Heading,
  Code2,
  Mail,
  Phone,
  DollarSign,
  Copy,
  Check,
  ExternalLink,
} from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ScreenshotViewer } from "@/components/screenshot-viewer"
import type { ScrapeResultData } from "@/components/scraper-form"
import { toast } from "sonner"

interface ScrapeResultsProps {
  result: ScrapeResultData
}

export function ScrapeResults({ result }: ScrapeResultsProps) {
  const [copiedHtml, setCopiedHtml] = useState(false)

  const stats = [
    { label: "Headings", value: result.headings.length, icon: Heading },
    { label: "Links", value: result.links.length, icon: Link2 },
    { label: "Images", value: result.images.length, icon: ImageIcon },
    {
      label: "Emails",
      value: result.smartData?.emails?.length || 0,
      icon: Mail,
    },
    {
      label: "Phones",
      value: result.smartData?.phones?.length || 0,
      icon: Phone,
    },
    {
      label: "Prices",
      value: result.smartData?.prices?.length || 0,
      icon: DollarSign,
    },
  ]

  async function copyToClipboard(text: string) {
    await navigator.clipboard.writeText(text)
    setCopiedHtml(true)
    toast.success("Copied to clipboard")
    setTimeout(() => setCopiedHtml(false), 2000)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg truncate">{result.title}</CardTitle>
            <CardDescription className="flex items-center gap-1 mt-1">
              <a
                href={result.url}
                target="_blank"
                rel="noopener noreferrer"
                className="truncate hover:underline text-muted-foreground"
              >
                {result.url}
              </a>
              <ExternalLink className="h-3 w-3 shrink-0" />
            </CardDescription>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Badge variant="secondary">{result.duration}ms</Badge>
            <Badge
              variant={result.status === "success" ? "default" : "destructive"}
            >
              {result.status}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-3 mb-6 sm:grid-cols-6">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col items-center gap-1 rounded-lg border border-border p-2.5"
            >
              <stat.icon className="h-4 w-4 text-muted-foreground" />
              <span className="text-lg font-semibold">{stat.value}</span>
              <span className="text-xs text-muted-foreground">
                {stat.label}
              </span>
            </div>
          ))}
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="w-full justify-start overflow-x-auto">
            <TabsTrigger value="overview">
              <FileText className="mr-1.5 h-3.5 w-3.5" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="headings">
              <Heading className="mr-1.5 h-3.5 w-3.5" />
              Headings
            </TabsTrigger>
            <TabsTrigger value="links">
              <Link2 className="mr-1.5 h-3.5 w-3.5" />
              Links
            </TabsTrigger>
            <TabsTrigger value="images">
              <ImageIcon className="mr-1.5 h-3.5 w-3.5" />
              Images
            </TabsTrigger>
            <TabsTrigger value="smart">
              <DollarSign className="mr-1.5 h-3.5 w-3.5" />
              Smart Data
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-4 flex flex-col gap-4">
            {result.metadata?.description && (
              <div className="rounded-lg border border-border p-4">
                <h4 className="text-sm font-medium mb-1">Meta Description</h4>
                <p className="text-sm text-muted-foreground">
                  {result.metadata.description}
                </p>
              </div>
            )}
            {result.metadata?.keywords && (
              <div className="rounded-lg border border-border p-4">
                <h4 className="text-sm font-medium mb-2">Keywords</h4>
                <div className="flex flex-wrap gap-1.5">
                  {result.metadata.keywords.split(",").map((kw, i) => (
                    <Badge key={i} variant="outline" className="text-xs">
                      {kw.trim()}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {result.screenshotUrl && (
              <ScreenshotViewer
                screenshotUrl={result.screenshotUrl}
                title={result.title}
              />
            )}
          </TabsContent>

          <TabsContent value="headings" className="mt-4">
            <ScrollArea className="h-[400px]">
              <div className="flex flex-col gap-2">
                {result.headings.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No headings found
                  </p>
                ) : (
                  result.headings.map((h, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 rounded-lg border border-border p-3"
                    >
                      <Badge variant="outline" className="shrink-0 uppercase font-mono text-xs">
                        {h.tag}
                      </Badge>
                      <span className="text-sm">{h.text}</span>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="links" className="mt-4">
            <ScrollArea className="h-[400px]">
              <div className="flex flex-col gap-2">
                {result.links.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No links found
                  </p>
                ) : (
                  result.links.map((link, i) => (
                    <div
                      key={i}
                      className="flex items-start justify-between gap-3 rounded-lg border border-border p-3"
                    >
                      <div className="flex flex-col gap-1 min-w-0 flex-1">
                        <span className="text-sm font-medium truncate">
                          {link.text}
                        </span>
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-muted-foreground truncate hover:underline"
                        >
                          {link.href}
                        </a>
                      </div>
                      <ExternalLink className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="images" className="mt-4">
            <ScrollArea className="h-[400px]">
              {result.images.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No images found
                </p>
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {result.images.map((img, i) => (
                    <div
                      key={i}
                      className="rounded-lg border border-border overflow-hidden"
                    >
                      <div className="aspect-video bg-muted flex items-center justify-center">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={img.src}
                          alt={img.alt || `Image ${i + 1}`}
                          className="w-full h-full object-cover"
                          crossOrigin="anonymous"
                          onError={(e) => {
                            ;(e.target as HTMLImageElement).style.display = "none"
                          }}
                        />
                      </div>
                      <div className="p-2">
                        <p className="text-xs text-muted-foreground truncate">
                          {img.alt || img.src}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="smart" className="mt-4">
            <div className="flex flex-col gap-4">
              {result.smartData?.emails?.length > 0 && (
                <div className="rounded-lg border border-border p-4">
                  <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Emails ({result.smartData.emails.length})
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {result.smartData.emails.map((email, i) => (
                      <Badge key={i} variant="secondary">
                        {email}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {result.smartData?.phones?.length > 0 && (
                <div className="rounded-lg border border-border p-4">
                  <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Phone Numbers ({result.smartData.phones.length})
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {result.smartData.phones.map((phone, i) => (
                      <Badge key={i} variant="secondary">
                        {phone}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {result.smartData?.prices?.length > 0 && (
                <div className="rounded-lg border border-border p-4">
                  <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Prices ({result.smartData.prices.length})
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {result.smartData.prices.map((price, i) => (
                      <Badge key={i} variant="secondary">
                        {price}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {(!result.smartData?.emails?.length &&
                !result.smartData?.phones?.length &&
                !result.smartData?.prices?.length) && (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No smart data extracted from this page
                </p>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Copy raw HTML */}
        <div className="mt-4 flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              copyToClipboard(
                JSON.stringify(
                  {
                    url: result.url,
                    title: result.title,
                    headings: result.headings,
                    links: result.links,
                    images: result.images,
                    metadata: result.metadata,
                    smartData: result.smartData,
                  },
                  null,
                  2
                )
              )
            }
          >
            {copiedHtml ? (
              <Check className="mr-2 h-3.5 w-3.5" />
            ) : (
              <Copy className="mr-2 h-3.5 w-3.5" />
            )}
            {copiedHtml ? "Copied!" : "Copy JSON Data"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
