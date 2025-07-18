---
cache_control: {"type": "ephemeral"}
---
# Project Overview
tags: #overview #project #summary

## 3-Line Summary
- **Purpose**: デジタルノイズに埋もれた現代人の集中力を回復し、知的生産性を向上させる #purpose #problem
- **Target**: 集中できない自分に悩む知識労働者・学習者（特に30-40代のビジネスパーソン） #target #users
- **Success Criteria**: ユーザーがフロー状態を日常的に体験し、「自分はできる」という自信を獲得 #success #metrics

## Project Basic Information
- **Start Date**: 2024年後半
- **Deadline**: 2025年中にMVP完成予定
- **Current Progress**: 20% (基本設計・プロトタイプ完成)

## Core Features (Priority Order)
1. **フォーカスモード（集中バリア）**: OSレベル通知遮断によるデジタルノイズ完全遮断 #feature #core #p1
2. **クイックメモシステム**: 思考中断なしのアイデア瞬時記録（音声入力対応） #feature #core #p2
3. **成長の木（ゲーミフィケーション）**: 集中時間の可視化と習慣化サポート #feature #core #p3
4. **プロジェクトテンプレート**: Markdownベースの知的生産ワークフロー #feature #core #p4

## Technology Stack
- **Language**: TypeScript, JavaScript #tech #language
- **Framework**: React (Capacitor版), Electron (デスクトップ版) #tech #framework
- **DB**: ローカルストレージ中心、将来的にはSQLite #tech #database
- **Others**: Chakra UI, Vite, Capacitor, Framer Motion #tech #tools

## Constraints & Assumptions
- 個人の集中に特化（チーム機能は既存ツールとの連携で実現）
- プライバシー重視（データはローカル保存中心）
- 段階的機能解放でユーザーを圧倒しない設計

## Success Criteria & Progress
- [ ] フォーカスモードでデジタルノイズ遮断機能 - [設計完了、実装中]
- [ ] クイックメモの瞬時記録機能 - [基本機能実装完了]
- [ ] 成長の木による習慣化サポート - [コンセプト設計完了]

## Problem Definition
現代の知識労働者は情報過多とデジタルノイズに囲まれ、深い集中が困難になっている。従来のタスク管理ツールは機能が多すぎて逆にストレスとなり、「完璧を求める」プレッシャーが挫折を招いている。

## User Value
「デジタルノイズから解放された静かな集中環境で、自分の可能性を最大限に発揮できる」

Detailed technical information → @.claude/context/tech.md
Detailed specifications → @docs/requirements.md