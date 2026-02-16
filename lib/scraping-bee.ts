// const SCRAPINGBEE_API_KEY = process.env.SCRAPINGBEE_API_KEY!
// const BASE_URL = "https://app.scrapingbee.com/api/v1/"

// export interface ScrapeOptions {
//   renderJs?: boolean
//   screenshot?: boolean
//   premiumProxy?: boolean
// }

// export interface ScrapeResponse {
//   html: string
//   screenshot?: string
//   statusCode: number
// }

// export async function scrapeUrl(
//   url: string,
//   options: ScrapeOptions = {}
// ): Promise<ScrapeResponse> {
//   const params = new URLSearchParams({
//     api_key: SCRAPINGBEE_API_KEY,
//     url,
//     render_js: options.renderJs !== false ? "true" : "false",
//     block_resources: "false",
//   })

//   if (options.premiumProxy) {
//     params.set("premium_proxy", "true")
//   }

//   // If screenshot requested, make a separate call for screenshot
//   let screenshotBase64: string | undefined

//   if (options.screenshot) {
//     const screenshotParams = new URLSearchParams({
//       api_key: SCRAPINGBEE_API_KEY,
//       url,
//       render_js: "true",
//       screenshot: "true",
//       screenshot_full_page: "true",
//     })

//     if (options.premiumProxy) {
//       screenshotParams.set("premium_proxy", "true")
//     }

//     const screenshotRes = await fetch(`${BASE_URL}?${screenshotParams.toString()}`)

//     if (screenshotRes.ok) {
//       const buffer = await screenshotRes.arrayBuffer()
//       screenshotBase64 = `data:image/png;base64,${Buffer.from(buffer).toString("base64")}`
//     }
//   }

//   // Main HTML request
//   const res = await fetch(`${BASE_URL}?${params.toString()}`)

//   if (!res.ok) {
//     const errorText = await res.text()
//     throw new Error(`ScrapingBee error (${res.status}): ${errorText}`)
//   }

//   const html = await res.text()

//   return {
//     html,
//     screenshot: screenshotBase64,
//     statusCode: res.status,
//   }
// }

// export function parseHtml(html: string) {
//   // Extract title
//   const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)
//   const title = titleMatch ? titleMatch[1].trim() : "Untitled"

//   // Extract meta description
//   const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([\s\S]*?)["'][^>]*>/i)
//     || html.match(/<meta[^>]*content=["']([\s\S]*?)["'][^>]*name=["']description["'][^>]*>/i)
//   const description = descMatch ? descMatch[1].trim() : ""

//   // Extract meta keywords
//   const keywordsMatch = html.match(/<meta[^>]*name=["']keywords["'][^>]*content=["']([\s\S]*?)["'][^>]*>/i)
//     || html.match(/<meta[^>]*content=["']([\s\S]*?)["'][^>]*name=["']keywords["'][^>]*>/i)
//   const keywords = keywordsMatch ? keywordsMatch[1].trim() : ""

//   // Extract headings
//   const headings: { tag: string; text: string }[] = []
//   const headingRegex = /<(h[1-6])[^>]*>([\s\S]*?)<\/\1>/gi
//   let match
//   while ((match = headingRegex.exec(html)) !== null) {
//     const text = match[2].replace(/<[^>]*>/g, "").trim()
//     if (text) {
//       headings.push({ tag: match[1].toLowerCase(), text })
//     }
//   }

//   // Extract links
//   const links: { text: string; href: string }[] = []
//   const linkRegex = /<a[^>]*href=["']([^"']*?)["'][^>]*>([\s\S]*?)<\/a>/gi
//   while ((match = linkRegex.exec(html)) !== null) {
//     const text = match[2].replace(/<[^>]*>/g, "").trim()
//     const href = match[1].trim()
//     if (href && !href.startsWith("#") && !href.startsWith("javascript:")) {
//       links.push({ text: text || href, href })
//     }
//   }

//   // Extract images
//   const images: { alt: string; src: string }[] = []
//   const imgRegex = /<img[^>]*>/gi
//   while ((match = imgRegex.exec(html)) !== null) {
//     const srcMatch = match[0].match(/src=["']([^"']*?)["']/i)
//     const altMatch = match[0].match(/alt=["']([^"']*?)["']/i)
//     if (srcMatch && srcMatch[1]) {
//       images.push({
//         src: srcMatch[1],
//         alt: altMatch ? altMatch[1] : "",
//       })
//     }
//   }

//   // Smart extraction - emails
//   const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g
//   const emails = [...new Set(html.match(emailRegex) || [])]

//   // Smart extraction - phone numbers
//   const phoneRegex = /(?:\+?1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}/g
//   const phones = [...new Set(html.replace(/<[^>]*>/g, "").match(phoneRegex) || [])]

//   // Smart extraction - prices
//   const priceRegex = /(?:\$|USD|EUR|GBP|£|€)\s?[\d,]+(?:\.\d{2})?/g
//   const prices = [...new Set(html.replace(/<[^>]*>/g, "").match(priceRegex) || [])]

//   return {
//     title,
//     metadata: { description, keywords },
//     headings,
//     links,
//     images,
//     smartData: { emails, phones, prices },
//   }
// }


const SCRAPINGBEE_API_KEY = process.env.SCRAPINGBEE_API_KEY!
const BASE_URL = "https://app.scrapingbee.com/api/v1/"

export interface ScrapeOptions {
  renderJs?: boolean
  screenshot?: boolean
  premiumProxy?: boolean
}

export interface ScrapeResponse {
  html: string
  screenshot?: string
  statusCode: number
}

