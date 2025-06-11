"use client"

import { useEffect, useState } from "react"

import Link from "next/link"

type NewsItem = {
  id: string
  date: string
  title: string
  detail: string
  link: string
}

export default function NewsListPage() {
  const [news, setNews] = useState<NewsItem[]>([])

  useEffect(() => {
    fetch("/news.json")
      .then((res) => res.json())
      .then((data: NewsItem[]) => {
        // 日付降順で全件
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
                <span className="text-lg font-semibold text-black">{item.title}</span>
              </div>
              <div className="mb-2 text-gray-700 text-sm">{item.detail}</div>
              <Link href={item.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
                詳細・外部サイトへ
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </main>
  )
} 