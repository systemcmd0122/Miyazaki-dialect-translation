import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json()

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "テキストが提供されていないか、無効です" }, { status: 400 })
    }

    const apiKey = process.env.GEMINI_API_KEY

    if (!apiKey) {
      return NextResponse.json({ error: "API キーが設定されていません" }, { status: 500 })
    }

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" + apiKey,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `あなたは宮崎県の方言（宮崎弁）を標準的な日本語に翻訳する専門家です。以下の指示に従って翻訳してください。

# 宮崎弁の特徴
- 「〜ちょる」「〜ごつ」「〜ごわす」などの特徴的な語尾
- 「〜と」「〜とよ」「〜とね」などの文末表現
- 「おいどん」（私）、「あんた」（あなた）などの人称代名詞
- 「ごっつぉ」（ごちそう）、「おやっとさぁ」（お疲れ様）などの特有の語彙
- 「せんといかん」（しなければならない）のような義務表現
- 「〜ちゃ」「〜やっちゃ」などの疑問形
- 「〜やった」「〜やろ」などの過去形・推量形

# 翻訳の際の注意点
1. 宮崎弁特有の語彙や表現を正確に理解する
2. 文脈を考慮して適切な標準語に変換する
3. 話者の意図や感情のニュアンスを保持する
4. 敬語表現や世代差を考慮する
5. 地域による微妙な方言の違いを考慮する（県北部と南部で異なる場合がある）

# 翻訳例
- 「おはようごわす」→「おはようございます」
- 「あんたんとこに行くとよ」→「あなたの家に行きますよ」
- 「そげんことせんでよかが」→「そんなことしなくていいですか」
- 「めっちゃよかとこやね」→「とても良いところですね」
- 「おいどんが行っちょく」→「私が行っておきます」
- 「なんごつしよっと？」→「何をしているの？」

以下の宮崎弁を上記の知識を活用して、自然で正確な標準語に翻訳してください。翻訳のみを返し、説明は不要です。

宮崎弁: ${text}`,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.1, // より決定論的な応答のために温度を下げる
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          },
        }),
      },
    )

    if (!response.ok) {
      const errorData = await response.json()
      console.error("Gemini API エラー:", errorData)
      return NextResponse.json({ error: "翻訳サービスとの通信中にエラーが発生しました" }, { status: 500 })
    }

    const data = await response.json()

    // レスポンスから翻訳テキストを抽出
    const translatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || ""

    return NextResponse.json({ translatedText })
  } catch (error) {
    console.error("翻訳処理エラー:", error)
    return NextResponse.json({ error: "翻訳処理中にエラーが発生しました" }, { status: 500 })
  }
}
