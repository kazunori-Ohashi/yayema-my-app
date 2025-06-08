"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { ChevronRight } from "lucide-react"

export default function FeaturedDestinations() {
  const [islands, setIslands] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/islands.json")
      .then((res) => res.json())
      .then((data) => {
        setIslands(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return <div>読み込み中...</div>
  }

  return (
    <section className="py-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold mb-3 text-[#006666]">人気の島々</h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">八重山諸島の魅力あふれる島々をご紹介します</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {islands.map((island) => (
          <Link key={island.id} href={`/island/${island.id}`} className="block group">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden group-hover:shadow-2xl transition-shadow duration-200">
              {island.mainImage && (
                <Image
                  src={island.mainImage}
                  alt={island.title}
                  width={400}
                  height={250}
                  className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-200"
                  unoptimized
                />
              )}
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">{island.title}</h3>
                <p className="text-gray-600 mb-2">{island.description}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
