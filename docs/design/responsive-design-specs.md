# レスポンシブデザイン仕様書

## 設計哲学

### Mobile First Approach
1. **Mobile First**: モバイル体験を優先設計
2. **Progressive Enhancement**: 画面が大きくなるにつれて機能を拡張
3. **Touch First**: タッチ操作を前提とした設計
4. **Context Aware**: 使用状況に応じた最適化

### Device Context
- **Mobile**: 移動中、短時間の操作、片手操作
- **Tablet**: カフェ、中時間の作業、両手操作
- **Desktop**: オフィス、長時間の作業、マルチタスク

---

## ブレークポイント定義

### Primary Breakpoints
```css
/* Mobile First */
:root {
  --mobile-max: 767px;
  --tablet-min: 768px;
  --tablet-max: 1023px;
  --desktop-min: 1024px;
  --desktop-large-min: 1440px;
}

/* Media Queries */
@media (max-width: 767px) { /* Mobile */ }
@media (min-width: 768px) and (max-width: 1023px) { /* Tablet */ }
@media (min-width: 1024px) { /* Desktop */ }
@media (min-width: 1440px) { /* Large Desktop */ }
```

### Secondary Breakpoints
```css
/* Fine-tuning breakpoints */
:root {
  --mobile-small: 320px;
  --mobile-large: 480px;
  --tablet-small: 768px;
  --tablet-large: 1024px;
  --desktop-small: 1024px;
  --desktop-medium: 1200px;
  --desktop-large: 1440px;
  --desktop-xlarge: 1920px;
}
```

---

## 1. Mobile Design (320px - 767px)

### 1.1 Layout Structure
```
┌─────────────────────────────────┐
│ [📱] Header (Fixed)             │ 56px
├─────────────────────────────────┤
│                                 │
│        Main Content             │
│        (Scrollable)             │
│                                 │
│                                 │
│                                 │
│                                 │
│                                 │
│                                 │
│                                 │
│                                 │
│                                 │
├─────────────────────────────────┤
│ [🏠][📝][🎯][⚙️] Bottom Nav     │ 64px
└─────────────────────────────────┘
```

### 1.2 Key Design Patterns

#### Header
- **Height**: 56px (iOS Safe Area対応)
- **Content**: タイトル + 必要最小限のアクション
- **Style**: Fixed position, 半透明背景
- **Safe Area**: iOS Notch/Dynamic Island対応

#### Bottom Navigation
- **Height**: 64px (+ Safe Area)
- **Items**: 最大4つのメイン機能
- **Touch Target**: 最小48px × 48px
- **Active State**: 明確な選択状態表示

#### Content Area
- **Padding**: 16px (左右), 8px (上下)
- **Card Spacing**: 8px間隔
- **Typography**: 16px base, 1.5 line-height
- **Scrolling**: Native momentum scrolling

### 1.3 Mobile Specific Features

#### Touch Interactions
```css
/* Touch-friendly button sizes */
.button-primary {
  min-height: 48px;
  padding: 12px 24px;
  font-size: 16px;
}

.button-secondary {
  min-height: 44px;
  padding: 10px 20px;
  font-size: 14px;
}

/* Touch feedback */
.touch-feedback {
  transition: transform 0.1s ease;
}

.touch-feedback:active {
  transform: scale(0.98);
}
```

#### Gestures
- **Swipe**: タスク完了、削除、編集
- **Pull to Refresh**: リスト更新
- **Long Press**: コンテキストメニュー
- **Pinch to Zoom**: 統計グラフ（必要時）

### 1.4 Mobile Navigation
```
Bottom Tab Navigation:
┌─────────┬─────────┬─────────┬─────────┐
│   🏠    │   📝    │   🎯    │   ⚙️    │
│ ダッシュ  │ タスク   │ 集中    │ 設定    │
│ ボード   │        │        │        │
└─────────┴─────────┴─────────┴─────────┘
```

---

## 2. Tablet Design (768px - 1023px)

