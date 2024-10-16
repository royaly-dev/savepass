const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('update', {
  getUpdate: () => ipcRenderer.invoke('get-update'),
  downloadupdate: () => ipcRenderer.invoke('download-update'),
  update: () => ipcRenderer.invoke('start-update'),
  init: () => ipcRenderer.invoke('init'),
  finish: () => ipcRenderer.invoke('update-finish'),
  setmaster: (data) => ipcRenderer.send('setMaster', data),
  savepassword: () => ipcRenderer.invoke('savepassword'),

  onPasswordcreated: (callback) => ipcRenderer.on('initPassword', (event, ...args) => callback(...args)),
  onUpdateDownload: (callback) => ipcRenderer.on('updateDownload', (event, ...args) => callback(...args))
})