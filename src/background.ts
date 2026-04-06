console.log("background scritp launched !")

chrome.runtime.onMessage.addListener((message: string, sender: chrome.runtime.MessageSender, sendResponse: (responce: string) => void) => {

    const arg = message.split("_")
    switch (arg[1]) {
        case "status":

            break;

        case "checkpass":
            checkService(sendResponse)
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

    if (check?.status === 200) {
        await chrome.action.openPopup()
        sendResponse("background_checkpass_succes")
    } else {
        sendResponse("background_checkpass_error")
    }
}