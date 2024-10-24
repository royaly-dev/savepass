const { ipcMain, shell, dialog } = require('electron')
const { app, BrowserWindow } = require('electron/main')
const path = require("node:path")
const { addPassword, deletePassword, getPassword, passwordManager, setpasswordManager, getpasswordManager, modifPassword, getPasswordWithUrlHostname } = require('./src/script/encrypte')
const fs = require("node:fs")
const { autoUpdater } = require("electron-updater")
const { passgenn } = require('./src/script/pass_gen')
const { Server } = require('node:http')

let win
let masterforweb

const createWindow = () => {
  win = new BrowserWindow({
    width: 1500,
    height: 800,
    minWidth: 1450,
    minHeight: 650,
    webPreferences: {
      preload: path.join(__dirname, 'src/preload/preload_main.js')
    }
  })
  win.loadFile('index.html')
  win.removeMenu()
}

let winupdate

const updateWindow = () => {
  winupdate = new BrowserWindow({
    width: 480,
    height: 600,
    minWidth: 450,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, 'src/preload/preload_update.js')
    }
  })
  
  winupdate.resizable = false
  winupdate.loadFile('updater.html')
  winupdate.removeMenu()
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
          console.log("update available")
          return resolve({ available: true });
        })

        // reject if no update is available
        autoUpdater.on("update-not-available", () => {
          console.log("no update")
          return resolve({ available: false });
        })

        // reject if an error occurs
        autoUpdater.on("error", (error) => {
          console.error("Error checking for updates:", error);
          return resolve({ available: false })
        });

      });
  })

  ipcMain.handle('download-update', () => {
    autoUpdater.downloadUpdate()
  })

  autoUpdater.on('download-progress', (progressObj) => {
    console.log("download")
    console.log(progressObj)
    let d = String(progressObj.percent).split('.')
    winupdate.webContents.send("updateDownload", {progress: d[0]})
  });

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
    masterforweb = data.master
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

  // Link System and gen pass System

  ipcMain.handle('link', (event, data) => {
    console.log("url: " + data.url)
    shell.openExternal(String(data.url))
  })

  ipcMain.handle('genpass', (event, data) => {
    const pass = passgenn(20)
    return pass
  })

  // settings system

  ipcMain.handle('load', async (event, data) => {
  
    const path = data.path
    let skip = 0

    try {
      const arraystring = fs.readFileSync(path, { encoding: 'utf-8' }, (err, data) => {
        return data
      })

      const array = JSON.parse(arraystring)

      for (let i = 0; i < array.length; i++) {
        const addpass = addPassword(array[i].service, array[i].username, array[i].password, data.master)
        if (addpass === null) {
          skip++
        }
      }

      return {skip: skip, confirm: array.length - skip}

    } catch (error) {
      return {err: true}
    }


  })

  ipcMain.handle('export', async (event, data) => {

    const path = data.path
    const master = data.master

    try {
      const arraystring = fs.readFileSync(appdata + "\\savepassApp\\data.json", { encoding: 'utf-8' }, (err, dataarray) => {
        return dataarray
      })

      const array = JSON.parse(arraystring)
      const exportArray = []

      for (let i = 0; i < array.length; i++ ) {
        if (array[i].service === "big") {
          continue
        }
        const getpass = getPassword(array[i].service, master)

        exportArray.push({service: array[i].service, username: array[i].username, password: getpass})
      }

      fs.writeFileSync(path, JSON.stringify(exportArray), { encoding: 'utf-8', flag: 'w' }, (err) => {
        if (err) {
          console.log("error : " + err)
          return {confirm: false}
        } else {
          return {confirm: true}
        }
      });

    } catch (error) {
      console.log(error)
      return {confirm: false}
    }

  })

  ipcMain.handle('select-dirs', async (event) => {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory']
    });
    return result.filePaths;
  });

  ipcMain.handle('select-file', async (event) => {
    const result = await dialog.showOpenDialog({
      properties: ['openFile']
    });
    return result.filePaths;
  });

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

autoUpdater.autoRunAppAfterInstall = true
autoUpdater.autoInstallOnAppQuit = true
autoUpdater.forceDevUpdateConfig = true
autoUpdater.autoDownload = false
autoUpdater.updateConfigPath = path.join(app.getAppPath(), 'dev-app-update.yml');

//webserver for the extension in the browser

Server((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.url === "/status") {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: "ok" }));
  } else if (req.url === "/get") {
    if (req.method === "POST") {
      let body = "";
      req.on("data", (chunk) => {
        body += chunk.toString();
      });
      req.on("end", () => {
        body = JSON.parse(body);
        const pass = getPasswordWithUrlHostname(body.service, String(masterforweb));
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(pass));
      });
    } else {
      res.writeHead(405, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: "Method not allowed" }));
    }
  }
}).listen(9560, () => {
  console.log("Server started on http://localhost:9560");
});