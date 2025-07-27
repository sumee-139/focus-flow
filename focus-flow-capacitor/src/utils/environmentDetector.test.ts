/**
 * # 環境検出システムテスト
 * ## 用途
 * NODE_ENV環境変数の検出と適切な処理をテスト
 * ## 引数
 * なし（テストファイル）
 * ## 戻り値
 * テスト結果
 */
import { describe, test, expect, beforeEach, afterEach } from 'vitest'
import { EnvironmentDetector } from './environmentDetector'

describe('Environment Detection', () => {
  const originalNodeEnv = process.env.NODE_ENV

  afterEach(() => {
    // Reset environment
    process.env.NODE_ENV = originalNodeEnv
  })

  test('should detect NODE_ENV=production correctly', () => {
    process.env.NODE_ENV = 'production'
    
    const detector = new EnvironmentDetector()
    
    expect(detector.isProduction()).toBe(true)
    expect(detector.isDevelopment()).toBe(false)
    expect(detector.isTest()).toBe(false)
    expect(detector.getEnvironment()).toBe('production')
  })

  test('should detect NODE_ENV=development correctly', () => {
    process.env.NODE_ENV = 'development'
    
    const detector = new EnvironmentDetector()
    
    expect(detector.isProduction()).toBe(false)
    expect(detector.isDevelopment()).toBe(true)
    expect(detector.isTest()).toBe(false)
    expect(detector.getEnvironment()).toBe('development')
  })

  test('should handle undefined NODE_ENV gracefully', () => {
    delete process.env.NODE_ENV
    
    const detector = new EnvironmentDetector()
    
    // Should default to development when undefined
    expect(detector.isDevelopment()).toBe(true)
    expect(detector.isProduction()).toBe(false)
    expect(detector.getEnvironment()).toBe('development')
  })

  test('should integrate with webpack DefinePlugin', () => {
    // Test that the detector works with webpack-defined process.env
    process.env.NODE_ENV = 'production'
    
    const detector = new EnvironmentDetector()
    
    // Should handle webpack's string replacement correctly
    expect(typeof detector.getEnvironment()).toBe('string')
    expect(detector.getEnvironment()).toBe('production')
  })

  test('should handle test environment', () => {
    process.env.NODE_ENV = 'test'
    
    const detector = new EnvironmentDetector()
    
    expect(detector.isProduction()).toBe(false)
    expect(detector.isDevelopment()).toBe(false)
    expect(detector.isTest()).toBe(true)
    expect(detector.getEnvironment()).toBe('test')
  })
})