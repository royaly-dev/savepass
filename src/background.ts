console.log("background scritp launched !")

chrome.runtime.onMessage.addListener(async (message: string, sender: chrome.runtime.MessageSender) => {
    console.log(message)
    console.log("fetch")
    const t = await fetch("http://localhost:5263/setupSync")
    console.log("fetched")
    console.log(t.status)
})