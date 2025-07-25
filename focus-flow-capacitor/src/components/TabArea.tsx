import React from 'react'

export interface TabInfo {
  id: string
  type: 'daily' | 'task'
  title: string
  taskId?: string
  closable: boolean
}

export interface TabAreaProps {
  tabs: TabInfo[]
  activeTabId: string
  onTabSelect: (tabId: string) => void
  onTabClose: (tabId: string) => void
}

export const TabArea: React.FC<TabAreaProps> = ({
  tabs,
  activeTabId,
  onTabSelect,
  onTabClose
}) => {
  const handleTabClick = (tabId: string) => {
    onTabSelect(tabId)
  }

  const handleTabClose = (e: React.MouseEvent, tabId: string) => {
    e.stopPropagation()
    onTabClose(tabId)
  }

  return (
    <div className="tab-area tab-area-scroll" data-testid="tab-area">
      {/* デイリーメモタブ（固定表示） */}
      {tabs.find(tab => tab.type === 'daily') && (
        <div className="tab-daily-memo-sticky" data-testid="tab-daily-memo">
          <button
            className={`tab-button ${activeTabId === 'daily' ? 'tab-active' : ''}`}
            onClick={() => handleTabClick('daily')}
          >
            📝 デイリーメモ
          </button>
        </div>
      )}

      {/* スクロール可能なタスクタブリスト */}
      <div className="tab-list" data-testid="tab-list">
        {tabs
          .filter(tab => tab.type === 'task')
          .map(tab => (
            <div key={tab.id} className="tab-item" data-testid={`tab-${tab.type}-${tab.id}`}>
              <button
                className={`tab-button ${activeTabId === tab.id ? 'tab-active' : ''}`}
                onClick={() => handleTabClick(tab.id)}
              >
                {tab.title}
              </button>
              {tab.closable && (
                <button
                  className="tab-close-btn"
                  onClick={(e) => handleTabClose(e, tab.id)}
                  aria-label={`Close ${tab.title}`}
                >
                  ×
                </button>
              )}
            </div>
          ))}
      </div>
    </div>
  )
}