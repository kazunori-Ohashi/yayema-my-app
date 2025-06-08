"use client"

import { useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion, useScroll, useTransform } from "framer-motion"
import { ChevronRight } from "lucide-react"

export default function ExperienceSection() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  })

  const y = useTransform(scrollYProgress, [0, 1], [50, -50])
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.6], [0, 1, 1])

  const experiences = [
    {
      id: "snorkeling",
      title: "シュノーケリング",
      image: "/images/snorkeling.jpg",
      description: "透明度抜群の海で色とりどりの熱帯魚と泳ぐ",
      link: "/experience/snorkeling",
    },
    {
      id: "kayaking",
      title: "マングローブカヤック",
      image: "/images/kayaking.jpg",
      description: "西表島の原生林をカヤックで探検する冒険",
      link: "/experience/kayaking",
    },
    {
      id: "star-gazing",
      title: "星空観察",
      image: "/images/star-gazing.jpg",
      description: "光害の少ない島で満天の星空を堪能",
      link: "/experience/star-gazing",
    },
  ]

  return (
    <section ref={ref} className="py-16 relative overflow-hidden">
      <motion.div
        className="absolute inset-0 -z-10"
        style={{
          backgroundImage: "url('/images/experience-bg.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          y,
        }}
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      </motion.div>

      <motion.div className="relative z-10 text-white container mx-auto px-4" style={{ opacity }}>
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">八重山の体験</h2>
          <p className="text-lg max-w-2xl mx-auto opacity-90">忘れられない思い出を作る特別な体験</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {experiences.map((experience, index) => (
            <motion.div
              key={experience.id}
              className="bg-white/10 backdrop-blur-md rounded-xl overflow-hidden shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true, margin: "-100px" }}
            >
              <div className="relative h-48">
                <Image
                  src={experience.image || "/placeholder.svg"}
                  alt={experience.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">{experience.title}</h3>
                <p className="mb-4 opacity-90">{experience.description}</p>
                <Link href={experience.link} className="inline-flex items-center text-white hover:underline">
                  詳しく見る
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link
            href="/experiences"
            className="inline-flex items-center justify-center bg-[#006666] hover:bg-[#004444] text-white px-6 py-3 rounded-full text-lg font-medium transition-all"
          >
            すべての体験を見る
            <ChevronRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </motion.div>
    </section>
  )
}
