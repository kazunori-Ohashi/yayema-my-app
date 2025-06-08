"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useParams, notFound } from "next/navigation";

export default function DetailPage() {
  const params = useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!params?.id) return;
    fetch("/contents.json")
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

  const mainImage = Array.isArray(data.image) ? data.image[0] : data.image || "";
  const subImages = Array.isArray(data.image) ? data.image.slice(1) : [];

  return (
    <div className="container mx-auto py-12 px-4 max-w-3xl">
      <h1 className="text-3xl font-bold mb-4 text-[#006666]">{data.title}</h1>
      <div className="mb-6">
        {mainImage && (
          <Image src={mainImage} alt={data.title} width={800} height={400} className="w-full h-72 object-cover rounded-lg" unoptimized />
        )}
      </div>
      <div className="mb-6 text-lg text-gray-700">{data.description}</div>
      {typeof data.latitude === 'number' && typeof data.longitude === 'number' && !isNaN(data.latitude) && !isNaN(data.longitude) && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2 text-[#006666]">地図</h2>
          <div className="w-full h-64 rounded-lg overflow-hidden">
            <iframe
              title="Google Map"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              src={`https://www.google.com/maps?q=${data.latitude},${data.longitude}&z=15&output=embed`}
            />
          </div>
        </div>
      )}
      {subImages.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2 text-[#006666]">サブ画像</h2>
          <div className="flex flex-row gap-4 overflow-x-auto">
            {subImages.map((img: any, idx: any) => (
              <Image key={idx} src={img} alt={`サブ画像${idx + 1}`} width={180} height={120} className="rounded-md object-cover w-44 h-28" unoptimized />
            ))}
          </div>
        </div>
      )}
      {data.heroSectionComment && (
        <div className="mt-8 p-4 bg-green-50 text-green-900 rounded">
          <span className="font-bold">ひとこと:</span> {data.heroSectionComment}
        </div>
      )}
    </div>
  );
} 