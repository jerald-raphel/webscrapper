// "use client"

// import { useState } from "react"
// import useSWR from "swr"
// import { format } from "date-fns"
// import {
//   Download,
//   FileJson,
//   FileSpreadsheet,
//   CheckCircle,
//   XCircle,
//   Loader2,
// } from "lucide-react"
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card"
// import { Button } from "@/components/ui/button"
// import { Checkbox } from "@/components/ui/checkbox"
// import { Badge } from "@/components/ui/badge"
// import { Skeleton } from "@/components/ui/skeleton"
// import { ScrollArea } from "@/components/ui/scroll-area"
// import { toast } from "sonner"

// const fetcher = (url: string) => fetch(url).then((r) => r.json())

// interface ScrapeEntry {
//   _id: string
//   url: string
//   title: string
//   status: string
//   scrapedAt: string
//   duration: number
// }

// export default function ExportPage() {
//   const { data, isLoading } = useSWR(
//     "/api/scrape/history?limit=100",
//     fetcher
//   )
//   const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
//   const [exporting, setExporting] = useState(false)

//   function toggleSelect(id: string) {
//     setSelectedIds((prev) => {
//       const next = new Set(prev)
//       if (next.has(id)) {
//         next.delete(id)
//       } else {
//         next.add(id)
//       }
//       return next
//     })
//   }

//   function toggleAll() {
//     if (!data?.results) return
//     if (selectedIds.size === data.results.length) {
//       setSelectedIds(new Set())
//     } else {
//       setSelectedIds(new Set(data.results.map((r: ScrapeEntry) => r._id)))
//     }
//   }

//   async function handleExport(exportFormat: "json" | "csv") {
//     setExporting(true)
//     try {
//       const res = await fetch("/api/scrape/export", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           ids: selectedIds.size > 0 ? [...selectedIds] : [],
//           format: exportFormat,
//         }),
//       })

//       if (!res.ok) {
//         toast.error("Export failed")
//         return
//       }

//       if (exportFormat === "csv") {
//         const blob = await res.blob()
//         const url = URL.createObjectURL(blob)
//         const a = document.createElement("a")
//         a.href = url
//         a.download = `scrape-export-${Date.now()}.csv`
//         document.body.appendChild(a)
//         a.click()
//         document.body.removeChild(a)
//         URL.revokeObjectURL(url)
//         toast.success("CSV exported successfully")
//       } else {
//         const json = await res.json()
//         const blob = new Blob([JSON.stringify(json, null, 2)], {
//           type: "application/json",
//         })
//         const url = URL.createObjectURL(blob)
//         const a = document.createElement("a")
//         a.href = url
//         a.download = `scrape-export-${Date.now()}.json`
//         document.body.appendChild(a)
//         a.click()
//         document.body.removeChild(a)
//         URL.revokeObjectURL(url)
//         toast.success("JSON exported successfully")
//       }
//     } catch {
//       toast.error("Export failed")
//     } finally {
//       setExporting(false)
//     }
//   }

//   return (
//     <div className="flex flex-col gap-6">
//       <div>
//         <h1 className="text-2xl font-bold tracking-tight text-balance">Export Data</h1>
//         <p className="text-muted-foreground">
//           Export your scraped data as JSON or CSV files.
//         </p>
//       </div>

//       <div className="grid gap-4 sm:grid-cols-2">
//         <Card
//           className="cursor-pointer border-2 transition-colors hover:border-primary"
//           onClick={() => handleExport("json")}
//         >
//           <CardHeader>
//             <CardTitle className="flex items-center gap-2 text-base">
//               <FileJson className="h-5 w-5" />
//               Export as JSON
//             </CardTitle>
//             <CardDescription>
//               Full structured data with headings, links, images, and smart data
//             </CardDescription>
//           </CardHeader>
//           <CardContent>
//             <Button disabled={exporting} className="w-full">
//               {exporting ? (
//                 <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//               ) : (
//                 <Download className="mr-2 h-4 w-4" />
//               )}
//               Download JSON
//             </Button>
//           </CardContent>
//         </Card>

//         <Card
//           className="cursor-pointer border-2 transition-colors hover:border-primary"
//           onClick={() => handleExport("csv")}
//         >
//           <CardHeader>
//             <CardTitle className="flex items-center gap-2 text-base">
//               <FileSpreadsheet className="h-5 w-5" />
//               Export as CSV
//             </CardTitle>
//             <CardDescription>
//               Flattened tabular data compatible with Excel and Google Sheets
//             </CardDescription>
//           </CardHeader>
//           <CardContent>
//             <Button disabled={exporting} variant="secondary" className="w-full">
//               {exporting ? (
//                 <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//               ) : (
//                 <Download className="mr-2 h-4 w-4" />
//               )}
//               Download CSV
//             </Button>
//           </CardContent>
//         </Card>
//       </div>

