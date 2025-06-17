"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export default function IslandDetailPage() {
  const params = useParams();
  const [island, setIsland] = useState<any>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
          <h1 className="text-4xl md:text-6xl font-bold mb-4 tracking-tight">{island.title}</h1>
          <p className="text-xl md:text-2xl mb-8 max-w-2xl">{island.description}</p>
        </div>
      </section>

      {/* アクティビティ・スポットセクション */}
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

      {/* アクセス情報やエリアガイドなど、必要に応じて追加可能 */}
    </main>
  );
} 