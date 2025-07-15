# FocusFlow Acceptance Criteria Details

## Overview
このドキュメントは、user-stories.mdのAcceptance Criteriaを詳細化し、開発時のDefinition of Doneを明確にします。

---

## Phase 1: 基本集中機能

### Story 1.1: 集中セッション開始

#### AC 1.1.1: 集中時間選択
**Given** ユーザーがフォーカスモード画面を開いている  
**When** 集中時間の選択肢を確認する  
**Then** 以下の選択肢が表示される：
- 15分（プリセット）
- 30分（プリセット）
- 60分（プリセット）
- カスタム（5分〜180分、5分刻み）

**Technical Details:**
- React Select コンポーネント使用
- 選択値をReact Contextに保存
- 入力値検証（最小5分、最大180分）

#### AC 1.1.2: 通知遮断
**Given** ユーザーが集中モードを開始した  
**When** 集中セッションが開始される  
**Then** 以下の通知制御が実行される：
- PWA通知APIでブラウザ通知を制御
- 集中中アイコンの表示
- 通知許可がない場合は代替UI表示

**Technical Details:**
```typescript
// 通知制御の実装例
const startFocusMode = async () => {
  if (Notification.permission === 'granted') {
    // 通知を一時的に無効化
    await navigator.serviceWorker.ready;
    // Service Workerに通知抑制指示
  } else {
    // 代替UI（サイレントモード表示）
    showSilentModeIndicator();
  }
};
```

#### AC 1.1.3: 集中状態の表示
**Given** 集中モードが開始されている  
**When** ユーザーがアプリを確認する  
**Then** 以下の情報が表示される：
- 現在の集中時間（リアルタイム更新）
- 集中開始時刻
- 残り時間のプログレスバー
- 現在のタスク名（設定時）

**Technical Details:**
- setInterval で1秒間隔更新
- Chakra UI Progress コンポーネント
- 時間表示フォーマット（MM:SS）

#### AC 1.1.4: セッション記録
**Given** 集中セッションが開始された  
**When** セッションが終了する  
**Then** 以下のデータがIndexedDBに保存される：

```typescript
interface Session {
  id: number;
  taskId?: number;
  startTime: Date;
  endTime: Date;
  duration: number; // 分
  interruptions: number;
  completed: boolean;
  notes?: string;
}
```

### Story 1.2: 通知制御

#### AC 1.2.1: PWA通知制御
**Given** ユーザーがPWA通知を許可している  
**When** 集中モードが開始される  
**Then** 以下の通知制御が実行される：
- ブラウザ通知の一時停止
- Service Worker経由での通知フィルタリング
- 集中終了時の通知復旧

**Technical Details:**
```typescript
// Service Worker での通知制御
self.addEventListener('push', (event) => {
  if (focusMode.isActive) {
    // 緊急通知のみ許可
    if (event.data.json().priority === 'urgent') {
      // 通知表示
    }
    return; // 通常通知は抑制
  }
  // 通常の通知処理
});
```

#### AC 1.2.2: 緊急連絡先例外
**Given** ユーザーが緊急連絡先を設定している  
**When** 集中モード中に緊急連絡先から通知が来る  
**Then** 以下の動作を行う：
- 緊急通知の表示
- 音声アラートの再生
- ユーザーの応答選択肢（中断/継続）

**Technical Details:**
- 緊急連絡先リストをIndexedDBに保存
- 通知送信者の識別ロジック
- 音声ファイルの再生

#### AC 1.2.3: iOS PWA制限対応
**Given** ユーザーがiOS PWAを使用している  
**When** 通知制御が制限される  
**Then** 以下の代替UI を提供する：
- 集中中の視覚的インジケーター
- 手動サイレントモード設定
- 集中時間の明確な表示

### Story 2.1: タスク作成

#### AC 2.1.1: タスク入力フォーム
**Given** ユーザーがタスク作成画面を開いている  
**When** 新しいタスクを作成する  
**Then** 以下の入力フィールドが提供される：

```typescript
interface TaskForm {
  title: string; // 必須、1-100文字
  description?: string; // オプション、500文字以下
  estimatedTime: number; // 必須、5-480分
  tags: string[]; // オプション、最大10個
  priority: 'low' | 'medium' | 'high'; // デフォルト: medium
}
```

**Validation Rules:**
- タイトル: 必須、1-100文字、HTML タグ不可
- 見積もり時間: 5分〜480分（8時間）
- タグ: 英数字・ひらがな・カタカナ・漢字のみ

