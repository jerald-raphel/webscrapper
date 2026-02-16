// import { NextRequest, NextResponse } from "next/server"
// import { getAuthUser } from "@/lib/auth"
// import { connectDB } from "@/lib/mongodb"
// import ScrapeResult from "@/models/scrape-result"

// export async function POST(req: NextRequest) {
//   try {
//     const user = await getAuthUser()
//     if (!user) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
//     }

//     const body = await req.json()
//     const { ids, format: exportFormat } = body

//     await connectDB()
//     const userId = (user as { _id: string })._id

//     const query: Record<string, unknown> = { userId }
//     if (ids && Array.isArray(ids) && ids.length > 0) {
//       query._id = { $in: ids }
//     }

//     const results = await ScrapeResult.find(query)
//       .sort({ scrapedAt: -1 })
//       .select("-rawHtml")
//       .lean()

//     if (exportFormat === "csv") {
//       // Build CSV
//       const headers = [
//         "ID",
//         "URL",
//         "Title",
//         "Status",
//         "Duration (ms)",
//         "Headings Count",
//         "Links Count",
//         "Images Count",
//         "Emails",
//         "Phones",
//         "Prices",
//         "Description",
//         "Scraped At",
//       ]

//       const rows = results.map((r: Record<string, unknown>) => {
//         const smartData = r.smartData as { emails?: string[]; phones?: string[]; prices?: string[] } | undefined
//         const metadata = r.metadata as { description?: string } | undefined
//         const headings = r.headings as unknown[] | undefined
//         const links = r.links as unknown[] | undefined
//         const images = r.images as unknown[] | undefined

//         return [
//           String(r._id),
//           `"${String(r.url || "").replace(/"/g, '""')}"`,
//           `"${String(r.title || "").replace(/"/g, '""')}"`,
//           String(r.status || ""),
//           String(r.duration || 0),
//           String(headings?.length || 0),
//           String(links?.length || 0),
//           String(images?.length || 0),
//           `"${(smartData?.emails || []).join("; ")}"`,
//           `"${(smartData?.phones || []).join("; ")}"`,
//           `"${(smartData?.prices || []).join("; ")}"`,
//           `"${String(metadata?.description || "").replace(/"/g, '""')}"`,
//           String(r.scrapedAt || ""),
//         ].join(",")
//       })

//       const csv = [headers.join(","), ...rows].join("\n")

//       return new NextResponse(csv, {
//         headers: {
//           "Content-Type": "text/csv",
//           "Content-Disposition": `attachment; filename="scrape-export-${Date.now()}.csv"`,
//         },
//       })
//     }

//     // Default JSON export
//     const cleaned = results.map((r: Record<string, unknown>) => ({
//       id: String(r._id),
//       url: r.url,
//       title: r.title,
//       status: r.status,
//       duration: r.duration,
//       headings: r.headings,
//       links: r.links,
//       images: r.images,
//       metadata: r.metadata,
//       smartData: r.smartData,
//       settings: r.settings,
//       scrapedAt: r.scrapedAt,
//     }))

//     return NextResponse.json(cleaned)
//   } catch (error) {
//     console.error("Export error:", error)
//     return NextResponse.json(
//       { error: "Internal server error" },
//       { status: 500 }
//     )
//   }
// }



// import { NextRequest, NextResponse } from "next/server"
// import { getAuthUser } from "@/lib/auth"
// import { connectDB } from "@/lib/mongodb"
// import ScrapeResult from "@/models/scrape-result"
// import * as XLSX from "xlsx"

// export async function POST(req: NextRequest) {
//   try {
//     const user = await getAuthUser()

//     if (!user) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
//     }

//     const body = await req.json()
//     const { ids, format: exportFormat } = body

//     await connectDB()

//     const userId = (user as { _id: string })._id

//     const query: Record<string, unknown> = { userId }

//     if (ids && Array.isArray(ids) && ids.length > 0) {
//       query._id = { $in: ids }
//     }

//     const results = await ScrapeResult.find(query)
//       .sort({ scrapedAt: -1 })
//       .lean()

//     // ✅ CSV EXPORT (keep your existing logic)
//     if (exportFormat === "csv") {

