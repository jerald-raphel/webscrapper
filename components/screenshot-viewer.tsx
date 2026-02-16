"use client"

import { Download, Maximize2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface ScreenshotViewerProps {
  screenshotUrl: string
  title: string
}

export function ScreenshotViewer({ screenshotUrl, title }: ScreenshotViewerProps) {
  if (!screenshotUrl) return null

  function handleDownload() {
    const link = document.createElement("a")
    link.href = screenshotUrl
    link.download = `screenshot-${title.replace(/[^a-z0-9]/gi, "-").toLowerCase()}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium">Page Screenshot</h4>
        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Maximize2 className="mr-2 h-3 w-3" />
                Full Size
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
              <DialogHeader>
                <DialogTitle>{title}</DialogTitle>
              </DialogHeader>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={screenshotUrl}
                alt={`Screenshot of ${title}`}
                className="w-full rounded-lg"
              />
            </DialogContent>
          </Dialog>
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="mr-2 h-3 w-3" />
            Download
          </Button>
        </div>
      </div>
      <div className="overflow-hidden rounded-lg border border-border">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={screenshotUrl}
          alt={`Screenshot of ${title}`}
          className="w-full"
        />
      </div>
    </div>
  )
}