### 2.1 Layout Structure（Markdownエディタ中心）
```
┌─────────────────────────────────────────────────────────────┐
│ [📱] Header (Fixed)                                         │ 64px
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐  ┌─────────────────────────────────────┐  │
│  │             │  │                                     │  │
│  │ Navigation  │  │     📝 デイリーメモ                 │  │
│  │ 🏠 📝 🎯 ⚙️ │  │    (メインエリア)                   │  │
│  │             │  │                                     │  │
│  │─────────────│  │  ┌─────────────────────────────────┐ │  │
│  │📝 Tasks     │  │  │ ## 今日のメモ                   │ │  │
│  │• React設計  │  │  │                                 │ │  │
│  │• API仕様書  │  │  │ - 作業ログ                      │ │  │
│  │• メール返信  │  │  │ - アイデア・気づき               │ │  │
│  │             │  │  │                                 │ │  │
│  │[+ 新規]     │  │  │ [大きなMarkdown編集エリア]       │ │  │
│  │             │  │  │                                 │ │  │
│  └─────────────┘  │  └─────────────────────────────────┘ │  │
│      200px        │                                     │  │
│                   └─────────────────────────────────────┘  │
│                               メイン領域（75%）              │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Key Design Patterns

#### Sidebar Navigation（コンパクト設計）
- **Width**: 200px (固定)
- **Content**: 基本ナビ + コンパクトなタスク一覧
- **Collapsible**: 必要に応じて折りたたみ
- **Persistent**: 常時表示

#### Two-Column Layout（Markdownエディタ中心）
- **Left**: コンパクトなナビゲーション・タスク一覧
- **Right**: デイリーメモ（Markdownエディタ）がメイン
- **Ratio**: 1:4 (メモエリアを大きく)
- **Design**: 見た目はMarkdownエディタ

### 2.3 Tablet Specific Features

#### Split Screen Support
```css
/* iPad Split View対応 */
@media (min-width: 768px) and (max-width: 1023px) {
  .adaptive-layout {
    display: flex;
    flex-direction: column;
  }
  
  /* Compact width時の対応 */
  @media (max-width: 600px) {
    .sidebar {
      display: none;
    }
    
    .main-content {
      width: 100%;
    }
  }
}
```

#### Enhanced Touch Interactions
- **Hover States**: タブレットでのマウス操作対応
- **Precise Touch**: より細かい操作が可能
- **Multi-touch**: ピンチズーム、回転対応

### 2.4 Tablet Navigation
```
Sidebar Navigation:
┌─────────────────┐
│ 🏠 ダッシュボード  │
│ 📝 タスク管理     │
│ 🎯 集中モード     │
│ 📊 統計・分析     │
│ 🗒️ メモ         │
│ ⚙️ 設定         │
│ ❓ ヘルプ        │
└─────────────────┘
```

---

## 3. Desktop Design (1024px+)

### 3.1 Layout Structure
```
┌─────────────────────────────────────────────────────────────┐
│ [🖥️] Header (Fixed)                                         │ 72px
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ ┌─────────────┐ ┌─────────────────────┐ ┌─────────────────┐ │
│ │             │ │                     │ │                 │ │
│ │ Navigation  │ │    Main Content     │ │   Side Panel    │ │
│ │ (Sidebar)   │ │                     │ │   (Optional)    │ │
│ │             │ │                     │ │                 │ │
│ │             │ │                     │ │                 │ │
│ │             │ │                     │ │                 │ │
│ │             │ │                     │ │                 │ │
│ │             │ │                     │ │                 │ │
│ │             │ │                     │ │                 │ │
│ │             │ │                     │ │                 │ │
│ │             │ │                     │ │                 │ │
│ │             │ │                     │ │                 │ │
│ └─────────────┘ └─────────────────────┘ └─────────────────┘ │
│     240px               可変                  280px          │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 Key Design Patterns

#### Three-Column Layout
- **Left Sidebar**: 240px (固定)
- **Main Content**: 可変 (min-width: 480px)
- **Right Panel**: 280px (コンテキスト依存)
- **Collapsible**: 各カラムの折りたたみ対応

#### Advanced Navigation
- **Breadcrumbs**: 階層の明確化
- **Search**: 高度な検索機能
- **Shortcuts**: キーボードショートカット
- **Context Menus**: 右クリックメニュー

### 3.3 Desktop Specific Features

#### Keyboard Navigation
```javascript
// キーボードショートカット
const shortcuts = {
  'Ctrl+N': 'newTask',
  'Ctrl+F': 'search',
  'Ctrl+Shift+M': 'quickMemo',
  'Escape': 'closeModal',
  'Tab': 'nextElement',
  'Shift+Tab': 'prevElement',
  'Enter': 'activate',
  'Space': 'select'
};
```

