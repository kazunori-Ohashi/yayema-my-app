import { notFound } from "next/navigation";
import Image from "next/image";

async function getContent(id: string) {
  const res = await fetch(`http://localhost:4000/api/contents/${id}`, { cache: "no-store" });
  if (!res.ok) return null;
  return res.json();
}

export default async function DetailPage({ params }: { params: { id: string } }) {
  const data = await getContent(params.id);
  if (!data) return notFound();

  // メイン画像
  const mainImage = Array.isArray(data.image) ? data.image[0] : data.image || "";
  // サブ画像
  const subImages = Array.isArray(data.image) ? data.image.slice(1) : [];

  return (
    <div className="container mx-auto py-12 px-4 max-w-3xl">
      <h1 className="text-3xl font-bold mb-4 text-[#006666]">{data.title}</h1>
      <div className="mb-6">
        {mainImage && (
          <Image src={mainImage} alt={data.title} width={800} height={400} className="w-full h-72 object-cover rounded-lg" unoptimized />
        )}
      </div>
      <div className="mb-6 text-lg text-gray-700">
        {data.description}
      </div>
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
            {subImages.map((img: string, idx: number) => (
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