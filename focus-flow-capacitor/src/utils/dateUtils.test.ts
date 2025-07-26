// dateUtils.test.ts - T006 UTC/JST時差問題修正のためのテスト
// JST基準の日付処理を確実に実装するためのテストファースト開発

import { describe, test, expect, vi } from 'vitest'
import { 
  getJSTTodayString, 
  getJSTDateString, 
  createJSTDate,
  isJSTToday 
} from './dateUtils'

describe('JST Date Utilities - T006 UTC/JST時差問題修正', () => {
  // 🔴 Red Phase: JST基準の今日日付取得
  test('should get today date in JST format (YYYY-MM-DD)', () => {
    // 2025-07-25 15:00 JST (06:00 UTC) をシミュレート
    const jstDate = new Date('2025-07-25T06:00:00.000Z')
    vi.setSystemTime(jstDate)
    
    const result = getJSTTodayString()
    expect(result).toBe('2025-07-25')
  })

  // 🔴 Red Phase: JST境界での正確な日付処理
  test('should handle JST date boundary correctly at midnight', () => {
    // 2025-07-24 24:00 JST = 2025-07-25 00:00 JST = 2025-07-24 15:00 UTC
    const jstMidnight = new Date('2025-07-24T15:00:00.000Z')
    vi.setSystemTime(jstMidnight)
    
    const result = getJSTTodayString()
    expect(result).toBe('2025-07-25') // JSTでは翌日
  })

  // 🔴 Red Phase: JST早朝（0-9時）の処理
  test('should handle JST early morning hours (0-9 AM) correctly', () => {
    // 2025-07-25 08:00 JST = 2025-07-24 23:00 UTC
    const jstMorning = new Date('2025-07-24T23:00:00.000Z')
    vi.setSystemTime(jstMorning)
    
    const result = getJSTTodayString()
    expect(result).toBe('2025-07-25')
  })

  // 🔴 Red Phase: 任意の日付をJST基準で処理
  test('should convert any date to JST date string', () => {
    const inputDate = new Date('2025-07-25T06:00:00.000Z') // 15:00 JST
    const result = getJSTDateString(inputDate)
    expect(result).toBe('2025-07-25')
  })

  // 🔴 Red Phase: JST基準のDateオブジェクト作成
  test('should create JST-based Date object from date string', () => {
    const result = createJSTDate('2025-07-25')
    
    // JSTの0時を表すUTC時刻（前日15時）であることを確認
    expect(result.getUTCFullYear()).toBe(2025)
    expect(result.getUTCMonth()).toBe(6) // 0-indexed
    expect(result.getUTCDate()).toBe(24) // UTC日付は前日
    expect(result.getUTCHours()).toBe(15) // UTC時刻は15時（JST 0時）
  })

  // 🔴 Red Phase: JST基準の今日判定
  test('should determine if date is today in JST', () => {
    // 2025-07-25 10:00 JST をシミュレート
    const jstTime = new Date('2025-07-25T01:00:00.000Z') // JST 10:00
    vi.setSystemTime(jstTime)
    
    expect(isJSTToday('2025-07-25')).toBe(true)
    expect(isJSTToday('2025-07-24')).toBe(false)
    expect(isJSTToday('2025-07-26')).toBe(false)
  })

  // 🔴 Red Phase: 年末年始境界でのJST処理
  test('should handle New Year boundary in JST correctly', () => {
    // 2024-12-31 24:00 JST = 2025-01-01 00:00 JST = 2024-12-31 15:00 UTC
    const newYearJST = new Date('2024-12-31T15:00:00.000Z')
    vi.setSystemTime(newYearJST)
    
    const result = getJSTTodayString()
    expect(result).toBe('2025-01-01') // JSTでは新年
  })

  // 🔴 Red Phase: JST全体での一貫性確認
  test('should consistently use JST across all date operations', () => {
    const testDate = new Date('2025-07-25T08:00:00.000Z') // JST 17:00
    vi.setSystemTime(testDate)
    
    const todayString = getJSTTodayString()
    const dateString = getJSTDateString(testDate)
    const createdDate = createJSTDate(todayString)
    const isTodayCheck = isJSTToday(todayString)
    
    // すべてのJST操作が一貫していることを確認
    expect(todayString).toBe('2025-07-25')
    expect(dateString).toBe('2025-07-25')
    expect(isTodayCheck).toBe(true)
    
    // 作成されたDateオブジェクトも正しいJST基準であることを確認
    expect(getJSTDateString(createdDate)).toBe('2025-07-25')
  })
})