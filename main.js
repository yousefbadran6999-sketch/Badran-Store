const { app, BrowserWindow, ipcMain, Notification, dialog } = require('electron');
const path = require('path');
const fs   = require('fs');

// تسريع فتح الـ app
app.commandLine.appendSwitch('disable-http-cache');
app.commandLine.appendSwitch('js-flags', '--max-old-space-size=256');

const DATA_FILE = path.join(app.getPath('userData'), 'badran_data.json');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280, height: 800,
    minWidth: 960, minHeight: 620,
    title: 'Badran CNC',
    icon: path.join(__dirname, 'logo-badran.png'),
    show: false, // مش بيظهر غير ما يكون جاهز
    backgroundColor: '#f8fafc', // لون الخلفية قبل التحميل
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      spellcheck: false,
      enableBlinkFeatures: '',
    }
  });

  mainWindow.loadFile('index.html');

  // يظهر بعد ما يكون جاهز - بدون وميض
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // تنظيف الذاكرة لما الشاشة تتخبى
  mainWindow.on('hide', () => {
    if (mainWindow) mainWindow.webContents.setBackgroundThrottling(true);
  });
  mainWindow.on('show', () => {
    if (mainWindow) mainWindow.webContents.setBackgroundThrottling(false);
  });
}

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// ── IPC: قراءة البيانات
ipcMain.handle('read-data', () => {
  try {
    if (fs.existsSync(DATA_FILE)) {
      return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
    }
    return null;
  } catch(e) { return null; }
});

// ── IPC: كتابة البيانات (async عشان مش تجمد الواجهة)
ipcMain.handle('write-data', (event, data) => {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data), 'utf-8');
    return true;
  } catch(e) { return false; }
});

// ── IPC: Windows Notification
ipcMain.handle('show-notification', (event, title, body) => {
  try {
    if (Notification.isSupported()) {
      new Notification({ title, body, icon: path.join(__dirname,'logo-badran.png') }).show();
    }
  } catch(e) {}
});

// ── IPC: Backup
ipcMain.handle('backup-data', async () => {
  try {
    const { filePath } = await dialog.showSaveDialog({
      title: 'حفظ نسخة احتياطية',
      defaultPath: `badran_backup_${new Date().toISOString().split('T')[0]}.json`,
      filters: [{ name: 'JSON', extensions: ['json'] }]
    });
    if (filePath && fs.existsSync(DATA_FILE)) {
      fs.copyFileSync(DATA_FILE, filePath);
      return true;
    }
    return false;
  } catch(e) { return false; }
});
