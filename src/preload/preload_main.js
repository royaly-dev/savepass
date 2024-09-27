const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('db', {
  all: (data) => ipcRenderer.send('get-info', data),
  get: (data) => ipcRenderer.send('get-pass', data),
  add: (data) => ipcRenderer.send('add-new', data),
  delete: (data) => ipcRenderer.send('delete-info', data)
})