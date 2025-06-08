"use client"

import { useState, useEffect } from "react"
import { ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"

export default function HeroSection() {
  const [slides, setSlides] = useState([])
  const [currentSlide, setCurrentSlide] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/contents.json")
      .then((res) => res.json())
      .then((data) => {
        const heroSlides = data
          .filter((item) => item.isHero)
          .map((item) => ({
            ...item,
            mainImage: Array.isArray(item.image) ? item.image[0] : item.image || "",
          }))
          .filter((item) => typeof item.mainImage === "string" && item.mainImage.trim() !== "")
        setSlides(heroSlides)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (slides.length === 0) return
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1))
    }, 5000)
    return () => clearInterval(interval)
  }, [slides.length])

  if (loading) {
    return <div className="h-[40vh] flex items-center justify-center text-gray-600">読み込み中...</div>
  }
  if (slides.length === 0) {
    return <div className="h-[40vh] flex items-center justify-center text-gray-400">ヒーロー表示対象がありません</div>
  }

  const current = slides[currentSlide]
  const src = typeof current.mainImage === "string" ? current.mainImage.trim() : ""
  const heroComment = current.heroSectionComment && current.heroSectionComment.trim() !== '' ? current.heroSectionComment : current.description

  return (
    <section className="relative w-full h-[40vh] overflow-hidden">
      {src !== '' && (
        <Image
          src={src}
          alt={current.title}
          fill
          className="object-cover"
          priority
          unoptimized
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/40 pointer-events-none" />
      <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-4">
        <h1 className="text-4xl md:text-6xl font-bold mb-4 tracking-tight drop-shadow-lg">{current.title}</h1>
        <p className="text-xl md:text-2xl mb-6 drop-shadow">{heroComment}</p>
        <Button className="bg-[#006666] hover:bg-[#004444] text-white px-8 py-6 rounded-full text-lg">
          観光スポットを探す <ChevronRight className="ml-2 h-5 w-5" />
        </Button>
        <div className="absolute bottom-8 left-0 right-0 flex justify-center z-20">
          {slides.length > 1 && (
            <div className="flex space-x-2">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  className={`w-3 h-3 rounded-full transition-all duration-200 ${idx === currentSlide ? "bg-white/90" : "bg-white/40"}`}
                  onClick={() => setCurrentSlide(idx)}
                  aria-label={`スライド${idx + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
