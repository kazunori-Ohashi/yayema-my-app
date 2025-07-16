"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Search, Bookmark, Heart, Share2 } from "lucide-react"
import { useLanguage } from "@/context/language-context"

type CardItem = {
  id: string
  title: { ja: string; en: string; zh: string }
  image: string | string[]
  description: { ja: string; en: string; zh: string }
  date?: string
  credit?: string
  link: string
  icons?: string[]
}

type CardGalleryProps = {
  id: string
  title: string
  items: CardItem[]
}

export default function CardGallery() {
  const [items, setItems] = useState<CardItem[]>([])
  const [loading, setLoading] = useState(true)
  const { lang } = useLanguage()

  useEffect(() => {
    fetch("/contents.json")
      .then((res) => res.json())
      .then((data: CardItem[]) => {
        const itemsWithMainImage = data.map((item) => ({
          ...item,
          mainImage: Array.isArray(item.image) ? item.image[0] : item.image || "",
        }))
        setItems(itemsWithMainImage)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return <div>読み込み中...</div>
  }

  return (
    <section id="card-gallery" className="py-12">
      <h2 className="text-2xl font-bold mb-8 text-[#006666]">Card Gallery</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {items.map((item) => {
          const src = typeof item.mainImage === 'string' ? item.mainImage.trim() : '';
          const excerpt = item.description?.[lang]?.slice(0, 40) + (item.description?.[lang]?.length > 40 ? '…' : '')
          return (
            <div
              key={item.id}
              className="card bg-white rounded-xl overflow-hidden shadow-[0_2px_5px_rgba(0,0,0,0.05)] hover:shadow-[0_12px_24px_rgba(0,0,0,0.20)] hover:-translate-y-1.5 transition-all duration-300"
            >
              <Link href={item.link} className="block relative group">
                <div className="aspect-square relative overflow-hidden">
                  {src !== '' ? (
                    <Image
                      src={src}
                      alt={item.title?.[lang] || item.title?.ja || ''}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      unoptimized
                    />
                  ) : null}

                  <div className="absolute top-3 right-3 flex space-x-2">
                    {item.icons?.includes("zoom") && (
                      <button className="bg-white/80 backdrop-blur-sm p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <Search size={16} className="text-[#006666]" />
                      </button>
                    )}
                    {item.icons?.includes("bookmark") && (
                      <button className="bg-white/80 backdrop-blur-sm p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <Bookmark size={16} className="text-[#006666]" />
                      </button>
                    )}
                    {item.icons?.includes("like") && (
                      <button className="bg-white/80 backdrop-blur-sm p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <Heart size={16} className="text-[#006666]" />
                      </button>
                    )}
                    {item.icons?.includes("share") && (
                      <button className="bg-white/80 backdrop-blur-sm p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <Share2 size={16} className="text-[#006666]" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="font-bold text-lg mb-2">{item.title?.[lang] || item.title?.ja || ''}</h3>
                  <p className="text-gray-600 text-sm mb-3">{excerpt}</p>
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span>{item.date || ''}</span>
                    <span className="truncate max-w-[70%] text-right">{item.credit || ''}</span>
                  </div>
                </div>
              </Link>
            </div>
          );
        })}
      </div>
    </section>
  )
}
