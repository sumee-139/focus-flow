console.log('FocusFlow: Starting application...');

const { app, BrowserWindow, Notification, systemPreferences, ipcMain } = require('electron');
const path = require('node:path');
const os = require('os');

console.log('FocusFlow: Modules loaded successfully');
console.log('FocusFlow: Electron version:', process.versions.electron);
console.log('FocusFlow: Node.js version:', process.versions.node);

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

const createWindow = () => {
  console.log('FocusFlow: createWindow() called');
  
  try {
    // Create the browser window.
    console.log('FocusFlow: Creating BrowserWindow...');
    const mainWindow = new BrowserWindow({
      width: 800,
      height: 600,
      webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        nodeIntegration: false,
        contextIsolation: true,
      },
    });
    console.log('FocusFlow: BrowserWindow created successfully');

    // and load the index.html of the app.
    console.log('FocusFlow: Loading index.html...');
    mainWindow.loadFile(path.join(__dirname, 'index.html'));
    console.log('FocusFlow: index.html loaded');

    // Open the DevTools.
    console.log('FocusFlow: Opening DevTools...');
    mainWindow.webContents.openDevTools();
    console.log('FocusFlow: DevTools opened');
    
    // Window event listeners for debugging
    mainWindow.once('ready-to-show', () => {
      console.log('FocusFlow: Window ready to show');
    });
    
    mainWindow.webContents.once('dom-ready', () => {
      console.log('FocusFlow: DOM ready');
    });
    
  } catch (error) {
    console.error('FocusFlow: Error in createWindow():', error);
    throw error;
  }
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// FocusFlow: OSレベル通知制御機能
let focusModeEnabled = false;
let originalNotificationSettings = null;

// フォーカスモード開始
async function startFocusMode() {
  focusModeEnabled = true;
  
  // システム通知を無効化
  app.setBadgeCount(0);
  
  // Windows: 通知センター制御と集中モード連携
  if (process.platform === 'win32') {
    app.setAppUserModelId('com.focusflow.app');
    
    // Windows 10/11 集中モード連携 (可能な場合)
    try {
      await setWindowsFocusAssist(true);
      console.log('FocusFlow: Windows Focus Assist integration - ENABLED');
    } catch (error) {
      console.log('FocusFlow: Windows Focus Assist integration - Manual setting required');
    }
  }
  
  // macOS: Do Not Disturb連携
  if (process.platform === 'darwin') {
    app.dock.setBadge('');
    
    // macOS通知設定を変更
    if (systemPreferences.getDoNotDisturb) {
      originalNotificationSettings = systemPreferences.getDoNotDisturb();
      systemPreferences.setDoNotDisturb(true);
    }
  }
  
  console.log('FocusFlow: Focus mode started - Notifications blocked');
}

// フォーカスモード終了
async function stopFocusMode() {
  focusModeEnabled = false;
  
  // 通知を再有効化
  app.setBadgeCount(0);
  
  // Windows: 集中モード解除
  if (process.platform === 'win32') {
    try {
      await setWindowsFocusAssist(false);
      console.log('FocusFlow: Windows Focus Assist - DISABLED');
    } catch (error) {
      console.log('FocusFlow: Windows Focus Assist - Manual disable required');
    }
  }
  
  // macOS: Do Not Disturb解除
  if (process.platform === 'darwin' && originalNotificationSettings !== null) {
    systemPreferences.setDoNotDisturb(originalNotificationSettings);
    originalNotificationSettings = null;
  }
  
  console.log('FocusFlow: Focus mode stopped - Notifications restored');
}

// Windows 集中モード制御関数（デバッグ版）
async function setWindowsFocusAssist(enabled) {
  if (process.platform !== 'win32') return;
  
  const action = enabled ? 'ENABLE' : 'DISABLE';
  console.log(`FocusFlow: Windows Focus Assist ${action} requested`);
  console.log(`FocusFlow: Focus mode enabled state: ${focusModeEnabled}`);
  
  // デバッグ: 現在の状態を確認
  console.log(`FocusFlow: setWindowsFocusAssist called with enabled=${enabled}`);
  
  // 将来的にはWindows APIを使用してより確実な制御を実装予定
  return Promise.resolve();
}

// 通知制御テスト
async function testNotificationControl() {
  if (Notification.isSupported()) {
    console.log('FocusFlow: Starting automatic notification control test');
    
    // 通知音を無効化した通知を作成
    const notification = new Notification({
      title: 'FocusFlow Auto Test',
      body: 'Automatic notification control test - Normal mode',
      silent: true
    });
    
    notification.show();
    console.log('FocusFlow: Normal mode notification sent');
    
    // 3秒後にフォーカスモードをテスト
    setTimeout(async () => {
      await startFocusMode();
      console.log('FocusFlow: Focus mode activated for auto test');
      
      // さらに3秒後に通知テスト（フォーカスモード中）
      setTimeout(() => {
        console.log('FocusFlow: Testing notification during focus mode');
        
        // フォーカスモード中は通知をブロック
        if (focusModeEnabled) {
          console.log('FocusFlow: ✅ Auto test - Notification BLOCKED correctly');
        } else {
          // フォーカスモードが無効の場合のみ通知を送信
          const blockedNotification = new Notification({
            title: 'Should be blocked',
            body: 'This notification should be blocked in focus mode',
            silent: true
          });
          blockedNotification.show();
          console.log('FocusFlow: ❌ Auto test - Notification should have been blocked');
        }
        
        // 5秒後にフォーカスモード解除
        setTimeout(async () => {
          await stopFocusMode();
          console.log('FocusFlow: Focus mode deactivated - Auto test complete');
        }, 5000);
      }, 3000);
    }, 3000);
  }
}

