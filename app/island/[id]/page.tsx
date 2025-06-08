"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";

export default function IslandDetailPage() {
  const params = useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!params?.id) return;
    fetch("/islands.json")
      .then((res) => res.json())
      .then((all: any[]) => {
        const found = all.find((item: any) => item.id === params.id);
        setData(found || null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [params?.id]);

  if (loading) return <div>読み込み中...</div>;
  if (!data) return <div>データが見つかりません</div>;

  return (
    <div className="container mx-auto py-12 px-4 max-w-3xl">
      <h1 className="text-3xl font-bold mb-4 text-[#006666]">{data.title}</h1>
      <div className="mb-6">
        {data.mainImage && (
          <Image src={data.mainImage} alt={data.title} width={800} height={400} className="w-full h-72 object-cover rounded-lg" unoptimized />
        )}
      </div>
      <div className="mb-6 text-lg text-gray-700">{data.description}</div>
    </div>
  );
} 