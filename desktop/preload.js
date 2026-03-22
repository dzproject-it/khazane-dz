const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('khazane', {
  onStatus: (callback) => ipcRenderer.on('status', (_event, msg) => callback(msg)),
});