#### Multi-window Support
- **Modal Windows**: 複数同時表示
- **Drag & Drop**: 高度な操作
- **Resize**: 動的レイアウト調整
- **Multi-monitor**: 複数ディスプレイ対応

### 3.4 Desktop Navigation
```
Header Navigation:
┌─────────────────────────────────────────────────────────────┐
│ FocusFlow    [🔍 検索] [📝 新規] [🔔 通知] [👤 ユーザー]     │
└─────────────────────────────────────────────────────────────┘

Sidebar Navigation:
┌─────────────────┐
│ 🏠 ダッシュボード  │
│ 📝 タスク管理     │
│ 🎯 集中モード     │
│ 📊 統計・分析     │
│ 🗒️ メモ         │
│ 📅 カレンダー     │
│ ⚙️ 設定         │
│ ❓ ヘルプ        │
└─────────────────┘
```

---

## 4. 画面別レスポンシブ設計

### 4.1 ダッシュボード

#### Mobile (320px - 767px)
```
┌─────────────────────────────────┐
│ FocusFlow              [🔔] [⚙️] │
├─────────────────────────────────┤
│                                 │
│ ┌─────────────────────────────┐ │
│ │ 🎯 今日の集中時間            │ │
│ │ 2時間 30分 / 4時間 (63%)    │ │
│ │ ■■■■■■■■■■■■■░░░░     │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ 📝 今日のタスク             │ │
│ │ ┌─────────────────────────┐ │ │
│ │ │📝 タスク1         [▶️] │ │ │
│ │ │📝 タスク2         [▶️] │ │ │
│ │ │📝 タスク3         [▶️] │ │ │
│ │ └─────────────────────────┘ │ │
│ │ [すべて見る]                 │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │  🎯 クイック集中開始         │ │
│ │                             │ │
│ │     [大きなボタン]           │ │
│ └─────────────────────────────┘ │
│                                 │
├─────────────────────────────────┤
│ [🏠] [📝] [🎯] [⚙️] Bottom Nav  │
└─────────────────────────────────┘
```

