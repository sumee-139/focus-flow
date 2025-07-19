import { useLocalStorage } from './useLocalStorage'
import { TaskMemoData } from '../types/Task'

// LocalStorageキーパターン生成関数
const getTaskMemoKey = (taskId: string): string => `focus-flow-task-memo-${taskId}`

// タスクメモ専用カスタムhook
export const useTaskMemoStorage = (taskId: string) => {
  const [taskMemo, setTaskMemo] = useLocalStorage<TaskMemoData | null>(
    getTaskMemoKey(taskId), 
    null
  )
  
  return [taskMemo, setTaskMemo] as const
}