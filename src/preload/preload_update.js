const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('update', {
  getUpdate: () => ipcRenderer.invoke('get-update'),
  startupdate: () => ipcRenderer.invoke('start-update'),
  init: () => ipcRenderer.invoke('init'),
  finish: () => ipcRenderer.invoke('update-finish'),
  setmaster: (data) => ipcRenderer.send('setMaster', data),
  savepassword: () => ipcRenderer.invoke('savepassword')
})