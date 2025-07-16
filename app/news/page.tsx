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
  contact: Multilang
  link: string
}

export default function NewsListPage() {
  const [news, setNews] = useState<NewsItem[]>([])
  const { lang } = useLanguage()

  useEffect(() => {
    fetch("/news.json")
      .then((res) => res.json())
      .then((data: NewsItem[]) => {
        const sorted = [...data].sort((a, b) => b.date.localeCompare(a.date))
        setNews(sorted)
      })
  }, [])

  return (
    <main className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-2xl font-bold mb-8">新着情報一覧</h1>
        <ul className="space-y-6">
          {news.length === 0 && <li className="text-gray-500">新着情報はありません</li>}
          {news.map((item) => (
            <li key={item.id} className="border-b pb-6">
              <div className="flex items-center gap-4 mb-2">
                <span className="text-xs text-gray-500 w-24">{item.date}</span>
                <span className="text-lg font-semibold text-black">{item.title?.[lang] || item.title?.ja || ""}</span>
              </div>
              {item.venue?.[lang] && (
                <div className="text-xs text-gray-600 mt-1">会場: {item.venue[lang]}</div>
              )}
              {(item.open_time || item.start_time) && (
                <div className="text-xs text-gray-600">開場: {item.open_time}　開演: {item.start_time}</div>
              )}
              {item.performers?.length > 0 && (
                <div className="text-xs text-gray-600">出演: {item.performers.map(p => p[lang] || p.ja).join(", ")}</div>
              )}
              {item.fee?.[lang] && (
                <div className="text-xs text-gray-600">料金: {item.fee[lang]}</div>
              )}
              {item.contact?.[lang] && (
                <div className="text-xs text-blue-700 font-semibold mt-1">{item.contact[lang]}</div>
              )}
              {item.detail?.[lang] && (
                <div className="text-xs text-gray-700 mt-1">{item.detail[lang]}</div>
              )}
              {item.link && (
                <Link href={item.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-xs mt-1 block">詳細・外部サイトへ</Link>
              )}
            </li>
          ))}
        </ul>
      </div>
    </main>
  )
} 