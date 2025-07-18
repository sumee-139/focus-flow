const { app, BrowserWindow, Notification, ipcMain } = require('electron');
const path = require('node:path');

console.log('FocusFlow: Starting with notification support...');

// Focus mode state
let focusModeEnabled = false;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

const createWindow = () => {
  console.log('FocusFlow: Creating window...');
  
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
    show: true, // 明示的にウィンドウを表示
  });

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
  
  console.log('FocusFlow: Window created and should be visible');
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.whenReady().then(() => {
  console.log('FocusFlow: App ready, creating window...');
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Basic IPC handlers
ipcMain.handle('start-focus-mode', async () => {
  console.log('FocusFlow: Start focus mode requested');
  focusModeEnabled = true;
  return { success: true, status: 'Focus mode started' };
});

ipcMain.handle('stop-focus-mode', async () => {
  console.log('FocusFlow: Stop focus mode requested');
  focusModeEnabled = false;
  return { success: true, status: 'Focus mode stopped' };
});

ipcMain.handle('test-notification', async () => {
  console.log('FocusFlow: Test notification requested');
  console.log('Focus mode enabled:', focusModeEnabled);
  
  // Block notification if focus mode is active
  if (focusModeEnabled) {
    console.log('FocusFlow: Notification BLOCKED');
    return { 
      success: true, 
      status: 'Notification blocked',
      blocked: true 
    };
  }
  
  // Send notification if focus mode is off
  if (Notification.isSupported()) {
    const notification = new Notification({
      title: 'FocusFlow Test',
      body: 'Test notification',
      silent: false
    });
    
    notification.show();
    console.log('FocusFlow: Notification sent');
    return { 
      success: true, 
      status: 'Notification sent',
      blocked: false 
    };
  } else {
    return { success: false, status: 'Notifications not supported' };
  }
});

ipcMain.handle('get-focus-status', () => {
  return { focusMode: focusModeEnabled };
});

ipcMain.handle('get-system-info', () => {
  return {
    platform: process.platform,
    nodeVersion: process.versions.node,
    electronVersion: process.versions.electron
  };
});

console.log('FocusFlow: Script loaded completely');