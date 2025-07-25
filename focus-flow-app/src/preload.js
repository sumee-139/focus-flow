// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

const { contextBridge, ipcRenderer } = require('electron');

// デバッグ用：preloadスクリプトが読み込まれたことを確認
console.log('FocusFlow: preload.js starting...');

// FocusFlow用のAPIをフロントエンドに公開
contextBridge.exposeInMainWorld('electronAPI', {
  startFocusMode: () => ipcRenderer.invoke('start-focus-mode'),
  stopFocusMode: () => ipcRenderer.invoke('stop-focus-mode'),
  testNotification: () => ipcRenderer.invoke('test-notification'),
  getFocusStatus: () => ipcRenderer.invoke('get-focus-status'),
  // システム情報はメインプロセスから取得
  getSystemInfo: () => ipcRenderer.invoke('get-system-info')
});

console.log('FocusFlow: preload.js loaded successfully');
