import { useState } from 'react'

// 🟢 Green Phase: テストを通すための最小限の実装
export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((prevValue: T) => T)) => void] {
  // 初期値を読み取る
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key)
      if (item === null) {
        return initialValue
      }
      return JSON.parse(item)
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error)
      return initialValue
    }
  })

  // 値を設定する関数
  const setValue = (value: T | ((prevValue: T) => T)) => {
    try {
      // 関数型更新をサポート
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      
      // localStorageに保存
      window.localStorage.setItem(key, JSON.stringify(valueToStore))
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error)
      // localStorageが失敗してもstateは更新する
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
    }
  }

  return [storedValue, setValue]
}