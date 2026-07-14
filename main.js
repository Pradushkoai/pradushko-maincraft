// ═══════════════════════════════════════════════════════════
//  main.js — Electron main process
//  Запускает окно браузера с игрой, отключает меню
// ═══════════════════════════════════════════════════════════
const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 700,
    title: 'Pradushko Maincraft',
    backgroundColor: '#87ceeb',
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      devTools: process.argv.includes('--dev')
    }
  });

  // Убираем меню полностью
  Menu.setApplicationMenu(null);

  // Разрешаем загрузку локальных модулей из node_modules
  mainWindow.webContents.session.webRequest.onBeforeRequest((details, callback) => {
    callback({ cancel: false });
  });

  mainWindow.loadFile(path.join(__dirname, 'src', 'index.html'));

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    if (process.argv.includes('--dev')) {
      mainWindow.webContents.openDevTools();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