#### AC 2.1.2: タグ機能
**Given** ユーザーがタスクにタグを追加している  
**When** タグを入力する  
**Then** 以下の機能が提供される：
- 既存タグの自動補完
- タグの色分け表示
- タグ使用頻度の記録
- 不適切なタグの除外

**Technical Details:**
```typescript
// タグ自動補完
const getTagSuggestions = async (input: string) => {
  const existingTags = await db.tags
    .where('name')
    .startsWithIgnoreCase(input)
    .limit(5)
    .toArray();
  return existingTags.map(tag => tag.name);
};
```

#### AC 2.1.3: データ保存
**Given** ユーザーがタスク作成を完了した  
**When** 「保存」ボタンをクリックする  
**Then** 以下のデータがIndexedDBに保存される：

```typescript
interface Task {
  id?: number;
  title: string;
  description?: string;
  estimatedTime: number;
  actualTime?: number;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
  priority: 'low' | 'medium' | 'high';
}
```

**Error Handling:**
- 保存失敗時のエラーメッセージ表示
- 自動保存機能（下書き）
- オフライン時の保存キュー

### Story 2.2: タスク実行

#### AC 2.2.1: タスク選択
**Given** ユーザーがタスクリストを確認している  
**When** 実行するタスクを選択する  
**Then** 以下の情報が表示される：
- タスクの詳細情報
- 見積もり時間
- 前回の実行履歴
- 関連メモ（あれば）

**Technical Details:**
```typescript
// タスク選択時のデータ取得
const selectTask = async (taskId: number) => {
  const task = await db.tasks.get(taskId);
  const sessions = await db.sessions
    .where('taskId')
    .equals(taskId)
    .reverse()
    .limit(5)
    .toArray();
  
  return { task, recentSessions: sessions };
};
```

#### AC 2.2.2: 集中モード連携
**Given** ユーザーがタスクを選択している  
**When** 「集中開始」ボタンをクリックする  
**Then** 以下の連携が実行される：
- 選択タスクの集中モード開始
- タスクと集中セッションの紐付け
- 作業時間の自動計測開始
- 現在実行中タスクの表示

#### AC 2.2.3: 時間計測
**Given** タスクの集中セッションが開始されている  
**When** 集中時間が経過する  
**Then** 以下の計測が実行される：
- 実際の作業時間の記録
- 中断回数のカウント
- 集中効率の計算
- リアルタイム進捗更新

**Technical Details:**
```typescript
// 時間計測の実装
class TimeTracker {
  private startTime: Date;
  private interruptions: number = 0;
  private isActive: boolean = false;
  
  start(taskId: number) {
    this.startTime = new Date();
    this.isActive = true;
    this.startTimer();
  }
  
  interrupt() {
    this.interruptions++;
    // 中断時間を記録
  }
  
  stop() {
    const endTime = new Date();
    const duration = endTime.getTime() - this.startTime.getTime();
    return {
      duration: Math.floor(duration / 1000 / 60), // 分
      interruptions: this.interruptions
    };
  }
}
```

### Story 2.3: タスク完了

#### AC 2.3.1: 完了マーク
**Given** ユーザーがタスクを完了した  
**When** 完了チェックボックスをクリックする  
**Then** 以下の処理が実行される：
- タスクの完了状態更新
- 完了時刻の記録
- 実績時間の確定
- 視覚的な完了表示

**Technical Details:**
```typescript
const completeTask = async (taskId: number) => {
  const now = new Date();
  await db.tasks.update(taskId, {
    completed: true,
    completedAt: now,
    updatedAt: now
  });
  
  // 進行中のセッションがあれば終了
  const activeSession = await db.sessions
    .where('taskId')
    .equals(taskId)
    .and(session => !session.endTime)
    .first();
    
  if (activeSession) {
    await db.sessions.update(activeSession.id, {
      endTime: now,
      completed: true
    });
  }
};
```

#### AC 2.3.2: 実績記録
**Given** タスクが完了された  
**When** 実績データを確認する  
**Then** 以下の情報が記録される：
- 総作業時間
- 見積もりとの差異
- 中断回数
- 完了日時
- 効率スコア

