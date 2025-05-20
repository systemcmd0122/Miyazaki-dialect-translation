import { DialectTranslator } from "@/components/dialect-translator"
import { ThemeToggle } from "@/components/theme-toggle"

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-950 transition-colors duration-300">
      <div className="container mx-auto px-4 py-12">
        <header className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-gray-100 mb-2">宮崎弁翻訳</h1>
            <p className="text-gray-600 dark:text-gray-400">宮崎県の方言を標準的な日本語に翻訳します</p>
          </div>
          <ThemeToggle />
        </header>

        <DialectTranslator />

        <footer className="mt-16 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>© {new Date().getFullYear()} 宮崎弁翻訳 | Powered by Gemini API</p>
        </footer>
      </div>
    </main>
  )
}
