---
cache_control: {"type": "ephemeral"}
---
# Focus-Flow Requirements Specification

## 1. Project Overview

### 1.1 Purpose
デジタルノイズに埋もれた現代人の集中力を回復し、知的生産性を向上させるマルチプラットフォームアプリケーションの開発。「あなたの可能性を解き放つ、知的生産性の伴走者」として、静かな集中環境を提供し、段階的な機能解放とゲーミフィケーションにより無理なく習慣化をサポートする。

### 1.2 Scope
- Users: 集中できない自分に悩む知識労働者・学習者（特に30-40代のビジネスパーソン）
- Environment: Windows/macOS/Linux デスクトップ、iOS/Android モバイル
- Constraints: 個人の集中に特化、プライバシー重視、段階的機能解放でユーザーを圧倒しない設計

### 1.3 Technology Stack
- **Frontend**: React (Capacitor版), Vanilla JS + HTML/CSS (Electron版)
- **Backend**: ローカルストレージ中心、将来的にはオプションでクラウド同期
- **Database**: LocalStorage, IndexedDB, 将来的にはSQLite
- **Others**: Chakra UI, Vite, Capacitor, Electron, Framer Motion, TypeScript

## 2. Functional Requirements

### 2.1 フォーカスモード（集中バリア）
#### 2.1.1 OSレベル通知遮断機能
- OS標準APIを活用した通知の完全遮断
- 集中開始の心理的ハードルを下げるシンプルな開始導線
- 中断理由の簡易記録による集中パターンの可視化

#### 2.1.2 集中時間のトラッキング
- 集中セッションの自動記録
- 見積もり時間との比較分析
- 過去データに基づく時間見積もりヒント

### 2.2 クイックメモシステム
#### 2.2.1 瞬時記録機能
- グローバルショートカット、モバイルウィジェットからの即座入力
- 音声入力対応による最速での情報記録
- ファイル添付・画像インライン表示・プレビュー機能

#### 2.2.2 統合メモ管理
- 全メモの集約と自由編集（Markdown記法サポート）
- 簡易全文検索による高速情報検索
- クイックメモのタスク化導線

## 3. Non-Functional Requirements

### 3.1 Performance Requirements
- [Response time requirements]
- [Concurrent connections]
- [Data processing volume]

### 3.2 Usability Requirements
- [UI/UX requirements]
- [Accessibility requirements]
- [Multi-language support]

### 3.3 Security Requirements

#### 3.3.1 Command Execution Security
- **Dangerous Command Blocking**: Automatic detection and blocking of system-destructive commands
- **Allow List Management**: Pre-approval of safe commands necessary for development
- **Real-time Monitoring**: Command execution monitoring using Claude Code hooks
- **Security Logging**: Recording and auditing of executed commands

#### 3.3.2 Blocked Commands
- System destruction: `rm -rf /`, `chmod 777 /`, `mv /usr`, etc.
- External code execution: `curl | sh`, `wget | bash`, etc.
- Configuration changes: `git config --global`, `npm config set`, etc.
- Privilege escalation: `sudo`, `su`, `sudo -i`, etc.
- Data erasure: `shred`, `dd if=/dev/zero`, etc.

#### 3.3.3 Allowed Commands
- File operations: `ls`, `cat`, `mkdir`, `touch`, `cp`, `mv`, etc.
- Git operations: `git status`, `git add`, `git commit`, `git push`, etc.
- Development tools: `npm run`, `python`, `pip install`, etc.
- Modern CLI: `eza`, `batcat`, `rg`, `fd`, `dust`, etc.

#### 3.3.4 Security Testing
- Automated test suite: `.claude/scripts/test-security.sh`
- Test coverage: Comprehensive testing of safe commands, dangerous commands, and allow lists
- Test frequency: Required when settings change and at project start

#### 3.3.5 Access Control
- File access: Limited to project directory and below
- Log access: Read-only access to `~/.claude/security.log`
- Configuration changes: Administrator privileges required

#### 3.3.6 Incident Response
- Block events: Immediate user notification and log recording
- Emergency stop: Temporary disabling of security settings procedures
- Recovery procedures: Settings recovery from backup procedures

