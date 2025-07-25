// jstTime.ts - JST基準日付処理モジュール
// Phase 2.2d T006: モバイル日付設定バグ修正

/**
 * JST基準の日付処理ユーティリティ
 * UTC/JST時差問題を解決するための専用モジュール
 */

// JST = UTC+9
const JST_OFFSET_HOURS = 9;
const MILLISECONDS_PER_HOUR = 3600000;

/**
 * JST基準の現在日時を取得
 * @returns JST基準のDateオブジェクト
 */
function getJSTDate(): Date {
  const now = new Date();
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  return new Date(utc + (JST_OFFSET_HOURS * MILLISECONDS_PER_HOUR));
}

/**
 * DateオブジェクトをYYYY-MM-DD形式でフォーマット
 * タイムゾーンに関係なく、ローカル日付でフォーマット
 * @param date フォーマット対象のDateオブジェクト
 * @returns YYYY-MM-DD形式の文字列
 */
function formatYMD(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * 指定された日付が今日（JST基準）かどうか判定
 * @param dateString YYYY-MM-DD形式の日付文字列
 * @returns 今日の場合true、それ以外はfalse
 */
function isToday(dateString: string): boolean {
  if (!dateString || typeof dateString !== 'string') {
    return false;
  }
  
  try {
    const today = formatYMD(getJSTDate());
    return dateString === today;
  } catch {
    return false;
  }
}

/**
 * JST基準の現在日付をYYYY-MM-DD形式で取得
 * @returns YYYY-MM-DD形式の今日の日付（JST基準）
 */
function getCurrentDate(): string {
  return formatYMD(getJSTDate());
}

/**
 * jstTime モジュール
 * JST基準の日付処理機能を提供
 */
export const jstTime = {
  getJSTDate,
  formatYMD,
  isToday,
  getCurrentDate
} as const;