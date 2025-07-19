import React, { useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import type { Task } from '../types/Task'

interface AddTaskFormProps {
  onAdd: (task: Task) => void;
  onCancel: () => void;
}

export const AddTaskForm: React.FC<AddTaskFormProps> = ({ onAdd, onCancel }) => {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [estimatedMinutes, setEstimatedMinutes] = useState(30)
  const [alarmTime, setAlarmTime] = useState('')
  const [tags, setTags] = useState('')
  const [error, setError] = useState('')
  const [showAdvanced, setShowAdvanced] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // バリデーション
    if (!title.trim()) {
      setError('タスクタイトルは必須です')
      return
    }

    // タスクオブジェクト作成
    const newTask: Task = {
      id: uuidv4(),
      title: title.trim(),
      description: description.trim() || undefined,
      estimatedMinutes,
      alarmTime: alarmTime || undefined,
      order: Date.now(), // 仮実装：現在時刻をorderとして使用
      completed: false,
      tags: tags ? tags.split(',').map(tag => tag.trim()).filter(Boolean) : [],
      createdAt: new Date(),
      updatedAt: new Date()
    }

    onAdd(newTask)
    
    // フォームリセット
    setTitle('')
    setDescription('')
    setEstimatedMinutes(30)
    setAlarmTime('')
    setTags('')
    
    // フォーカス管理：タイトル入力フィールドにフォーカスを戻す
    setTimeout(() => {
      const titleInput = document.getElementById('task-title')
      if (titleInput) {
        titleInput.focus()
      }
    }, 0)
  }

  return (
    <form onSubmit={handleSubmit} className="add-task-form-slim" role="form">
      {error && <div className="error-message">{error}</div>}
      
      {/* メインレイアウト：タスクカード準拠 */}
      <div className="form-main-row">
        {/* 統一アイコン（Design Philosophy必須要件） */}
        <div className="task-icon">
          📝
        </div>
        
        {/* タイトル入力（インライン） */}
        <div className="form-content">
          <input
            id="task-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="タスクタイトルを入力..."
            required
            className="title-input"
            aria-label="タスクタイトル"
          />
          
          {/* メタ情報エリア */}
          <div className="form-meta">
            <input
              id="estimated-minutes"
              type="number"
              value={estimatedMinutes}
              onChange={(e) => setEstimatedMinutes(Number(e.target.value))}
              min="1"
              step="1"
              placeholder="分"
              className="compact-input"
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
              {showAdvanced ? '▲' : '▼'} 詳細
            </button>
          </div>
        </div>

        {/* アクションボタン */}
        <div className="form-actions actions-compact">
          <button type="submit" className="btn-compact btn-primary">
            追加
          </button>
          <button type="button" onClick={onCancel} className="btn-compact btn-secondary">
            キャンセル
          </button>
        </div>
      </div>

      {/* 詳細オプション（展開可能） */}
      {showAdvanced && (
        <div className="form-advanced">
          <div className="form-group">
            <label htmlFor="description">説明</label>
            <textarea
              id="description"
              value={description}
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
    </form>
  )
}