#### Tablet (768px - 1023px)
```
┌─────────────────────────────────────────────────────────────┐
│ FocusFlow              [🔍] [📝] [🔔] [👤]                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ ┌─────────────────┐ ┌─────────────────────────────────────┐ │
│ │ 🎯 今日の集中時間 │ │ 📝 今日のタスク                   │ │
│ │ 2時間 30分      │ │ ┌─────────────────────────────────┐ │ │
│ │ ■■■■■■■■░░░░ │ │ │📝 タスク1              [▶️] │ │ │
│ │ 63% 完了        │ │ │📝 タスク2              [▶️] │ │ │
│ │                 │ │ │📝 タスク3              [▶️] │ │ │
│ │ [クイック開始]   │ │ │📝 タスク4              [▶️] │ │ │
│ └─────────────────┘ │ └─────────────────────────────────┘ │ │
│                     │ [すべて見る]                         │ │
│                     └─────────────────────────────────────┘ │
│                                                             │
│ ┌─────────────────┐ ┌─────────────────────────────────────┐ │
│ │ 📊 週間統計      │ │ 📈 生産性トレンド                 │ │
│ │ [グラフ]        │ │ [チャート]                         │ │
│ └─────────────────┘ └─────────────────────────────────────┘ │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### Desktop (1024px+)
```
┌─────────────────────────────────────────────────────────────┐
│ FocusFlow    [🔍 検索] [📝 新規] [🔔 通知] [👤 ユーザー]     │
├─────┬───────────────────────────────────────────────────────┤
│ 🏠  │ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐       │
│ 📝  │ │ 🎯 今日の    │ │ 📊 週間統計  │ │ 📈 生産性    │       │
│ 🎯  │ │ 集中時間     │ │            │ │ トレンド     │       │
│ 📊  │ │ 2時間 30分  │ │ [グラフ]    │ │ [チャート]   │       │
│ 🗒️  │ │ ■■■■■■■■░░ │ │            │ │             │       │
│ 📅  │ │ 63% 完了    │ │            │ │             │       │
│ ⚙️  │ │            │ │            │ │             │       │
│ ❓  │ │[クイック開始] │ │            │ │             │       │
│     │ └─────────────┘ └─────────────┘ └─────────────┘       │
│     │                                                      │
│     │ ┌─────────────────────────────────────────────────┐  │
│     │ │ 📝 今日のタスク                                 │  │
│     │ │ ┌─────────────────────────────────────────────┐ │  │
│     │ │ │📝 React コンポーネント設計        [▶️] [⚙️]│ │  │
│     │ │ │📝 API仕様書レビュー              [▶️] [⚙️]│ │  │
│     │ │ │📝 メール返信                    [▶️] [⚙️]│ │  │
│     │ │ │📝 データベース設計              [▶️] [⚙️]│ │  │
│     │ │ └─────────────────────────────────────────────┘ │  │
│     │ │ [すべて見る] [新規作成]                          │  │
│     │ └─────────────────────────────────────────────────┘  │
│     │                                                      │
└─────┴───────────────────────────────────────────────────────┘
```

### 4.2 フォーカスモード

#### Mobile (320px - 767px)
```
┌─────────────────────────────────┐
│ 集中中                     [⚙️] │
├─────────────────────────────────┤
│                                 │
│ ┌─────────────────────────────┐ │
│ │ 📝 React コンポーネント設計 │ │
│ │ 見積もり: 60分               │ │
│ └─────────────────────────────┘ │
│                                 │
│                                 │
│         ┌─────────────┐         │
│         │             │         │
│         │   37:42     │         │
│         │             │         │
│         │(大きく表示)  │         │
│         │             │         │
│         └─────────────┘         │
│                                 │
│    ████████████████░░░░░░░░     │
│         62% 完了                │
│                                 │
│  ┌─────────┐  ┌─────────┐      │
│  │  ⏸️     │  │  🗒️     │      │
│  │ 一時停止 │  │ メモ    │      │
│  └─────────┘  └─────────┘      │
│                                 │
│  ┌─────────┐  ┌─────────┐      │
│  │  ⚠️     │  │  ⏹️     │      │
│  │ 緊急    │  │ 終了    │      │
│  └─────────┘  └─────────┘      │
│                                 │
│        中断: 1回 | 効率: 85%    │
│                                 │
└─────────────────────────────────┘
```

#### Desktop (1024px+)
```
┌─────────────────────────────────────────────────────────────┐
│ 集中中                                               [⚙️] │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│    ┌─────────────────────────────────────────────────┐    │
│    │ 📝 React コンポーネント設計                      │    │
│    │ 見積もり: 60分 | 経過: 23分                     │    │
│    └─────────────────────────────────────────────────┘    │
│                                                             │
│                   ┌─────────────┐                          │
│                   │             │                          │
│                   │   37:42     │                          │
│                   │             │                          │
│                   │(大きく表示)  │                          │
│                   │             │                          │
│                   └─────────────┘                          │
│                                                             │
│              ████████████████░░░░░░░░░░                    │
│                  62% 完了                                   │
│                                                             │
│    ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐    │
│    │  ⏸️     │  │  🗒️     │  │  ⚠️     │  │  ⏹️     │    │
│    │ 一時停止 │  │ メモ    │  │ 緊急    │  │ 終了    │    │
│    └─────────┘  └─────────┘  └─────────┘  └─────────┘    │
│                                                             │
│               中断回数: 1回 | 効率: 85%                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 5. Component Responsive Patterns

### 5.1 Card Component
```css
.card {
  /* Base styles (Mobile) */
  padding: 16px;
  margin: 8px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

@media (min-width: 768px) {
  .card {
    padding: 20px;
    margin: 12px;
    border-radius: 12px;
  }
}

@media (min-width: 1024px) {
  .card {
    padding: 24px;
    margin: 16px;
    border-radius: 16px;
    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  }
}
```

### 5.2 Button Component
```css
.button {
  /* Mobile */
  min-height: 48px;
  padding: 12px 24px;
  font-size: 16px;
  border-radius: 8px;
}

@media (min-width: 768px) {
  .button {
    min-height: 44px;
    padding: 10px 20px;
    font-size: 15px;
  }
}

@media (min-width: 1024px) {
  .button {
    min-height: 40px;
    padding: 8px 16px;
    font-size: 14px;
    border-radius: 6px;
  }
}
```

