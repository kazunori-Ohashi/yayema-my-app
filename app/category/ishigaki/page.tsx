"use client";

import Image from "next/image"
import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { useState, useEffect } from "react"

export default function IshigakiPage() {
  const [spots, setSpots] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("http://localhost:4000/api/contents")
      .then((res) => res.json())
      .then((data) => {
        setSpots(data.filter((item) => item.location === "石垣島"))
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return <div>読み込み中...</div>
  }

  // 石垣島のエリア情報
  const areas = [
    {
      name: "石垣市街",
      description: "島の中心部。飲食店やショップが立ち並び、市場や港もあります。",
      spots: ["ユーグレナモール", "石垣市公設市場", "離島ターミナル"]
    },
    {
      name: "北部エリア",
      description: "美しいビーチや展望台がある自然豊かな地域。",
      spots: ["米原ビーチ", "平久保崎灯台", "御神崎"]
    },
    {
      name: "南部エリア",
      description: "川平湾をはじめとする絶景スポットがある地域。",
      spots: ["川平湾", "石垣やいま村", "フサキビーチ"]
    }
  ]

  return (
    <main className="min-h-screen">
      {/* ヒーローセクション */}
      <section className="relative h-[50vh] overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "url('/images/ishigaki-feature.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/70" />
        </div>

        <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-4">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 tracking-tight">石垣島</h1>
          <p className="text-xl md:text-2xl mb-8 max-w-2xl">
            美しいビーチと活気ある市街地、八重山の中心地
          </p>
        </div>
      </section>

      {/* 石垣島紹介セクション */}
      <section className="py-16 container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-6 text-[#006666]">石垣島について</h2>
            <p className="text-gray-700 mb-4">
              石垣島は八重山諸島の中心的な島で、沖縄本島から約410km南西に位置しています。美しいビーチや豊かな自然、独自の文化で知られています。
            </p>
            <p className="text-gray-700 mb-4">
              島の北部には米原ビーチを始めとする美しいビーチが点在し、南部には川平湾などの絶景スポットがあります。また、中心部の石垣市街には飲食店や
              ショッピングスポットが充実しており、離島へのアクセス拠点でもあります。
            </p>
            <ul className="space-y-2 mb-4">
              <li className="flex items-center">
                <ChevronRight className="text-[#006666] mr-2" size={18} />
                <span>面積: 約223平方キロメートル</span>
              </li>
              <li className="flex items-center">
                <ChevronRight className="text-[#006666] mr-2" size={18} />
                <span>人口: 約48,000人</span>
              </li>
              <li className="flex items-center">
                <ChevronRight className="text-[#006666] mr-2" size={18} />
                <span>気候: 亜熱帯性気候で、年間平均気温は約24度</span>
              </li>
            </ul>
          </div>
          <div className="rounded-xl overflow-hidden shadow-lg">
            {(spots[0] && (spots[0].mainImage || spots[0].image) && (spots[0].mainImage || spots[0].image) !== '') ? (
              <Image
                src={spots[0].mainImage || spots[0].image}
                alt={spots[0].title}
                width={600}
                height={400}
                className="w-full h-auto object-cover"
              />
            ) : null}
          </div>
        </div>
      </section>

      {/* 観光スポットセクション */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center text-[#006666]">人気の観光スポット</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {spots.map((spot) => (
              <div key={spot.id} className="bg-white rounded-xl overflow-hidden shadow-lg">
                <div className="relative h-56">
                  {(spot.mainImage || spot.image) ? (
                    (spot.mainImage || spot.image) !== '' ? (
                      <Image
                        src={spot.mainImage || spot.image}
                        alt={spot.title}
                        fill
                        className="object-cover"
                      />
                    ) : null
                  ) : null}
                  <div className="absolute top-4 right-4 bg-[#006666] text-white px-3 py-1 rounded-full text-sm">
                    {spot.category}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-3">{spot.title}</h3>
                  <p className="text-gray-600 mb-4">{spot.description}</p>
                  <Link
                    href={`/spot/${spot.id}`}
                    className="text-[#006666] font-medium hover:underline inline-flex items-center"
                  >
                    詳しく見る
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link
              href="/category/ishigaki/spots"
              className="bg-[#006666] hover:bg-[#004444] text-white px-6 py-3 rounded-full inline-flex items-center"
            >
              すべての観光スポットを見る
              <ChevronRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* エリアガイドセクション */}
      <section className="py-16 container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-8 text-center text-[#006666]">エリアガイド</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {areas.map((area, index) => (
            <div key={index} className="border border-gray-200 rounded-xl p-6">
              <h3 className="text-xl font-bold mb-3">{area.name}</h3>
              <p className="text-gray-600 mb-4">{area.description}</p>
              <h4 className="font-medium mb-2">主なスポット:</h4>
              <ul className="space-y-1">
                {area.spots.map((spot, i) => (
                  <li key={i} className="flex items-center">
                    <ChevronRight className="text-[#006666] mr-2" size={16} />
                    <span>{spot}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* アクセス情報セクション */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center text-[#006666]">アクセス情報</h2>
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <h3 className="text-xl font-bold mb-4">石垣島への行き方</h3>
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium mb-2">飛行機で</h4>
                  <p className="text-gray-600">
                    那覇空港から約1時間、東京（羽田・成田）から約3時間15分、大阪（関西国際空港）から約2時間40分で到着します。
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">島内の移動</h4>
                  <p className="text-gray-600">
                    バス、タクシー、レンタカー、レンタサイクルなどが利用できます。石垣島を効率よく観光するには、レンタカーがおすすめです。
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">離島へのアクセス</h4>
                  <p className="text-gray-600">
                    石垣港離島ターミナルから竹富島や西表島などへの高速船が出ています。所要時間は行き先によって10分〜60分程度です。
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
