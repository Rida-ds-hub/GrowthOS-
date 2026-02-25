import type { Metadata } from "next"
import { IBM_Plex_Mono, JetBrains_Mono } from "next/font/google"
import "./globals.css"

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-ibm-plex-mono",
  display: "swap",
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-jetbrains-mono",
  display: "swap",
})

const title = "Growth OS - Career Progression Engine"
const description = "Build the evidence. Earn the promotion."

// Vercel sets VERCEL_URL (no protocol); strip trailing slash. Fallback for local/build.
function getMetadataBase(): URL {
  const raw = process.env.VERCEL_URL ?? process.env.VERCEL_BRANCH_URL
  if (raw && typeof raw === "string") {
    const host = raw.replace(/\/$/, "")
    return new URL(host.startsWith("http") ? host : `https://${host}`)
  }
  return new URL("http://localhost:3000")
}

export const metadata: Metadata = {
  title,
  description,
  metadataBase: getMetadataBase(),
  openGraph: {
    title,
    description,
    siteName: "Growth OS",
    type: "website",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "Growth OS - Career Progression Engine",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/og.png"],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${ibmPlexMono.variable} ${jetbrainsMono.variable} font-mono`}>
        {children}
      </body>
    </html>
  )
}