//       const headers = [
//         "URL",
//         "Title",
//         "Description",
//         "Headings Count",
//         "Links Count",
//         "Images Count",
//         "Scraped At",
//       ]

//       const rows = results.map((r: any) => [
//         r.url,
//         r.title,
//         r.metadata?.description || "",
//         r.headings?.length || 0,
//         r.links?.length || 0,
//         r.images?.length || 0,
//         r.scrapedAt,
//       ])

//       const csv =
//         headers.join(",") +
//         "\n" +
//         rows.map((row) => row.join(",")).join("\n")

//       return new NextResponse(csv, {
//         headers: {
//           "Content-Type": "text/csv",
//           "Content-Disposition":
//             `attachment; filename="scrape-export-${Date.now()}.csv`,
//         },
//       })
//     }

//     // ✅ EXCEL EXPORT (BEST METHOD)
//     if (exportFormat === "excel") {

//       const workbook = XLSX.utils.book_new()

//       // Sheet 1: Overview
//       const overview = results.map((r: any) => ({
//         URL: r.url,
//         Title: r.title,
//         Description: r.metadata?.description || "",
//         Status: r.status,
//         Duration: r.duration,
//         ScrapedAt: r.scrapedAt,
//       }))

//       const overviewSheet = XLSX.utils.json_to_sheet(overview)
//       XLSX.utils.book_append_sheet(workbook, overviewSheet, "Overview")

//       // Sheet 2: Headings
//       const headings: any[] = []

//       results.forEach((r: any) => {
//         r.headings?.forEach((h: any) => {
//           headings.push({
//             URL: r.url,
//             Tag: h.tag,
//             Text: h.text,
//           })
//         })
//       })

//       const headingsSheet = XLSX.utils.json_to_sheet(headings)
//       XLSX.utils.book_append_sheet(workbook, headingsSheet, "Headings")

//       // Sheet 3: Links
//       const links: any[] = []

//       results.forEach((r: any) => {
//         r.links?.forEach((l: any) => {
//           links.push({
//             URL: r.url,
//             Text: l.text,
//             Link: l.href,
//           })
//         })
//       })

//       const linksSheet = XLSX.utils.json_to_sheet(links)
//       XLSX.utils.book_append_sheet(workbook, linksSheet, "Links")

//       // Sheet 4: Images
//       const images: any[] = []

//       results.forEach((r: any) => {
//         r.images?.forEach((img: any) => {
//           images.push({
//             URL: r.url,
//             Alt: img.alt,
//             ImageURL: img.src,
//           })
//         })
//       })

//       const imagesSheet = XLSX.utils.json_to_sheet(images)
//       XLSX.utils.book_append_sheet(workbook, imagesSheet, "Images")

//       // Convert to buffer
//       const buffer = XLSX.write(workbook, {
//         type: "buffer",
//         bookType: "xlsx",
//       })

//       return new NextResponse(buffer, {
//         headers: {
//           "Content-Type":
//             "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",

//           "Content-Disposition":
//             `attachment; filename="scrape-export-${Date.now()}.xlsx`,
//         },
//       })
//     }

//     // Default JSON
//     return NextResponse.json(results)

//   } catch (error) {

//     console.error(error)

//     return NextResponse.json(
//       { error: "Export failed" },
//       { status: 500 }
//     )
//   }
// }



import { NextRequest, NextResponse } from "next/server"
import { getAuthUser } from "@/lib/auth"
import { connectDB } from "@/lib/mongodb"
import ScrapeResult from "@/models/scrape-result"
import * as XLSX from "xlsx"

