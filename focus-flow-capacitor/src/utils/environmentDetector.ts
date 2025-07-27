/**
 * # 環境検出システム
 * ## 用途
 * NODE_ENV環境変数を検出し、開発/本番環境の判定を提供
 * ## 引数
 * なし（constructor）
 * ## 戻り値
 * EnvironmentDetectorインスタンス
 */
export class EnvironmentDetector {
  private readonly environment: string

  constructor() {
    // webpack DefinePlugin integration - process.env.NODE_ENV is replaced at build time
    this.environment = process.env.NODE_ENV || 'development'
  }

  /**
   * # 本番環境判定
   * ## 用途
   * 現在の環境が本番環境かどうかを判定
   * ## 引数
   * なし
   * ## 戻り値
   * boolean: 本番環境の場合true
   */
  isProduction(): boolean {
    return this.environment === 'production'
  }

  /**
   * # 開発環境判定
   * ## 用途
   * 現在の環境が開発環境かどうかを判定
   * ## 引数
   * なし
   * ## 戻り値
   * boolean: 開発環境の場合true
   */
  isDevelopment(): boolean {
    return this.environment === 'development'
  }

  /**
   * # テスト環境判定
   * ## 用途
   * 現在の環境がテスト環境かどうかを判定
   * ## 引数
   * なし
   * ## 戻り値
   * boolean: テスト環境の場合true
   */
  isTest(): boolean {
    return this.environment === 'test'
  }

  /**
   * # 環境名取得
   * ## 用途
   * 現在の環境名を取得
   * ## 引数
   * なし
   * ## 戻り値
   * string: 環境名（development/production/test）
   */
  getEnvironment(): string {
    return this.environment
  }
}