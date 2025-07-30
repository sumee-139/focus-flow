/**
 * # 統合デバッグロガーシステム（継承ベース最適化版）
 * ## 用途
 * 環境別ログ制御とゼロオーバーヘッド最適化を提供する統合ログシステム
 * ## 引数
 * なし（singleton）
 * ## 戻り値
 * LoggerInterface準拠インスタンス
 */
/**
 * # ベースロガークラス
 * ## 用途
 * 継承用の抽象ベースクラス
 */
class BaseLogger {
}
/**
 * # プロダクションロガー（ゼロオーバーヘッド）
 * ## 用途
 * プロダクション環境用の最適化ロガー（ERROR以外は完全no-op）
 */
export class ProductionLogger extends BaseLogger {
    /**
     * # デバッグログ（no-op）
     * ## 用途
     * プロダクション環境では何も実行しない
     */
    debug(_message, ..._args) {
        // Intentionally empty - zero overhead in production
    }
    /**
     * # インフォログ（no-op）
     * ## 用途
     * プロダクション環境では何も実行しない
     */
    info(_message, ..._args) {
        // Intentionally empty - zero overhead in production
    }
    /**
     * # 警告ログ（no-op）
     * ## 用途
     * プロダクション環境では何も実行しない
     */
    warn(_message, ..._args) {
        // Intentionally empty - zero overhead in production
    }
    /**
     * # エラーログ
     * ## 用途
     * プロダクション環境でもエラーは出力
     */
    error(message, ...args) {
        console.error(message, ...args);
    }
}
/**
 * # テストロガー（サイレント）
 * ## 用途
 * テスト環境用のサイレントロガー（テスト出力をクリーンに保つ）
 */
export class TestLogger extends BaseLogger {
    /**
     * # デバッグログ（サイレント）
     * ## 用途
     * テスト環境では意図的にサイレント
     */
    debug(_message, ..._args) {
        // Intentionally silent during tests for clean output
    }
    /**
     * # インフォログ（サイレント）
     * ## 用途
     * テスト環境では意図的にサイレント
     */
    info(_message, ..._args) {
        // Intentionally silent during tests for clean output
    }
    /**
     * # 警告ログ（サイレント）
     * ## 用途
     * テスト環境では意図的にサイレント
     */
    warn(_message, ..._args) {
        // Intentionally silent during tests for clean output
    }
    /**
     * # エラーログ（サイレント）
     * ## 用途
     * テスト環境では意図的にサイレント（エラーハンドリングテストのため）
     */
    error(_message, ..._args) {
        // Intentionally silent during tests for clean output
    }
}
/**
 * # 開発ロガー（フル機能）
 * ## 用途
 * 開発環境用のフル機能ロガー
 */
export class DevelopmentLogger extends BaseLogger {
    /**
     * # デバッグログ
     * ## 用途
     * デバッグ情報を出力
     */
    debug(message, ...args) {
        console.debug(message, ...args);
    }
    /**
     * # インフォログ
     * ## 用途
     * 一般的な情報を出力
     */
    info(message, ...args) {
        console.info(message, ...args);
    }
    /**
     * # 警告ログ
     * ## 用途
     * 警告情報を出力
     */
    warn(message, ...args) {
        console.warn(message, ...args);
    }
    /**
     * # エラーログ
     * ## 用途
     * エラー情報を出力
     */
    error(message, ...args) {
        console.error(message, ...args);
    }
}
/**
 * # ブラウザ互換性環境判定ヘルパー
 * ## 用途
 * ブラウザとNode.js環境で安全に環境変数にアクセス
 * ## 引数
 * なし
 * ## 戻り値
 * string: 環境名 ('development' | 'production' | 'test')
 */
function getEnvironmentSafely() {
    // ブラウザ環境でprocess未定義の場合に安全に処理
    try {
        if (typeof process === 'undefined' || !process.env) {
            return 'development'; // ブラウザ環境ではデフォルトで開発モード
        }
        return process.env.NODE_ENV || 'development';
    }
    catch (error) {
        // process参照で例外が発生した場合のフォールバック
        return 'development';
    }
}
/**
 * # ブラウザ互換性テスト環境判定
 * ## 用途
 * ブラウザとNode.js環境で安全にテスト環境かどうかを判定
 * ## 引数
 * なし
 * ## 戻り値
 * boolean: テスト環境かどうか
 */
function isTestEnvironmentSafely() {
    try {
        // vitest判定（globalThis.__vitest__は常に安全）
        if (typeof globalThis !== 'undefined' && globalThis.__vitest__ !== undefined) {
            return true;
        }
        // process.env判定（process未定義の可能性を考慮）
        if (typeof process !== 'undefined' && process.env) {
            return process.env.VITEST === 'true' || process.env.NODE_ENV === 'test';
        }
        return false;
    }
    catch (error) {
        return false;
    }
}
/**
 * # 環境別ロガーファクトリー
 * ## 用途
 * 環境に応じて最適化されたロガーインスタンスを作成（ブラウザ互換性対応）
 * ## 引数
 * なし
 * ## 戻り値
 * LoggerInterface: 環境最適化ロガー
 */
function createOptimizedLogger() {
    const currentEnv = getEnvironmentSafely();
    const isTestEnv = isTestEnvironmentSafely();
    if (isTestEnv) {
        return new TestLogger();
    }
    else if (currentEnv === 'production') {
        return new ProductionLogger();
    }
    else {
        return new DevelopmentLogger();
    }
}
// 環境別最適化シングルトンインスタンス
export const logger = createOptimizedLogger();
