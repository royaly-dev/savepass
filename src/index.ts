import { app, BrowserWindow, clipboard, ipcMain, session, shell } from 'electron';
import Store from 'electron-store';
import CryptoJS from 'crypto-js';
import { generate } from 'otplib';
import { getRemainingTime } from "@otplib/totp";
import { OptData } from './types/Data';

const store: any = new Store();

declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

let master = ""

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

  function genTotptimeout(time: number) {
    setTimeout( async () => {
      if (master != "") {
        const data = await genTotp()
        mainWindow.webContents.send('otpGen', data)
        genTotptimeout(data.left)
      } else {
        genTotptimeout(getRemainingTime())
      }
    }, time*1000);
  }

  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);
};

async function genTotp() {
  const timeleft = getRemainingTime()
  const savedData = <OptData[]>JSON.parse(CryptoJS.AES.decrypt(store.get("data"), master).toString(CryptoJS.enc.Utf8)).opt
  for (let i = 0; i < savedData.length; i++) {
    savedData[i].key = await generate({secret: savedData[i].key})
  }
  return {left: timeleft, data: savedData}
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
    await store.set("data", CryptoJS.AES.encrypt(JSON.stringify({password: [], opt: [], acount: [{id: "test", mail: "test@test.ts"}]}), data).toString())
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

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
