const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('db', {
  get: () => ipcRenderer.invoke('get-info'),
  add: () => ipcRenderer.invoke('add-new'),
  delete: () => ipcRenderer.invoke('delete-info')
})