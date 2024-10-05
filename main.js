const { ipcMain, shell } = require('electron')
const { app, BrowserWindow } = require('electron/main')
const path = require("node:path")
const { addPassword, deletePassword, getPassword, passwordManager, setpasswordManager, getpasswordManager, modifPassword } = require('./src/script/encrypte')
const fs = require("node:fs")
const { autoUpdater } = require("electron-updater")

let win

const createWindow = () => {
  win = new BrowserWindow({
    width: 900,
    height: 600,
    minWidth: 875,
    webPreferences: {
      preload: path.join(__dirname, 'src/preload/preload_main.js')
    }
  })
  win.loadFile('index.html')
}

let winupdate

const updateWindow = () => {
  winupdate = new BrowserWindow({
    width: 400,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'src/preload/preload_update.js')
    }
  })

  winupdate.isResizable = false
  winupdate.loadFile('updater.html')
}

app.whenReady().then(() => {
  updateWindow();

  // init the app if is the first launche

  const appdata = process.env.APPDATA

  ipcMain.handle('init', () => {
    dossierPath = appdata + "\\savepassApp"
    let isconfirm = false
    try {
        const res = fs.accessSync(dossierPath, fs.constants.F_OK, (err) => {
        if (err) {
            fs.mkdirSync(appdata + "\\savepassApp")
            isconfirm = true
        } else {
          isconfirm = false
        }
        });

        if (isconfirm === true) {
          return {first: true}
        } else {
          return {first: false}
        }

    } catch (err) {
        console.log(err)
        fs.mkdirSync(appdata + "\\savepassApp")
        console.log("eedsds")
        return { first: true }
    }
  })

  ipcMain.on('setMaster', (event, data) => {

    console.log("test")
    // set a default value "big" to verify it with the master password to know if the master password is true
    // see how it work here : src/asstes/js/index.js
    addPassword('big', "master", 'bigbang', data.master)

    console.log("tesdsdsdst")

    winupdate.webContents.send("initPassword", {confirm: true})
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
    console.log("sucessfuly saved !")
    try {
      fs.writeFile(appdata + "\\savepassApp\\data.json", JSON.stringify(getpasswordManager()), (e) => {
        if (e) {
            console.log(e)
            return {err: true}
        }
      })
  
      return {err: false}
    } catch (error) {
      console.log(error)
      return {err: true}
    }
  })

  ipcMain.handle('get-info', () => {
    const all = getall()

    if (all === null) {
      console.log("null")
      return {err: true}
    }

    setpasswordManager(all)

    return all
  })

  ipcMain.on('verif-pass', (event, data) => {
    const pass = getPassword(data.service, data.master);
    if (pass === null) {
      win.webContents.send("verif", {confirm: false})
    } else {
      win.webContents.send("verif", {confirm: true})
    }
  })

  ipcMain.handle('get-pass', (event, data) => {
    const pass = getPassword(data.service, data.master);
    return pass
  })

  ipcMain.handle('add-new', (event, data) => {
    const newpass = addPassword(data.service, data.username, data.password, data.master);

    if (newpass === null) {
      return {confirm: false}
    } else {
      return {confirm: true}
    }
  })

  ipcMain.handle('modif-pass', (event, data) => {
    const modif = modifPassword(data.service, data.username, data.password, data.master);

    if (modif === null) {
      return {confirm: false}
    } else {
      return {confirm: true}
    }
  })

  ipcMain.handle('delete-info', (event, data) => {
    const remove = deletePassword(data.service);

    if (!remove) {
      return {confirm: false}
    } else {
      return {confirm: true}
    }
  })

  ipcMain.handle('link', (event, data) => {
    console.log("url: " + data.url)
    shell.openExternal(String(data.url))
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

  const appdata = process.env.APPDATA

  const all = fs.readFileSync(appdata + '\\savepassApp\\data.json', { encoding: 'utf-8' }, (err, data) => {
    return data
  })

  if (all === null) {
    return null
  }

  const data = JSON.parse(all)

  return data
}

autoUpdater.autoDownload = false
autoUpdater.updateConfigPath = path.join(app.getAppPath(), 'dev-app-update.yml');