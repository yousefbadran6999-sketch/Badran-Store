const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  readData:         ()          => ipcRenderer.invoke('read-data'),
  writeData:        (data)      => ipcRenderer.invoke('write-data', data),
  showNotification: (title,body)=> ipcRenderer.invoke('show-notification', title, body),
  backupData:       ()          => ipcRenderer.invoke('backup-data')
});
