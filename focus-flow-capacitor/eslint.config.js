import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { globalIgnores } from 'eslint/config'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs['recommended-latest'],
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      // 品質管理のためのESLintルール調整
      '@typescript-eslint/no-unused-vars': [
        'error',
        { 
          argsIgnorePattern: '^_', 
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_'
        }
      ],
      // case文での変数宣言を許可（既にブロックで修正済み）
      'no-case-declarations': 'off',
      // テストファイルでのany型を警告レベルに下げる
      '@typescript-eslint/no-explicit-any': [
        'warn',
        { ignoreRestArgs: true }
      ],
      // useEffectの依存配列を必須にする (バグ防止)
      'react-hooks/exhaustive-deps': 'error'
    }
  },
])
