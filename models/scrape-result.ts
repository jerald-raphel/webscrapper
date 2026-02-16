import mongoose, { Schema, type Document } from "mongoose"

export interface IScrapeResult extends Document {
  _id: mongoose.Types.ObjectId
  userId: mongoose.Types.ObjectId
  url: string
  title: string
  headings: { tag: string; text: string }[]
  links: { text: string; href: string }[]
  images: { alt: string; src: string }[]
  metadata: { description: string; keywords: string }
  smartData: {
    emails: string[]
    phones: string[]
    prices: string[]
  }
  rawHtml: string
  screenshotUrl: string
  settings: {
    jsRendering: boolean
    screenshot: boolean
    premiumProxy: boolean
  }
  status: "success" | "error"
  errorMessage: string
  scrapedAt: Date
  duration: number
}

const ScrapeResultSchema = new Schema<IScrapeResult>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  url: { type: String, required: true },
  title: { type: String, default: "Untitled" },
  headings: [{ tag: String, text: String }],
  links: [{ text: String, href: String }],
  images: [{ alt: String, src: String }],
  metadata: {
    description: { type: String, default: "" },
    keywords: { type: String, default: "" },
  },
  smartData: {
    emails: [String],
    phones: [String],
    prices: [String],
  },
  rawHtml: { type: String, default: "" },
  screenshotUrl: { type: String, default: "" },
  settings: {
    jsRendering: { type: Boolean, default: true },
    screenshot: { type: Boolean, default: false },
    premiumProxy: { type: Boolean, default: false },
  },
  status: {
    type: String,
    enum: ["success", "error"],
    default: "success",
  },
  errorMessage: { type: String, default: "" },
  scrapedAt: { type: Date, default: Date.now },
  duration: { type: Number, default: 0 },
})

ScrapeResultSchema.index({ userId: 1, scrapedAt: -1 })

export default mongoose.models.ScrapeResult ||
  mongoose.model<IScrapeResult>("ScrapeResult", ScrapeResultSchema)
