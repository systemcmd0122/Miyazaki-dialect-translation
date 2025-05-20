"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Mic, MicOff } from "lucide-react"
import { useSpeechRecognition } from "@/hooks/use-speech-recognition"
import { cn } from "@/lib/utils"

export function DialectTranslator() {
  const [dialectText, setDialectText] = useState("")
  const [translatedText, setTranslatedText] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    isListening,
    transcript,
    startListening,
    stopListening,
    hasRecognitionSupport,
    error: speechError,
  } = useSpeechRecognition()

  // 音声認識の結果をテキストエリアに反映（そのまま追加）
  useEffect(() => {
    if (transcript) {
      setDialectText((prev) => prev + transcript)
    }
  }, [transcript])

  // 音声認識のエラーを表示
  useEffect(() => {
    if (speechError) {
      setError(speechError)
    }
  }, [speechError])

  const handleTranslate = async () => {
    if (!dialectText.trim()) return

    setIsLoading(true)
    setError(null)

    try {
      // 前処理を行わず、そのままのテキストを送信
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: dialectText }),
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
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label htmlFor="dialect-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    宮崎弁を入力してください
                  </label>
                  {hasRecognitionSupport && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={toggleListening}
                      className={cn(
                        "flex items-center gap-1",
                        isListening &&
                          "bg-red-50 text-red-600 border-red-200 hover:bg-red-100 dark:bg-red-900 dark:text-red-300 dark:border-red-800 dark:hover:bg-red-800",
                      )}
                    >
                      {isListening ? (
                        <>
                          <MicOff className="h-4 w-4" />
                          <span>停止</span>
                        </>
                      ) : (
                        <>
                          <Mic className="h-4 w-4" />
                          <span>音声入力</span>
                        </>
                      )}
                    </Button>
                  )}
                </div>
                <div className="relative">
                  <Textarea
                    id="dialect-input"
                    placeholder="宮崎弁を入力"
                    value={dialectText}
                    onChange={(e) => setDialectText(e.target.value)}
                    className={cn(
                      "min-h-[120px] resize-y dark:bg-gray-700 dark:text-gray-100 dark:placeholder:text-gray-400",
                      isListening &&
                        "border-red-300 focus-visible:ring-red-300 dark:border-red-700 dark:focus-visible:ring-red-700",
                    )}
                  />
                  {isListening && (
                    <div className="absolute top-2 right-2">
                      <div className="flex items-center justify-center h-6 w-6">
                        <div className="relative h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75 dark:bg-red-500"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 dark:bg-red-600"></span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                {isListening && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    音声を認識中... マイクに向かって宮崎弁で話してください（ひらがなで文字起こしします）
                  </p>
                )}
              </div>

              <Button onClick={handleTranslate} disabled={isLoading || !dialectText.trim()} className="w-full">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    翻訳中...
                  </>
                ) : (
                  "翻訳する"
                )}
              </Button>

              {error && <div className="text-red-500 dark:text-red-400 text-sm mt-2">{error}</div>}

              {translatedText && (
                <div className="mt-6">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">翻訳結果:</h3>
                  <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-600">
                    <p className="whitespace-pre-wrap dark:text-gray-100">{translatedText}</p>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="about">
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200">宮崎弁翻訳について</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  このツールは、宮崎県の方言（宮崎弁）を標準的な日本語に翻訳するためのものです。Gemini
                  APIを活用して、入力された宮崎弁を解析し、標準語に変換します。
                </p>
                <h4 className="text-md font-medium mt-4 text-gray-800 dark:text-gray-200">使い方</h4>
                <ol className="list-decimal pl-5 space-y-2 text-gray-600 dark:text-gray-300">
                  <li>
                    「翻訳」タブで宮崎弁のテキストを入力します
                    {hasRecognitionSupport && (
                      <span className="text-sm text-gray-500 dark:text-gray-400 block mt-1">
                        または「音声入力」ボタンをクリックして、マイクで宮崎弁を話すこともできます（ひらがなで文字起こしされます）
                      </span>
                    )}
                  </li>
                  <li>「翻訳する」ボタンをクリックします</li>
                  <li>標準語に翻訳された結果が表示されます</li>
                </ol>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
                  ※翻訳精度は完璧ではありません。文脈によっては正確に翻訳されない場合があります。
                </p>
                {!hasRecognitionSupport && (
                  <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-800 rounded-md">
                    <p className="text-sm text-yellow-700 dark:text-yellow-300">
                      お使いのブラウザは音声認識機能をサポートしていません。Chrome、Edge、Safariなどの最新ブラウザをご利用ください。
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
