const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('db', {

  // Functions

  all: () => ipcRenderer.invoke('get-info'),
  get: (data) => ipcRenderer.invoke('get-pass', data),
  add: (data) => ipcRenderer.invoke('add-new', data),
  delete: (data) => ipcRenderer.invoke('delete-info', data),
  save: () => ipcRenderer.invoke('savepassword'),
  verif: (data) => ipcRenderer.send('verif-pass', data),
  modif: (data) => ipcRenderer.invoke('modif-pass', data),
  openurl: (data) => ipcRenderer.invoke('link', data),
  genpass: (data) => ipcRenderer.invoke('genpass', data),
  load: (data) => ipcRenderer.invoke('load', data),
  export: (data) => ipcRenderer.invoke('export', data),
  selectDirs: () => ipcRenderer.invoke('select-dirs'),
  selectFiles: () => ipcRenderer.invoke('select-file'),

  // Event listeners

  onVerif: (callback) => ipcRenderer.on('verif', (event, ...args) => callback(...args)),
  onAll: (callback) => ipcRenderer.on('all', (event, ...args) => callback(...args))
})