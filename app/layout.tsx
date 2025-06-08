import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { ThemeProvider } from "@/components/theme-provider"

export const metadata: Metadata = {
  title: {
    template: "%s | 八重山観光ガイド",
    default: "八重山観光ガイド｜石垣島・竹富島・西表島の旅情報ポータル",
  },
  description: "石垣島・竹富島・西表島など八重山諸島の観光・体験・グルメ情報を発信する地域密着型ガイドサイト",
  icons: {
    icon: "/assets/favicon.svg",
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ja" suppressHydrationWarning className="">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen flex flex-col font-sans">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem={true} disableTransitionOnChange>
          <Header />
          {children}
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  )
}
