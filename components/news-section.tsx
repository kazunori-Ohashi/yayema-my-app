"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useLanguage } from "@/context/language-context"

type Multilang = { ja: string; en: string; zh: string }
type Performer = Multilang

type NewsItem = {
  id: string
  date: string
  title: Multilang
  detail: Multilang
  venue: Multilang
  open_time: string
  start_time: string
  performers: Performer[]
  fee: Multilang
  link: string
}

export default function NewsSection() {
  const [news, setNews] = useState<NewsItem[]>([])
  const { lang } = useLanguage()

  useEffect(() => {
    fetch("/news.json")
      .then((res) => res.json())
      .then((data: NewsItem[]) => {
        // 日付降順で3件取得
        const sorted = [...data].sort((a, b) => b.date.localeCompare(a.date))
        setNews(sorted.slice(0, 3))
      })
      .catch(() => setNews([]))
  }, [])

  return (
    <section className="bg-white border-b py-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">新着情報</h2>
          <Link href="/news" className="text-sm text-blue-600 hover:underline">もっと見る</Link>
        </div>
        <ul>
          {news.length === 0 && <li className="text-gray-500">新着情報はありません</li>}
          {news.map((item) => (
            <li key={item.id} className="py-2 border-b last:border-b-0">
              <div className="flex items-center gap-4">
              <span className="text-xs text-gray-500 w-24">{item.date}</span>
                <span className="text-base text-black font-semibold">{item.title?.[lang] || item.title?.ja || ""}</span>
              </div>
              {item.detail?.[lang] && (
                <div className="text-xs text-gray-700 mt-1">{item.detail[lang]}</div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
} 