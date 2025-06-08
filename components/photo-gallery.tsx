"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { Bookmark, Heart, ChevronRight } from "lucide-react"

type PhotoGalleryProps = {
  id: string
  title: string
  subtitle: string
}

export default function PhotoGallery({ id, title, subtitle }: PhotoGalleryProps) {
  const [selectedFilter, setSelectedFilter] = useState("all")
  const [isClient, setIsClient] = useState(false)
  const [photos, setPhotos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    fetch("http://localhost:4000/api/contents")
      .then((res) => res.json())
      .then((data) => {
        const photosWithMainImage = data.map((photo) => ({
          ...photo,
          mainImage: Array.isArray(photo.image) ? photo.image[0] : photo.image || "",
        }));
        setPhotos(photosWithMainImage);
        setLoading(false);
      })
      .catch(() => setLoading(false))
  }, [])

  if (!isClient) {
    return null
  }
  if (loading) {
    return <div>読み込み中...</div>
  }

  const filteredPhotos = selectedFilter === "all" ? photos : photos.filter((photo) => photo.category === selectedFilter)

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  }

  return (
    <section id={id} className="py-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold mb-3 text-[#006666]">{title}</h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">{subtitle}</p>
      </div>

      <div className="flex justify-center mb-8 overflow-x-auto pb-2">
        <div className="flex space-x-2">
          {[
            { id: "all", label: "すべて" },
            { id: "beaches", label: "ビーチ" },
            { id: "nature", label: "自然" },
            { id: "culture", label: "文化" },
            { id: "food", label: "グルメ" },
          ].map((filter) => (
            <button
              key={filter.id}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedFilter === filter.id ? "bg-[#006666] text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
              onClick={() => setSelectedFilter(filter.id)}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {filteredPhotos.map((photo) => {
          const src = typeof photo.mainImage === 'string' ? photo.mainImage.trim() : '';
          return (
            <motion.div key={photo.id} className="group relative overflow-hidden rounded-xl shadow-lg" variants={item}>
              <Link href={`/detail/${photo.id}`} className="block">
                <div className="aspect-[4/3] relative overflow-hidden">
                  {src !== '' ? (
                    <Image
                      src={src}
                      alt={photo.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      unoptimized
                    />
                  ) : null}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-80" />
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <div className="flex items-center mb-2">
                    <span className="text-sm font-medium bg-[#006666]/80 backdrop-blur-sm px-3 py-1 rounded-full">
                      {photo.location}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold mb-1">{photo.title}</h3>
                  <div className="flex flex-wrap gap-2">
                    {photo.tags.map((tag) => (
                      <span key={tag} className="text-xs bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="absolute top-4 right-4 flex space-x-2">
                  <button className="bg-white/80 backdrop-blur-sm p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Bookmark size={16} className="text-[#006666]" />
                  </button>
                  <button className="bg-white/80 backdrop-blur-sm p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Heart size={16} className="text-[#006666]" />
                  </button>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </motion.div>

      <div className="text-center mt-12">
        <Link href="/spots" className="inline-flex items-center text-[#006666] font-medium hover:underline">
          すべての観光スポットを見る
          <ChevronRight className="ml-1 h-4 w-4" />
        </Link>
      </div>
    </section>
  )
}
