"use client"

import { useEffect, useState } from "react"
import useSWR from "swr"
import {
  Zap,
  Camera,
  Shield,
  Save,
  Loader2,
  User,
  Settings as SettingsIcon,
} from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function SettingsPage() {
  const { data, isLoading, mutate } = useSWR("/api/auth/settings", fetcher)
  const [jsRendering, setJsRendering] = useState(true)
  const [screenshot, setScreenshot] = useState(false)
  const [premiumProxy, setPremiumProxy] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (data?.defaultSettings) {
      setJsRendering(data.defaultSettings.jsRendering ?? true)
      setScreenshot(data.defaultSettings.screenshot ?? false)
      setPremiumProxy(data.defaultSettings.premiumProxy ?? false)
    }
  }, [data])

  async function handleSave() {
    setSaving(true)
    try {
      const res = await fetch("/api/auth/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          defaultSettings: { jsRendering, screenshot, premiumProxy },
        }),
      })

      if (res.ok) {
        toast.success("Settings saved")
        mutate()
      } else {
        toast.error("Failed to save settings")
      }
    } catch {
      toast.error("Network error")
    } finally {
      setSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-balance">Settings</h1>
          <p className="text-muted-foreground">Manage your scraping preferences.</p>
        </div>
        <Skeleton className="h-[300px] w-full rounded-lg" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-balance">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account and scraping preferences.
        </p>
      </div>

      {/* Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <User className="h-4 w-4" />
            Profile
          </CardTitle>
          <CardDescription>Your account information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-border p-4">
              <p className="text-xs text-muted-foreground mb-1">Name</p>
              <p className="text-sm font-medium">{data?.name || "User"}</p>
            </div>
            <div className="rounded-lg border border-border p-4">
              <p className="text-xs text-muted-foreground mb-1">Email</p>
              <p className="text-sm font-medium">{data?.email || "user@example.com"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Default Scraping Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <SettingsIcon className="h-4 w-4" />
            Default Scraping Settings
          </CardTitle>
          <CardDescription>
            These settings will be pre-selected when you start a new scrape
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex items-center justify-between rounded-lg border border-border p-4">
            <div className="flex items-center gap-3">
              <Zap className="h-5 w-5 text-muted-foreground" />
              <div>
                <Label htmlFor="default-js" className="text-sm font-medium cursor-pointer">
                  JavaScript Rendering
                </Label>
                <p className="text-xs text-muted-foreground">
                  Render JavaScript on target pages for dynamic content
                </p>
              </div>
            </div>
            <Switch
              id="default-js"
              checked={jsRendering}
              onCheckedChange={setJsRendering}
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border p-4">
            <div className="flex items-center gap-3">
              <Camera className="h-5 w-5 text-muted-foreground" />
              <div>
                <Label htmlFor="default-screenshot" className="text-sm font-medium cursor-pointer">
                  Screenshot Capture
                </Label>
                <p className="text-xs text-muted-foreground">
                  Capture a full-page screenshot of scraped pages
                </p>
              </div>
            </div>
            <Switch
              id="default-screenshot"
              checked={screenshot}
              onCheckedChange={setScreenshot}
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border p-4">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-muted-foreground" />
              <div>
                <Label htmlFor="default-proxy" className="text-sm font-medium cursor-pointer">
                  Premium Proxy
                </Label>
                <p className="text-xs text-muted-foreground">
                  Use residential proxies for better success rate on protected sites
                </p>
              </div>
            </div>
            <Switch
              id="default-proxy"
              checked={premiumProxy}
              onCheckedChange={setPremiumProxy}
            />
          </div>

          <Separator />

          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Save Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
