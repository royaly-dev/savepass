import { app, autoUpdater, BrowserWindow, clipboard, dialog, ipcMain, session, shell } from 'electron';
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
import { updateElectronApp, UpdateSourceType } from 'update-electron-app'
import log from 'electron-log'
import launching from 'electron-squirrel-startup'
import NodeRSA from 'node-rsa'

const key = new NodeRSA({ b: 2048 });
key.setOptions({ encryptionScheme: 'pkcs1' })

if (launching) app.quit()

const store: any = new Store();
const instance = new Bonjour({})
declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

let master = ""
let syncKey = ""
let isWaiting = false
const Services: Service[] = []

const checkUpdateForLinux = async () => {
  const fetchForVersion = await fetch("https://api.github.com/repos/royaly-dev/savepass/releases/latest").then(async responce => await responce.json())
  if (fetchForVersion?.tag_name > "v" + app.getVersion()) {
    ipcMain.emit("update")
  }
}

if (process.platform != "linux") {
  updateElectronApp({
    updateSource: {
      type: UpdateSourceType.ElectronPublicUpdateService,
      repo: 'royaly-dev/savepass'
    },
    updateInterval: '1 hour',
    logger: log
  })
}

const mainInstance = instance.find({ type: "http" }, (service: Service) => {
  console.log("Detected a service")
  if (Boolean(service.txt?.readytosync) && (Date.now() - service.txt?.time) < 10000) {
    const synckey = service.name.split("_")
    ipcMain.emit("ready_to_pair", null, { newdevice: { syncKey: synckey[synckey.length - 1], lastSync: 0, name: service.host }, ip: service.addresses[0] })
  }
  if (Object.values(networkInterfaces()).flat().filter((item) => item.address === service.addresses[0]).length === 0 && service.name.includes("savepass") && Services.filter(item => item.host === service.host).length === 0 && service.addresses.length > 0) {
    Services.push(service)
  }
})

