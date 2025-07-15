---
cache_control: {"type": "ephemeral"}
---
# Project Overview
tags: #overview #project #summary

## 3-Line Summary
- **Purpose**: 個人の集中と知的生産性を最大化するデジタル伴走者 #purpose #problem
- **Target**: 集中力向上を求める知的労働者・学習者 #target #users
- **Success Criteria**: フロー状態の日常化と段階的習慣化の実現 #success #metrics

## Project Basic Information
- **Start Date**: 2025-07-14
- **Deadline**: 2025-09-14（2ヶ月）
- **Current Progress**: 0%（計画段階）

## Core Features (Priority Order)
1. **フォーカスモード**: OSレベル通知制御による集中バリア #feature #core #p1
2. **クイックメモ**: 思考中断を防ぐ瞬時メモ機能 #feature #core #p2
3. **時間見積もり**: 現実的な時間管理と改善サイクル #feature #core #p3
4. **ディスカバーモード**: 知識の可視化と関連性発見 #feature #core #p4

## Technology Stack
- **Language**: TypeScript v5+ #tech #language
- **Frontend**: React v18+ + Chakra UI v2+ #tech #framework
- **Build Tool**: Vite v5+ #tech #build
- **PWA**: Workbox v7+ #tech #pwa
- **Database**: IndexedDB (Dexie.js) #tech #database
- **State Management**: React Context + useReducer #tech #state
- **Package Manager**: npm #tech #tools

## Constraints & Assumptions
- 個人利用に特化（チーム機能は外部連携で対応）
- 段階的機能解放による複雑性管理
- 既存ツールとの協調（競合回避）

## Success Criteria & Progress
- [ ] フェーズ1: 基本集中機能（フォーカスモード + タスク入力）- PWA基盤
- [ ] フェーズ2: 思考支援機能（クイックメモ + 検索）+ Flutter Widget
- [ ] フェーズ3: 時間管理機能（見積もり + レポート）
- [ ] フェーズ4-5: サーバーレス連携（Firebase + AWS Lambda）

## Problem Definition
デジタルノイズと情報過多による集中力低下、既存ツールの複雑性による導入障壁、完璧主義によるツール利用の挫折

## User Value
「自分は集中できる」という自信を育み、日常的なフロー状態を実現する優しいデジタル伴走者

**First Reference**: Design Philosophy → @docs/design-philosophy.md ⭐**必須**
Detailed technical information → @.claude/context/tech.md
Detailed specifications → @docs/requirements.md