"use client"

type SpeechOptions = {
  rate?: number;
  pitch?: number;
  volume?: number;
  lang?: string;
  voice?: SpeechSynthesisVoice;
};

export function useSpeech() {
  // 利用可能な音声を取得
  const getVoices = () => {
    return typeof window !== "undefined"
      ? window.speechSynthesis.getVoices()
      : [];
  };

  // テキストを読み上げる関数
  const speak = (text: string, options: SpeechOptions = {}) => {
    if (typeof window === "undefined") return;

    // デフォルトのオプション
    const defaultOptions: SpeechOptions = {
      rate: 1,
      pitch: 1,
      volume: 1,
      lang: "ja-JP",
    };

    // オプションをマージ
    const mergedOptions = { ...defaultOptions, ...options };

    // 発話を作成
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = mergedOptions.rate!;
    utterance.pitch = mergedOptions.pitch!;
    utterance.volume = mergedOptions.volume!;
    utterance.lang = mergedOptions.lang!;

    // 声が指定されている場合は設定
    if (mergedOptions.voice) {
      utterance.voice = mergedOptions.voice;
    }

    // 読み上げを実行
    window.speechSynthesis.speak(utterance);
  };

  // 読み上げを停止
  const stop = () => {
    if (typeof window === "undefined") return;
    window.speechSynthesis.cancel();
  };

  return {
    speak,
    stop,
    getVoices,
  };
}
