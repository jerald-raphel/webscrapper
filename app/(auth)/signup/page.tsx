import { AuthForm } from "@/components/auth-form"

export const metadata = {
  title: "Sign Up - WebScraper",
  description: "Create your web scraper account",
}

export default function SignupPage() {
  return <AuthForm mode="signup" />
}
