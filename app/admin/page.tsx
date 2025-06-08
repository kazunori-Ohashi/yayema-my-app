import Link from "next/link";

export default function AdminTopPage() {
  return (
    <div className="container mx-auto py-12 min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold mb-8 text-[#006666]">管理画面トップ</h1>
      <div className="flex flex-col gap-6 w-full max-w-md">
        <Link href="/admin/activity" className="block bg-green-600 hover:bg-green-700 text-white text-lg font-semibold py-4 px-6 rounded shadow text-center transition">アクティビティ編集</Link>
        <Link href="/admin/island" className="block bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold py-4 px-6 rounded shadow text-center transition">島々編集</Link>
      </div>
    </div>
  );
} 