#### 3.3.7 Security Documentation
- Configuration manual: `.claude/security-README.md`
- Content: Configuration methods, emergency response, troubleshooting
- Update frequency: Required when security settings change

#### 3.3.8 General Security Requirements
- [Authentication and authorization]
- [Data encryption]
- [Audit logs]

### 3.4 Development and Operation Requirements
- Version control: [VCS to use]
- Development environment: [Development environment description]
- Testing: [Testing policy]
- Deployment: [Deployment method]

## 4. Database Design

### 4.1 Table Structure

#### [Table Name 1]
```sql
CREATE TABLE [table_name] (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    -- Column definitions
);
```

#### [Table Name 2]
```sql
CREATE TABLE [table_name] (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    -- Column definitions
);
```

## 5. API Design

### 5.1 Endpoint List

#### [Resource Name] Related
- `GET /api/[resource]` - Get list
- `GET /api/[resource]/:id` - Get details
- `POST /api/[resource]` - Create new
- `PUT /api/[resource]/:id` - Update
- `DELETE /api/[resource]/:id` - Delete

### 5.2 Request/Response Specifications
[Describe detailed API specifications]

## 6. Directory Structure

```
focus-flow/
├── .claude/                   # Memory Bank system
├── docs/                      # Documentation
│   ├── adr/                  # Architecture Decision Records
│   ├── design/               # UI/UX design specifications
│   ├── development/          # Development guides
│   └── planning/             # User stories & acceptance criteria
├── focus-flow-capacitor/     # Multi-platform version (React + Capacitor)
│   ├── src/
│   │   ├── components/       # React components
│   │   └── types/           # TypeScript type definitions
│   ├── android/             # Android platform files
│   └── ios/                 # iOS platform files (future)
├── focus-flow-app/          # Desktop version (Electron)
│   └── src/                 # Electron main and renderer processes
├── ideas/                   # Concept documents and persona definitions
├── mockup/                  # UI mockups and prototypes
├── CLAUDE.md                # Project configuration
├── .clauderules             # Project insights
└── README.md                # Project description
```

## 7. Development Schedule

### Phase 1: MVP Core Features (2025 Q1-Q2)
- フォーカスモード（集中バリア）基本機能
- クイックメモシステム
- 基本的な集中時間トラッキング

### Phase 2: Advanced Features (2025 Q3-Q4)
- 成長の木（ゲーミフィケーション）機能
- ディスカバーモード（関連性可視化）
- プロジェクトテンプレートワークフロー

### Phase 3: Platform Optimization (2026 Q1)
- モバイルウィジェット強化
- デスクトップ版のパフォーマンス最適化
- クラウド同期機能（オプション）

## 8. Success Criteria

- [ ] フォーカスモードでデジタルノイズが95%以上遮断される
- [ ] クイックメモの記録時間が3秒以内
- [ ] ユーザーの集中時間が導入前比較で平均30%向上

## 9. Risks and Countermeasures

| Risk | Impact | Probability | Countermeasure |
|------|--------|-------------|----------------|
| [Risk 1] | High/Medium/Low | High/Medium/Low | [Countermeasure] |
| [Risk 2] | High/Medium/Low | High/Medium/Low | [Countermeasure] |

## 10. Notes

[Describe other important matters]
---

## 📋 次のステップ: 設計フェーズ

### これで要件定義は完了です！設計フェーズに進みましょう。

1. **設計生成テンプレートを使用する**
   - 場所: `.claude/shared/templates/design/`
   - 目的: この要件定義を技術設計に変換します

2. **設計フェーズで実施すること**
   - アーキテクチャの決定
   - コンポーネント設計
   - インターフェース定義
   - データモデル
   - 技術仕様

3. **Plannerエージェントへの引き継ぎ**
   ```
   /agent:planner
   「要件定義が完了しました。上記の要件を基に設計フェーズを進めてください。」
   ```

### 設計フェーズチェックリスト
- [ ] すべての機能要件が反映されている
- [ ] 非機能要件が明確になっている
- [ ] 成功基準が測定可能である
- [ ] ステークホルダーがレビューし、承認した

---
*優れた要件は優れた設計につながり、優れた設計は優れた実装につながります。*
