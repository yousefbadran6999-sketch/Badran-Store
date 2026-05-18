const { contextBridge, ipcRenderer } = require('electron');

// كشف API آمن للصفحة — بدون تعريض Node.js كاملاً
contextBridge.exposeInMainWorld('electronAPI', {
  readData:  ()     => ipcRenderer.invoke('read-data'),
  writeData: (data) => ipcRenderer.invoke('write-data', data)
});
