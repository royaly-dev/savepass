console.log("background scritp launched !")

const latestData: { link: string, email: string, password: string } = { link: "", email: "", password: "" }

chrome.runtime.onMessage.addListener((message: string, sender: chrome.runtime.MessageSender, sendResponse: (responce: string) => void) => {

    const arg = message.split("_")
    switch (arg[1]) {
        case "status":
            StatusService(sendResponse)
            break;
        case "checkpass":
            checkService(sendResponse)
            break;
        case "getLast":
            sendResponse(JSON.stringify(latestData))
            latestData.email = ""
            latestData.password = ""
            latestData.link = ""
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

const checkService = async (sendResponse: (responce: string) => void) => {
    const check = await fetch("http://localhost:5263/check").catch((err) => { console.log(err); return null })

    latestData.email = "test"
    latestData.link = "http://rest.tes"
    latestData.password = "testtest"
    await chrome.action.openPopup()

    if (check?.status === 200) {
        const checkJson = await check.json()
        latestData.email = checkJson.email
        latestData.link = checkJson.link
        latestData.password = checkJson.password
        await chrome.action.openPopup()
        sendResponse("background_checkpass_succes")
    } else {
        sendResponse("background_checkpass_error")
    }
}