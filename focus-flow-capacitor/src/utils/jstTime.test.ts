// jstTime.test.ts - JST基準日付処理テスト
// Phase 2.2d T006: モバイル日付設定バグ修正

import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { jstTime } from './jstTime';

describe('jstTime - JST基準日付処理', () => {
  let originalTimezone: string | undefined;

  beforeEach(() => {
    // タイムゾーンを保存
    originalTimezone = process.env.TZ;
  });

  afterEach(() => {
    // タイムゾーンを復元
    if (originalTimezone) {
      process.env.TZ = originalTimezone;
    } else {
      delete process.env.TZ;
    }
    vi.useRealTimers();
  });

  describe('getJSTDate', () => {
    test('should return JST date correctly', () => {
      // UTC 2025-07-25 15:00 (JST 2025-07-26 00:00)
      const mockUTCDate = new Date('2025-07-25T15:00:00.000Z');
      vi.useFakeTimers();
      vi.setSystemTime(mockUTCDate);

      const jstDate = jstTime.getJSTDate();
      
      // JST基準なので日付が1日進んでいるはず
      expect(jstDate.getDate()).toBe(26);
      expect(jstDate.getMonth()).toBe(6); // 0-indexed (7月)
      expect(jstDate.getFullYear()).toBe(2025);
    });

    test('should handle timezone edge cases', () => {
      // UTC 2025-07-24 16:00 (JST 2025-07-25 01:00)
      const mockUTCDate = new Date('2025-07-24T16:00:00.000Z');
      vi.useFakeTimers();
      vi.setSystemTime(mockUTCDate);

      const jstDate = jstTime.getJSTDate();
      
      // JST基準で翌日になっているはず
      expect(jstDate.getDate()).toBe(25);
      expect(jstDate.getMonth()).toBe(6); // 7月
      expect(jstDate.getFullYear()).toBe(2025);
    });

    test('should work correctly in JST midnight', () => {
      // UTC 2025-07-24 15:00 (JST 2025-07-25 00:00) - JST午前0時
      const mockUTCDate = new Date('2025-07-24T15:00:00.000Z');
      vi.useFakeTimers();
      vi.setSystemTime(mockUTCDate);

      const jstDate = jstTime.getJSTDate();
      
      expect(jstDate.getHours()).toBe(0); // JST午前0時
      expect(jstDate.getDate()).toBe(25);
    });

    test('should handle JST early morning hours (0-9 AM) correctly', () => {
      const testCases = [
        { utc: '2025-07-24T15:00:00.000Z', jst: { hour: 0, date: 25 } }, // JST 00:00
        { utc: '2025-07-24T16:30:00.000Z', jst: { hour: 1, date: 25 } }, // JST 01:30  
        { utc: '2025-07-24T18:00:00.000Z', jst: { hour: 3, date: 25 } }, // JST 03:00
        { utc: '2025-07-24T21:00:00.000Z', jst: { hour: 6, date: 25 } }, // JST 06:00
        { utc: '2025-07-24T23:59:00.000Z', jst: { hour: 8, date: 25 } }, // JST 08:59
        { utc: '2025-07-25T00:00:00.000Z', jst: { hour: 9, date: 25 } }, // JST 09:00
      ];

      testCases.forEach(({ utc, jst }, _index) => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date(utc));
        
        const jstDate = jstTime.getJSTDate();
        
        expect(jstDate.getHours()).toBe(jst.hour);
        expect(jstDate.getDate()).toBe(jst.date);
        
        vi.useRealTimers();
      });
    });
  });

  describe('formatYMD', () => {
    test('should format date as YYYY-MM-DD', () => {
      const date = new Date(2025, 6, 25, 10, 30, 0); // 2025-07-25 10:30:00
      const result = jstTime.formatYMD(date);
      expect(result).toBe('2025-07-25');
    });

    test('should handle single digit months and days', () => {
      const date = new Date(2025, 0, 5); // 2025-01-05
      const result = jstTime.formatYMD(date);
      expect(result).toBe('2025-01-05');
    });
  });

  describe('isToday', () => {
    test('should detect today correctly in JST', () => {
      // UTC 2025-07-25 10:00 (JST 2025-07-25 19:00)
      const mockUTCDate = new Date('2025-07-25T10:00:00.000Z');
      vi.useFakeTimers();
      vi.setSystemTime(mockUTCDate);

      // JST基準では2025-07-25が今日
      expect(jstTime.isToday('2025-07-25')).toBe(true);
      expect(jstTime.isToday('2025-07-24')).toBe(false);
      expect(jstTime.isToday('2025-07-26')).toBe(false);
    });

    test('should handle JST date boundary correctly', () => {
      // UTC 2025-07-24 16:00 (JST 2025-07-25 01:00) - JST午前1時
      const mockUTCDate = new Date('2025-07-24T16:00:00.000Z');
      vi.useFakeTimers();
      vi.setSystemTime(mockUTCDate);

      // JST基準では2025-07-25が今日（UTC基準だと2025-07-24）
      expect(jstTime.isToday('2025-07-25')).toBe(true);
      expect(jstTime.isToday('2025-07-24')).toBe(false);
    });

    test('should correctly identify today during JST morning hours (0-9 AM)', () => {
      const criticalTimes = [
        { utc: '2025-07-24T15:00:00.000Z', expectedToday: '2025-07-25' }, // JST 00:00
        { utc: '2025-07-24T15:30:00.000Z', expectedToday: '2025-07-25' }, // JST 00:30
        { utc: '2025-07-24T17:00:00.000Z', expectedToday: '2025-07-25' }, // JST 02:00
        { utc: '2025-07-24T20:00:00.000Z', expectedToday: '2025-07-25' }, // JST 05:00
        { utc: '2025-07-24T23:00:00.000Z', expectedToday: '2025-07-25' }, // JST 08:00
        { utc: '2025-07-24T23:59:00.000Z', expectedToday: '2025-07-25' }, // JST 08:59
        { utc: '2025-07-25T00:00:00.000Z', expectedToday: '2025-07-25' }, // JST 09:00
      ];

      criticalTimes.forEach(({ utc, expectedToday }) => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date(utc));
        
        // JST基準の今日であることを確認
        expect(jstTime.isToday(expectedToday)).toBe(true);
        
        // UTC基準だと前日になってしまう場合のテスト
        if (expectedToday === '2025-07-25') {
          expect(jstTime.isToday('2025-07-24')).toBe(false);
        }
        
        vi.useRealTimers();
      });
    });

    test('should return false for invalid date strings', () => {
      expect(jstTime.isToday('')).toBe(false);
      expect(jstTime.isToday('invalid-date')).toBe(false);
      expect(jstTime.isToday('2025-13-45')).toBe(false);
    });
  });

  describe('getCurrentDate', () => {
    test('should return current JST date as YYYY-MM-DD string', () => {
      // UTC 2025-07-25 16:30 (JST 2025-07-26 01:30)
      const mockUTCDate = new Date('2025-07-25T16:30:00.000Z');
      vi.useFakeTimers();
      vi.setSystemTime(mockUTCDate);

      const currentDate = jstTime.getCurrentDate();
      
      // JST基準なので翌日の日付が返される
      expect(currentDate).toBe('2025-07-26');
    });

    test('should return correct JST date during critical morning hours (0-9 AM)', () => {
      const morningTestCases = [
        { utc: '2025-07-24T15:00:00.000Z', expected: '2025-07-25' }, // JST 00:00
        { utc: '2025-07-24T15:01:00.000Z', expected: '2025-07-25' }, // JST 00:01
        { utc: '2025-07-24T16:00:00.000Z', expected: '2025-07-25' }, // JST 01:00
        { utc: '2025-07-24T18:30:00.000Z', expected: '2025-07-25' }, // JST 03:30
        { utc: '2025-07-24T21:15:00.000Z', expected: '2025-07-25' }, // JST 06:15
        { utc: '2025-07-24T23:45:00.000Z', expected: '2025-07-25' }, // JST 08:45
        { utc: '2025-07-24T23:59:59.000Z', expected: '2025-07-25' }, // JST 08:59:59
        { utc: '2025-07-25T00:00:00.000Z', expected: '2025-07-25' }, // JST 09:00:00
      ];

      morningTestCases.forEach(({ utc, expected }) => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date(utc));
        
        const currentDate = jstTime.getCurrentDate();
        expect(currentDate).toBe(expected);
        
        vi.useRealTimers();
      });
    });

    test('should be consistent with getJSTDate and formatYMD', () => {
      const mockUTCDate = new Date('2025-07-25T12:00:00.000Z');
      vi.useFakeTimers();
      vi.setSystemTime(mockUTCDate);

      const currentDate = jstTime.getCurrentDate();
      const jstDate = jstTime.getJSTDate();
      const formattedJSTDate = jstTime.formatYMD(jstDate);
      
      expect(currentDate).toBe(formattedJSTDate);
    });

    test('should handle JST date transitions correctly', () => {
      // JST午前0時の直前・直後をテスト
      const transitionTimes = [
        { utc: '2025-07-24T14:59:59.000Z', expected: '2025-07-24' }, // JST 23:59:59 (前日)
        { utc: '2025-07-24T15:00:00.000Z', expected: '2025-07-25' }, // JST 00:00:00 (当日)
        { utc: '2025-07-24T15:00:01.000Z', expected: '2025-07-25' }, // JST 00:00:01 (当日)
      ];

      transitionTimes.forEach(({ utc, expected }) => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date(utc));
        
        const currentDate = jstTime.getCurrentDate();
        expect(currentDate).toBe(expected);
        
        vi.useRealTimers();
      });
    });
  });

  describe('エッジケース', () => {
    test('should handle New Year boundary', () => {
      // UTC 2024-12-31 16:00 (JST 2025-01-01 01:00)
      const mockUTCDate = new Date('2024-12-31T16:00:00.000Z');
      vi.useFakeTimers();
      vi.setSystemTime(mockUTCDate);

      const currentDate = jstTime.getCurrentDate();
      expect(currentDate).toBe('2025-01-01');
      expect(jstTime.isToday('2025-01-01')).toBe(true);
      expect(jstTime.isToday('2024-12-31')).toBe(false);
    });

    test('should handle month boundary', () => {
      // UTC 2025-01-31 16:00 (JST 2025-02-01 01:00)
      const mockUTCDate = new Date('2025-01-31T16:00:00.000Z');
      vi.useFakeTimers();
      vi.setSystemTime(mockUTCDate);

      const currentDate = jstTime.getCurrentDate();
      expect(currentDate).toBe('2025-02-01');
      expect(jstTime.isToday('2025-02-01')).toBe(true);
      expect(jstTime.isToday('2025-01-31')).toBe(false);
    });
  });
});