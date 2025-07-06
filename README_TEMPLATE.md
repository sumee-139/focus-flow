# Claude Code 軽量プロジェクトテンプレート v1.0.0

個人開発者向けに最適化された、効率的なプロジェクト開発テンプレートです。

## 🎯 特徴

- **軽量設計**: コンテキスト使用量を最小化
- **階層化Memory Bank**: 必要な情報のみ読み込み
- **段階的拡張**: 小規模→大規模プロジェクトに対応
- **日次運用**: 3分で状況更新完了
- **汎用性**: 言語・技術スタックに依存しない設計
- **開発規約統合**: Anthropicベストプラクティスを統合
- **品質管理**: エラー対応ガイド・品質ゲート内蔵
- **プロジェクト記憶**: PROJECT_MEMORY.mdによる「なぜ」の永続化
- **自動化ワークフロー**: Hooks機能による品質チェック自動化
- **進化記録**: プロジェクトの成長過程を自動追跡

## 📁 テンプレート構成

### 必須ファイル
```
CLAUDE.md                    # プロジェクト設定
PROJECT_MEMORY.md            # プロジェクトの記憶（新規）
.clauderules                 # プロジェクト知見
.gitignore                   # キャッシュファイル除外設定
.claude/settings.json        # キャッシュ環境設定
.claude/hooks.yaml           # Hooks設定（新規）
docs/requirements.md         # 要求仕様書
docs/adr/template.md         # ADRテンプレート
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
│   ├── history.md          # 履歴・決定事項
│   └── debt.md             # 技術負債トラッキング
├── debug/                  # デバッグ情報
│   └── latest.md           # 最新のデバッグセッション（100行以内）
├── evolution/              # 進化記録（新規）
│   ├── changes.log         # 変更履歴
│   ├── features.log        # 機能追加履歴
│   └── commits.log         # コミット履歴
├── agents/                 # エージェント定義（新規）
├── archive/                # 定期整理
└── commands/               # カスタムコマンド
    ├── plan.md             # 計画立案
    ├── act.md              # 実装実行
    ├── daily.md            # 日次更新
    ├── focus.md            # フォーカスモード
    ├── debug-start.md      # デバッグ特化モード
    ├── feature-plan.md     # 新機能設計モード
    ├── review-check.md     # コードレビューモード
    └── health.md           # プロジェクト健康診断（新規）
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
↓
集中作業: /project:focus  # タスク切り替え・集中時
↓
夕方: /project:daily    # 日次更新（3分）
```

#### タグ検索（必要時）
```
タグ検索: #urgent #bug #feature #completed  # 関連情報の高速検索
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
| `/project:act` | 計画に基づく実装実行 | 実装時間 |
| `/project:focus` | 現在タスクに集中 | 即座 |
| `/project:daily` | 日次振り返り | 3分 |

### 専門化モード
| コマンド | 用途 | 参照ファイル |
|---------|------|-------------|
| `/debug:start` | デバッグ特化モード | current.md + tech.md + debug/latest.md |
| `/feature:plan` | 新機能設計モード | overview.md + next.md + 要件定義 |
| `/review:check` | コードレビューモード | history.md + チェックリスト |

### タグ検索
- タグ形式: `#tag_name` でMemory Bank内検索
- 主要タグ: #urgent #bug #feature #completed

## 📋 内蔵機能

### 開発規約（Core Development Rules）
- パッケージ管理統一方針
- コード品質基準・テスト要件
- Git/PR規約（コミット形式・トレーラー・レビュー規約）

### 実行コマンド一覧
- 言語非依存の開発フロー（`[tool]`記法）
- セットアップ・テスト・品質チェック・ビルドの統一コマンド
- 主要言語（Node.js/Python/Rust/Go）対応

### エラー対応ガイド
- 問題解決の標準順序（フォーマット→型→リント→テスト）
- 分野別よくある問題と解決策
- 開発・エラー対応・情報収集時のベストプラクティス

### 品質ゲート
- 段階別チェックリスト（コミット前・PR前・デプロイ前）
- 自動化レベル分類（完全自動化・半自動化・手動確認）
- 継続的品質管理の運用指針

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
- **大幅削減**: 階層化Memory Bankによる効率化
- **一定量維持**: プロジェクト規模に関係なく軽量

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
| 随時 | `#タグ検索` | 関連情報検索時 |

## 🎉 始めよう

1. テンプレートをコピー
2. CLAUDE.mdをカスタマイズ
3. `/project:plan`で最初の計画を立案
4. 上記の運用例を参考に効率的な開発を開始！

このテンプレートで、Claude Codeを使った効率的な個人開発を実現しましょう！

## 📚 強化内容・ソース情報

### v1.1.0 強化機能
- **プロンプトキャッシュ最適化**: 90%コスト削減・85%レイテンシ短縮
- **段階的TDD学習パス**: 未経験者向け学習システム
- **ADRシステム**: 技術決定の記録・管理機能
- **技術負債トラッキング**: 体系的な負債管理システム

### ソース・参考文献

