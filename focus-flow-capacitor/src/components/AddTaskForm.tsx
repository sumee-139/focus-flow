import React, { useState, useRef, useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'
import type { Task } from '../types/Task'
import { DatePicker } from './DatePicker'
import { formatTaskDate } from '../utils/taskDate'
import './AddTaskForm.css'

interface AddTaskFormProps {
  onAdd: (task: Task) => void;
  currentDate?: string; // 🔥 FIX: Phase 2.2a統合 - 現在選択中の日付
}

export const AddTaskForm: React.FC<AddTaskFormProps> = ({ onAdd, currentDate }) => {
  // useRefでDOM要素への参照を作成
  const titleInputRef = useRef<HTMLInputElement>(null)
  
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [estimatedMinutes, setEstimatedMinutes] = useState(30)
  const [alarmTime, setAlarmTime] = useState('')
  const [tags, setTags] = useState('')
  const [error, setError] = useState('')
  const [showAdvanced, setShowAdvanced] = useState(false)
  
  // 🟢 Green Phase: 日付選択機能の最小限実装
  const [targetDate, setTargetDate] = useState(currentDate || new Date().toISOString().split('T')[0])
  const [showDatePicker, setShowDatePicker] = useState(false)
  
  // currentDateが変更されたときに、targetDateを自動更新
  useEffect(() => {
    if (currentDate) {
      setTargetDate(currentDate)
    }
  }, [currentDate])

  // フォームリセット処理を関数に切り出し（Refactor Phase）
  const resetForm = () => {
    setTitle('')
    setDescription('')
    setEstimatedMinutes(30)
    setAlarmTime('')
    setTags('')
    setError('')
    // 🟢 Green Phase: 日付も今日にリセット
    setTargetDate(new Date().toISOString().split('T')[0])
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // バリデーション
    if (!title.trim()) {
      setError('タスクタイトルは必須です')
      // useRefを使ったフォーカス管理（エラー時）
      titleInputRef.current?.focus()
      return
    }

    // タスクオブジェクト作成
    const newTask: Task = {
      id: uuidv4(),
      title: title.trim(),
      description: description.trim() || undefined,
      estimatedMinutes,
      alarmTime: alarmTime || undefined,
      targetDate, // 🟢 Green Phase: ステートから取得
      order: Date.now(), // 仮実装：現在時刻をorderとして使用
      completed: false,
      tags: tags ? tags.split(',').map(tag => tag.trim()).filter(Boolean) : [],
      createdAt: new Date(),
      updatedAt: new Date()
    }

    onAdd(newTask)
    
    // フォームリセット（Refactor: 関数に切り出し）
    resetForm()
    
    // useRefを使ったフォーカス管理（成功時）
    titleInputRef.current?.focus()
  }

  return (
    <form onSubmit={handleSubmit} className="add-task-form-slim" role="form" data-testid="task-form">
      {error && <div className="error-message" data-testid="error-message">{error}</div>}
      
      {/* 上段：アイコン + タスク名 */}
      <div className="form-top-row">
        {/* 統一アイコン（Design Philosophy必須要件） */}
        <div className="task-icon">
          📝
        </div>
        
        {/* タイトル入力（メイン） */}
        <input
          ref={titleInputRef}
          id="task-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="タスク名"
          required
          className="title-input-main"
          aria-label="タスクタイトル"
          data-testid="task-title-input"
        />
      </div>

      {/* 下段：分・詳細・追加 */}
      <div className="form-bottom-row">
        {/* 見積時間入力 */}
        <input
          id="estimated-minutes"
          type="number"
          value={estimatedMinutes}
          onChange={(e) => setEstimatedMinutes(Number(e.target.value))}
          min="1"
          step="1"
          placeholder="30"
          className="minutes-input"
          aria-label="見積時間"
        />
        <span className="time-label">分</span>
        
        {/* 詳細オプション展開ボタン */}
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="expand-button"
          aria-label="詳細オプション"
        >
          詳細
        </button>
        
        {/* 🟢 Green Phase: 日付選択ボタン */}
        <button
          type="button"
          onClick={() => setShowDatePicker(true)}
          className="date-button"
          aria-label="日付を選択"
        >
          {formatTaskDate(targetDate, { format: 'relative' })}
        </button>
        
        {/* 可変幅スペーサー */}
        <div className="spacer"></div>
        
        {/* アクションボタン */}
        <button type="submit" className="btn-compact btn-primary" data-testid="add-task-button">
          追加
        </button>
      </div>

      {/* 詳細オプション（展開可能） */}
      {showAdvanced && (
        <div className="form-advanced">
          <div className="form-group">
            <label htmlFor="description">説明</label>
            <textarea
              id="description"
              value={description}
              data-testid="task-description-input"
              onChange={(e) => setDescription(e.target.value)}
              placeholder="任意の詳細..."
              rows={2}
              aria-label="説明"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="alarm-time">アラーム時刻</label>
              <input
                id="alarm-time"
                type="time"
                value={alarmTime}
                onChange={(e) => setAlarmTime(e.target.value)}
                aria-label="アラーム時刻"
              />
            </div>

            <div className="form-group">
              <label htmlFor="tags">タグ（カンマ区切り）</label>
              <input
                id="tags"
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="仕事, 緊急, プライベート"
                aria-label="タグ"
              />
            </div>
          </div>
        </div>
      )}

      {/* 🟢 Green Phase: DatePickerモーダル */}
      {showDatePicker && (
        <DatePicker
          isOpen={showDatePicker}
          selectedDate={targetDate}
          onDateSelect={(date) => {
            setTargetDate(date)
            setShowDatePicker(false)
          }}
          onClose={() => setShowDatePicker(false)}
          availableDates={[]} // 制限なし、すべての日付を選択可能
        />
      )}
    </form>
  )
}