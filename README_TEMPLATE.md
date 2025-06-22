# Claude Code 軽量プロジェクトテンプレート

個人開発者向けに最適化された、効率的なプロジェクト開発テンプレートです。

## 🎯 特徴

- **軽量設計**: コンテキスト使用量を最小化
- **階層化Memory Bank**: 必要な情報のみ読み込み
- **段階的拡張**: 小規模→大規模プロジェクトに対応
- **日次運用**: 3分で状況更新完了

## 📁 テンプレート構成

### 必須ファイル
```
CLAUDE.md                    # プロジェクト設定
.clauderules                 # プロジェクト知見
docs/requirements.md         # 要求仕様書
```

### Memory Bank（階層化）
```
.claude/
├── core/                    # 常時参照（軽量）
│   ├── current.md          # 現在の状況（50行以内）
│   ├── next.md             # 次のアクション（30行以内）
│   ├── overview.md         # プロジェクト概要
│   └── templates.md        # クイックテンプレート＆パターン集
├── context/                # 必要時参照
│   ├── tech.md             # 技術詳細
│   └── history.md          # 履歴・決定事項
├── debug/                  # デバッグ情報
│   └── latest.md           # 最新のデバッグセッション（100行以内）
├── archive/                # 定期整理
└── commands/               # カスタムコマンド
    ├── plan.md             # 計画立案
    ├── act.md              # 実装実行
    ├── daily.md            # 日次更新
    ├── focus.md            # フォーカスモード
    ├── update-memory.md    # Memory Bank更新
    ├── compress.md         # 圧縮・アーカイブ
    ├── monthly.md          # 月次メンテナンス
    ├── debug-start.md      # デバッグ特化モード
    ├── feature-plan.md     # 新機能設計モード
    ├── review-check.md     # コードレビューモード
    └── deploy-prep.md      # デプロイ準備モード
```

## 🚀 使い方

### 1. プロジェクト開始
```bash
# テンプレートをコピー
cp -r claude_file_template/ your-project/
cd your-project/

# プロジェクト情報をカスタマイズ
# - CLAUDE.md の [プロジェクト名] を置換
# - docs/requirements.md を記入
# - .claude/core/ 内のファイルを更新
```

### 2. 日常の開発フロー

#### 基本サイクル（毎日）
```
朝: /project:plan     # 今日の作業計画（5分）
↓
実装作業: /project:act    # 計画に基づく実装実行
（状況に応じて）
↓ /debug:start      # バグ対応時
↓ /feature:plan     # 新機能設計時
↓ /review:check     # コードレビュー時
↓ /deploy:prep      # デプロイ準備時
↓
集中作業: /project:focus  # タスク切り替え・集中時
↓
夕方: /project:daily    # 日次更新（3分）
```

#### 追加コマンド（必要時）
```
/project:update-memory  # 重要な変更・学びがあった時
/project:compress      # 週1回（Memory Bank整理）
/project:monthly       # 月1回（月次アーカイブ）
タグ検索: #urgent #bug  # 関連情報の高速検索
```

### 3. 定期メンテナンス
```
週次: /project:compress  # Memory Bank圧縮
月次: /project:monthly   # 自動アーカイブ＆メンテナンス
```

## 💡 効率化のポイント

### コンテキスト最小化
- **通常時**: `@.claude/core/*` のみ参照
- **詳細必要時**: `@.claude/context/*` を明示指定
- **過去参照**: `@.claude/archive/*` で履歴確認

