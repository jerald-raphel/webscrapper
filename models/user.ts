import mongoose, { Schema, type Document } from "mongoose"

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId
  name: string
  email: string
  password: string
  defaultSettings: {
    jsRendering: boolean
    screenshot: boolean
    premiumProxy: boolean
  }
  createdAt: Date
  updatedAt: Date
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
    },
    defaultSettings: {
      jsRendering: { type: Boolean, default: true },
      screenshot: { type: Boolean, default: false },
      premiumProxy: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
)

export default mongoose.models.User || mongoose.model<IUser>("User", UserSchema)
