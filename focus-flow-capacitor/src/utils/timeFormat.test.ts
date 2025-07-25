// timeFormat.test.ts - 時間フォーマット共通ユーティリティのテスト
// Phase 2.2a リファクタリング - TDD品質保証

import { formatDuration, formatDurationCompact, formatDurationDecimal } from './timeFormat';

describe('timeFormat utilities', () => {
  describe('formatDuration', () => {
    test('should format 0 minutes', () => {
      expect(formatDuration(0)).toBe('0分');
    });

    test('should format minutes less than 60', () => {
      expect(formatDuration(30)).toBe('30分');
      expect(formatDuration(59)).toBe('59分');
    });

    test('should format exact hours', () => {
      expect(formatDuration(60)).toBe('1時間');
      expect(formatDuration(120)).toBe('2時間');
      expect(formatDuration(300)).toBe('5時間');
    });

    test('should format hours with minutes', () => {
      expect(formatDuration(90)).toBe('1時間30分');
      expect(formatDuration(125)).toBe('2時間5分');
      expect(formatDuration(375)).toBe('6時間15分');
    });
  });

  describe('formatDurationCompact', () => {
    test('should format in compact style', () => {
      expect(formatDurationCompact(0)).toBe('0m');
      expect(formatDurationCompact(30)).toBe('30m');
      expect(formatDurationCompact(60)).toBe('1h');
      expect(formatDurationCompact(90)).toBe('1h30m');
    });
  });

  describe('formatDurationDecimal', () => {
    test('should format as decimal hours', () => {
      expect(formatDurationDecimal(0)).toBe('0時間');
      expect(formatDurationDecimal(30)).toBe('0.5時間');
      expect(formatDurationDecimal(90)).toBe('1.5時間');
      expect(formatDurationDecimal(125)).toBe('2.1時間');
    });
  });
});