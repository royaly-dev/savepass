const { contextBridge } = require('electron')

contextBridge.exposeInMainWorld('test', {
  test: () => {
    console.log("test")
    return ["t"]
  },
})