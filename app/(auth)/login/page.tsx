import { AuthForm } from "@/components/auth-form"

export const metadata = {
  title: "Sign In - WebScraper",
  description: "Sign in to your web scraper dashboard",
}

export default function LoginPage() {
  return <AuthForm mode="login" />
}
