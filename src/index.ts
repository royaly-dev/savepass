import { app, BrowserWindow, clipboard, dialog, ipcMain, session, shell } from 'electron';
import Store from 'electron-store';
import CryptoJS from 'crypto-js';
import { generate } from 'otplib';
import { getRemainingTime } from "@otplib/totp";
import { Data, OptData, syncData, syncDevice } from './types/Data';
import fs from 'fs'
import { randomUUID } from 'crypto';
import { Bonjour, Service } from 'bonjour-service'
import { hostname } from 'os';
import { createServer, IncomingMessage, ServerResponse } from 'node:http'
import { networkInterfaces } from 'node:os';

const store: any = new Store();
const instance = new Bonjour()

declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

let master = ""
let syncKey = ""
let isWaiting = false

const createWindow = (): void => {
  const mainWindow = new BrowserWindow({
    height: 600,
    width: 800,
    autoHideMenuBar: true,
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
    },
  });

  mainWindow.webContents.once("dom-ready", async () => {
    genTotptimeout(0)
  })

  ipcMain.on("syncFinished", () => {
    mainWindow.webContents.send("syncRefresh")
  })

  function genTotptimeout(time: number) {
    setTimeout(async () => {
      if (master != "") {
        const data = await genTotp()
        mainWindow.webContents.send('otpGen', data)
        genTotptimeout(data.left)
      } else {
        genTotptimeout(getRemainingTime())
      }
    }, time * 1000);
  }

  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);
};

async function genTotp() {
  const timeleft = getRemainingTime()
  const savedData = <OptData[]>JSON.parse(CryptoJS.AES.decrypt(store.get("data"), master).toString(CryptoJS.enc.Utf8)).opt
  for (let i = 0; i < savedData.length; i++) {
    savedData[i].key = await generate({ secret: savedData[i].key })
  }
  return { left: timeleft, data: savedData }
}

app.on('ready', () => {
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          `
          default-src 'self';
          script-src 'self' 'unsafe-eval';
          style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
          font-src 'self' https://fonts.gstatic.com;
          img-src 'self' data: https:;
          connect-src 'self' ws: http:;
          `
        ]
      }
    })
  });
  createWindow()
});

