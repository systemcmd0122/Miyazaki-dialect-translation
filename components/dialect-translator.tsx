"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { useSpeechRecognition } from "@/hooks/use-speech-recognition"
import { MicIcon, MicOffIcon, ArrowRightLeft } from "lucide-react"

export function DialectTranslator() {
  const [inputText, setInputText] = useState("")
  const [translatedText, setTranslatedText] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mode, setMode] = useState<"toStandard" | "toDialect">("toStandard")

  const {
    isListening,
    transcript,
    startListening,
    stopListening,
    hasRecognitionSupport,
    error: speechError,
  } = useSpeechRecognition()

  useEffect(() => {
    if (transcript) {
      setInputText((prev) => prev + transcript)
    }
  }, [transcript])

  useEffect(() => {
    if (speechError) {
      setError(speechError)
    }
  }, [speechError])

  const handleTranslate = async () => {
    if (!inputText.trim()) return

    setIsLoading(true)
    setError(null)

    try {
      const endpoint = mode === "toStandard" ? "/api/translate" : "/api/to-dialect"
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: inputText }),
      })

      if (!response.ok) {
        throw new Error("翻訳中にエラーが発生しました")
      }

      const data = await response.json()
      setTranslatedText(data.translatedText)
    } catch (err) {
      setError(err instanceof Error ? err.message : "翻訳中にエラーが発生しました")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleListening = () => {
    if (isListening) {
      stopListening()
    } else {
      startListening()
    }
  }

  const toggleMode = () => {
    setMode((prev) => (prev === "toStandard" ? "toDialect" : "toStandard"))
    setInputText("")
    setTranslatedText("")
  }

  return (
    <div className="max-w-3xl mx-auto">
      <Card className="bg-white dark:bg-gray-800 shadow-md border-none">
        <CardContent className="p-6">
          <Tabs defaultValue="translate" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6 dark:bg-gray-700">
              <TabsTrigger value="translate">翻訳</TabsTrigger>
              <TabsTrigger value="about">使い方</TabsTrigger>
            </TabsList>

            <TabsContent value="translate" className="space-y-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">
                  {mode === "toStandard" ? "宮崎弁 → 標準語" : "標準語 → 宮崎弁"}
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleMode}
                  className="flex items-center gap-2"
                >
                  <ArrowRightLeft className="h-4 w-4" />
                  <span>変換方向を切り替え</span>
                </Button>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label htmlFor="input-text" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {mode === "toStandard" ? "宮崎弁を入力してください" : "標準語を入力してください"}
                  </label>
                  {hasRecognitionSupport && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={toggleListening}
                      className={cn(
                        "flex items-center gap-2",
                        isListening && "border-red-500 text-red-500 hover:text-red-600"
                      )}
                    >
                      {isListening ? (
                        <>
                          <MicOffIcon className="h-4 w-4" />
                          <span>音声入力を停止</span>
                        </>
                      ) : (
                        <>
                          <MicIcon className="h-4 w-4" />
                          <span>音声入力を開始</span>
                        </>
                      )}
                    </Button>
                  )}
                </div>
                <div className="relative">
                  <Textarea
                    id="input-text"
                    placeholder={mode === "toStandard" ? "宮崎弁を入力" : "標準語を入力"}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    className={cn(
                      "min-h-[120px] resize-y dark:bg-gray-700 dark:text-gray-100 dark:placeholder:text-gray-400",
                      isListening &&
                        "border-red-300 focus-visible:ring-red-300 dark:border-red-700 dark:focus-visible:ring-red-700",
                    )}
                  />
                </div>
                {isListening && (
                  <p className="text-sm text-red-500 dark:text-red-400 mt-2">音声を認識しています...</p>
                )}
              </div>

              <Button onClick={handleTranslate} disabled={isLoading || !inputText.trim()} className="w-full">
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    <span>翻訳中...</span>
                  </div>
                ) : (
                  "翻訳する"
                )}
              </Button>

              {error && <div className="text-red-500 dark:text-red-400 text-sm mt-2">{error}</div>}

              {translatedText && (
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    翻訳結果
                  </label>
                  <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900">
                    <p className="text-gray-900 dark:text-gray-100 whitespace-pre-wrap">{translatedText}</p>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="about">
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200">宮崎弁翻訳について</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  このツールは、宮崎県の方言（宮崎弁）と標準的な日本語を相互に翻訳するためのものです。
                  Gemini APIを活用して、入力されたテキストを解析し、変換します。
                </p>
                <h4 className="text-md font-medium mt-4 text-gray-800 dark:text-gray-200">使い方</h4>
                <ol className="list-decimal pl-5 space-y-2 text-gray-600 dark:text-gray-300">
                  <li>「翻訳」タブで、変換方向を選択します（宮崎弁→標準語、または標準語→宮崎弁）</li>
                  <li>テキストを入力欄に直接入力するか、音声入力ボタンを使用して入力します</li>
                  <li>「翻訳する」ボタンをクリックして変換を実行します</li>
                  <li>翻訳結果が下部に表示されます</li>
                </ol>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
                  ※翻訳精度は完璧ではありません。文脈によっては正確に翻訳されない場合があります。
                </p>
                {!hasRecognitionSupport && (
                  <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-2">
                    ※お使いのブラウザは音声認識をサポートしていません。テキスト入力のみ利用可能です。
                  </p>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