export async function POST(req: NextRequest) {
  try {

    const user = await getAuthUser()

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { ids, format: exportFormat } = body

    await connectDB()

    const userId = (user as { _id: string })._id

    const query: Record<string, unknown> = { userId }

    if (ids && Array.isArray(ids) && ids.length > 0) {
      query._id = { $in: ids }
    }

    const results = await ScrapeResult.find(query)
      .sort({ scrapedAt: -1 })
      .lean()

    // =====================
    // CSV EXPORT
    // =====================

    if (exportFormat === "csv") {

      const headers = [
        "URL",
        "Title",
        "Description",
        "Headings Count",
        "Links Count",
        "Images Count",
        "Scraped At",
      ]

      const rows = results.map((r: any) => [
        r.url,
        r.title,
        r.metadata?.description || "",
        r.headings?.length || 0,
        r.links?.length || 0,
        r.images?.length || 0,
        r.scrapedAt,
      ])

      const csv =
        headers.join(",") +
        "\n" +
        rows.map((row) => row.join(",")).join("\n")

      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition":
            `attachment; filename="scrape-export-${Date.now()}.csv`,
        },
      })
    }

    // =====================
    // EXCEL EXPORT
    // =====================

    if (exportFormat === "excel") {

      const workbook = XLSX.utils.book_new()

      // -----------------
      // Sheet 1: Overview
      // -----------------

      const overview = results.map((r: any) => ({

        URL: r.url,
        Title: r.title,
        Description: r.metadata?.description || "",
        Status: r.status,
        Duration: r.duration,
        ScrapedAt: r.scrapedAt,

      }))

      const overviewSheet =
        XLSX.utils.json_to_sheet(overview)

      XLSX.utils.book_append_sheet(
        workbook,
        overviewSheet,
        "Overview"
      )

      // -----------------
      // Sheet 2: Headings
      // -----------------

      const headings: any[] = []

      results.forEach((r: any) => {

        r.headings?.forEach((h: any) => {

          headings.push({

            URL: r.url,
            Tag: h.tag,
            Text: h.text,

          })

        })

      })

      const headingsSheet =
        XLSX.utils.json_to_sheet(headings)

      XLSX.utils.book_append_sheet(
        workbook,
        headingsSheet,
        "Headings"
      )

      // -----------------
      // Sheet 3: Links
      // -----------------

      const links: any[] = []

      results.forEach((r: any) => {

        r.links?.forEach((l: any) => {

          links.push({

            URL: r.url,
            Text: l.text,
            Link: l.href,

          })

        })

      })

      const linksSheet =
        XLSX.utils.json_to_sheet(links)

      XLSX.utils.book_append_sheet(
        workbook,
        linksSheet,
        "Links"
      )

      // -----------------
      // Sheet 4: Images
      // -----------------

      const images: any[] = []

      results.forEach((r: any) => {

        r.images?.forEach((img: any) => {

          images.push({

            URL: r.url,
            Alt: img.alt,
            ImageURL: img.src,

          })

        })

      })

      const imagesSheet =
        XLSX.utils.json_to_sheet(images)

      XLSX.utils.book_append_sheet(
        workbook,
        imagesSheet,
        "Images"
      )

      // -----------------
      // Sheet 5: SmartData ✅
      // -----------------

      const smartDataRows: any[] = []

      results.forEach((r: any) => {

        if (r.smartData) {

          Object.entries(r.smartData).forEach(
            ([key, value]) => {

              // handle array values
              if (Array.isArray(value)) {

                value.forEach((v) => {

                  smartDataRows.push({

                    URL: r.url,
                    Field: key,
                    Value: v,

                  })

                })

              }

              // handle object values
              else if (typeof value === "object") {

                smartDataRows.push({

                  URL: r.url,
                  Field: key,
                  Value: JSON.stringify(value),

                })

              }

              // handle string/number
              else {

                smartDataRows.push({

                  URL: r.url,
                  Field: key,
                  Value: value,

                })

              }

            }
          )

        }

      })

      const smartSheet =
        XLSX.utils.json_to_sheet(smartDataRows)

      XLSX.utils.book_append_sheet(
        workbook,
        smartSheet,
        "SmartData"
      )

      // -----------------
      // Convert to buffer
      // -----------------

      const buffer = XLSX.write(
        workbook,
        {
          type: "buffer",
          bookType: "xlsx",
        }
      )

      return new NextResponse(buffer, {

        headers: {

          "Content-Type":
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",

          "Content-Disposition":
            `attachment; filename="scrape-export-${Date.now()}.xlsx`,

        },

      })

    }

    // Default JSON

    return NextResponse.json(results)

  }

  catch (error) {

    console.error(error)

    return NextResponse.json(
      { error: "Export failed" },
      { status: 500 }
    )

  }

}
