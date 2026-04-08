console.log("background scritp launched !")

const latestData: { type: "find" | "new", link: string, email: string, password: string } = { link: "", email: "", password: "", type: "find" }

chrome.runtime.onMessage.addListener((message: string, sender: chrome.runtime.MessageSender, sendResponse: (responce: string) => void) => {

    const arg = message.split("_")
    switch (arg[1]) {
        case "status":
            StatusService(sendResponse)
            break;
        case "sync":
            SyncService(sendResponse)
            break;
        case "checkpass":
            checkService(sendResponse, arg[2])
            break;
        case "getLast":
            sendResponse(JSON.stringify(latestData))
            if (arg[2] === "apply") {
                latestData.email = ""
                latestData.password = ""
                latestData.link = ""
                latestData.type = "find"
            }
            break;

        default:
            break;
    }

    return true
})

const StatusService = async (sendResponse: (responce: string) => void) => {
    const status = await fetch("http://localhost:5263/status").catch((err) => { console.log(err); return null })

    if (status?.status === 200) {
        sendResponse("background_status_succes")
    } else {
        sendResponse("background_status_error")
    }
}

const SyncService = async (sendResponse: (responce: string) => void) => {
    const syncKey = await chrome.storage.local.get("sync")

    if (syncKey) {
        const status = await fetch("http://localhost:5263/testSync", { method: 'POST', body: JSON.stringify({ syncKey: syncKey.sync }) }).catch((err) => { console.log(err); return null })
        console.log(status.status)
        if (status?.status === 200) {
            sendResponse("valid")
        } else {
            sendResponse("none")
            await addService()

        }
    } else {
        sendResponse("none")
        await addService()
    }
}

const addService = async () => {
    const newSyncKey = crypto.randomUUID()
    await chrome.storage.local.set({ sync: newSyncKey })
    await fetch("http://localhost:5263/addSyncDevice", { method: 'POST', body: JSON.stringify({ syncKey: newSyncKey }) })
}

const checkService = async (sendResponse: (responce: string) => void, url: string) => {
    const check = await fetch("http://localhost:5263/check", { method: 'POST', body: JSON.stringify({ syncKey: (await chrome.storage.local.get("sync")).sync, url: url }) }).catch((err) => { console.log(err); return null })

    if (check?.status === 200) {
        const checkJson = await check.json()
        latestData.email = checkJson.email
        latestData.link = checkJson.link
        latestData.password = checkJson.password
        latestData.type = checkJson.type
        await chrome.action.openPopup()
        sendResponse("background_checkpass_succes")
    } else {
        sendResponse("background_checkpass_error")
    }
}