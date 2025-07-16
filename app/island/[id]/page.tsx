"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

const LANGUAGES = [
  { code: "ja", label: "日本語", flag: "🇯🇵" },
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "zh", label: "繁體中文", flag: "🇹🇼" },
];

export default function IslandDetailPage() {
  const params = useParams();
  const [island, setIsland] = useState<any>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [lang, setLang] = useState("ja");

  useEffect(() => {
    if (!params?.id) return;
    let islandData: any = null;
    let allActivities: any[] = [];
    Promise.all([
      fetch("/islands.json").then((res) => res.json()),
      fetch("/contents.json").then((res) => res.json()),
    ])
      .then(([islands, contents]) => {
        islandData = islands.find((item: any) => item.id === params.id);
        if (!islandData) throw new Error("島データが見つかりません");
        allActivities = contents.filter((item: any) => item.location === islandData.title);
        setIsland(islandData);
        setActivities(allActivities);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [params?.id]);

  if (loading) return <div>読み込み中...</div>;
  if (!island) return <div>データが見つかりません</div>;

  return (
    <main className="min-h-screen">
      {/* 言語切替UI */}
      <div className="fixed top-4 right-4 z-50 flex gap-2">
        {LANGUAGES.map((l) => (
          <button
            key={l.code}
            className={`flex items-center px-3 py-1 rounded-full border ${lang === l.code ? 'bg-[#006666] text-white' : 'bg-white text-[#006666]'} shadow transition`}
            onClick={() => setLang(l.code)}
            aria-label={l.label}
          >
            <span className="text-xl mr-1">{l.flag}</span>
            <span className="text-sm font-bold">{l.label}</span>
          </button>
        ))}
      </div>
      {/* ヒーローセクション */}
      <section className="relative h-[50vh] overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url('${island.mainImage}')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/70" />
        </div>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-4">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 tracking-tight">{island.title?.[lang] || island.title?.ja}</h1>
          {island.catchCopy && (
            <p className="text-xl md:text-2xl mb-4 max-w-2xl font-semibold text-[#ffe066] drop-shadow-lg">{island.catchCopy?.[lang] || island.catchCopy?.ja}</p>
          )}
          <p className="text-lg md:text-xl mb-8 max-w-2xl">{island.description?.[lang] || island.description?.ja}</p>
        </div>
      </section>
            {/* 特徴セクション */}
            {island.features && island.features.length > 0 && (
        <section className="py-10 container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-6 text-[#006666] text-center">{lang === 'en' ? 'Features' : lang === 'zh' ? '島嶼特色' : 'この島の特徴'}</h2>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {island.features.map((feature: any, idx: number) => (
              <li key={idx} className="bg-white rounded-xl shadow p-6 text-lg text-gray-700 flex items-center">
                <ChevronRight className="text-[#006666] mr-2" size={20} />
                {feature?.[lang] || feature?.ja}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* エリアガイドセクション */}
      {Array.isArray(island.areas) && island.areas.length > 0 && (
        <section className="py-10 container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-6 text-[#006666] text-center">{lang === 'en' ? 'Area Guide' : lang === 'zh' ? '區域導覽' : 'エリアガイド'}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {island.areas.map((area: any, idx: number) => (
              <div key={idx} className="bg-white rounded-xl shadow p-6 flex flex-col">
                <div className="flex items-center mb-2">
                  <span className="text-xl font-semibold text-[#006666] mr-2">{area.name?.[lang] || area.name?.ja}</span>
                </div>
                {area.image && area.image !== "" && (
                  <div className="relative w-full h-40 mb-3">
                    <Image src={area.image} alt={area.name?.[lang] || area.name?.ja} fill className="object-cover rounded-lg" />
                  </div>
                )}
                <p className="text-gray-700 mb-2">{area.description?.[lang] || area.description?.ja}</p>
                {Array.isArray(area.spots) && area.spots.length > 0 && area.spots[0]?.ja !== "" && (
                  <ul className="list-disc list-inside text-gray-600 mt-2">
                    {area.spots.map((spot: any, i: number) => (
                      <li key={i}>{spot?.[lang] || spot?.ja}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* アクセス情報セクション */}
      {island.access && (
        <section className="py-10 container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-6 text-[#006666] text-center">{lang === 'en' ? 'Access' : lang === 'zh' ? '交通資訊' : 'アクセス情報'}</h2>
          <div className="bg-white rounded-xl shadow p-6 max-w-3xl mx-auto text-lg text-gray-700 whitespace-pre-line">
            {island.access?.[lang] || island.access?.ja}
          </div>
        </section>
      )}

      {/* アクティビティ・スポットセクション（ページ最下部に移動） */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center text-[#006666]">人気の観光スポット・アクティビティ</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {activities.length === 0 ? (
              <div className="col-span-3 text-center text-gray-500">この島のアクティビティ情報はまだありません。</div>
            ) : (
              activities.map((spot) => (
                <div key={spot.id} className="bg-white rounded-xl overflow-hidden shadow-lg">
                  <div className="relative h-56">
                    {Array.isArray(spot.image) && spot.image[0] && (
                      <Image
                        src={spot.image[0]}
                        alt={spot.title}
                        fill
                        className="object-cover"
                      />
                    )}
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
              ))
            )}
          </div>
        </div>
      </section>
    </main>
  );
}