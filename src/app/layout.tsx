import type { Metadata } from "next"
import { IBM_Plex_Mono, JetBrains_Mono } from "next/font/google"
import "./globals.css"
import { SessionProvider } from "@/components/providers/session-provider"

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-ibm-plex-mono",
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-jetbrains-mono",
})

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
      <body className={`${ibmPlexMono.variable} ${jetbrainsMono.variable} font-mono`}>
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  )
}
