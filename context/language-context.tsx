"use client"

import { createContext, useContext, useState, ReactNode } from "react"

const LANGUAGES = [
  { code: "ja", label: "日本語", flag: "🇯🇵" },
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "zh", label: "繁體中文", flag: "🇹🇼" },
]

type LanguageContextType = {
  lang: string
  setLang: (l: string) => void
  LANGUAGES: typeof LANGUAGES
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState("ja")
  return (
    <LanguageContext.Provider value={{ lang, setLang, LANGUAGES }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error("useLanguage must be used within a LanguageProvider")
  return ctx
} 