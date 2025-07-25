// timeFormat.ts - 時間フォーマット共通ユーティリティ
// Phase 2.2a リファクタリング - DRY原則による重複排除

/**
 * 分から時間表記への変換
 * @param minutes 分数
 * @returns 日本語時間表記（例: "2時間30分", "45分", "3時間"）
 */
export function formatDuration(minutes: number): string {
  if (minutes === 0) return '0分';
  if (minutes < 60) return `${minutes}分`;
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours}時間`;
  }
  return `${hours}時間${remainingMinutes}分`;
}

/**
 * 分から短縮時間表記への変換（スペース節約用）
 * @param minutes 分数
 * @returns 短縮時間表記（例: "2h30m", "45m", "3h"）
 */
export function formatDurationCompact(minutes: number): string {
  if (minutes === 0) return '0m';
  if (minutes < 60) return `${minutes}m`;
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours}h`;
  }
  return `${hours}h${remainingMinutes}m`;
}

/**
 * 分から小数点時間への変換
 * @param minutes 分数
 * @returns 小数点時間（例: "2.5時間", "0.75時間"）
 */
export function formatDurationDecimal(minutes: number): string {
  if (minutes === 0) return '0時間';
  const hours = minutes / 60;
  return `${hours.toFixed(1)}時間`;
}