const createWindow = (): void => {
  const mainWindow = new BrowserWindow({
    height: 600,
    width: 800,
    autoHideMenuBar: true,
    icon: "assets/icon.ico",
    title: "SavePass",
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
    },
  });

  mainWindow.webContents.once("dom-ready", async () => {
    genTotptimeout(0)
  })

  ipcMain.on("ready_to_pair", (event, data: { newdevice: syncData, ip: string }) => {
    mainWindow.webContents.send("ready_to_pair", [null, data])
  })

  ipcMain.on("syncFinished", (event, data: { type: number, name: string }) => {
    mainWindow.webContents.send("syncRefresh", [null, data])
  })

  ipcMain.on("syncError", () => {
    mainWindow.webContents.send("syncError")
  })

  ipcMain.on("update", () => {
    mainWindow.webContents.send("update")
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
  const savedData = <OptData[]>JSON.parse(CryptoJS.AES.decrypt(store.get("data"), master).toString(CryptoJS.enc.Utf8)).opt.filter((item: OptData) => !item.deleted)
  for (let i = 0; i < savedData.length; i++) {
    try {
      savedData[i].key = await generate({ secret: savedData[i].key })
    } catch (error) {
      console.log("key : " + savedData[i].key + " is not valid !")
      savedData[i].key = "000000"
      savedData[i].name = "Invalid"
      savedData[i].provider = "TOTP code"
    }
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
  const host = await (hostname().slice(0, 17) + "_savepass_" + syncKey)
  instance.publish({ name: host, type: 'http', port: 3600 });
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
        const tempKey = CryptoJS.lib.WordArray.random(32).toString()
        const tempKeyRSA = new NodeRSA({ b: 2048 });
        tempKeyRSA.setOptions({ encryptionScheme: 'pkcs1' })
        tempKeyRSA.importKey(device.public, 'pkcs1-public-pem')
        const syncWithDevice = await fetch("http://" + scanedDevice.addresses[0] + ":5263/sync", {
          method: 'POST',
          body: JSON.stringify({
            syncKey: syncKey,
            key: tempKeyRSA.encrypt(tempKey, 'base64'),
            data: CryptoJS.AES.encrypt(CryptoJS.AES.decrypt(store.get("data"), master).toString(CryptoJS.enc.Utf8), tempKey).toString()
          })
        }).then(async responce => {
          const jsonBody = await responce.json()
          return { ...jsonBody, data: JSON.parse(CryptoJS.AES.decrypt((jsonBody.data), key.decrypt(jsonBody.key, 'utf8').toString()).toString(CryptoJS.enc.Utf8)) }
        })

        if (syncWithDevice?.confirm) {
          await store.set('data', CryptoJS.AES.encrypt(JSON.stringify(syncWithDevice.data), master).toString())
          ipcMain.emit("syncFinished", null, { type: 1, name: scanedDevice.host })
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
    await store.set("sync", JSON.stringify(<syncDevice>{ syncKey: randomUUID(), data: [], lastSync: 0, status: false, private: key.exportKey('pkcs1-private-pem'), public: key.exportKey('pkcs1-public-pem') }))
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
    if (process.platform == "linux") {
      checkUpdateForLinux()
    }
    key.importKey((<syncDevice>JSON.parse(store.get('sync'))).public, 'pkcs1-public-pem')
    key.importKey((<syncDevice>JSON.parse(store.get('sync'))).private, 'pkcs1-private-pem')
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
  startSync()
})

ipcMain.handle("isTotpValid", async (event, code: string) => {
  try {
    const test = await generate({ secret: code })
    console.log("valid")
    return true
  } catch (error) {
    console.log("invalid")
    return false
  }
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

    for (const password of parsedData.password) {
      if (!newData.password.some(p => p.id === password.id)) {
        newData.password.push(password)
      } else {
        const index = newData.password.findIndex(
          item => item.id === password.id
        )

        if (index !== -1 && !password.deleted) {
          newData.password[index] = password
        }
      }
    }

    for (const totp of parsedData.opt) {
      if (!newData.opt.some(o => o.id === totp.id)) {
        newData.opt.push(totp)
      } else {
        const index = newData.opt.findIndex(
          item => item.id === totp.id
        )

        if (index !== -1 && !totp.deleted) {
          newData.opt[index] = totp
        }
      }
    }

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
    return Services
  } else {
    const host = await (hostname().slice(0, 17) + "_savepass_" + syncKey)
    instance.unpublishAll()
    instance.publish({ name: host, type: 'http', port: 3600, txt: { readytosync: "true", time: Date.now() } });
    isWaiting = true
    return { confirm: true }
  }
})

ipcMain.handle("addSyncDevice", async (event, data: { newdevice: syncData, ip: string }) => {
  const SyncDevice: syncDevice = await JSON.parse(await store.get("sync"))

  const syncWithDevice = await fetch("http://" + data.ip + ":5263/setupSync", {
    method: 'POST',
    body: JSON.stringify({
      syncKey: syncKey,
      name: hostname(),
      key: key.exportKey('pkcs1-public-pem')
    })
  })

  if (syncWithDevice.status === 200) {
    const syncWithDeviceData = await syncWithDevice.json()
    SyncDevice.data.push({ ...data.newdevice, public: syncWithDeviceData.key })
    SyncDevice.lastSync = Date.now()
    SyncDevice.status = SyncDevice.data.length > 0

    Services.slice(0, Services.length)
    Services.push(...Services.filter(item => item.host !== data.newdevice.name))

    await store.set("sync", JSON.stringify(SyncDevice))

    return { confirm: true }
  } else {
    ipcMain.emit("syncError")

    return { confirm: false }
  }

})

ipcMain.handle("removeSyncDevice", async (event, data: syncData) => {
  const SyncDevice: syncDevice = await JSON.parse(await store.get("sync"))
  SyncDevice.data = SyncDevice.data.filter(item => item.syncKey !== data.syncKey)
  SyncDevice.lastSync = Date.now()
  SyncDevice.status = SyncDevice.data.length > 0
  await store.set("sync", JSON.stringify(SyncDevice))
  const t = Services.filter(item => item.name.split("_")[item.name.split("_").length - 1] === data.syncKey)
  if (t[0]?.addresses[0]) {
    fetch("http://" + t[0]?.addresses[0] + ":5263/removeSync", {
      method: 'POST',
      body: JSON.stringify({
        syncKey: syncKey
      })
    })
  }
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

          const parsedbody = JSON.parse(body)
          const SyncDevice: syncDevice = await JSON.parse(await store.get("sync"))
          SyncDevice.data.push({ lastSync: Date.now(), name: parsedbody.name, syncKey: parsedbody.syncKey, public: parsedbody.key })
          SyncDevice.lastSync = Date.now()
          SyncDevice.status = SyncDevice.data.length > 0

          await store.set("sync", JSON.stringify(SyncDevice))
          ipcMain.emit("syncFinished", null, { type: 2, name: parsedbody.name })
          console.log("setup finished")
          instance.unpublishAll()

          isWaiting = false
          res.statusCode = 200
          res.end(JSON.stringify({ key: key.exportKey('pkcs1-public-pem') }))
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
        const body: { syncKey: string, data: string, key: string } = await JSON.parse(chunkBody)
        const syncDeviceData: syncDevice = JSON.parse(store.get("sync"))
        const isInSync: syncData[] = syncDeviceData.data.filter((item) => item.syncKey === body.syncKey)


        if (isInSync.length > 0 && master != "") {
          const tempKeyRSA = new NodeRSA({ b: 2048 });
          tempKeyRSA.setOptions({ encryptionScheme: 'pkcs1' })
          const tempSyncData: Data = JSON.parse(CryptoJS.AES.decrypt(store.get("data"), master).toString(CryptoJS.enc.Utf8))
          const syncData: Data = JSON.parse(CryptoJS.AES.decrypt(body.data, key.decrypt(body.key, 'base64').toString()).toString(CryptoJS.enc.Utf8))
          let insert = false

          for (const password of syncData.password) {
            insert = false

            for (const localPassword of tempSyncData.password) {
              if (password.id === localPassword.id) {
                if (password.lastedit > localPassword.lastedit) {
                  const index = tempSyncData.password.findIndex(item => item.id === localPassword.id)
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
                  const index = tempSyncData.opt.findIndex(item => item.id === localTotp.id)
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

          ipcMain.emit("syncFinished", null, { type: 1, name: syncDeviceData.data.filter((item) => item.syncKey === body.syncKey)[0].name })
          res.statusCode = 200
          res.setHeader("Content-Type", "text/plain")
          const tempKey = CryptoJS.lib.WordArray.random(32).toString()
          const encryptedData = CryptoJS.AES.encrypt(JSON.stringify(tempSyncData), tempKey).toString()
          tempKeyRSA.importKey(isInSync[0].public, 'pkcs1-public-pem')
          res.end(JSON.stringify({ data: encryptedData, confirm: true, key: tempKeyRSA.encrypt(tempKey, 'base64') }))
        } else {
          res.statusCode = 400
          res.end(JSON.stringify({ confirm: false }))
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

        syncData.data = syncData.data.filter(item => item.syncKey !== body.syncKey)
        syncData.lastSync = Date.now()
        syncData.status = syncData.data.length > 0
        await store.set("sync", JSON.stringify(syncData))

        ipcMain.emit("syncFinished", null, { type: 3, name: syncData.data.filter((item) => item.syncKey === body.syncKey)[0].name })

        res.statusCode = 200
        res.end("")
      })
    }
  })
  server.listen(5263, '0.0.0.0', () => {
    console.log(`Server started`);
  });
}
webserver()