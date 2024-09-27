const { ipcMain } = require('electron')
const { app, BrowserWindow } = require('electron/main')
const path = require("node:path")
const { addPassword, deletePassword, getPassword, passwordManager } = require('./src/script/encrypte')
const fs = require("node:fs")
const { autoUpdater } = require("electron-updater")

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
  updateWindow();

  // init the app if is the first launche

  const appdata = process.env.APPDATA

  ipcMain.handle('init', () => {
    dossierPath = appdata + "\\savepassApp"
    try {
        fs.access(dossierPath, fs.constants.F_OK, (err) => {
        if (err) {
            fs.mkdirSync(appdata + "\\savepassApp")
            return { first: true }
        } else {
            return { first: false }
        }
        });
    } catch (err) {
        console.log(err)
        fs.mkdirSync(appdata + "\\savepassApp")
        return { first: true }
    }
  })

  ipcMain.on('setMaster', (event, data) => {

    // set a default value "big" to verify it with the master password to know if the master password is true
    // see how it work here : src/asstes/js/index.js
    addPassword('big', 'bigbang', data.master)
  })

  // Update System

  ipcMain.handle('get-update', () => {
    autoUpdater.checkForUpdates()
    return new Promise((resolve, reject) => {

      // resolve if an update is available
      autoUpdater.on("update-available", () => {
        resolve(JSON.stringify({available: true}));
      })

      // reject if no update is available
      autoUpdater.on("update-not-available", () => {
        reject(JSON.stringify({available: false}));
      })
    });
  })

  ipcMain.handle('download-update', () => {
    autoUpdater.downloadUpdate()

    autoUpdater.on("download-progress", (progressObj) => {
      let d = String(progressObj.percent).split('.')
      winupdate.webContents.send("updateapp", d[0])
    })
  })

  ipcMain.handle('start-update', () => {
    autoUpdater.quitAndInstall()
  })

  ipcMain.handle('update-finish', () => {
    createWindow()
  })

  // Password System

  ipcMain.handle('savepassword', () => {
    fs.writeFile(appdata + "\\TodoAppFile\\data.json", JSON.stringify(passwordManager), { flag: 'a+' }, (e) => {
      if (e) {
          console.log(e)
          return {err: true}
      }
    })

    return {err: false}
  })

  ipcMain.on('get-info', (event, data) => {
    const all = getall()

    passwordManager = all

    return all
  })

  ipcMain.on('get-pass', (event, data) => {
    const pass = getPassword(data.service, data.master);

    return pass
  })

  ipcMain.on('add-new', (event, data) => {
    const add = addPassword(data.service, data.password, data.master);

    return add
  })

  ipcMain.on('delete-info', (event, data) => {
    const remove = deletePassword(data.service);

    return remove
  })

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      updateWindow();
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

function getall() {
  const all = fs.readFileSync(appdata + '\\savepassApp\\data.json', { encoding: 'utf-8' }, (err, data) => {
    return data
  })

  const data = JSON.parse(all)

  return data
}

autoUpdater.autoDownload = false
autoUpdater.updateConfigPath = path.join(app.getAppPath(), 'dev-app-update.yml');