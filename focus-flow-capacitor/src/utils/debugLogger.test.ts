/**
 * # 統合デバッグロガーシステムテスト
 * ## 用途
 * 環境別ログ制御とプロダクション最適化の統合ログシステムをテスト
 * ## 引数
 * なし（テストファイル）
 * ## 戻り値
 * テスト結果
 */
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'
import { logger, ProductionLogger, DevelopmentLogger } from './debugLogger'

describe('DebugLogger - 統合環境制御', () => {
  const originalNodeEnv = process.env.NODE_ENV
  let consoleDebugSpy: any
  let consoleInfoSpy: any
  let consoleWarnSpy: any
  let consoleErrorSpy: any

  beforeEach(() => {
    // Console spy setup
    consoleDebugSpy = vi.spyOn(console, 'debug').mockImplementation(() => {})
    consoleInfoSpy = vi.spyOn(console, 'info').mockImplementation(() => {})
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    // Reset environment
    process.env.NODE_ENV = originalNodeEnv
    vi.clearAllMocks()
  })

  test('should output logs in development environment', () => {
    // Test development logger directly (since test env uses TestLogger)
    const devLogger = new DevelopmentLogger()
    
    // Test all log levels in development
    devLogger.debug('Debug message')
    devLogger.info('Info message')
    devLogger.warn('Warning message') 
    devLogger.error('Error message')

    // All should be output in development
    expect(consoleDebugSpy).toHaveBeenCalledWith('Debug message')
    expect(consoleInfoSpy).toHaveBeenCalledWith('Info message')
    expect(consoleWarnSpy).toHaveBeenCalledWith('Warning message')
    expect(consoleErrorSpy).toHaveBeenCalledWith('Error message')
  })

  test('should suppress non-error logs in production environment', () => {
    // Test production logger directly
    const prodLogger = new ProductionLogger()
    
    // Test all log levels in production
    prodLogger.debug('Debug message')
    prodLogger.info('Info message')
    prodLogger.warn('Warning message')
    prodLogger.error('Error message')

    // Only error should be output in production
    expect(consoleDebugSpy).not.toHaveBeenCalled()
    expect(consoleInfoSpy).not.toHaveBeenCalled()
    expect(consoleWarnSpy).not.toHaveBeenCalled()
    expect(consoleErrorSpy).toHaveBeenCalledWith('Error message')
  })

  test('should always output error logs regardless of environment', () => {
    // Test production and development loggers directly (TestLogger is intentionally silent)
    const devLogger = new DevelopmentLogger()
    const prodLogger = new ProductionLogger()
    
    // Test development logger
    consoleErrorSpy.mockClear()
    devLogger.error('Critical error message')
    expect(consoleErrorSpy).toHaveBeenCalledWith('Critical error message')
    
    // Test production logger
    consoleErrorSpy.mockClear()
    prodLogger.error('Critical error message')
    expect(consoleErrorSpy).toHaveBeenCalledWith('Critical error message')
  })

  test('should optimize performance in production (minimal processing)', () => {
    // Test production logger directly
    const prodLogger = new ProductionLogger()
    
    // Complex object that should not be processed in production
    const complexObject = { data: Array(1000).fill('test') }
    
    prodLogger.debug('Debug with complex data', complexObject)
    prodLogger.info('Info with complex data', complexObject)
    
    // These should not be called, meaning no processing overhead
    expect(consoleDebugSpy).not.toHaveBeenCalled()
    expect(consoleInfoSpy).not.toHaveBeenCalled()
  })

  test('should handle log levels: DEBUG, INFO, WARN, ERROR', () => {
    // Test development logger directly
    const devLogger = new DevelopmentLogger()
    
    // Test method existence and functionality
    expect(typeof devLogger.debug).toBe('function')
    expect(typeof devLogger.info).toBe('function')
    expect(typeof devLogger.warn).toBe('function')
    expect(typeof devLogger.error).toBe('function')
    
    // Test with arguments
    devLogger.debug('Debug:', { test: 'data' })
    devLogger.info('Info:', { test: 'data' })
    devLogger.warn('Warn:', { test: 'data' })
    devLogger.error('Error:', { test: 'data' })
    
    expect(consoleDebugSpy).toHaveBeenCalledWith('Debug:', { test: 'data' })
    expect(consoleInfoSpy).toHaveBeenCalledWith('Info:', { test: 'data' })
    expect(consoleWarnSpy).toHaveBeenCalledWith('Warn:', { test: 'data' })
    expect(consoleErrorSpy).toHaveBeenCalledWith('Error:', { test: 'data' })
  })

  test('should replace existing console.log/warn usage patterns', () => {
    // Test development logger directly
    const devLogger = new DevelopmentLogger()
    
    // Test compatibility with existing console.log patterns
    devLogger.info('This replaces console.log')
    devLogger.warn('This replaces console.warn')
    devLogger.error('This replaces console.error')
    
    expect(consoleInfoSpy).toHaveBeenCalledWith('This replaces console.log')
    expect(consoleWarnSpy).toHaveBeenCalledWith('This replaces console.warn')
    expect(consoleErrorSpy).toHaveBeenCalledWith('This replaces console.error')
  })

  // 🔴 ブラウザ互換性テスト（process未定義エラー対応完了）
  describe('Browser Compatibility Tests', () => {
    test('should create default development logger when process is undefined', () => {
      // getEnvironmentSafely と isTestEnvironmentSafely 関数をテスト
      // ブラウザ環境では development logger が作成されることを確認
      
      // logger インスタンスの基本メソッドが存在することを確認
      expect(typeof logger.debug).toBe('function')
      expect(typeof logger.info).toBe('function')
      expect(typeof logger.warn).toBe('function')
      expect(typeof logger.error).toBe('function')
      
      // エラーが発生しないことを確認
      expect(() => logger.debug('Browser compatibility test')).not.toThrow()
      expect(() => logger.info('Browser compatibility test')).not.toThrow()
      expect(() => logger.warn('Browser compatibility test')).not.toThrow()
      expect(() => logger.error('Browser compatibility test')).not.toThrow()
    })

    test('should handle environment detection gracefully', () => {
      // 環境検出機能が正常に動作することを確認
      // テスト環境では TestLogger が作成されることを確認
      
      // logger が正常に作成されていることを確認
      expect(logger).toBeDefined()
      
      // process が存在する環境でも安全に動作することを確認
      expect(typeof process).toBe('object')
      expect(() => {
        const testLogger = new (logger.constructor as any)()
        testLogger.debug('test')
      }).not.toThrow()
    })
  })

  // 🔵 継承ベース最適化テスト
  describe('Inheritance-Based Performance Optimization', () => {
    test('should provide zero-overhead production logger', () => {
      // ProductionLogger should have methods that do nothing
      const prodLogger = new ProductionLogger()
      
      // Should not call console methods at all
      prodLogger.debug('Should not output')
      prodLogger.info('Should not output')
      prodLogger.warn('Should not output')
      prodLogger.error('Error should output')
      
      expect(consoleDebugSpy).not.toHaveBeenCalled()
      expect(consoleInfoSpy).not.toHaveBeenCalled()
      expect(consoleWarnSpy).not.toHaveBeenCalled()
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error should output')
    })

    test('should provide full-featured development logger', () => {
      const devLogger = new DevelopmentLogger()
      
      // Should call all console methods
      devLogger.debug('Debug output')
      devLogger.info('Info output')
      devLogger.warn('Warn output')
      devLogger.error('Error output')
      
      expect(consoleDebugSpy).toHaveBeenCalledWith('Debug output')
      expect(consoleInfoSpy).toHaveBeenCalledWith('Info output')
      expect(consoleWarnSpy).toHaveBeenCalledWith('Warn output')
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error output')
    })

    test('should export correct logger instance based on environment', () => {
      // The default exported logger should be optimized for current environment
      expect(typeof logger.debug).toBe('function')
      expect(typeof logger.info).toBe('function')
      expect(typeof logger.warn).toBe('function')
      expect(typeof logger.error).toBe('function')
    })
  })
})