### 5.3 Typography Scale
```css
:root {
  /* Mobile Typography */
  --font-size-xs: 12px;
  --font-size-sm: 14px;
  --font-size-base: 16px;
  --font-size-lg: 18px;
  --font-size-xl: 20px;
  --font-size-2xl: 24px;
  --font-size-3xl: 30px;
}

@media (min-width: 768px) {
  :root {
    --font-size-xs: 11px;
    --font-size-sm: 13px;
    --font-size-base: 15px;
    --font-size-lg: 17px;
    --font-size-xl: 19px;
    --font-size-2xl: 22px;
    --font-size-3xl: 28px;
  }
}

@media (min-width: 1024px) {
  :root {
    --font-size-xs: 10px;
    --font-size-sm: 12px;
    --font-size-base: 14px;
    --font-size-lg: 16px;
    --font-size-xl: 18px;
    --font-size-2xl: 20px;
    --font-size-3xl: 24px;
  }
}
```

---

## 6. Performance Considerations

### 6.1 Image Optimization
```css
.responsive-image {
  width: 100%;
  height: auto;
  object-fit: cover;
}

/* Picture element for different screen densities */
```

```html
<picture>
  <source 
    media="(min-width: 1024px)" 
    srcset="image-desktop.webp 1x, image-desktop@2x.webp 2x"
  >
  <source 
    media="(min-width: 768px)" 
    srcset="image-tablet.webp 1x, image-tablet@2x.webp 2x"
  >
  <img 
    src="image-mobile.webp" 
    srcset="image-mobile@2x.webp 2x"
    alt="Description"
    loading="lazy"
  >
</picture>
```

### 6.2 CSS Optimization
```css
/* Container queries for component-level responsiveness */
.task-card {
  container-type: inline-size;
}

@container (min-width: 400px) {
  .task-card .task-actions {
    display: flex;
    gap: 8px;
  }
}

@container (min-width: 500px) {
  .task-card {
    grid-template-columns: 1fr auto;
  }
}
```

### 6.3 Loading Strategies
```javascript
// Lazy loading for off-screen content
const observerOptions = {
  root: null,
  rootMargin: '50px',
  threshold: 0.1
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      // Load content
    }
  });
}, observerOptions);
```

---

## 7. Testing Strategy

### 7.1 Device Testing
```javascript
// Responsive testing breakpoints
const testBreakpoints = [
  { name: 'Mobile Small', width: 320, height: 568 },
  { name: 'Mobile Large', width: 414, height: 896 },
  { name: 'Tablet Portrait', width: 768, height: 1024 },
  { name: 'Tablet Landscape', width: 1024, height: 768 },
  { name: 'Desktop Small', width: 1024, height: 768 },
  { name: 'Desktop Large', width: 1440, height: 900 }
];
```

### 7.2 Accessibility Testing
- **Screen Reader**: NVDA, JAWS, VoiceOver
- **Keyboard Navigation**: Tab順序、フォーカス管理
- **Color Contrast**: WCAG 2.1 AA基準
- **Touch Target**: 最小44px × 44px

### 7.3 Performance Testing
- **Core Web Vitals**: 各ブレークポイントでの測定
- **Network Throttling**: 3G, 4G環境での検証
- **Memory Usage**: メモリ使用量の監視

---

## 8. Implementation Guidelines

### 8.1 CSS Grid Layout
```css
.dashboard-grid {
  display: grid;
  gap: 16px;
  
  /* Mobile: 1 column */
  grid-template-columns: 1fr;
  
  /* Tablet: 2 columns */
  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  /* Desktop: 3 columns */
  @media (min-width: 1024px) {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

### 8.2 Flexbox Patterns
```css
.responsive-flex {
  display: flex;
  flex-direction: column;
  gap: 16px;
  
  @media (min-width: 768px) {
    flex-direction: row;
    align-items: center;
  }
}
```

### 8.3 Utility Classes
```css
/* Responsive visibility */
.mobile-only { display: block; }
.tablet-only { display: none; }
.desktop-only { display: none; }

@media (min-width: 768px) {
  .mobile-only { display: none; }
  .tablet-only { display: block; }
  .desktop-only { display: none; }
}

@media (min-width: 1024px) {
  .mobile-only { display: none; }
  .tablet-only { display: none; }
  .desktop-only { display: block; }
}
```

---

**最終更新**: 2025-07-14  
**次回更新**: 実装テスト結果反映時