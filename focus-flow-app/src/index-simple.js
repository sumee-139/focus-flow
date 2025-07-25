// Simplified Electron app for Windows troubleshooting
console.log('FocusFlow: Starting simplified version...');

const { app, BrowserWindow } = require('electron');

console.log('FocusFlow: Modules loaded');

// Create window function
function createWindow() {
  console.log('FocusFlow: Creating window...');
  
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  // Load a simple HTML content instead of file
  win.loadURL('data:text/html;charset=UTF-8,' + encodeURIComponent(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>FocusFlow - Simple Test</title>
      <style>
        body { 
          font-family: Arial, sans-serif; 
          padding: 20px; 
          background: #f0f0f0; 
        }
        .container { 
          max-width: 600px; 
          margin: 0 auto; 
          background: white; 
          padding: 20px; 
          border-radius: 8px; 
        }
        button { 
          padding: 10px 20px; 
          margin: 10px; 
          font-size: 16px; 
          border: none; 
          border-radius: 4px; 
          cursor: pointer; 
        }
        .success { background: #4CAF50; color: white; }
        .info { background: #2196F3; color: white; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🎯 FocusFlow - Windows Test</h1>
        <p>✅ Electron is working on Windows!</p>
        <p><strong>Platform:</strong> ${process.platform}</p>
        <p><strong>Node.js:</strong> ${process.versions.node}</p>
        <p><strong>Electron:</strong> ${process.versions.electron}</p>
        
        <h3>Next Steps:</h3>
        <ol>
          <li>This simplified version is working</li>
          <li>Now we can debug the full version</li>
          <li>Check for file path issues</li>
          <li>Check for module loading issues</li>
        </ol>
        
        <button class="success" onclick="alert('Button working!')">Test Button</button>
        <button class="info" onclick="window.close()">Close Window</button>
      </div>
    </body>
    </html>
  `));

  console.log('FocusFlow: Window created successfully');
}

// App ready event
app.whenReady().then(() => {
  console.log('FocusFlow: App ready event');
  createWindow();
});

// Window closed event
app.on('window-all-closed', () => {
  console.log('FocusFlow: All windows closed');
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

console.log('FocusFlow: Script setup complete');