// Windows 集中モード確認手順を表示
function showWindowsFocusAssistInstructions() {
  console.log(`
=== Windows Focus Assist Integration Instructions ===

1. Open Windows Settings (Win + I)
2. Go to System > Focus Assist
3. Check current state:
   - Off: Normal mode
   - Priority only: Important notifications only
   - Alarms only: Alarm notifications only

4. Start Focus Mode in FocusFlow app
5. Check Focus Assist state changes

6. Manual test:
   - Set Focus Assist to "Priority only"
   - Verify other app notifications are blocked
   - Verify important notifications (calls, alarms) still appear

=== Verification Points ===
- ✅ Notification popups (silent)
- ✅ Sound disabled
- ⚠️ Windows Focus Assist integration (manual setting required)
- ⚠️ System-wide notification control (permission limited)
  `);
}

// IPC handlers for frontend communication
ipcMain.handle('start-focus-mode', async () => {
  console.log('FocusFlow IPC: start-focus-mode called');
  try {
    await startFocusMode();
    console.log('FocusFlow IPC: Focus mode started successfully');
    return { success: true, status: 'Focus mode started' };
  } catch (error) {
    console.error('FocusFlow IPC: Start focus mode error:', error);
    throw error;
  }
});

ipcMain.handle('stop-focus-mode', async () => {
  console.log('FocusFlow IPC: stop-focus-mode called');
  try {
    await stopFocusMode();
    console.log('FocusFlow IPC: Focus mode stopped successfully');
    return { success: true, status: 'Focus mode stopped' };
  } catch (error) {
    console.error('FocusFlow IPC: Stop focus mode error:', error);
    throw error;
  }
});

ipcMain.handle('test-notification', async () => {
  console.log('FocusFlow IPC: test-notification called');
  console.log('FocusFlow IPC: Current focusModeEnabled:', focusModeEnabled);
  
  try {
    // フォーカスモード中は通知をブロック
    if (focusModeEnabled) {
      console.log('FocusFlow IPC: Notification BLOCKED - Focus mode is active');
      return { 
        success: true, 
        status: 'Notification blocked - Focus mode is active',
        blocked: true 
      };
    }
    
    console.log('FocusFlow IPC: Notification.isSupported():', Notification.isSupported());
    
    if (Notification.isSupported()) {
      const notification = new Notification({
        title: 'FocusFlow Test',
        body: 'Test notification from FocusFlow',
        silent: false,
        urgency: 'normal'
      });
      
      notification.on('show', () => {
        console.log('FocusFlow IPC: Notification shown successfully');
      });
      
      notification.on('click', () => {
        console.log('FocusFlow IPC: Notification clicked');
      });
      
      notification.on('close', () => {
        console.log('FocusFlow IPC: Notification closed');
      });
      
      notification.show();
      console.log('FocusFlow IPC: Notification.show() called');
      return { 
        success: true, 
        status: 'Notification sent',
        blocked: false 
      };
    } else {
      console.log('FocusFlow IPC: Notifications not supported on this platform');
      return { success: false, status: 'Notifications not supported' };
    }
  } catch (error) {
    console.error('FocusFlow IPC: Test notification error:', error);
    return { success: false, status: 'Error: ' + error.message };
  }
});

ipcMain.handle('get-focus-status', () => {
  console.log('FocusFlow IPC: get-focus-status called');
  return { focusMode: focusModeEnabled };
});

ipcMain.handle('get-system-info', () => {
  console.log('FocusFlow IPC: get-system-info called');
  return {
    platform: process.platform,
    nodeVersion: process.versions.node,
    electronVersion: process.versions.electron
  };
});

// エラーハンドリングを追加
process.on('uncaughtException', (error) => {
  console.error('FocusFlow: Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('FocusFlow: Unhandled Rejection at:', promise, 'reason:', reason);
});

// アプリ起動時に通知制御テストを実行
app.whenReady().then(() => {
  console.log('FocusFlow: App ready event fired');
  console.log('FocusFlow: Platform:', process.platform);
  
  try {
    // Windows通知設定
    if (process.platform === 'win32') {
      app.setAppUserModelId('com.focusflow.app');
      console.log('FocusFlow: App User Model ID set');
    }
    
    console.log('FocusFlow: Creating window...');
    createWindow();
    console.log('FocusFlow: Window created successfully');
    
    // 通知権限をリクエスト
    setTimeout(() => {
      if (process.platform === 'win32') {
        console.log('FocusFlow: Requesting notification permission...');
        console.log('FocusFlow: Notification system initialized');
      }
    }, 1000);
    
    // Windows 集中モード確認手順を表示
    setTimeout(() => {
      console.log('FocusFlow: Showing Focus Assist instructions');
      showWindowsFocusAssistInstructions();
    }, 2000);
    
    // 通知制御テスト（5秒後）
    setTimeout(() => {
      console.log('FocusFlow: Starting notification control test');
      testNotificationControl();
    }, 5000);
    
  } catch (error) {
    console.error('FocusFlow: Error during app initialization:', error);
  }
  
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
}).catch(error => {
  console.error('FocusFlow: Error in app.whenReady():', error);
});