**Calculation Logic:**
```typescript
interface TaskMetrics {
  estimatedTime: number;
  actualTime: number;
  accuracy: number; // 見積もり精度
  efficiency: number; // 効率スコア
  interruptions: number;
  focusRate: number; // 集中率
}

const calculateMetrics = (task: Task, sessions: Session[]): TaskMetrics => {
  const totalActualTime = sessions.reduce((sum, s) => sum + s.duration, 0);
  const totalInterruptions = sessions.reduce((sum, s) => sum + s.interruptions, 0);
  
  return {
    estimatedTime: task.estimatedTime,
    actualTime: totalActualTime,
    accuracy: Math.min(task.estimatedTime / totalActualTime, 2), // 最大2倍
    efficiency: totalActualTime / (totalActualTime + totalInterruptions * 2), // 中断ペナルティ
    interruptions: totalInterruptions,
    focusRate: 1 - (totalInterruptions / (totalActualTime / 15)) // 15分あたりの中断率
  };
};
```

#### AC 2.3.3: 完了タスクの表示
**Given** タスクが完了されている  
**When** ユーザーがタスクリストを確認する  
**Then** 以下の視覚的区別が提供される：
- 完了タスクのグレーアウト
- チェックマークの表示
- 完了日時の表示
- 実績データの表示

**UI Requirements:**
- 完了タスクは別セクションに移動
- 完了タスクの表示/非表示切り替え
- 完了タスクの検索対象化
- 完了タスクの再開機能

---

## Phase 2: 思考支援機能

### Story 3.1: 瞬時メモ入力

#### AC 3.1.1: ホットキー起動
**Given** ユーザーがアプリを使用している  
**When** ホットキー（Ctrl+Shift+M）を押す  
**Then** 以下の動作が実行される：
- メモ入力ウィンドウの表示
- 自動フォーカス
- 既存作業の中断最小化
- ESCキーでの閉じる機能

**Technical Details:**
```typescript
// ホットキー登録
useEffect(() => {
  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.ctrlKey && event.shiftKey && event.key === 'M') {
      event.preventDefault();
      openQuickMemo();
    }
  };
  
  document.addEventListener('keydown', handleKeyDown);
  return () => document.removeEventListener('keydown', handleKeyDown);
}, []);
```

#### AC 3.1.2: 軽量入力インターフェース
**Given** クイックメモウィンドウが開いている  
**When** ユーザーがメモを入力する  
**Then** 以下の機能が提供される：
- シンプルなテキストエリア
- 基本的なMarkdown記法サポート
- 自動保存（3秒間隔）
- 文字数カウント表示

**Markdown Support:**
- `**太字**`
- `*斜体*`
- `# 見出し`
- `- リスト`
- `[リンク](URL)`
- コードブロック（```）

#### AC 3.1.3: 自動保存
**Given** ユーザーがメモを入力している  
**When** 入力が停止して3秒経過する  
**Then** 以下の保存処理が実行される：
- 自動でIndexedDBに保存
- 保存状態のインジケーター表示
- 保存失敗時のエラー表示
- オフライン時の保存キュー

**Technical Details:**
```typescript
// 自動保存の実装
const useAutoSave = (content: string, delay: number = 3000) => {
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved');
  
  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        setSaveStatus('saving');
        await saveNote(content);
        setSaveStatus('saved');
      } catch (error) {
        setSaveStatus('error');
      }
    }, delay);
    
    return () => clearTimeout(timer);
  }, [content, delay]);
  
  return saveStatus;
};
```

### Story 3.2: メモの整理

#### AC 3.2.1: タグ追加機能
**Given** ユーザーがメモを編集している  
**When** タグを追加する  
**Then** 以下の機能が提供される：
- #記法でのタグ入力
- 既存タグの自動補完
- タグの色分け表示
- タグ使用統計の記録

**Technical Details:**
```typescript
// タグ解析の実装
const parseTagsFromContent = (content: string): string[] => {
  const tagRegex = /#([a-zA-Z0-9\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]+)/g;
  const matches = content.match(tagRegex);
  return matches ? matches.map(tag => tag.slice(1)) : [];
};

