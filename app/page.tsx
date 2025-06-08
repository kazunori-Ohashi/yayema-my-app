import HeroSection from "@/components/hero-section"
import PhotoGallery from "@/components/photo-gallery"
import FeaturedDestinations from "@/components/featured-destinations"
import ExperienceSection from "@/components/experience-section"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "八重山観光ガイド｜石垣島・竹富島・西表島の旅情報ポータル",
  description: "石垣島・竹富島・西表島など八重山諸島の観光・体験・グルメ情報を発信する地域密着型ガイドサイト",
  openGraph: {
    type: "website",
    images: ["/images/hero-2.jpg"], // 存在する画像に変更
  },
  twitter: {
    card: "summary_large_image",
  },
}

export default function Home() {
  return (
    <main className="min-h-screen">
      <HeroSection />

      <div className="container mx-auto px-4 py-12">
        <FeaturedDestinations />

        <PhotoGallery id="travel-gallery" title="旅行・観光・遊び" subtitle="八重山諸島の魅力を写真で体感" />

        <ExperienceSection />
      </div>
    </main>
  )
}