#### Claude Code 最適化技法
- **Anthropic 公式**: [Prompt caching - Anthropic API](https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching)
- **Anthropic 公式**: [Claude Code Best Practices](https://www.anthropic.com/engineering/claude-code-best-practices)
- **AWS 公式**: [Supercharge your development with Claude Code and Amazon Bedrock prompt caching](https://aws.amazon.com/blogs/machine-learning/supercharge-your-development-with-claude-code-and-amazon-bedrock-prompt-caching/)
- **Medium**: [Unlocking Efficiency: A Practical Guide to Claude Prompt Caching](https://medium.com/@mcraddock/unlocking-efficiency-a-practical-guide-to-claude-prompt-caching-3185805c0eef)

#### TDD & テスト駆動開発
- **Anthropic 公式**: [Claude Code: Best practices for agentic coding](https://www.anthropic.com/engineering/claude-code-best-practices)
- **Reddit**: [Claude Dev can now automatically fix linter, compiler, and build errors](https://www.reddit.com/r/ClaudeAI/comments/1fgzo87/claude_dev_can_now_automatically_fix_linter/)
- **Reddit**: [Generating unit tests with Claude](https://www.reddit.com/r/ClaudeAI/comments/1i17nwn/generating_unit_tests_with_claude/)

#### ADR (Architecture Decision Record)
- **GitHub**: [Architecture decision record (ADR) examples](https://github.com/joelparkerhenderson/architecture-decision-record)
- **MakerX Blog**: [Architecture Decision Records: How we make better technical choices](https://blog.makerx.com.au/architecture-decision-records-how-we-make-better-technical-choices-at-makerx/)
- **Medium**: [Why Every Software Team Should Embrace Architecture Decision Records](https://levelup.gitconnected.com/why-every-software-team-should-embrace-architecture-decision-records-18cd201cc179)

#### Memory Bank & コンテキスト管理
- **Anthropic 公式**: [Manage Claude's memory](https://docs.anthropic.com/en/docs/claude-code/memory)
- **Cloud Artisan**: [Claude Code Tips & Tricks: Maximising Memory](https://cloudartisan.com/posts/2025-04-16-claude-code-tips-memory/)
- **DEV Community**: [Introducing Claude Crew: Enhancing Claude Desktop's Coding Agent Capabilities](https://dev.to/kimuson/introducing-claude-crew-enhancing-claude-desktops-coding-agent-capabilities-36ah)

#### キャッシュ技術詳細
- **Anthropic 公式**: [Long context prompting tips](https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/long-context-tips)
- **LinkedIn**: [How to Use Anthropic Claude Prompt Caching (and RAG)](https://www.linkedin.com/posts/anantharamuavinash_how-to-use-claude-prompt-caching-and-ditch-activity-7230786805590061056-xupU)
- **Reddit**: [Claude Caching Is Fantastic For Iterating Over Code!](https://www.reddit.com/r/ClaudeAI/comments/1ewms42/claude_caching_is_fantastic_for_iterating_over/)

### 実装機能詳細

#### 1. CLAUDE_CACHE設定
```json
// .claude/settings.json
{
  "env": {
    "CLAUDE_CACHE": "./.ccache"
  }
}
```

#### 2. cache_control最適化
以下のファイルにcache_controlが適用済み:
- `.claude/core/overview.md` - プロジェクト概要
- `.claude/core/templates.md` - クイックテンプレート
- `.claude/context/tech.md` - 技術スタック
- `.claude/context/debt.md` - 技術負債トラッキング
- `docs/requirements.md` - 要求仕様

#### 3. TDD段階的学習パス
- **Phase 1 (Week 1-2)**: TDD体験なしでClaude Code習得
- **Phase 2 (Week 3-4)**: 小さな機能でTDD体験
- **Phase 3 (Month 2-3)**: 本格的なTDD適用

#### 4. ADRシステム
- **テンプレート**: `docs/adr/template.md`
- **決定記録**: 技術選択、アーキテクチャ、セキュリティ方針等
- **連携**: GitHub Issue、負債ログ、履歴管理

#### 5. 技術負債トラッキング
- **優先度管理**: 高🔥/中⚠️/低📝
- **コスト試算**: 時間単位で推定・実績記録
- **キャッシュ影響分析**: 削除コスト・最適化効果測定

### 性能効果
- **コスト削減**: プロンプトキャッシュによる90%削減
- **レイテンシ短縮**: APIレスポンスの85%短縮
- **TDD学習**: 未経験者でも2-3ヶ月で習得可能
- **知識管理**: ADR・負債ログによる体系的管理

### 注意事項
- `.ccache/`フォルダは`.gitignore`に追加済み
- cache_controlは長期安定情報のみに適用
- TDDは段階的導入で学習曲線を緩やかに
- ADRは重要な技術決定のみ記録し過度な文書化を回避

### v1.2.0 新機能（PROJECT MEMORY & 自動化）

#### PROJECT_MEMORY.md
- **設計の「なぜ」を記録**: 重要な決定とその理由を永続化
- **失敗と成功の学習**: 同じ失敗を繰り返さないための記憶
- **実装と設計の整合性**: 自動的に追跡・記録

#### Hooks自動化システム  
- **品質チェック自動化**: コード変更時に自動でリント・型チェック
- **テスト成功記録**: 成功したテストを自動的にPROJECT_MEMORYに記録
- **進化の自動追跡**: 新機能追加・コミットを自動ログ化

#### プロジェクト健康診断
- **メトリクス収集**: コードサイズ、技術負債、依存関係の健全性
- **総合スコア算出**: A-Fでプロジェクトの健康状態を評価
- **改善提案**: 具体的なアクションプランを自動生成