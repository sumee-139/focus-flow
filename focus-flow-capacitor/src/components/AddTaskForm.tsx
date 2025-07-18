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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // バリデーション
    if (!title.trim()) {
      setError('Title is required')
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
  }

  return (
    <form onSubmit={handleSubmit} className="add-task-form" role="form">
      {error && <div className="error-message">{error}</div>}
      
      <div className="form-group">
        <label htmlFor="task-title">Task Title *</label>
        <input
          id="task-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What needs to be done?"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Optional details..."
          rows={3}
        />
      </div>

      <div className="form-group">
        <label htmlFor="estimated-minutes">Estimated Minutes</label>
        <input
          id="estimated-minutes"
          type="number"
          value={estimatedMinutes}
          onChange={(e) => setEstimatedMinutes(Number(e.target.value))}
          min="1"
          step="5"
        />
      </div>

      <div className="form-group">
        <label htmlFor="alarm-time">Alarm Time</label>
        <input
          id="alarm-time"
          type="time"
          value={alarmTime}
          onChange={(e) => setAlarmTime(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label htmlFor="tags">Tags (comma separated)</label>
        <input
          id="tags"
          type="text"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="work, urgent, personal"
        />
      </div>

      <div className="form-actions">
        <button type="submit" className="btn btn-primary">
          Add Task
        </button>
        <button type="button" onClick={onCancel} className="btn btn-secondary">
          Cancel
        </button>
      </div>
    </form>
  )
}