//       {/* Select specific results to export */}
//       <Card>
//         <CardHeader>
//           <div className="flex items-center justify-between">
//             <div>
//               <CardTitle className="text-base">Select Results</CardTitle>
//               <CardDescription>
//                 {selectedIds.size > 0
//                   ? `${selectedIds.size} selected for export`
//                   : "Select specific results, or export all by default"}
//               </CardDescription>
//             </div>
//             {data?.results?.length > 0 && (
//               <Button variant="outline" size="sm" onClick={toggleAll}>
//                 {selectedIds.size === data.results.length
//                   ? "Deselect All"
//                   : "Select All"}
//               </Button>
//             )}
//           </div>
//         </CardHeader>
//         <CardContent>
//           {isLoading ? (
//             <div className="flex flex-col gap-2">
//               {[...Array(5)].map((_, i) => (
//                 <Skeleton key={i} className="h-12 w-full" />
//               ))}
//             </div>
//           ) : (
//             <ScrollArea className="h-[400px]">
//               <div className="flex flex-col gap-2">
//                 {data?.results?.length === 0 ? (
//                   <p className="text-sm text-muted-foreground text-center py-8">
//                     No scrape results to export. Start scraping first!
//                   </p>
//                 ) : (
//                   data?.results?.map((entry: ScrapeEntry) => (
//                     <div
//                       key={entry._id}
//                       className="flex items-center gap-3 rounded-lg border border-border p-3 cursor-pointer hover:bg-accent/50 transition-colors"
//                       onClick={() => toggleSelect(entry._id)}
//                     >
//                       <Checkbox
//                         checked={selectedIds.has(entry._id)}
//                         onCheckedChange={() => toggleSelect(entry._id)}
//                       />
//                       {entry.status === "success" ? (
//                         <CheckCircle className="h-4 w-4 shrink-0 text-chart-2" />
//                       ) : (
//                         <XCircle className="h-4 w-4 shrink-0 text-destructive" />
//                       )}
//                       <div className="flex-1 min-w-0">
//                         <p className="text-sm font-medium truncate">
//                           {entry.title || entry.url}
//                         </p>
//                         <p className="text-xs text-muted-foreground truncate">
//                           {entry.url}
//                         </p>
//                       </div>
//                       <div className="flex items-center gap-2 shrink-0">
//                         <Badge variant="secondary" className="text-xs">
//                           {entry.duration}ms
//                         </Badge>
//                         <span className="text-xs text-muted-foreground">
//                           {format(new Date(entry.scrapedAt), "MMM d")}
//                         </span>
//                       </div>
//                     </div>
//                   ))
//                 )}
//               </div>
//             </ScrollArea>
//           )}
//         </CardContent>
//       </Card>
//     </div>
//   )
// }


"use client"

import { useState } from "react"
import useSWR from "swr"
import { format } from "date-fns"
import {
  Download,
  FileJson,
  FileSpreadsheet,
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
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { ScrollArea } from "@/components/ui/scroll-area"

import { toast } from "sonner"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

interface ScrapeEntry {
  _id: string
  url: string
  title: string
  status: string
  scrapedAt: string
  duration: number
}

export default function ExportPage() {
  const { data, isLoading } = useSWR("/api/scrape/history?limit=100", fetcher)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [exporting, setExporting] = useState(false)

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleAll() {
    if (!data?.results) return
    if (selectedIds.size === data.results.length) setSelectedIds(new Set())
    else setSelectedIds(new Set(data.results.map((r: ScrapeEntry) => r._id)))
  }

  async function handleExport(exportFormat: "json" | "excel") {
    setExporting(true)
    try {
      const res = await fetch("/api/scrape/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ids: selectedIds.size > 0 ? [...selectedIds] : [],
          format: exportFormat,
        }),
      })

      if (!res.ok) {
        toast.error("Export failed")
        return
      }

      const blob = exportFormat === "json"
        ? new Blob([JSON.stringify(await res.json(), null, 2)], { type: "application/json" })
        : await res.blob()

      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = exportFormat === "json"
        ? `scrape-export-${Date.now()}.json`
        : `scrape-export-${Date.now()}.xlsx`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast.success(exportFormat === "json" ? "JSON exported successfully" : "Excel exported successfully")
    } catch {
      toast.error("Export failed")
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Export Data</h1>
        <p className="text-muted-foreground">
          Export your scraped data as JSON or Excel files.
        </p>
      </div>

      {/* Export Buttons */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* JSON */}
        <Card className="cursor-pointer border-2 hover:border-primary" onClick={() => handleExport("json")}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FileJson className="h-5 w-5" /> Export JSON
            </CardTitle>
            <CardDescription>Full structured data</CardDescription>
          </CardHeader>
          <CardContent>
            <Button disabled={exporting} className="w-full">
              {exporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
              Download JSON
            </Button>
          </CardContent>
        </Card>

        {/* Excel */}
        <Card className="cursor-pointer border-2 hover:border-primary" onClick={() => handleExport("excel")}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FileSpreadsheet className="h-5 w-5" /> Export Excel
            </CardTitle>
            <CardDescription>Multi-sheet Excel export</CardDescription>
          </CardHeader>
          <CardContent>
            <Button disabled={exporting} className="w-full">
              {exporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
              Download Excel
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Results list */}
      <Card>
        <CardHeader>
          <CardTitle>Select Results</CardTitle>
          <Button onClick={toggleAll} variant="outline">Select All</Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-20 w-full" />
          ) : (
            <ScrollArea className="h-[400px]">
              {data?.results?.map((entry: ScrapeEntry) => (
                <div
                  key={entry._id}
                  className="flex items-center gap-3 border p-3 rounded cursor-pointer"
                  onClick={() => toggleSelect(entry._id)}
                >
                  <Checkbox checked={selectedIds.has(entry._id)} />
                  {entry.status === "success" ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                  <div className="flex-1">
                    {entry.title}
                    <div className="text-xs text-muted-foreground">{entry.url}</div>
                  </div>
                  <Badge>{entry.duration} ms</Badge>
                  <span className="text-xs">{format(new Date(entry.scrapedAt), "MMM d")}</span>
                </div>
              ))}
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
