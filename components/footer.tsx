import Link from "next/link"
import Image from "next/image"
import { Instagram, Facebook, Twitter } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-[#004444] text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <Link href="/" className="flex items-center mb-4">
              <Image src="/assets/logo-white.svg" alt="八重山観光ガイド" width={40} height={40} />
              <div className="ml-3">
                <h2 className="text-xl font-bold">八重山観光ガイド</h2>
                <p className="text-sm text-gray-300">石垣島・竹富島・西表島の旅情報</p>
              </div>
            </Link>
            <p className="text-gray-300 mb-4">八重山諸島の観光・体験・グルメ情報を発信する地域密着型ガイドサイト</p>
            <div className="flex space-x-4">
              <a href="#" className="text-white hover:text-gray-300 transition-colors">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-white hover:text-gray-300 transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-white hover:text-gray-300 transition-colors">
                <Twitter size={20} />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4 border-b border-white/20 pb-2">島々</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/category/ishigaki" className="text-gray-300 hover:text-white transition-colors">
                  石垣島
                </Link>
              </li>
              <li>
                <Link href="/category/taketomi" className="text-gray-300 hover:text-white transition-colors">
                  竹富島
                </Link>
              </li>
              <li>
                <Link href="/category/iriomote" className="text-gray-300 hover:text-white transition-colors">
                  西表島
                </Link>
              </li>
              <li>
                <Link href="/category/yonaguni" className="text-gray-300 hover:text-white transition-colors">
                  与那国島
                </Link>
              </li>
              <li>
                <Link href="/category/hateruma" className="text-gray-300 hover:text-white transition-colors">
                  波照間島
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4 border-b border-white/20 pb-2">カテゴリー</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/category/beaches" className="text-gray-300 hover:text-white transition-colors">
                  ビーチ
                </Link>
              </li>
              <li>
                <Link href="/category/gourmet" className="text-gray-300 hover:text-white transition-colors">
                  グルメ
                </Link>
              </li>
              <li>
                <Link href="/category/culture" className="text-gray-300 hover:text-white transition-colors">
                  文化・歴史
                </Link>
              </li>
              <li>
                <Link href="/category/activities" className="text-gray-300 hover:text-white transition-colors">
                  アクティビティ
                </Link>
              </li>
              <li>
                <Link href="/category/ferry" className="text-gray-300 hover:text-white transition-colors">
                  離島フェリー
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4 border-b border-white/20 pb-2">お役立ち情報</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-gray-300 hover:text-white transition-colors">
                  運営会社
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-300 hover:text-white transition-colors">
                  お問い合わせ
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-gray-300 hover:text-white transition-colors">
                  プライバシーポリシー
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-300 hover:text-white transition-colors">
                  利用規約
                </Link>
              </li>
              <li>
                <Link href="/sitemap" className="text-gray-300 hover:text-white transition-colors">
                  サイトマップ
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-white/20 text-center text-sm text-gray-300">
          <p>© 2025 Yaeyama Guide. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
