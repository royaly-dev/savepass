import { ipcRenderer } from "electron"
import { Data } from "@/types/Data"

const { contextBridge } = require('electron')

contextBridge.exposeInMainWorld('savepass', {
  Register: async (master: string) => {
    return await ipcRenderer.invoke("Register", master)
  },
  IsRegistred: async () => {
    return await ipcRenderer.invoke("IsRegister")
  },
  Check: async (master: string) => {
    return await ipcRenderer.invoke("Check", master)
  },
  GetData: async () => {
    return await ipcRenderer.invoke("GetData")
  },
  SaveData: async (data: Data) => {
    ipcRenderer.send("SaveData", data)
  },
  openLink: (link: string) => {
    ipcRenderer.send("openLink", link)
  },
  copyToClipBoard: (text: string) => {
    ipcRenderer.send("copyToClipBoard", text)
  },
  genrateOPT: async () => {
    return await ipcRenderer.invoke("getTotp")
  },
  onGetOTP: (callback: any) => {
    ipcRenderer.on('otpGen', (event, data) => {
      callback(data)
    })
  },
  ImportData: async () => {
    return await ipcRenderer.invoke("ImportData")
  },
  ExportData: async () => {
    return await ipcRenderer.invoke("ExportData")
  }
})