// dateUtils.ts - T006 UTC/JST時差問題修正
// JST（日本標準時）基準の日付処理ユーティリティ

/**
 * JST基準で今日の日付を取得
 * @returns JST基準の今日の日付（YYYY-MM-DD形式）
 */
export function getJSTTodayString(): string {
  const now = new Date()
  return getJSTDateString(now)
}

/**
 * 任意のDateオブジェクトをJST基準の日付文字列に変換
 * @param date 変換対象のDateオブジェクト
 * @returns JST基準の日付文字列（YYYY-MM-DD形式）
 */
export function getJSTDateString(date: Date): string {
  // JST = UTC + 9時間のオフセットを適用
  const jstOffset = 9 * 60 * 60 * 1000 // 9時間をミリ秒で表現
  const jstTime = new Date(date.getTime() + jstOffset)
  
  // UTC時刻として取得するが、実際はJST時刻が格納されている
  const year = jstTime.getUTCFullYear()
  const month = String(jstTime.getUTCMonth() + 1).padStart(2, '0')
  const day = String(jstTime.getUTCDate()).padStart(2, '0')
  
  return `${year}-${month}-${day}`
}

/**
 * 日付文字列からJST基準のDateオブジェクトを作成
 * @param dateString YYYY-MM-DD形式の日付文字列
 * @returns JST基準のDateオブジェクト（JST 0:00:00を表す）
 */
export function createJSTDate(dateString: string): Date {
  // YYYY-MM-DD形式の日付文字列をパース
  const [year, month, day] = dateString.split('-').map(Number)
  
  // JST基準での0時0分0秒を作成
  // JST 0:00 = UTC 15:00（前日）
  const jstMidnight = new Date()
  jstMidnight.setUTCFullYear(year)
  jstMidnight.setUTCMonth(month - 1) // 0-indexed
  jstMidnight.setUTCDate(day)
  jstMidnight.setUTCHours(0 - 9) // JST 0時 = UTC 15時（前日）
  jstMidnight.setUTCMinutes(0)
  jstMidnight.setUTCSeconds(0)
  jstMidnight.setUTCMilliseconds(0)
  
  return jstMidnight
}

/**
 * 指定された日付がJST基準で今日かどうか判定
 * @param dateString YYYY-MM-DD形式の日付文字列
 * @returns JST基準で今日の場合true
 */
export function isJSTToday(dateString: string): boolean {
  const todayJST = getJSTTodayString()
  return dateString === todayJST
}