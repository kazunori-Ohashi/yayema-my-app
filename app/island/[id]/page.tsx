import { notFound } from "next/navigation";
import Image from "next/image";

async function getIsland(id: string) {
  const res = await fetch(`http://localhost:4000/api/islands/${id}`, { cache: "no-store" });
  if (!res.ok) return null;
  return res.json();
}

export default async function IslandDetailPage({ params }: { params: { id: string } }) {
  const data = await getIsland(params.id);
  if (!data) return notFound();

  return (
    <div className="container mx-auto py-12 px-4 max-w-3xl">
      <h1 className="text-3xl font-bold mb-4 text-[#006666]">{data.title}</h1>
      <div className="mb-6">
        {data.mainImage && (
          <Image src={data.mainImage} alt={data.title} width={800} height={400} className="w-full h-72 object-cover rounded-lg" unoptimized />
        )}
      </div>
      <div className="mb-6 text-lg text-gray-700">
        {data.description}
      </div>
    </div>
  );
} 