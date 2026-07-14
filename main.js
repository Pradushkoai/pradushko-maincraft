// ═══════════════════════════════════════════════════════════
//  main.js — Electron main process
//  Запускает окно браузера с игрой, отключает меню
// ═══════════════════════════════════════════════════════════
const { app, BrowserWindow, Menu, dialog } = require('electron');
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
      devTools: true
    }
  });

  // Убираем меню полностью
  Menu.setApplicationMenu(null);

  // Показываем ошибки в консоли
  mainWindow.webContents.on('console-message', (event, level, message, line, sourceId) => {
    console.log(`[Renderer ${level}] ${message} (${sourceId}:${line})`);
  });

  // Ловим ошибки загрузки
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    console.error('Failed to load:', errorCode, errorDescription, validatedURL);
    dialog.showErrorBox('Ошибка загрузки', `Не удалось загрузить игру.\nКод: ${errorCode}\n${errorDescription}\nURL: ${validatedURL}`);
  });

  mainWindow.webContents.on('render-process-gone', (event, details) => {
    console.error('Render process gone:', details);
    dialog.showErrorBox('Ошибка', `Процесс рендера упал: ${details.reason}`);
  });

  mainWindow.loadFile(path.join(__dirname, 'src', 'index.html'));

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    mainWindow.focus();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Ловим необработанные исключения
process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
  dialog.showErrorBox('Критическая ошибка', err.stack || err.message);
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