// タグ統計の更新
const updateTagStatistics = async (tags: string[]) => {
  for (const tag of tags) {
    const existing = await db.tagStats.where('name').equals(tag).first();
    if (existing) {
      await db.tagStats.update(existing.id, { count: existing.count + 1 });
    } else {
      await db.tagStats.add({ name: tag, count: 1, createdAt: new Date() });
    }
  }
};
```

#### AC 3.2.2: タグフィルタリング
**Given** ユーザーがメモ一覧を確認している  
**When** 特定のタグを選択する  
**Then** 以下のフィルタリングが実行される：
- 選択タグを含むメモの表示
- 複数タグでのAND/OR検索
- タグの使用頻度による並び替え
- フィルタのクリア機能

#### AC 3.2.3: タグクラウド
**Given** ユーザーがメモ整理画面を開いている  
**When** タグクラウドを確認する  
**Then** 以下の情報が表示される：
- タグの使用頻度に応じたサイズ
- 最近使用したタグのハイライト
- クリックでのフィルタリング
- タグの編集・削除機能

### Story 3.3: 全文検索

#### AC 3.3.1: 検索機能
**Given** ユーザーが検索画面を開いている  
**When** 検索クエリを入力する  
**Then** 以下の検索が実行される：
- 200ms以内での検索結果表示
- 部分一致検索
- ひらがな・カタカナ検索対応
- 検索結果のハイライト表示

**Technical Details:**
```typescript
// 全文検索の実装
const searchNotes = async (query: string): Promise<Note[]> => {
  const normalizedQuery = query.toLowerCase();
  
  return await db.notes
    .where('content')
    .startsWithIgnoreCase(normalizedQuery)
    .or('content')
    .anyOf(query.split(' '))
    .limit(50)
    .toArray();
};

// 検索結果のハイライト
const highlightSearchResults = (content: string, query: string): string => {
  const regex = new RegExp(`(${query})`, 'gi');
  return content.replace(regex, '<mark>$1</mark>');
};
```

#### AC 3.3.2: 検索履歴
**Given** ユーザーが検索を実行している  
**When** 検索履歴を確認する  
**Then** 以下の履歴機能が提供される：
- 最近の検索クエリ表示（最大10件）
- 検索頻度による並び替え
- 履歴からの再検索
- 履歴のクリア機能

#### AC 3.3.3: 検索候補
**Given** ユーザーが検索入力している  
**When** 文字を入力する  
**Then** 以下の候補が表示される：
- 過去の検索クエリ
- 関連するタグ
- メモのタイトル候補
- 自動補完機能

---

## Non-Functional Requirements

### Performance Requirements

#### AC P.1: 初期読み込み時間
**Given** ユーザーがアプリにアクセスする  
**When** アプリが読み込まれる  
**Then** 以下の性能要件を満たす：
- First Contentful Paint < 1.5秒
- Largest Contentful Paint < 2.5秒
- Time to Interactive < 3.0秒

**Measurement:**
```typescript
// パフォーマンス計測
const measurePerformance = () => {
  const perfEntries = performance.getEntriesByType('navigation');
  const navigation = perfEntries[0] as PerformanceNavigationTiming;
  
  return {
    domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
    loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
    fcp: performance.getEntriesByName('first-contentful-paint')[0]?.startTime,
    lcp: performance.getEntriesByName('largest-contentful-paint')[0]?.startTime
  };
};
```

#### AC P.2: データベース操作
**Given** ユーザーがデータベース操作を実行する  
**When** CRUD操作が実行される  
**Then** 以下の性能要件を満たす：
- 基本的なCRUD操作 < 100ms
- 検索操作 < 200ms
- 大量データ処理 < 500ms

### Security Requirements

#### AC S.1: データ暗号化
**Given** 機密情報が保存される  
**When** データがIndexedDBに保存される  
**Then** 以下の暗号化が実行される：
- 個人情報の暗号化
- 暗号化キーの安全な管理
- 暗号化アルゴリズムの最新化

**Technical Details:**
```typescript
// データ暗号化の実装
import CryptoJS from 'crypto-js';

const encryptData = (data: string, key: string): string => {
  return CryptoJS.AES.encrypt(data, key).toString();
};

const decryptData = (encryptedData: string, key: string): string => {
  const bytes = CryptoJS.AES.decrypt(encryptedData, key);
  return bytes.toString(CryptoJS.enc.Utf8);
};
```

#### AC S.2: XSS防御
**Given** ユーザーがコンテンツを入力する  
**When** コンテンツが表示される  
**Then** 以下のXSS防御が実行される：
- HTML エスケープ
- サニタイゼーション
- CSP ヘッダーの設定

### Accessibility Requirements

#### AC A.1: キーボードナビゲーション
**Given** ユーザーがキーボードのみでアプリを操作する  
**When** Tab キーで要素を移動する  
**Then** 以下の操作が可能：
- 全ての機能へのアクセス
- 適切なフォーカス表示
- 論理的なTab順序
- ショートカットキー対応

#### AC A.2: スクリーンリーダー対応
**Given** ユーザーがスクリーンリーダーを使用する  
**When** アプリを操作する  
**Then** 以下の対応が提供される：
- 適切なaria-labelの設定
- 見出し構造の明確化
- 状態変化の通知
- 代替テキストの提供

---

**最終更新**: 2025-07-14  
**Version**: 1.0.0