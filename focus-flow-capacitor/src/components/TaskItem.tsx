import React from 'react'
import type { Task } from '../types/Task'
import './TaskItem.css'

interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onReorder: (dragIndex: number, hoverIndex: number) => void;
}

export const TaskItem: React.FC<TaskItemProps> = ({
  task,
  onToggle,
  onEdit,
  onDelete,
  onReorder: _onReorder
}) => {
  const handleToggle = () => {
    onToggle(task.id)
  }

  const handleEdit = () => {
    onEdit(task.id)
  }

  const handleDelete = () => {
    onDelete(task.id)
  }

  return (
    <div className={`task-item ${task.completed ? 'completed' : ''}`} data-testid="task-item">
      {/* ドラッグハンドル（Design Philosophy準拠） */}
      <div className="drag-handle" title="Drag to reorder">
        ⋮⋮
      </div>

      {/* 統一アイコン（Design Philosophy必須要件） */}
      <div className="task-icon">
        📝
      </div>

      {/* タスクコンテンツ */}
      <div className="task-content">
        <div className="task-title">
          {task.title}
        </div>
        {task.description && (
          <div className="task-description">
            {task.description}
          </div>
        )}
        <div className="task-meta">
          {task.estimatedMinutes > 0 && (
            <span className="estimated-time">
              ⏱️ {task.estimatedMinutes}分
            </span>
          )}
          {task.alarmTime && (
            <span className="alarm-time">
              ⏰ {task.alarmTime}
            </span>
          )}
          {task.tags.length > 0 && (
            <span className="tags">
              {task.tags.map(tag => (
                <span key={tag} className="tag">#{tag}</span>
              ))}
            </span>
          )}
        </div>
      </div>

      {/* 完了チェックボックス */}
      <div className="task-actions">
        <input
          type="checkbox"
          checked={task.completed}
          onChange={handleToggle}
          className="task-checkbox"
          aria-label={`Mark "${task.title}" as ${task.completed ? 'incomplete' : 'complete'}`}
        />
        <button
          onClick={handleEdit}
          className="edit-button"
          aria-label={`Edit "${task.title}"`}
        >
          ✏️
        </button>
        <button
          onClick={handleDelete}
          className="delete-button"
          aria-label={`Delete "${task.title}"`}
        >
          🗑️
        </button>
      </div>
    </div>
  )
}