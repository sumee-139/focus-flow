// UI関連の定数定義
// Day 3: ISS-003対応 - ブレークポイント等の統一化
// Hook test - lint should run automatically

// レスポンシブブレークポイント (768px境界統一)
export const BREAKPOINTS = {
  MOBILE_MAX: 768,         // モバイル境界 (≤768px: mobile)
  TABLET_MIN: 769,         // タブレット開始
  TABLET_MAX: 1200,        // タブレット終了
  DESKTOP_MIN: 1201,       // デスクトップ開始
  SMALL_MOBILE_MAX: 480    // 小画面モバイル境界
} as const

// CSS メディアクエリ (768px境界統一)
export const MEDIA_QUERIES = {
  MOBILE: `(max-width: ${BREAKPOINTS.MOBILE_MAX}px)`,
  TABLET: `(min-width: ${BREAKPOINTS.TABLET_MIN}px) and (max-width: ${BREAKPOINTS.TABLET_MAX}px)`,
  DESKTOP: `(min-width: ${BREAKPOINTS.DESKTOP_MIN}px)`,
  SMALL_MOBILE: `(max-width: ${BREAKPOINTS.SMALL_MOBILE_MAX}px)`
} as const

// 自動保存関連
export const AUTO_SAVE = {
  DELAY_MS: 3000,          // 3秒後に自動保存
  DEBOUNCE_MS: 300         // 入力のデバウンス時間
} as const

// タッチターゲットサイズ (WCAG準拠)
export const TOUCH_TARGET = {
  MIN_SIZE: 44,            // 最小タッチターゲット (44x44px)
  TABLET_SIZE: 48,         // タブレット用サイズ
  SMALL_MOBILE_SIZE: 40    // 小画面モバイル用サイズ
} as const

// アニメーション時間
export const ANIMATION = {
  PANEL_TRANSITION: 300,   // パネル表示/非表示
  BUTTON_HOVER: 200,       // ボタンホバー効果
  FOCUS_FEEDBACK: 100      // フォーカス時のフィードバック
} as const

// Z-Index層管理
export const Z_INDEX = {
  OVERLAY: 999,            // デスクトップオーバーレイ
  MOBILE_PANEL: 2000,      // モバイルパネル
  NOTIFICATION: 3000,      // 通知・アラート
  MODAL: 4000              // モーダルダイアログ
} as const