export async function scrapeUrl(
  url: string,
  options: ScrapeOptions = {}
): Promise<ScrapeResponse> {

  // ✅ DEFAULT VALUES
  const renderJs = options.renderJs ?? true
  const screenshot = options.screenshot ?? false
  const premiumProxy = options.premiumProxy ?? false

  // ✅ DEBUG LOGS (VERY IMPORTANT)
  console.log("========== SCRAPING START ==========")
  console.log("URL:", url)
  console.log("JS Rendering:", renderJs)
  console.log("Screenshot:", screenshot)
  console.log("Premium Proxy:", premiumProxy)

  // ✅ BUILD MAIN REQUEST PARAMS
  const params = new URLSearchParams()

  params.append("api_key", SCRAPINGBEE_API_KEY)
  params.append("url", url)

  // ✅ STRICT CONTROL OF JS RENDERING
  if (renderJs === true) {
    params.append("render_js", "true")
  } else {
    params.append("render_js", "false")
  }

  params.append("block_resources", "false")

  if (premiumProxy === true) {
    params.append("premium_proxy", "true")
  }

  console.log("Final render_js sent:", params.get("render_js"))

  // ✅ SCREENSHOT REQUEST
  let screenshotBase64: string | undefined

  if (screenshot === true) {

    console.log("Taking screenshot...")

    const screenshotParams = new URLSearchParams()

    screenshotParams.append("api_key", SCRAPINGBEE_API_KEY)
    screenshotParams.append("url", url)
    screenshotParams.append("render_js", "true")
    screenshotParams.append("screenshot", "true")
    screenshotParams.append("screenshot_full_page", "true")

    if (premiumProxy === true) {
      screenshotParams.append("premium_proxy", "true")
    }

    const screenshotRes = await fetch(`${BASE_URL}?${screenshotParams.toString()}`)

    if (screenshotRes.ok) {

      const buffer = await screenshotRes.arrayBuffer()

      screenshotBase64 =
        `data:image/png;base64,${Buffer.from(buffer).toString("base64")}`

      console.log("Screenshot captured successfully")
    }
    else {
      console.log("Screenshot failed")
    }
  }

  // ✅ MAIN HTML REQUEST
  console.log("Sending request to ScrapingBee...")

  const res = await fetch(`${BASE_URL}?${params.toString()}`)

  if (!res.ok) {

    const errorText = await res.text()

    console.error("ScrapingBee Error:", errorText)

    throw new Error(
      `ScrapingBee error (${res.status}): ${errorText}`
    )
  }

  const html = await res.text()

  console.log("HTML Length:", html.length)
  console.log("========== SCRAPING END ==========")

  return {
    html,
    screenshot: screenshotBase64,
    statusCode: res.status,
  }
}

export function parseHtml(html: string) {

  // TITLE
  const titleMatch =
    html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)

  const title =
    titleMatch ? titleMatch[1].trim() : "Untitled"

  // META DESCRIPTION
  const descMatch =
    html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([\s\S]*?)["'][^>]*>/i)
    ||
    html.match(/<meta[^>]*content=["']([\s\S]*?)["'][^>]*name=["']description["'][^>]*>/i)

  const description =
    descMatch ? descMatch[1].trim() : ""

  // META KEYWORDS
  const keywordsMatch =
    html.match(/<meta[^>]*name=["']keywords["'][^>]*content=["']([\s\S]*?)["'][^>]*>/i)
    ||
    html.match(/<meta[^>]*content=["']([\s\S]*?)["'][^>]*name=["']keywords["'][^>]*>/i)

  const keywords =
    keywordsMatch ? keywordsMatch[1].trim() : ""

  // HEADINGS
  const headings: { tag: string; text: string }[] = []

  const headingRegex =
    /<(h[1-6])[^>]*>([\s\S]*?)<\/\1>/gi

  let match

  while ((match = headingRegex.exec(html)) !== null) {

    const text =
      match[2].replace(/<[^>]*>/g, "").trim()

    if (text) {

      headings.push({
        tag: match[1].toLowerCase(),
        text,
      })
    }
  }

  // LINKS
  const links: { text: string; href: string }[] = []

  const linkRegex =
    /<a[^>]*href=["']([^"']*?)["'][^>]*>([\s\S]*?)<\/a>/gi

  while ((match = linkRegex.exec(html)) !== null) {

    const text =
      match[2].replace(/<[^>]*>/g, "").trim()

    const href = match[1].trim()

    if (
      href &&
      !href.startsWith("#") &&
      !href.startsWith("javascript:")
    ) {

      links.push({
        text: text || href,
        href,
      })
    }
  }

  // IMAGES
  const images: { alt: string; src: string }[] = []

  const imgRegex =
    /<img[^>]*>/gi

  while ((match = imgRegex.exec(html)) !== null) {

    const srcMatch =
      match[0].match(/src=["']([^"']*?)["']/i)

    const altMatch =
      match[0].match(/alt=["']([^"']*?)["']/i)

    if (srcMatch && srcMatch[1]) {

      images.push({
        src: srcMatch[1],
        alt: altMatch ? altMatch[1] : "",
      })
    }
  }

  // EMAILS
  const emailRegex =
    /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g

  const emails =
    [...new Set(html.match(emailRegex) || [])]

  // PHONES
  const phoneRegex =
    /(?:\+?\d{1,3})?[\s.-]?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/g

  const phones =
    [...new Set(html.replace(/<[^>]*>/g, "").match(phoneRegex) || [])]

  // PRICES
  const priceRegex =
    /(?:\$|USD|EUR|GBP|₹|£|€)\s?[\d,]+(?:\.\d{2})?/g

  const prices =
    [...new Set(html.replace(/<[^>]*>/g, "").match(priceRegex) || [])]

  return {
    title,
    metadata: {
      description,
      keywords,
    },
    headings,
    links,
    images,
    smartData: {
      emails,
      phones,
      prices,
    },
  }
}