const startSync = async () => {
  console.log("Starting to sync with all device...")
  const DeviceScan = instance.find({ type: 'http' })
  await new Promise((resolve) => {
    setTimeout(() => {
      DeviceScan.stop()
      resolve(DeviceScan.services)
    }, 3000);
  })

  const SyncDeviceData: syncDevice = await JSON.parse(await store.get("sync"))

  for (const device of SyncDeviceData.data) {
    for (const scanedDevice of DeviceScan.services) {
      if (scanedDevice.name.includes(device.syncKey)) {
        const syncWithDevice = await fetch("http://" + scanedDevice.addresses[0] + "/syncData", {
          method: 'POST',
          body: JSON.stringify({
            syncKey: syncKey,
            data: await JSON.parse(CryptoJS.AES.decrypt(store.get("data"), master).toString(CryptoJS.enc.Utf8))
          })
        }).then(async responce => await responce.json())

        if (syncWithDevice?.confirm) {
          await store.set('data', CryptoJS.AES.encrypt(JSON.stringify(syncWithDevice.data), master).toString())
        } else {
          console.log("Error while sync with : " + scanedDevice.name)
        }

      }
    }
  }
  console.log("Finished to sync with all device !")
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

ipcMain.handle("IsRegister", async () => {
  if (!(await store.get("master"))) {
    return false
  } else {
    return true
  }
})

ipcMain.handle("getTotp", async () => {
  return await genTotp()
})

ipcMain.handle("Register", async (event, data) => {
  if (!store.get("master")) {
    await store.set("master", CryptoJS.AES.encrypt(data, data).toString())
    await store.set("data", CryptoJS.AES.encrypt(JSON.stringify({ password: [], opt: [] }), data).toString())
    await store.set("sync", JSON.stringify(<syncDevice>{ syncKey: randomUUID(), data: [], lastSync: 0, status: false }))
    return true
  } else {
    return false
  }
})

ipcMain.handle("Check", (event, data) => {
  const EncryptedMaster = store.get("master")
  const DecryptedMaster = CryptoJS.AES.decrypt(EncryptedMaster, data).toString(CryptoJS.enc.Utf8)

  if (DecryptedMaster != data) {
    return false
  } else {
    master = data;
    syncKey = (<syncDevice>JSON.parse(store.get("sync"))).syncKey
    if ((<syncDevice>JSON.parse(store.get("sync"))).status) {
      startSync()
    }
    return true
  }
})

ipcMain.handle("GetData", () => {
  if (master == "") {
    return []
  }

  return JSON.parse(CryptoJS.AES.decrypt(store.get("data"), master).toString(CryptoJS.enc.Utf8))
})

ipcMain.on("openLink", (event, data) => {
  shell.openExternal(String(data))
})

ipcMain.on("copyToClipBoard", (event, data) => {
  clipboard.writeText(data)
})

ipcMain.on("SaveData", (event, data) => {
  if (master == "") {
    return
  }

  store.set('data', CryptoJS.AES.encrypt(JSON.stringify(data), master).toString())
})

ipcMain.handle("ImportData", async () => {
  const data = await dialog.showOpenDialog({ properties: ['openFile'], filters: [{ name: 'JSON', extensions: ['json'] }] })
  if (data.canceled) {
    console.log("canceled")
    return { canceled: true }
  }
  let canceled = false
  fs.readFile(data.filePaths[0], 'utf8', async (err: any, data: string) => {
    if (err) {
      canceled = true
      return
    }
    const newData: Data = await JSON.parse(CryptoJS.AES.decrypt(store.get("data"), master).toString(CryptoJS.enc.Utf8))
    const parsedData: Data = JSON.parse(data)
    console.log(newData)

    for (const password of parsedData.password) {
      if (!newData.password.some(p => p.id === password.id)) {
        newData.password.push(password)
      }
    }

    for (const totp of parsedData.opt) {
      if (!newData.opt.some(o => o.id === totp.id)) {
        newData.opt.push(totp)
      }
    }

    console.log(parsedData)
    console.log(newData)

    store.set('data', CryptoJS.AES.encrypt(JSON.stringify(newData), master).toString())

  })
  return { canceled: canceled }
})

ipcMain.handle("ExportData", async () => {
  const data = await dialog.showOpenDialog({ properties: ['openDirectory'] })

  if (data.canceled) {
    console.log("canceled")
    return { canceled: true }
  }

  let canceled = false
  fs.writeFile(data.filePaths[0] + "/SavePassData.json", CryptoJS.AES.decrypt(store.get("data"), master).toString(CryptoJS.enc.Utf8), (err: any) => {
    if (err) {
      canceled = true
      return
    }
  })

  return { canceled: canceled }
})

ipcMain.handle("GetSyncStatus", async () => {
  return await JSON.parse(store.get("sync"))
})

ipcMain.handle("SyncSetup", async (event, type: string) => {
  if (type == "add") {
    const newDevice = instance.find({ type: 'http' })
    const Services: Service[] = await new Promise((resolve) => {
      setTimeout(() => {
        newDevice.stop()
        resolve(newDevice.services)
      }, 3000);
    })
    return Services.map((service) => Object.values(networkInterfaces()).flat().filter((item) => item.address === service.addresses[0]).length === 0 ? service : {})
  } else {
    instance.publish({ name: hostname() + "-savepass-" + syncKey, type: 'http', port: 3600 })
    console.log(syncKey)
    isWaiting = true
    return { confirm: true }
  }
})

ipcMain.handle("addSyncDevice", async (event, data: { newdevice: syncData, ip: string }) => {
  const SyncDevice: syncDevice = await JSON.parse(await store.get("sync"))
  SyncDevice.data.push(data.newdevice)
  await store.set("sync", JSON.stringify(SyncDevice))
  await fetch("http://" + data.ip + "/setupSync", {
    method: 'POST',
    body: JSON.stringify({
      syncKey: syncKey,
      name: hostname()
    })
  })
  return { confirm: true }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Web Server for sync service

const webserver = async () => {
  // @ts-ignore
  const server = createServer((req, res) => {
    if (req.url.includes("setupSync")) {
      let body = ""

      req.on("data", (chunk: string) => {
        body += chunk
      })

      req.on("end", async () => {
        if (isWaiting) {
          console.log("adding new device")
          const parsedbody = JSON.parse(body)
          const SyncDevice: syncDevice = await JSON.parse(await store.get("sync"))
          SyncDevice.data.push({ lastSync: Date.now(), name: parsedbody.name, syncKey: parsedbody.syncKey })
          await store.set("sync", JSON.stringify(SyncDevice))
          isWaiting = false
          res.statusCode = 200
          res.end("")
        } else {
          res.statusCode = 400
          res.end("")
        }
      })
    } else if (req.url.includes("sync")) {
      let chunkBody = ""

      req.on("data", (chunk: string) => {
        chunkBody += chunk
      })

      req.on("end", async () => {
        const body: { syncKey: string, data: Data } = await JSON.parse(chunkBody)
        const syncDeviceData: syncDevice = JSON.parse(store.get("sync"))
        const isInSync = syncDeviceData.data.filter((item) => item.syncKey === body.syncKey).length > 0

        if (isInSync && master != "") {
          const tempSyncData: Data = JSON.parse(CryptoJS.AES.decrypt(store.get("data"), master).toString(CryptoJS.enc.Utf8))
          const syncData: Data = body.data
          let insert = false

          for (const password of syncData.password) {
            insert = false

            for (const localPassword of tempSyncData.password) {
              if (password.id === localPassword.id) {
                if (password.lastedit > localPassword.lastedit) {
                  const index = tempSyncData.password.findIndex(item => item.id = localPassword.id)
                  tempSyncData.password[index] = password
                }
                insert = true
              }
            }

            if (!insert) {
              tempSyncData.password.push(password)
            }
          }

          for (const Totp of syncData.opt) {
            insert = false
            for (const localTotp of tempSyncData.opt) {
              if (Totp.id === localTotp.id) {
                if (Totp.deleted != localTotp.deleted) {
                  const index = tempSyncData.opt.findIndex(item => item.id = localTotp.id)
                  tempSyncData.opt[index].deleted = true
                }
                insert = true
              }
            }

            if (!insert) {
              tempSyncData.opt.push(Totp)
            }
          }

          await store.set("sync", JSON.stringify(<syncDevice>{ ...syncDeviceData, lastSync: Date.now() }))
          await store.set('data', CryptoJS.AES.encrypt(JSON.stringify(tempSyncData), master).toString())

          ipcMain.emit("syncFinished")
          res.statusCode = 200
          res.setHeader("Content-Type", "text/plain")
          //TODO : encrypt data with the device syncKey to prevent hack
          res.end(JSON.stringify(tempSyncData))
        } else {
          res.statusCode = 400
          res.end("")
        }

      })
    } else if (req.url.includes("removeSync")) {
      let chunkBody = ""

      req.on("data", (chunk: string) => {
        chunkBody += chunk
      })

      req.on("end", async () => {
        const body: { syncKey: string } = JSON.parse(chunkBody)

        const syncData: syncDevice = JSON.parse(store.get("sync"))

        syncData.data = syncData.data.filter(item => item.syncKey === body.syncKey)
        syncData.lastSync = Date.now()
        syncData.status = syncData.data.length > 0

        await store.set("sync", JSON.stringify(syncData))

        res.end(200)
      })
    }
  })
  server.listen(5263, '0.0.0.0', () => {
    console.log(`Serveur démarré`);
  });
}
webserver()