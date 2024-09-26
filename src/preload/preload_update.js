const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('update', {
  getUpdate: () => ipcRenderer.invoke('get-update'),
  startupdate: () => ipcRenderer.invoke('start-update')
})