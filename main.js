const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs   = require('fs');

// مسار ملف البيانات — بيتحفظ في مجلد AppData/بيانات المستخدم
const DATA_FILE = path.join(app.getPath('userData'), 'badran_data.json');

function createWindow() {
  const win = new BrowserWindow({
    width:  1280,
    height: 800,
    minWidth:  900,
    minHeight: 600,
    title: 'Badran CNC — نظام إدارة المبيعات',
    icon: path.join(__dirname, 'logo-badran.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,   // أمان: عزل السياق
      nodeIntegration:  false   // أمان: منع Node.js في الصفحة مباشرة
    }
  });

  win.loadFile('index.html');

  // إخفاء قائمة التطبيق الافتراضية في الإنتاج
  // win.setMenu(null); // فعّلها لو مش عايز Menu Bar
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

// ============================================================
// IPC — قراءة وكتابة البيانات من الملف
// ============================================================
ipcMain.handle('read-data', () => {
  try {
    if (fs.existsSync(DATA_FILE)) {
      let raw = fs.readFileSync(DATA_FILE, 'utf-8');
      return JSON.parse(raw);
    }
    return null;
  } catch (e) {
    console.error('Error reading data:', e);
    return null;
  }
});

ipcMain.handle('write-data', (event, data) => {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (e) {
    console.error('Error writing data:', e);
    return false;
  }
});
