// import { NextRequest, NextResponse } from "next/server"
// import { z } from "zod"
// import { getAuthUser } from "@/lib/auth"
// import { connectDB } from "@/lib/mongodb"
// import { scrapeUrl, parseHtml } from "@/lib/scraping-bee"
// import ScrapeResult from "@/models/scrape-result"

// const scrapeSchema = z.object({
//   url: z.string().url("Please enter a valid URL"),
//   renderJs: z.boolean().optional().default(true),
//   screenshot: z.boolean().optional().default(false),
//   premiumProxy: z.boolean().optional().default(false),
// })

// export async function POST(req: NextRequest) {
//   try {
//     const user = await getAuthUser()
//     if (!user) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
//     }

//     const body = await req.json()
//     const { url, renderJs, screenshot, premiumProxy } = scrapeSchema.parse(body)

//     const startTime = Date.now()

//     const response = await scrapeUrl(url, {
//       renderJs,
//       screenshot,
//       premiumProxy,
//     })

//     const parsed = parseHtml(response.html)
//     const duration = Date.now() - startTime

//     await connectDB()

//     const result = await ScrapeResult.create({
//       userId: (user as { _id: string })._id,
//       url,
//       title: parsed.title,
//       headings: parsed.headings.slice(0, 100),
//       links: parsed.links.slice(0, 200),
//       images: parsed.images.slice(0, 100),
//       metadata: parsed.metadata,
//       smartData: parsed.smartData,
//       rawHtml: response.html.slice(0, 500000),
//       screenshotUrl: response.screenshot || "",
//       settings: { jsRendering: renderJs, screenshot, premiumProxy },
//       status: "success",
//       scrapedAt: new Date(),
//       duration,
//     })

//     return NextResponse.json({
//       id: result._id,
//       url: result.url,
//       title: parsed.title,
//       headings: parsed.headings.slice(0, 100),
//       links: parsed.links.slice(0, 200),
//       images: parsed.images.slice(0, 100),
//       metadata: parsed.metadata,
//       smartData: parsed.smartData,
//       screenshotUrl: response.screenshot || "",
//       status: "success",
//       duration,
//       scrapedAt: result.scrapedAt,
//     })
//   } catch (error) {
//     if (error instanceof z.ZodError) {
//       return NextResponse.json(
//         { error: error.errors[0].message },
//         { status: 400 }
//       )
//     }

//     // Save failed scrape attempt
//     try {
//       const user = await getAuthUser()
//       if (user) {
//         await connectDB()
//         const body = await req.clone().json().catch(() => ({}))
//         await ScrapeResult.create({
//           userId: (user as { _id: string })._id,
//           url: body.url || "unknown",
//           title: "Failed Scrape",
//           status: "error",
//           errorMessage:
//             error instanceof Error ? error.message : "Unknown error",
//           scrapedAt: new Date(),
//           duration: 0,
//         })
//       }
//     } catch {
//       // silently fail on error logging
//     }

//     console.error("Scrape error:", error)
//     return NextResponse.json(
//       {
//         error:
//           error instanceof Error ? error.message : "Failed to scrape URL",
//       },
//       { status: 500 }
//     )
//   }
// }


import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { getAuthUser } from "@/lib/auth"
import { connectDB } from "@/lib/mongodb"
import { scrapeUrl, parseHtml } from "@/lib/scraping-bee"
import ScrapeResult from "@/models/scrape-result"

const scrapeSchema = z.object({
  url: z.string().url("Please enter a valid URL"),
  renderJs: z.boolean().optional().default(true),
  screenshot: z.boolean().optional().default(false),
  premiumProxy: z.boolean().optional().default(false),
})

export async function POST(req: NextRequest) {
  try {

    // ✅ Check user
    const user = await getAuthUser()

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await req.json()

    const {
      url,
      renderJs,
      screenshot,
      premiumProxy
    } = scrapeSchema.parse(body)

    const startTime = Date.now()

    // ✅ Scrape URL
    const response = await scrapeUrl(url, {
      renderJs,
      screenshot,
      premiumProxy,
    })

    // ❗ Detect dynamic site without JS rendering
    if (!renderJs) {

      const hasFramework =
        response.html.includes("__NEXT_DATA__") ||
        response.html.includes("id=\"root\"") ||
        response.html.includes("id=\"app\"") ||
        response.html.includes("Loading...") ||
        response.html.includes("Please enable JavaScript")

      if (hasFramework) {

        await connectDB()

        await ScrapeResult.create({
          userId: (user as { _id: string })._id,
          url,
          title: "Failed - JS rendering required",
          status: "error",
          errorMessage:
            "This site requires JavaScript rendering. Enable JS rendering.",
          scrapedAt: new Date(),
          duration: Date.now() - startTime,
        })

        return NextResponse.json(
          {
            error:
              "This website requires JavaScript rendering. Enable JS rendering.",
            jsRendering: false,
            success: false,
          },
          { status: 400 }
        )
      }
    }

    // ✅ Parse HTML
    const parsed = parseHtml(response.html)

    const duration = Date.now() - startTime

    await connectDB()

    const result = await ScrapeResult.create({

      userId: (user as { _id: string })._id,

      url,

      title: parsed.title,

      headings: parsed.headings.slice(0, 100),

      links: parsed.links.slice(0, 200),

      images: parsed.images.slice(0, 100),

      metadata: parsed.metadata,

      smartData: parsed.smartData,

      rawHtml: response.html.slice(0, 500000),

      screenshotUrl: response.screenshot || "",

      settings: {
        jsRendering: renderJs,
        screenshot,
        premiumProxy
      },

      status: "success",

      scrapedAt: new Date(),

      duration,
    })

    // ✅ Return response with JS info
    return NextResponse.json({

      success: true,

      id: result._id,

      url,

      title: parsed.title,

      headings: parsed.headings.slice(0, 100),

      links: parsed.links.slice(0, 200),

      images: parsed.images.slice(0, 100),

      smartData: parsed.smartData,

      metadata: parsed.metadata,

      jsRendering: renderJs,

      proxyUsed: premiumProxy,

      htmlLength: response.html.length,

      duration,

      scrapedAt: result.scrapedAt,

    })

  } catch (error) {

    console.error("Scrape error:", error)

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Scraping failed"
      },
      { status: 500 }
    )
  }
}
