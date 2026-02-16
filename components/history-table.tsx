"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import {
  Eye,
  Trash2,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  ExternalLink,
  MoreHorizontal,
} from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"

interface HistoryEntry {
  _id: string
  url: string
  title: string
  status: "success" | "error"
  errorMessage?: string
  scrapedAt: string
  duration: number
  headings?: { tag: string; text: string }[]
  links?: { text: string; href: string }[]
  images?: { alt: string; src: string }[]
  metadata?: { description: string; keywords: string }
  smartData?: { emails: string[]; phones: string[]; prices: string[] }
  settings?: { jsRendering: boolean; screenshot: boolean; premiumProxy: boolean }
}

interface HistoryTableProps {
  entries: HistoryEntry[]
  onDelete: (id: string) => void
  onRescrape: (url: string) => void
}

export function HistoryTable({ entries, onDelete, onRescrape }: HistoryTableProps) {
  const [detailId, setDetailId] = useState<string | null>(null)
  const [detail, setDetail] = useState<HistoryEntry | null>(null)
  const [loadingDetail, setLoadingDetail] = useState(false)

  async function viewDetail(id: string) {
    setDetailId(id)
    setLoadingDetail(true)
    try {
      const res = await fetch(`/api/scrape/${id}`)
      const json = await res.json()
      if (res.ok) {
        setDetail(json)
      } else {
        toast.error("Failed to load details")
      }
    } catch {
      toast.error("Network error")
    } finally {
      setLoadingDetail(false)
    }
  }

  return (
    <>
      <div className="rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Status</TableHead>
              <TableHead className="w-[40%]">URL / Title</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No scraping history found
                </TableCell>
              </TableRow>
            ) : (
              entries.map((entry) => (
                <TableRow key={entry._id}>
                  <TableCell>
                    {entry.status === "success" ? (
                      <CheckCircle className="h-4 w-4 text-chart-2" />
                    ) : (
                      <XCircle className="h-4 w-4 text-destructive" />
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <span className="text-sm font-medium truncate max-w-[300px] block">
                        {entry.title || "Untitled"}
                      </span>
                      <span className="text-xs text-muted-foreground truncate max-w-[300px] block">
                        {entry.url}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {entry.duration}ms
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(entry.scrapedAt), "MMM d, HH:mm")}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => viewDetail(entry._id)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onRescrape(entry.url)}>
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Re-scrape
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => window.open(entry.url, "_blank")}
                        >
                          <ExternalLink className="mr-2 h-4 w-4" />
                          Visit URL
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onDelete(entry._id)}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Detail Dialog */}
      <Dialog open={!!detailId} onOpenChange={() => { setDetailId(null); setDetail(null) }}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="truncate">
              {detail?.title || "Loading..."}
            </DialogTitle>
          </DialogHeader>
          {loadingDetail ? (
            <div className="flex justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : detail ? (
            <ScrollArea className="max-h-[60vh]">
              <div className="flex flex-col gap-4 pr-4">
                <div className="flex flex-wrap gap-2">
                  <Badge variant={detail.status === "success" ? "default" : "destructive"}>
                    {detail.status}
                  </Badge>
                  <Badge variant="secondary">{detail.duration}ms</Badge>
                  <Badge variant="outline">
                    {format(new Date(detail.scrapedAt), "PPp")}
                  </Badge>
                </div>

                <div className="rounded-lg border border-border p-3">
                  <p className="text-xs text-muted-foreground mb-1">URL</p>
                  <a
                    href={detail.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm hover:underline break-all"
                  >
                    {detail.url}
                  </a>
                </div>

                {detail.metadata?.description && (
                  <div className="rounded-lg border border-border p-3">
                    <p className="text-xs text-muted-foreground mb-1">Description</p>
                    <p className="text-sm">{detail.metadata.description}</p>
                  </div>
                )}

                <Tabs defaultValue="headings">
                  <TabsList>
                    <TabsTrigger value="headings">
                      Headings ({detail.headings?.length || 0})
                    </TabsTrigger>
                    <TabsTrigger value="links">
                      Links ({detail.links?.length || 0})
                    </TabsTrigger>
                    <TabsTrigger value="images">
                      Images ({detail.images?.length || 0})
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="headings" className="mt-3">
                    <div className="flex flex-col gap-1.5">
                      {detail.headings?.slice(0, 30).map((h, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm">
                          <Badge variant="outline" className="text-xs font-mono shrink-0">
                            {h.tag}
                          </Badge>
                          <span className="truncate">{h.text}</span>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                  <TabsContent value="links" className="mt-3">
                    <div className="flex flex-col gap-1.5">
                      {detail.links?.slice(0, 30).map((l, i) => (
                        <a
                          key={i}
                          href={l.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm hover:underline truncate text-muted-foreground"
                        >
                          {l.text || l.href}
                        </a>
                      ))}
                    </div>
                  </TabsContent>
                  <TabsContent value="images" className="mt-3">
                    <div className="grid grid-cols-3 gap-2">
                      {detail.images?.slice(0, 12).map((img, i) => (
                        <div
                          key={i}
                          className="aspect-video rounded border border-border overflow-hidden bg-muted flex items-center justify-center"
                        >
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
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>

                {detail.settings && (
                  <div className="rounded-lg border border-border p-3">
                    <p className="text-xs text-muted-foreground mb-2">Settings Used</p>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant={detail.settings.jsRendering ? "default" : "outline"}>
                        JS Rendering: {detail.settings.jsRendering ? "On" : "Off"}
                      </Badge>
                      <Badge variant={detail.settings.screenshot ? "default" : "outline"}>
                        Screenshot: {detail.settings.screenshot ? "On" : "Off"}
                      </Badge>
                      <Badge variant={detail.settings.premiumProxy ? "default" : "outline"}>
                        Premium Proxy: {detail.settings.premiumProxy ? "On" : "Off"}
                      </Badge>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  )
}
