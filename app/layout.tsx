import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import "./globals.css"
import { Sidebar } from "@/components/layout/sidebar"
import { ErrorBoundary } from "@/components/error-boundary"
import { Toaster } from "@/components/ui/toast"

export const metadata: Metadata = {
  title: "MinIO Client",
  description: "Modern web client for MinIO S3 storage",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <ErrorBoundary>
          <div className="flex h-screen bg-background">
            <Sidebar />
            <main className="flex-1 overflow-auto">{children}</main>
          </div>
          <Toaster />
        </ErrorBoundary>
      </body>
    </html>
  )
}
