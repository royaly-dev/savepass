window.addEventListener("load", async () => {
    console.log("loaded !")
    const data: { type: "find" | "new", link: string, email: string, password: string } = JSON.parse(await chrome.runtime.sendMessage("background_getLast"))
    if (data.link) {
        document.querySelector<HTMLButtonElement>("#button").addEventListener("click", () => {
            chrome.tabs.query({ active: true, currentWindow: true }, (result: chrome.tabs.Tab[]) => {
                chrome.tabs.sendMessage(result[0].id, "popup_apply")
            })
            window.close()
        })
        document.querySelector<HTMLDivElement>("#loading").style.display = "none"
        document.querySelector<HTMLDivElement>("#showPass").style.display = "flex"
        document.querySelector<HTMLParagraphElement>("#email").textContent = data.email
        document.querySelector<HTMLParagraphElement>("#password").textContent = data.password
        document.querySelector<HTMLHeadingElement>("#link").textContent = data.link

    } else {
        const isConnected = await chrome.runtime.sendMessage("background_status")
        console.log(isConnected)
        if (isConnected === "background_status_succes") {
            document.querySelector("#main_msg").textContent = "SavePass is connected !"
            document.querySelector<HTMLParagraphElement>("#main_msg").style.color = "#1a851a"
        } else {
            document.querySelector("#main_msg").textContent = "SavePass is not connected !"
            document.querySelector<HTMLParagraphElement>("#main_msg").style.color = "#e21e1e"
        }

        const isSync = await chrome.runtime.sendMessage("background_sync")

        if (isSync === "none") {
            document.querySelector<HTMLDivElement>("#loading").style.display = "none"
            document.querySelector<HTMLDivElement>("#setupSync").style.display = "flex"
        }
    }
})