"use client"

import { useState, useEffect, useCallback } from "react"

// 漢字・カタカナをひらがなに変換する関数
function toHiragana(text: string): string {
  // カタカナをひらがなに変換
  const kanaMap: { [key: string]: string } = {
    ア: "あ",
    イ: "い",
    ウ: "う",
    エ: "え",
    オ: "お",
    カ: "か",
    キ: "き",
    ク: "く",
    ケ: "け",
    コ: "こ",
    サ: "さ",
    シ: "し",
    ス: "す",
    セ: "せ",
    ソ: "そ",
    タ: "た",
    チ: "ち",
    ツ: "つ",
    テ: "て",
    ト: "と",
    ナ: "な",
    ニ: "に",
    ヌ: "ぬ",
    ネ: "ね",
    ノ: "の",
    ハ: "は",
    ヒ: "ひ",
    フ: "ふ",
    ヘ: "へ",
    ホ: "ほ",
    マ: "ま",
    ミ: "み",
    ム: "む",
    メ: "め",
    モ: "も",
    ヤ: "や",
    ユ: "ゆ",
    ヨ: "よ",
    ラ: "ら",
    リ: "り",
    ル: "る",
    レ: "れ",
    ロ: "ろ",
    ワ: "わ",
    ヲ: "を",
    ン: "ん",
    ガ: "が",
    ギ: "ぎ",
    グ: "ぐ",
    ゲ: "げ",
    ゴ: "ご",
    ザ: "ざ",
    ジ: "じ",
    ズ: "ず",
    ゼ: "ぜ",
    ゾ: "ぞ",
    ダ: "だ",
    ヂ: "ぢ",
    ヅ: "づ",
    デ: "で",
    ド: "ど",
    バ: "ば",
    ビ: "び",
    ブ: "ぶ",
    ベ: "べ",
    ボ: "ぼ",
    パ: "ぱ",
    ピ: "ぴ",
    プ: "ぷ",
    ペ: "ぺ",
    ポ: "ぽ",
    ャ: "ゃ",
    ュ: "ゅ",
    ョ: "ょ",
    ッ: "っ",
    // 長音記号は保持
    ー: "ー",
  }

  // カタカナをひらがなに変換
  let result = text.replace(/[\u30A0-\u30FF]/g, (match) => kanaMap[match] || match)

  // 漢字を含む文字列をひらがなに変換するためのAPIを呼び出す代わりに
  // 漢字を「？」に置き換える（完全な変換はブラウザだけでは難しいため）
  result = result.replace(/[\u4E00-\u9FFF]/g, "？")

  return result
}

// SpeechRecognitionのブラウザ互換性対応
const SpeechRecognition =
  typeof window !== "undefined" ? window.SpeechRecognition || (window as any).webkitSpeechRecognition : null

type UseSpeechRecognitionReturn = {
  isListening: boolean
  transcript: string
  startListening: () => void
  stopListening: () => void
  hasRecognitionSupport: boolean
  error: string | null
}

export function useSpeechRecognition(): UseSpeechRecognitionReturn {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [recognition, setRecognition] = useState<any>(null)
  const [hasRecognitionSupport, setHasRecognitionSupport] = useState(false)

  useEffect(() => {
    if (!SpeechRecognition) {
      setHasRecognitionSupport(false)
      setError("お使いのブラウザは音声認識をサポートしていません")
      return
    }

    setHasRecognitionSupport(true)
    const recognitionInstance = new SpeechRecognition()
    recognitionInstance.continuous = false
    recognitionInstance.interimResults = true
    recognitionInstance.lang = "ja-JP" // 日本語に設定

    recognitionInstance.onstart = () => {
      setIsListening(true)
      setError(null)
    }

    recognitionInstance.onend = () => {
      setIsListening(false)
    }

    recognitionInstance.onerror = (event: any) => {
      setError(`音声認識エラー: ${event.error}`)
      setIsListening(false)
    }

    recognitionInstance.onresult = (event: any) => {
      const current = event.resultIndex
      const result = event.results[current]
      const transcriptValue = result[0].transcript

      // 認識結果をひらがなに変換
      const hiraganaText = toHiragana(transcriptValue)
      setTranscript(hiraganaText)
    }

    setRecognition(recognitionInstance)

    return () => {
      if (recognitionInstance) {
        recognitionInstance.onstart = null
        recognitionInstance.onend = null
        recognitionInstance.onresult = null
        recognitionInstance.onerror = null
      }
    }
  }, [])

  const startListening = useCallback(() => {
    if (!recognition) return

    setTranscript("")
    try {
      recognition.start()
    } catch (err) {
      console.error("音声認識の開始に失敗しました:", err)
      setError("音声認識の開始に失敗しました")
    }
  }, [recognition])

  const stopListening = useCallback(() => {
    if (!recognition) return

    try {
      recognition.stop()
    } catch (err) {
      console.error("音声認識の停止に失敗しました:", err)
    }
  }, [recognition])

  return {
    isListening,
    transcript,
    startListening,
    stopListening,
    hasRecognitionSupport,
    error,
  }
}
