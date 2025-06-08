"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Menu, X, Search } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const navItems = [
    { label: "ホーム", link: "/" },
    { label: "八重山民謡三線体験", link: "/category/sanshin" },
    { label: "八重山舞踊鑑賞会", link: "/category/kansyou" },
  ]

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-white/90 backdrop-blur-md shadow-md h-16" : "bg-transparent h-20"
      }`}
    >
      <div className="container mx-auto px-4 h-full flex items-center justify-between">
        <Link href="/" className="flex items-center">
          {/* テキストベースのロゴに変更 */}
          <div className="bg-[#006666] text-white p-2 w-10 h-10 flex items-center justify-center rounded-sm">
            <span className="text-xl font-bold">Y</span>
          </div>
          <div className="ml-3">
            <h1
              className={`font-bold transition-all duration-300 ${
                isScrolled ? "text-[#006666] text-base" : "text-white text-lg drop-shadow-md"
              }`}
            >
              八重山観光ガイド
            </h1>
            <p
              className={`text-xs transition-all duration-300 ${
                isScrolled ? "text-gray-600" : "text-white/90 drop-shadow-md"
              }`}
            >
              石垣島・竹富島・西表島の旅情報
            </p>
          </div>
        </Link>

        <nav className="hidden md:flex items-center space-x-8">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.link}
              className={`relative pb-1 group transition-colors duration-300 ${
                isScrolled ? "text-gray-700" : "text-white drop-shadow-sm"
              }`}
            >
              {item.label}
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#006666] transition-all duration-200 group-hover:w-full"></span>
            </Link>
          ))}
          <button
            className={`p-2 rounded-full transition-colors duration-300 ${
              isScrolled
                ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                : "bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm"
            }`}
          >
            <Search size={20} />
          </button>
        </nav>

        <button
          className={`md:hidden p-2 rounded-full transition-colors duration-300 ${
            isScrolled ? "text-gray-700" : "text-white"
          }`}
          onClick={() => setMobileMenuOpen(true)}
        >
          <Menu size={24} />
        </button>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            className="fixed inset-0 bg-white z-50 md:hidden"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3 }}
          >
            <div className="flex justify-between items-center p-4 border-b">
              <Link href="/" className="flex items-center" onClick={() => setMobileMenuOpen(false)}>
                <div className="bg-[#006666] text-white p-2 w-8 h-8 flex items-center justify-center rounded-sm">
                  <span className="text-lg font-bold">Y</span>
                </div>
                <div className="ml-3">
                  <h1 className="text-base font-bold text-[#006666]">八重山観光ガイド</h1>
                  <p className="text-xs text-gray-600">石垣島・竹富島・西表島の旅情報</p>
                </div>
              </Link>
              <button
                className="p-2 text-gray-700 rounded-full hover:bg-gray-100"
                onClick={() => setMobileMenuOpen(false)}
              >
                <X size={24} />
              </button>
            </div>

            <nav className="p-4">
              <ul className="space-y-4">
                {navItems.map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.link}
                      className="block p-3 text-lg font-medium text-gray-700 hover:bg-gray-50 rounded-lg"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="mt-6 pt-6 border-t">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="観光スポットを検索..."
                    className="w-full p-3 pl-10 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006666]"
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
                </div>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
