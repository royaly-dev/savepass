import { ipcRenderer } from "electron"
import { Data } from "@/types/Data"

const { contextBridge } = require('electron')

contextBridge.exposeInMainWorld('savepass', {
  RegisterMaster: async (master: string) => {
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
    ipcRenderer.invoke("SaveData", data)
  }
})