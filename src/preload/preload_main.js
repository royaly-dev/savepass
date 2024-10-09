const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('db', {
  all: () => ipcRenderer.invoke('get-info'),
  get: (data) => ipcRenderer.invoke('get-pass', data),
  add: (data) => ipcRenderer.invoke('add-new', data),
  delete: (data) => ipcRenderer.invoke('delete-info', data),
  save: () => ipcRenderer.invoke('savepassword'),
  verif: (data) => ipcRenderer.send('verif-pass', data),
  modif: (data) => ipcRenderer.invoke('modif-pass', data),
  openurl: (data) => ipcRenderer.invoke('link', data),
  genpass: (data) => ipcRenderer.invoke('genpass', data),

  onVerif: (callback) => ipcRenderer.on('verif', (event, ...args) => callback(...args)),
  onAll: (callback) => ipcRenderer.on('all', (event, ...args) => callback(...args))
})