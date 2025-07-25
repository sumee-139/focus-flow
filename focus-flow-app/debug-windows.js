// Windows Electron Debug Script
console.log('=== FocusFlow Windows Debug ===');
console.log('Node.js version:', process.version);
console.log('Platform:', process.platform);
console.log('Architecture:', process.arch);
console.log('Working directory:', process.cwd());

console.log('\n=== Testing Electron modules ===');

try {
  console.log('Attempting to load electron...');
  const electron = require('electron');
  console.log('✅ Electron loaded successfully');
  console.log('Electron app:', typeof electron.app);
  console.log('Electron BrowserWindow:', typeof electron.BrowserWindow);
} catch (error) {
  console.log('❌ Failed to load electron:', error.message);
  console.log('Error details:', error);
  process.exit(1);
}

console.log('\n=== Testing file paths ===');
const path = require('path');
const fs = require('fs');

const preloadPath = path.join(__dirname, 'preload.js');
const htmlPath = path.join(__dirname, 'index.html');

console.log('Preload path:', preloadPath);
console.log('HTML path:', htmlPath);

try {
  if (fs.existsSync(preloadPath)) {
    console.log('✅ preload.js exists');
  } else {
    console.log('❌ preload.js NOT found');
  }
} catch (error) {
  console.log('❌ Error checking preload.js:', error.message);
}

try {
  if (fs.existsSync(htmlPath)) {
    console.log('✅ index.html exists');
  } else {
    console.log('❌ index.html NOT found');
  }
} catch (error) {
  console.log('❌ Error checking index.html:', error.message);
}

console.log('\n=== Attempting minimal Electron app ===');

try {
  const { app, BrowserWindow } = require('electron');
  
  console.log('✅ Electron modules imported');
  
  app.whenReady().then(() => {
    console.log('✅ App ready event fired');
    
    const win = new BrowserWindow({
      width: 400,
      height: 300,
      show: false, // Don't show window during debug
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false
      }
    });
    
    console.log('✅ BrowserWindow created successfully');
    console.log('✅ Windows Electron debug completed successfully!');
    
    // Exit after 1 second
    setTimeout(() => {
      app.quit();
    }, 1000);
  }).catch(error => {
    console.log('❌ App ready failed:', error.message);
    console.log('Error details:', error);
  });
  
} catch (error) {
  console.log('❌ Failed to create Electron app:', error.message);
  console.log('Error details:', error);
}

// Handle app events
try {
  const { app } = require('electron');
  
  app.on('window-all-closed', () => {
    console.log('✅ App shutting down normally');
    process.exit(0);
  });
  
} catch (error) {
  console.log('❌ Failed to set up app events:', error.message);
}