### Memory Bank運用
- **core/**: 50行以内を維持
- **context/**: 必要時のみ更新
- **archive/**: 月1回整理

### 時間管理
- 計画立案: 5分以内
- 日次更新: 3分以内
- Memory Bank更新: 必要時のみ

## 🛠 カスタムコマンド

### 基本コマンド
| コマンド | 用途 | 所要時間 |
|---------|------|----------|
| `/project:plan` | 作業計画立案 | 5分 |
| `/project:act` | 計画に基づいて実装実行 | 実装時間 |
| `/project:focus` | 集中モード（現在タスクのみ） | 即座 |
| `/project:daily` | 日次更新 | 3分 |
| `/project:update-memory` | Memory Bank差分更新 | 必要時 |
| `/project:compress` | Memory Bank圧縮・アーカイブ | 週1回 |
| `/project:monthly` | 月次アーカイブ＆メンテナンス | 月1回 |

### Quick Modes（専門化モード）
| コマンド | 用途 | 参照ファイル |
|---------|------|-------------|
| `/debug:start` | デバッグ特化モード | current.md + tech.md + debug/latest.md |
| `/feature:plan` | 新機能設計モード | overview.md + next.md + 要件定義 |
| `/review:check` | コードレビューモード | history.md + チェックリスト |
| `/deploy:prep` | デプロイ準備モード | tech.md + リリース確認 |

### タグ検索
- タグ形式: `#tag_name` でMemory Bank内検索
- 主要タグ: #urgent #bug #feature #tech #completed #blocked

## 🎯 適用プロジェクト

### 最適
- 個人開発プロジェクト
- 1-3ヶ月の中期プロジェクト
- Web開発・アプリ開発
- プロトタイプ開発

### 要調整
- 大規模チーム開発
- 1年以上の長期プロジェクト
- 高度な規制要件があるプロジェクト

## 📈 期待効果

### トークン使用量
- **60%削減**: 従来のMemory Bankと比較
- **一定量維持**: プロジェクト規模に関係なく

### 開発効率
- **高速計画**: 段階的情報読み込み
- **集中作業**: フォーカスモードで中断なし
- **継続運用**: 軽量更新で習慣化

### 拡張性
- **段階的成長**: 小→大規模に自然拡張
- **知見蓄積**: `.clauderules`で学習継続
- **再利用**: テンプレート・パターンの活用

## ⚠️ 注意事項

- Memory Bankファイルは簡潔に保つ（各50行以内推奨）
- 定期的なアーカイブでパフォーマンス維持
- プロジェクト固有の内容に確実に置換する
- 重要な決定事項は必ず記録する

## 📋 実際の運用例

### 🚀 初日のフロー

#### 人間主導開発の場合
```
09:00 テンプレートコピー & カスタマイズ
09:15 /project:plan - 最初の作業計画立案
09:30 開発作業開始
12:00 進捗確認
17:00 /project:daily - 初日の振り返り
```

#### AI主導開発の場合
```
09:00 テンプレートコピー & カスタマイズ（人間）
09:15 /project:plan - 最初の作業計画立案（人間→AI）
09:30 AI開発作業開始（AI実装、人間はチェック・提案）
12:00 進捗チェック & 方向性調整（人間）
16:00 成果物レビュー & フィードバック（人間）
17:00 /project:daily - 初日の振り返り（人間→AI）
```

### 📅 日常運用（2日目以降）

#### 人間主導開発
```
09:00 /project:plan     # 今日のタスク整理
09:30 開発作業開始      # 状況に応じて Quick Modes使用
      /debug:start      # バグ対応時
      /feature:plan     # 新機能設計時
      /review:check     # コードレビュー時
12:00 /project:focus    # 午後のタスクに集中
17:00 /project:daily    # 今日の振り返り
```

#### AI主導開発（推奨タイムライン）
```
09:00-09:30  人間: /project:plan で今日の作業指示
09:30-11:30  AI: /project:act で集中実装（人間は並行作業可）
             （状況に応じて /debug:start, /feature:plan 等使用）
11:30-12:00  人間: 中間レビュー・フィードバック
13:00-15:00  AI: 実装継続（人間は設計・企画）
             /review:check でコード品質確認
15:00-15:30  人間: 軌道修正・追加指示
15:30-16:30  AI: 最終実装・調整
             /deploy:prep でリリース準備（必要時）
16:30-17:00  人間: 最終レビュー・明日準備
17:00-17:15  人間: /project:daily で振り返り
```

### 👥 人間とAIの役割分担

#### 人間の担当
- **戦略的判断**: `/project:plan`での計画立案
- **品質管理**: 定期的なレビューとフィードバック
- **方向性制御**: 実装の軌道修正
- **要件調整**: 新しい要求の追加・変更
- **振り返り**: `/project:daily`での進捗管理

#### AIの担当
- **実装作業**: コード作成・修正・テスト
- **技術調査**: ライブラリ選定・実装方法検討
- **ドキュメント**: 技術文書・コメント作成
- **問題解決**: バグ修正・パフォーマンス改善

### ⚡ AI作業中の人間の時間活用
```
AI実装中（30-90分）の並行作業:
- 次のフェーズの企画
- UI/UXデザインの検討
- 外部API・サービスの調査
- ドキュメント整備
- 他プロジェクトの作業
```

### 📊 コマンド使用頻度

| 頻度 | コマンド | タイミング |
|------|---------|------------|
| 毎日 | `/project:plan` | 朝の作業開始時 |
| 毎日 | `/project:daily` | 夕方の振り返り時 |
| 作業時 | `/project:act` | 実装作業実行時 |
| 必要時 | `/project:focus` | 集中実装時 |
| 状況別 | `/debug:start` | バグ対応時 |
| 状況別 | `/feature:plan` | 新機能設計時 |
| 状況別 | `/review:check` | コードレビュー時 |
| 状況別 | `/deploy:prep` | デプロイ準備時 |
| 随時 | `#タグ検索` | 関連情報検索時 |
| 重要変更時 | `/project:update-memory` | 技術決定・学び時 |
| 週1回 | `/project:compress` | Memory Bank整理 |
| 月1回 | `/project:monthly` | 月次メンテナンス |

## 🎉 始めよう

1. テンプレートをコピー
2. CLAUDE.mdをカスタマイズ
3. `/project:plan`で最初の計画を立案
4. 上記の運用例を参考に効率的な開発を開始！

このテンプレートで、Claude Codeを使った効率的な個人開発を実現しましょう！