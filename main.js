const { ipcMain } = require('electron')
const { app, BrowserWindow } = require('electron/main')

const path = require("node:path")

let win

const createWindow = () => {
  win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'src/preload/preload_main.js')
    }
  })

  win.loadFile('index.html')
}

let winupdate

const updateWindow = () => {
  winupdate = new BrowserWindow({
    width: 250,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'src/preload/preload_update.js')
    }
  })

  winupdate.loadFile('updater.html')
}

app.whenReady().then(() => {
  updateWindow()

  // Update System

  ipcMain.handle('get-update', () => {
    return JSON.stringify({test: true})
  })

  ipcMain.handle('start-update', () => {
    return JSON.stringify({test: true})
  })

  // Password System

  ipcMain.handle('get-info', () => {
    return JSON.stringify({test: true})
  })

  ipcMain.handle('add-new', () => {
    return JSON.stringify({test: true})
  })

  ipcMain.handle('delete-info', () => {
    return JSON.stringify({test: true})
  })

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      updateWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})