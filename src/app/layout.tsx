import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "@fontsource/jetbrains-mono/400.css"
import "@fontsource/jetbrains-mono/700.css"
import "./globals.css"
import { SessionProvider } from "@/components/providers/session-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Growth OS - Career Progression Engine",
  description: "Build the evidence. Earn the promotion.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  )
}
